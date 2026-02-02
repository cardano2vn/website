"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import WalletPickerModal from "~/components/our-service/WalletPickerModal";
import DrepCard from "~/components/our-service/DrepCard";
import PoolCard from "~/components/our-service/PoolCard";
import DelegateList from "~/components/our-service/DelegateList";
import { useToastContext } from "~/components/toast-provider";
import * as CardanoWasm from "@emurgo/cardano-serialization-lib-asmjs";
import { cardanoWallet } from "~/lib/cardano-wallet";

const BLOCKFROST_PROXY = "/api/blockfrost";

const DREP_BECH32 =
  "drep1ygqlu72zwxszcx0kqdzst4k3g6fxx4klwcmpk0fcuujskvg3pmhgs";
const VILAI_POOL = "pool1u7zrgexnxsysctnnwljjjymr70he829fr5n3vefnv80guxr42dv";
const HADA_POOL = "pool1rqgf6qd0p3wyf9dxf2w7qcddvgg4vu56l35ez2xqemhqun2gn7y";

const BLOCKFROST_STALE_MS = 7 * 24 * 60 * 60 * 1000;

type PoolInfo = {
  ticker: string;
  delegators: number | null;
  blocks: number | null;
  stake: string | null;
  pledge: string | null;
};

export default function ServiceContent() {
  const { showSuccess, showError, showInfo } = useToastContext();
  const [walletPicker, setWalletPicker] = React.useState<{
    open: boolean;
    action: null | { type: "drep"; id: string } | { type: "pool"; id: string };
  }>({ open: false, action: null });

  const drepQuery = useQuery({
    queryKey: ["blockfrost", "drep", DREP_BECH32],
    queryFn: async () => {
      const res = await fetch(`${BLOCKFROST_PROXY}/governance/dreps/${DREP_BECH32}`);
      if (!res.ok) throw new Error(`DRep HTTP ${res.status}`);
      return res.json() as Promise<{ active?: boolean; retired?: boolean; expired?: boolean; amount?: string | number }>;
    },
    staleTime: BLOCKFROST_STALE_MS,
    gcTime: 10 * 60 * 60 * 1000,
  });

  const vilaiQuery = useQuery({
    queryKey: ["blockfrost", "pool", VILAI_POOL],
    queryFn: async () => {
      const res = await fetch(`${BLOCKFROST_PROXY}/pools/${VILAI_POOL}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: BLOCKFROST_STALE_MS,
    gcTime: 10 * 60 * 60 * 1000,
  });

  const hadaQuery = useQuery({
    queryKey: ["blockfrost", "pool", HADA_POOL],
    queryFn: async () => {
      const res = await fetch(`${BLOCKFROST_PROXY}/pools/${HADA_POOL}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: BLOCKFROST_STALE_MS,
    gcTime: 10 * 60 * 60 * 1000,
  });

  const loading = drepQuery.isLoading || vilaiQuery.isLoading || hadaQuery.isLoading;
  const error = drepQuery.error ? (drepQuery.error as Error).message : (vilaiQuery.error || hadaQuery.error) ? String(vilaiQuery.error || hadaQuery.error) : null;
  const drepJson = drepQuery.data;
  const drepStatus =
    !drepJson ? "Not registered"
    : drepJson.active ? "Active"
    : drepJson.retired ? "Retired"
    : drepJson.expired ? "Expired"
    : "Inactive";
  const votingPower =
    drepJson?.amount != null
      ? (() => {
          const vpNum = Number(drepJson.amount) / 1_000_000;
          return Number.isFinite(vpNum) ? `${vpNum.toLocaleString()} ₳` : String(drepJson.amount);
        })()
      : "0 ₳";
  const vilaiInfo = vilaiQuery.data;
  const hadaInfo = hadaQuery.data;
  const pools: Record<string, PoolInfo> = {
    [VILAI_POOL]: {
      ticker: "VILAI",
      delegators: vilaiInfo?.live_delegators ?? 0,
      blocks: vilaiInfo?.blocks_minted ?? 0,
      stake: vilaiInfo?.live_stake ? `${(Number(vilaiInfo.live_stake) / 1_000_000).toLocaleString()} ₳` : null,
      pledge: vilaiInfo?.live_pledge ? `${(Number(vilaiInfo.live_pledge) / 1_000_000).toLocaleString()} ₳` : null,
    },
    [HADA_POOL]: {
      ticker: "HADA",
      delegators: hadaInfo?.live_delegators ?? 0,
      blocks: hadaInfo?.blocks_minted ?? 0,
      stake: hadaInfo?.live_stake ? `${(Number(hadaInfo.live_stake) / 1_000_000).toLocaleString()} ₳` : null,
      pledge: hadaInfo?.live_pledge ? `${(Number(hadaInfo.live_pledge) / 1_000_000).toLocaleString()} ₳` : null,
    },
  };

  function isWalletInstalledByKey(key: string): boolean {
    const injected: any = (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) return false;
    return Object.keys(injected).some((k) => k.toLowerCase() === key.toLowerCase());
  }

  function getSelectedWalletProvider(preferredKey?: string): any {
    const injected: any =
      (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) throw new Error("No Cardano wallet detected");
    if (preferredKey) {
      const hit = Object.keys(injected).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
      if (hit) return injected[hit];
    }

    const currentName = cardanoWallet.getCurrentWalletName?.();
    const candidateOrder: string[] = [];
    if (currentName) candidateOrder.push(currentName);

    const preferredAliases = [
      "eternl",
      "nami",
      "lace",
      "yoroi",
      "gerowallet",
      "nufi",
      "typhoncip30",
    ];
    for (const k of preferredAliases)
      if (!candidateOrder.includes(k)) candidateOrder.push(k);

    for (const key of candidateOrder) {
      if (injected[key]) return injected[key];
      const lower = key.toLowerCase();
      const hit = Object.keys(injected).find((k) => k.toLowerCase() === lower);
      if (hit) return injected[hit];
    }

    const firstKey = Object.keys(injected)[0];
    if (firstKey) return injected[firstKey];
    throw new Error("No compatible CIP-30 wallet provider found");
  }



  async function delegateToDRep(drepId: string, preferredKey?: string) {
    try {
      const walletProvider = getSelectedWalletProvider(preferredKey);
      const walletApi = await walletProvider.enable();
      // const CardanoWasm: any = await import("@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib");
      const hexToBytes = (hex: string): Uint8Array => {
        const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
        }
        return bytes;
      };
      const bytesToHex = (bytes: Uint8Array): string =>
        Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");


      const rewardAddrHex: string | undefined = (await walletApi.getRewardAddresses())?.[0];
      if (!rewardAddrHex) throw new Error("Wallet has no reward (staking) address");

      const rewardAddr = CardanoWasm.Address.from_bytes(hexToBytes(rewardAddrHex));
      const reward = CardanoWasm.RewardAddress.from_address(rewardAddr);
      if (!reward) throw new Error("Invalid reward address");
      const stakeCred = reward.payment_cred();
      const drep = CardanoWasm.DRep.from_bech32(drepId);
      const cert = CardanoWasm.Certificate.new_vote_delegation(
        CardanoWasm.VoteDelegation.new(stakeCred, drep)
      );
      const ppRes = await fetch(`${BLOCKFROST_PROXY}/epochs/latest/parameters`);
      if (!ppRes.ok) throw new Error(`Params HTTP ${ppRes.status}`);
      const protocolParams = await ppRes.json();

      const minFeeA = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_a));
      const minFeeB = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_b));
      const linearFee = CardanoWasm.LinearFee.new(minFeeA, minFeeB);

      const coinsPerUtxoByteStr = String(
        protocolParams.coins_per_utxo_byte ??
        (protocolParams.coins_per_utxo_word ? Math.floor(Number(protocolParams.coins_per_utxo_word) / 8) : 0)
      );

      const builderCfg = CardanoWasm.TransactionBuilderConfigBuilder.new()
        .fee_algo(linearFee)
        .coins_per_utxo_byte(CardanoWasm.BigNum.from_str(coinsPerUtxoByteStr))
        .pool_deposit(CardanoWasm.BigNum.from_str(String(protocolParams.pool_deposit ?? 0)))
        .key_deposit(CardanoWasm.BigNum.from_str(String(protocolParams.key_deposit ?? 0)))
        .max_tx_size(Number(protocolParams.max_tx_size ?? 16384))
        .max_value_size(Number(protocolParams.max_value_size ?? 5000))
        .build();

      const txBuilder: any = CardanoWasm.TransactionBuilder.new(builderCfg);
      const utxosHex: string[] = await walletApi.getUtxos();
      const utxos = utxosHex.map((u) => CardanoWasm.TransactionUnspentOutput.from_bytes(hexToBytes(u)));
      
      // Build UTXO set
      const utxoSet = CardanoWasm.TransactionUnspentOutputs.new();
      utxos.forEach((u) => utxoSet.add(u));
      
      // Let CSL choose inputs
      txBuilder.add_inputs_from(
        utxoSet,
        CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst
      );
      const certs = CardanoWasm.Certificates.new();
      certs.add(cert);
      txBuilder.set_certs(certs);
      const changeAddrHex: string = await walletApi.getChangeAddress();
      const changeAddr = CardanoWasm.Address.from_bytes(hexToBytes(changeAddrHex));
      txBuilder.add_change_if_needed(changeAddr);
      const txBody = txBuilder.build();
      const tx = CardanoWasm.Transaction.new(
        txBody,
        CardanoWasm.TransactionWitnessSet.new()
      );
      const txHex = bytesToHex(tx.to_bytes());

      const signedTx = await walletApi.signTx(txHex, true);
      const txHash = await walletApi.submitTx(signedTx);

      showSuccess("Delegated to DRep", `DRep: ${drepId}\nTx: ${txHash}`);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("No Cardano wallet detected")) {
        showError("No wallet found", "Please install a Cardano wallet (Eternl, Nami, Lace) and refresh the page.");
      } else if (error.message.includes("reward address")) {
        showError("Staking key missing", "Your wallet doesn't have a staking key. Please use a staking-capable account.");
      } else if (error.message.includes("protocol parameters")) {
        showError("Network error", "Failed to fetch Cardano network parameters. Check your internet connection.");
      } else if (error.message.includes("UTXOs")) {
        showError("Wallet empty", "Your wallet has no UTXOs to spend. Please add some ADA to your wallet.");
      } else if (error.message.includes("signTx")) {
        showError("Transaction rejected", "You rejected the transaction or signing failed. Please try again.");
      } else if (error.message.includes("submitTx")) {
        showError("Transaction failed", "Transaction was rejected by the network. Check your wallet balance and try again.");
      } else {
        showError("DRep delegation failed", `Error: ${error.message}`);
      }
    }
  }

  async function delegateToPool(poolId: string, preferredKey?: string) {
    try {
      const walletProvider = getSelectedWalletProvider(preferredKey);
      const walletApi = await walletProvider.enable();
      const { runDelegateToPool } = await import("./delegateToPoolAction");
      const { txHash } = await runDelegateToPool(BLOCKFROST_PROXY, walletApi, poolId);
      showSuccess("Delegated to pool", `Pool: ${poolId}\nTx: ${txHash}`);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("No Cardano wallet detected")) {
        showError("No wallet found", "Please install a Cardano wallet (Eternl, Nami, Lace) and refresh the page.");
      } else if (error.message.includes("reward address")) {
        showError("Staking key missing", "Your wallet doesn't have a staking key. Please use a staking-capable account.");
      } else if (error.message.includes("Blockfrost")) {
        showError("Network error", "Failed to connect to Cardano network. Check your internet connection.");
      } else if (error.message.includes("signTx")) {
        showError("Transaction rejected", "You rejected the transaction or signing failed. Please try again.");
      } else if (error.message.includes("submitTx")) {
        showError("Transaction failed", "Transaction was rejected by the network. Check your wallet balance and try again.");
      } else {
        showError("Pool delegation failed", `Error: ${error.message}`);
      }
    }
  }

  function shortenId(id: string): string {
    if (!id) return "";
    if (id.length <= 20) return id;
    return `${id.slice(0, 12)}…${id.slice(-8)}`;
  }

  async function copyPoolId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      showSuccess("Copied ID", shortenId(id));
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        showError("Copy blocked", "Browser blocked clipboard access. Please allow clipboard permissions.");
      } else if (error.name === 'NotFoundError') {
        showError("Clipboard unavailable", "Clipboard API not supported in this browser.");
      } else {
        showError("Copy failed", `Unable to copy: ${error.message}`);
      }
    }
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="font-semibold">Failed to load data</div>
            <div className="text-sm mt-1">
              {error.includes("Missing NEXT_PUBLIC_BLOCKFROST_KEY") 
                ? "Blockfrost API key is missing. Please check your environment configuration."
                : error.includes("CORS") || error.includes("fetch")
                ? "Network error: Unable to connect to Blockfrost API. This might be a CORS issue or network problem."
                : error.includes("404")
                ? "API endpoint not found. The requested data might not be available."
                : `Error: ${error}`
              }
            </div>
            <div className="text-xs mt-2 opacity-75">Check browser console for technical details.</div>
          </div>
        )}
        {loading && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-6 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-4 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-3 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        <DrepCard
          drepId={DREP_BECH32}
          status={drepStatus}
          votingPower={votingPower}
          loading={loading}
          onCopy={copyPoolId}
          onDelegate={() => setWalletPicker({ open: true, action: { type: "drep", id: DREP_BECH32 } })}
        />

        {pools && Object.keys(pools).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(pools).map(([poolId, info]) => (
              <PoolCard
                key={poolId}
                poolId={poolId}
                ticker={info.ticker}
                delegators={info.delegators}
                blocks={info.blocks}
                stake={info.stake}
                pledge={info.pledge}
                loading={loading}
                onCopy={copyPoolId}
                onDelegate={() => setWalletPicker({ open: true, action: { type: "pool", id: poolId } })}
              />
            ))}
          </div>
        ) : (
          !loading && <p className="text-center text-gray-500">No pool data available (check API key/proxy).</p>
        )}

        <DelegateList drepId={DREP_BECH32} title="Recent DRep Delegators" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DelegateList poolId={VILAI_POOL} title="VILAI Pool Delegators" />
          <DelegateList poolId={HADA_POOL} title="HADA Pool Delegators" />
        </div>

        <WalletPickerModal
          open={walletPicker.open}
          onClose={() => setWalletPicker({ open: false, action: null })}
          isInstalled={isWalletInstalledByKey}
          onSelect={async (key) => {
            try {
              const sel = walletPicker.action;
              setWalletPicker({ open: false, action: null });
              if (!sel) return;
              if (sel.type === "drep") await delegateToDRep(sel.id, key);
              else await delegateToPool(sel.id, key);
            } catch (err) {
              showError("Wallet selection failed", (err as Error).message);
            }
          }}
        />
      </div>
    </div>
  );
}