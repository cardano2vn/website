"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const WALLET_ORDER = ["eternl", "nami", "lace", "yoroi", "gerowallet", "nufi", "typhoncip30"];

export default function WalletPickerModal({
  open,
  onClose,
  isInstalled,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  isInstalled: (key: string) => boolean;
  onSelect: (key: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const injected = (window as any).cardano;
    if (injected && typeof injected === "object") {
      const all = Object.keys(injected) as string[];
      const ordered = [...WALLET_ORDER.filter((k) => all.some((a) => a.toLowerCase() === k.toLowerCase())), ...all.filter((k) => !WALLET_ORDER.some((w) => w.toLowerCase() === k.toLowerCase()))];
      setKeys(ordered);
    } else {
      setKeys([]);
    }
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-picker-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="wallet-picker-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {keys.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Cardano wallet detected. Install Eternl, Nami, or Lace.</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  disabled={!isInstalled(key)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-medium capitalize"
                >
                  {key}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body
  );
}
