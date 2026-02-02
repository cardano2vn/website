
export async function runDelegateToPool(
  blockfrostProxy: string,
  walletApi: unknown,
  poolId: string
): Promise<{ txHash: string }> {
  const { Lucid, Blockfrost } = await import("lucid-cardano");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lucid = await Lucid.new(
    new Blockfrost(`${origin}${blockfrostProxy}`, "proxy"),
    "Mainnet"
  );
  lucid.selectWallet(walletApi as any);

  const rewardAddress = await lucid.wallet.rewardAddress();
  if (!rewardAddress) {
    throw new Error("Wallet has no reward address (no staking key). Please use a staking-capable account.");
  }

  const tx = await lucid.newTx().delegateTo(rewardAddress, poolId).complete();
  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  return { txHash };
}
