"use client";

import React from "react";
import CountUp from "react-countup";

export default function PoolCard({
  poolId,
  ticker,
  delegators,
  blocks,
  stake,
  pledge,
  loading,
  onCopy,
  onDelegate,
}: {
  poolId: string;
  ticker: string;
  delegators: number | null;
  blocks: number | null;
  stake: string | null;
  pledge: string | null;
  loading: boolean;
  onCopy: (id: string) => void;
  onDelegate: () => void;
}) {
  const shorten = (id: string) => (id.length <= 20 ? id : `${id.slice(0, 12)}…${id.slice(-8)}`);
  

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/80 shadow-sm">
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{ticker}</h3>
          <span className="text-[12px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Pool ID</span>
        </div>

        <p
          className="text-sm text-gray-700 dark:text-gray-300 mb-4 break-all cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-400"
          title="Click to copy"
          onClick={() => onCopy(poolId)}
        >
          {shorten(poolId)}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 border border-gray-200/60 dark:border-gray-700/60">
            <div className="text-[12px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Delegators</div>
            <div className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {loading ? "…" : (
                <CountUp end={(delegators ?? 0) as number} duration={1} separator="," />
              )}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 border border-gray-200/60 dark:border-gray-700/60">
            <div className="text-[12px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Blocks</div>
            <div className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {loading ? "…" : (
                <CountUp end={(blocks ?? 0) as number} duration={1} separator="," />
              )}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 border border-gray-200/60 dark:border-gray-700/60 min-w-0">
            <div className="text-[12px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Live Stake</div>
            <div className="mt-1 text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {loading ? "…" : (
                (() => {
                  if (!stake) return "-";
                  const match = String(stake).match(/([\d,]+(?:\.[\d]+)?)\s*₳/);
                  if (!match) return stake;
                  const num = parseFloat(match[1].replace(/,/g, ""));
                  if (!Number.isFinite(num)) return stake;
                  const decimals = match[1].includes(".") ? Math.min(3, match[1].split(".")[1].length) : 0;
                  return (
                    <>
                      <CountUp end={num} duration={1.2} separator="," decimals={decimals} />
                      {" "}₳
                    </>
                  );
                })()
              )}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 border border-gray-200/60 dark:border-gray-700/60 min-w-0">
            <div className="text-[12px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Pledge</div>
            <div className="mt-1 text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {loading ? "…" : (
                (() => {
                  if (!pledge) return "-";
                  const match = String(pledge).match(/([\d,]+(?:\.[\d]+)?)\s*₳/);
                  if (!match) return pledge;
                  const num = parseFloat(match[1].replace(/,/g, ""));
                  if (!Number.isFinite(num)) return pledge;
                  const decimals = match[1].includes(".") ? Math.min(3, match[1].split(".")[1].length) : 0;
                  return (
                    <>
                      <CountUp end={num} duration={1.2} separator="," decimals={decimals} />
                      {" "}₳
                    </>
                  );
                })()
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onDelegate}
            className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70"
          >
            Delegate to {ticker}
          </button>
        </div>
      </div>
    </div>
  );
}


