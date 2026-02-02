"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WalletPickerModal from "~/components/our-service/WalletPickerModal";
import { useToastContext } from "~/components/toast-provider";
import * as CardanoWasm from "@emurgo/cardano-serialization-lib-asmjs";
import { cardanoWallet } from "~/lib/cardano-wallet";

interface ServiceAdCardProps {
  onDelegateDrep?: () => void;
  onDelegatePool?: () => void;
  onDelegateService?: () => void;
}

const BLOCKFROST_PROXY = "/api/blockfrost";

const DREP_BECH32 = "drep1ygqlu72zwxszcx0kqdzst4k3g6fxx4klwcmpk0fcuujskvg3pmhgs";
const VILAI_POOL = "pool1u7zrgexnxsysctnnwljjjymr70he829fr5n3vefnv80guxr42dv";

export default function ServiceAdCard({ 
  onDelegateService 
}: ServiceAdCardProps) {
  const { showSuccess, showError } = useToastContext();
  const [walletPicker, setWalletPicker] = useState<{
    open: boolean;
    action: null | { type: "drep"; id: string } | { type: "pool"; id: string };
  }>({ open: false, action: null });

  function isWalletInstalledByKey(key: string): boolean {
    const injected: any = (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) return false;
    return Object.keys(injected).some((k) => k.toLowerCase() === key.toLowerCase());
  }

  function getSelectedWalletProvider(preferredKey?: string): any {
    const injected: any = (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) throw new Error("No Cardano wallet detected");
    if (preferredKey) {
      const hit = Object.keys(injected).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
      if (hit) return injected[hit];
    }

    const currentName = cardanoWallet.getCurrentWalletName?.();
    const candidateOrder: string[] = [];
    if (currentName) candidateOrder.push(currentName);

    const preferredAliases = ["eternl", "nami", "lace", "yoroi", "gerowallet", "nufi", "typhoncip30"];
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
      
      const utxoSet = CardanoWasm.TransactionUnspentOutputs.new();
      utxos.forEach((u) => utxoSet.add(u));
      
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
      const { Lucid, Blockfrost } = await import("lucid-cardano");
      const lucid = await Lucid.new(
        new Blockfrost(`${window.location.origin}${BLOCKFROST_PROXY}`, "proxy"),
        "Mainnet"
      );

      lucid.selectWallet(walletApi);

      const rewardAddress = await lucid.wallet.rewardAddress();
      if (!rewardAddress) {
        throw new Error("Wallet has no reward address (no staking key). Please use a staking-capable account.");
      }

      const tx = await lucid
        .newTx()
        .delegateTo(rewardAddress, poolId)
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

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
  const services = [
    {
      id: "drep",
      title: "DREP C2VN",
      description: "Delegate voting power",
      onDelegate: () => setWalletPicker({ open: true, action: { type: "drep", id: DREP_BECH32 } })
    },
    {
      id: "pool",
      title: "Stake Pool C2VN", 
      description: "Delegate ADA for rewards",
      onDelegate: () => setWalletPicker({ open: true, action: { type: "pool", id: VILAI_POOL } })
    },
    {
      id: "service",
      title: "Our Services",
      description: "Explore all services",
      onDelegate: onDelegateService
    }
  ];

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white inline-flex items-center gap-2">
          <Image src="/images/common/arrow.png" alt="arrow" width={40} height={40} />
          Our Services
        </h4>
      </div>
      
      <div className="rounded-md ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm divide-y divide-gray-200/70 dark:divide-gray-700/60 overflow-hidden">
        {services.map((service) => (
          <div
            key={service.id}
            className="group relative flex items-center justify-between py-3 px-3 hover:bg-indigo-50/70 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <span className="absolute left-0 top-0 h-full w-0.5 bg-indigo-400/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {service.title}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {service.description}
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            {service.id === "service" ? (
              <Link 
                href="/our-service"
                className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                View
              </Link>
            ) : (
              <button
                onClick={service.onDelegate}
                className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Delegate
              </button>
            )}
          </div>
        ))}
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
            
            if (sel.type === "drep") {
              await delegateToDRep(sel.id, key);
            } else if (sel.type === "pool") {
              await delegateToPool(sel.id, key);
            }
          } catch (err) {
            showError("Wallet selection failed", (err as Error).message);
          }
        }}
      />
    </div>
  );
}
