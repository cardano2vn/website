"use client";

import React from "react";
import CountUp from "react-countup";

export default function DrepCard({
  drepId,
  status,
  votingPower,
  loading,
  onCopy,
  onDelegate,
}: {
  drepId: string;
  status: string;
  votingPower: string;
  loading: boolean;
  onCopy: (id: string) => void;
  onDelegate: () => void;
}) {
  const shorten = (id: string) => (id.length <= 20 ? id : `${id.slice(0, 12)}…${id.slice(-8)}`);
  const statusTone = (s: string) => {
    const v = s.toLowerCase();
    if (v.includes("active")) return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30";
    if (v.includes("retired") || v.includes("expired")) return "bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/30";
    return "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-300/20";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/80 shadow-sm">
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Our DREP: C2VN</h3>
          <span className={`px-2.5 py-1 text-xs sm:text-[0.8rem] font-medium rounded-full ${statusTone(status)}`}>
            {loading ? "…" : status}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">DRep ID</div>
            <button
              type="button"
              onClick={() => onCopy(drepId)}
              title="Copy DRep ID"
              className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              <span className="truncate max-w-[260px] sm:max-w-[320px]">{shorten(drepId)}</span>
            </button>
          </div>

          <div className="min-w-0">
            <div className="text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Voting Power</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {loading ? "…" : (
                (() => {
                  // expect format like "1,234,567.890 ₳"
                  const match = String(votingPower).match(/([\d,]+(?:\.[\d]+)?)\s*₳/);
                  if (!match) return votingPower;
                  const num = parseFloat(match[1].replace(/,/g, ""));
                  if (!Number.isFinite(num)) return votingPower;
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

        <div className="mt-6">
          <button
            onClick={onDelegate}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 sm:px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70"
          >
            Delegate to DRep
          </button>
        </div>
      </div>
    </div>
  );
}


