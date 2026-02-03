import * as CardanoWasm from "@emurgo/cardano-serialization-lib-asmjs";
import { bech32 } from "bech32";

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function poolIdBech32ToKeyHash(poolIdBech32: string): Uint8Array {
  const decoded = bech32.decode(poolIdBech32);
  const bytes = bech32.fromWords(decoded.words);
  return new Uint8Array(bytes);
}

export async function runDelegateToPool(
  blockfrostProxy: string,
  walletApi: { getRewardAddresses: () => Promise<string[]>; getUtxos: () => Promise<string[]>; getChangeAddress: () => Promise<string>; signTx: (tx: string, partialSign?: boolean) => Promise<string>; submitTx: (tx: string) => Promise<string> },
  poolIdBech32: string
): Promise<{ txHash: string }> {
  const rewardAddrHex = (await walletApi.getRewardAddresses())?.[0];
  if (!rewardAddrHex) throw new Error("Wallet has no reward (staking) address");

  const poolKeyHashBytes = poolIdBech32ToKeyHash(poolIdBech32);
  const poolKeyHash = CardanoWasm.Ed25519KeyHash.from_bytes(poolKeyHashBytes);

  const rewardAddr = CardanoWasm.Address.from_bytes(hexToBytes(rewardAddrHex));
  const reward = CardanoWasm.RewardAddress.from_address(rewardAddr);
  if (!reward) throw new Error("Invalid reward address");
  const stakeCred = reward.payment_cred();

  const stakeDelegation = CardanoWasm.StakeDelegation.new(stakeCred, poolKeyHash);
  const cert = CardanoWasm.Certificate.new_stake_delegation(stakeDelegation);

  const ppRes = await fetch(`${blockfrostProxy}/epochs/latest/parameters`);
  if (!ppRes.ok) throw new Error(`Params HTTP ${ppRes.status}`);
  const protocolParams = await ppRes.json();

  const minFeeA = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_a));
  const minFeeB = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_b));
  const linearFee = CardanoWasm.LinearFee.new(minFeeA, minFeeB);
  const coinsPerUtxoByteStr = String(
    protocolParams.coins_per_utxo_byte ?? (protocolParams.coins_per_utxo_word ? Math.floor(Number(protocolParams.coins_per_utxo_word) / 8) : 0)
  );
  const builderCfg = CardanoWasm.TransactionBuilderConfigBuilder.new()
    .fee_algo(linearFee)
    .coins_per_utxo_byte(CardanoWasm.BigNum.from_str(coinsPerUtxoByteStr))
    .pool_deposit(CardanoWasm.BigNum.from_str(String(protocolParams.pool_deposit ?? 0)))
    .key_deposit(CardanoWasm.BigNum.from_str(String(protocolParams.key_deposit ?? 0)))
    .max_tx_size(Number(protocolParams.max_tx_size ?? 16384))
    .max_value_size(Number(protocolParams.max_value_size ?? 5000))
    .build();

  const txBuilder = CardanoWasm.TransactionBuilder.new(builderCfg);
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
  return { txHash };
}
