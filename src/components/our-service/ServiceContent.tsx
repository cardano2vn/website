"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import WalletPickerModal from "~/components/our-service/WalletPickerModal";
import DrepCard from "~/components/our-service/DrepCard";
import PoolCard from "~/components/our-service/PoolCard";
import { useToastContext } from "~/components/toast-provider";
import * as CardanoWasm from "@emurgo/cardano-serialization-lib-asmjs";
import { cardanoWallet } from "~/lib/cardano-wallet";
import { runDelegateToPool } from "~/components/our-service/delegateToPoolAction";

const BLOCKFROST_PROXY = "/api/blockfrost";
const DREP_BECH32 = "drep1ygqlu72zwxszcx0kqdzst4k3g6fxx4klwcmpk0fcuujskvg3pmhgs";
const VILAI_POOL = "pool1u7zrgexnxsysctnnwljjjymr70he829fr5n3vefnv80guxr42dv";
const HADA_POOL = "pool1rqgf6qd0p3wyf9dxf2w7qcddvgg4vu56l35ez2xqemhqun2gn7y";
const STALE_MS = 7 * 24 * 60 * 60 * 1000;

type PoolInfo = { ticker: string; delegators: number | null; blocks: number | null; stake: string | null; pledge: string | null };

export default function ServiceContent() {
  const { showSuccess, showError } = useToastContext();
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
    staleTime: STALE_MS,
    gcTime: 10 * 60 * 60 * 1000,
  });

  const vilaiQuery = useQuery({
    queryKey: ["blockfrost", "pool", VILAI_POOL],
    queryFn: async () => {
      const res = await fetch(`${BLOCKFROST_PROXY}/pools/${VILAI_POOL}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: STALE_MS,
    gcTime: 10 * 60 * 60 * 1000,
  });

  const hadaQuery = useQuery({
    queryKey: ["blockfrost", "pool", HADA_POOL],
    queryFn: async () => {
      const res = await fetch(`${BLOCKFROST_PROXY}/pools/${HADA_POOL}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: STALE_MS,
    gcTime: 10 * 60 * 60 * 1000,
  });

  const loading = drepQuery.isLoading || vilaiQuery.isLoading || hadaQuery.isLoading;
  const error = drepQuery.error ? (drepQuery.error as Error).message : (vilaiQuery.error || hadaQuery.error) ? String(vilaiQuery.error || hadaQuery.error) : null;
  const drepJson = drepQuery.data;
  const drepStatus = !drepJson ? "Not registered" : drepJson.active ? "Active" : drepJson.retired ? "Retired" : drepJson.expired ? "Expired" : "Inactive";
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
    const injected: any = typeof window !== "undefined" && (window as any).cardano ? (window as any).cardano : null;
    if (!injected) return false;
    return Object.keys(injected).some((k) => k.toLowerCase() === key.toLowerCase());
  }

  function getSelectedWalletProvider(preferredKey?: string): any {
    const injected: any = typeof window !== "undefined" ? (window as any).cardano : null;
    if (!injected) throw new Error("No Cardano wallet detected");
    if (preferredKey) {
      const hit = Object.keys(injected).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
      if (hit) return injected[hit];
    }
    const currentName = cardanoWallet.getCurrentWalletName?.();
    const candidateOrder: string[] = currentName ? [currentName] : [];
    ["eternl", "nami", "lace", "yoroi", "gerowallet", "nufi", "typhoncip30"].forEach((k) => {
      if (!candidateOrder.some((c) => c.toLowerCase() === k.toLowerCase())) candidateOrder.push(k);
    });
    for (const key of candidateOrder) {
      if (injected[key]) return injected[key];
      const hit = Object.keys(injected).find((k) => k.toLowerCase() === key.toLowerCase());
      if (hit) return injected[hit];
    }
    const firstKey = Object.keys(injected)[0];
    if (firstKey) return injected[firstKey];
    throw new Error("No compatible CIP-30 wallet provider found");
  }

  const hexToBytes = (hex: string): Uint8Array => {
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    return bytes;
  };
  const bytesToHex = (bytes: Uint8Array): string =>
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  async function delegateToDRep(drepId: string, preferredKey?: string) {
    try {
      const walletProvider = getSelectedWalletProvider(preferredKey);
      const walletApi = await walletProvider.enable();
      const rewardAddrHex: string | undefined = (await walletApi.getRewardAddresses())?.[0];
      if (!rewardAddrHex) throw new Error("Wallet has no reward (staking) address");
      const rewardAddr = CardanoWasm.Address.from_bytes(hexToBytes(rewardAddrHex));
      const reward = CardanoWasm.RewardAddress.from_address(rewardAddr);
      if (!reward) throw new Error("Invalid reward address");
      const stakeCred = reward.payment_cred();
      const drep = CardanoWasm.DRep.from_bech32(drepId);
      const cert = CardanoWasm.Certificate.new_vote_delegation(CardanoWasm.VoteDelegation.new(stakeCred, drep));
      const ppRes = await fetch(`${BLOCKFROST_PROXY}/epochs/latest/parameters`);
      if (!ppRes.ok) throw new Error(`Params HTTP ${ppRes.status}`);
      const protocolParams = await ppRes.json();
      const minFeeA = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_a));
      const minFeeB = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_b));
      const linearFee = CardanoWasm.LinearFee.new(minFeeA, minFeeB);
      const coinsPerUtxoByteStr = String(protocolParams.coins_per_utxo_byte ?? (protocolParams.coins_per_utxo_word ? Math.floor(Number(protocolParams.coins_per_utxo_word) / 8) : 0));
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
      const utxoSet = CardanoWasm.TransactionUnspentOutputs.new();
      utxos.forEach((u) => utxoSet.add(u));
      txBuilder.add_inputs_from(utxoSet, CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst);
      const certs = CardanoWasm.Certificates.new();
      certs.add(cert);
      txBuilder.set_certs(certs);
      const changeAddrHex = await walletApi.getChangeAddress();
      const changeAddr = CardanoWasm.Address.from_bytes(hexToBytes(changeAddrHex));
      txBuilder.add_change_if_needed(changeAddr);
      const txBody = txBuilder.build();
      const tx = CardanoWasm.Transaction.new(txBody, CardanoWasm.TransactionWitnessSet.new());
      const txHex = bytesToHex(tx.to_bytes());
      const signedTx = await walletApi.signTx(txHex, true);
      const txHash = await walletApi.submitTx(signedTx);
      showSuccess("Delegated to DRep", `DRep: ${drepId}\nTx: ${txHash}`);
    } catch (err) {
      const e = err as Error;
      if (e.message?.includes("No Cardano wallet")) showError("No wallet found", "Please install a Cardano wallet (Eternl, Nami, Lace) and refresh.");
      else if (e.message?.includes("reward address")) showError("Staking key missing", "Your wallet doesn't have a staking key.");
      else if (e.message?.includes("signTx")) showError("Transaction rejected", "You rejected the transaction. Please try again.");
      else if (e.message?.includes("submitTx")) showError("Transaction failed", "Transaction was rejected by the network.");
      else showError("DRep delegation failed", e.message ?? String(err));
    }
  }

  async function delegateToPool(poolId: string, preferredKey?: string) {
    try {
      const walletProvider = getSelectedWalletProvider(preferredKey);
      const walletApi = await walletProvider.enable();
      const { txHash } = await runDelegateToPool(BLOCKFROST_PROXY, walletApi, poolId);
      showSuccess("Delegated to pool", `Pool: ${poolId}\nTx: ${txHash}`);
    } catch (err) {
      const e = err as Error;
      if (e.message?.includes("No Cardano wallet")) showError("No wallet found", "Please install a Cardano wallet and refresh.");
      else if (e.message?.includes("reward address")) showError("Staking key missing", "Your wallet doesn't have a staking key.");
      else if (e.message?.includes("signTx")) showError("Transaction rejected", "You rejected the transaction.");
      else if (e.message?.includes("submitTx")) showError("Transaction failed", "Transaction was rejected by the network.");
      else showError("Pool delegation failed", e.message ?? String(err));
    }
  }

  function shortenId(id: string) {
    if (!id || id.length <= 20) return id;
    return `${id.slice(0, 12)}…${id.slice(-8)}`;
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      showSuccess("Copied", shortenId(id));
    } catch (e) {
      showError("Copy failed", (e as Error).message);
    }
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error.includes("Missing") ? "Blockfrost API key is missing." : error.includes("CORS") || error.includes("fetch") ? "Network error." : error}
          </div>
        )}

        <DrepCard
          drepId={DREP_BECH32}
          status={drepStatus}
          votingPower={votingPower}
          loading={loading}
          onCopy={copyId}
          onDelegate={() => setWalletPicker({ open: true, action: { type: "drep", id: DREP_BECH32 } })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([VILAI_POOL, HADA_POOL] as const).map((poolId) => {
            const info = pools[poolId];
            return (
              <PoolCard
                key={poolId}
                poolId={poolId}
                ticker={info.ticker}
                delegators={info.delegators}
                blocks={info.blocks}
                stake={info.stake}
                pledge={info.pledge}
                loading={loading}
                onCopy={copyId}
                onDelegate={() => setWalletPicker({ open: true, action: { type: "pool", id: poolId } })}
              />
            );
          })}
        </div>

        <WalletPickerModal
          open={walletPicker.open}
          onClose={() => setWalletPicker({ open: false, action: null })}
          isInstalled={isWalletInstalledByKey}
          onSelect={async (key) => {
            const sel = walletPicker.action;
            setWalletPicker({ open: false, action: null });
            if (!sel) return;
            try {
              if (sel.type === "drep") await delegateToDRep(sel.id, key);
              else await delegateToPool(sel.id, key);
            } catch (e) {
              showError("Wallet selection failed", (e as Error).message);
            }
          }}
        />
      </div>
    </div>
  );
}
