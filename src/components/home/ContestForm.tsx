"use client";

import React from "react";
import { useToastContext } from "~/components/toast-provider";

export default function ContestForm({ onStart }: { onStart?: (email: string) => void }) {
  const { showError } = useToastContext();
  const [email, setEmail] = React.useState("");
  const [starting, setStarting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const trimmed = email.trim();
      const isGmail = /^[^\s@]+@gmail\.com$/i.test(trimmed);
      if (!isGmail) throw new Error("Please enter a valid @gmail.com email");
      setStarting(true);
      try { sessionStorage.setItem('contest_email', email.trim()); } catch {}
      if (onStart) onStart(trimmed);
    } catch (e) {
      showError("Start failed", (e as Error).message);
      setStarting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="p-4 sm:p-5 w-full">
        <div className="grid grid-cols-1 gap-3 w-full">
          <form onSubmit={onSubmit}>
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                  placeholder="you@gmail.com"
                  disabled={starting}
                />
              </div>
              <button
                type="submit"
                disabled={starting || !/^[^\s@]+@gmail\.com$/i.test(email.trim())}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success text-sm sm:text-base bg-blue-600 dark:bg-white px-4 sm:px-5 py-2 sm:py-2.5 font-semibold text-white dark:text-blue-900 hover:bg-blue-700 dark:hover:bg-gray-100 w-full md:w-auto"
              >
                {starting ? 'Starting...' : 'Start Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


