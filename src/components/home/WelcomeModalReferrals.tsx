"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useToastContext } from "~/components/toast-provider";
import { Users, Mail, Phone, Calendar, User, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ReferralDetail } from "~/constants/users";

interface WelcomeModalReferralsProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerateWarning?: boolean;
}

const PER_PAGE = 5;

export default function WelcomeModalReferrals({ isOpen, onClose, isGenerateWarning = false }: WelcomeModalReferralsProps) {
  const { data: session } = useSession();
  const { showSuccess } = useToastContext();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data: apiData, isLoading: loading, error: apiError, isError } = useQuery({
    queryKey: ["user-referrals"],
    queryFn: async () => {
      const r = await fetch("/api/user/referrals");
      const data = await r.json();
      if (!data.success) throw new Error(data.message ?? "Failed");
      return data.data as { referrals?: ReferralDetail[]; user?: any };
    },
    enabled: !!session?.user && isOpen,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  const referrals = apiData?.referrals ?? [];
  const userInfo = apiData?.user ?? null;
  const error = isError ? "Failed to load" : null;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => setPage(1), [search]);

  const filtered = referrals.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.referralCode?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const list = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => showSuccess(`${label} copied!`)).catch(() => showSuccess("Failed to copy"));
  };

  if (!isOpen) return null;

  const closeBackdrop = (e: React.MouseEvent) => { if (e.target === overlayRef.current) onClose(); };

  if (isGenerateWarning) {
    return createPortal(
      <div ref={overlayRef} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeBackdrop} role="dialog" aria-modal="true">
        <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-[40px]  border border-gray-200 dark:border-gray-600 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚠️ Warning</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              If you generate your own referral code, you will <strong>NOT</strong> be able to use someone else&apos;s code in the contact form. Continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium">Cancel</button>
              <button
                type="button"
                disabled={generating}
                onClick={async () => {
                  setGenerating(true);
                  try {
                    const r = await fetch("/api/user/referral-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate" }) });
                    const data = await r.json();
                    if (data.success) { showSuccess("Code generated!"); window.dispatchEvent(new CustomEvent("session-update")); onClose(); }
                    else showSuccess(data.message ?? "Failed");
                  } catch { showSuccess("Failed"); }
                  finally { setGenerating(false); }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Code"}
              </button>
            </div>
          </div>
          <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeBackdrop} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-[40px]  p-8">
          {loading ? (
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />)}</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Thử lại</button>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chưa có referral</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Chia sẻ mã giới thiệu để bắt đầu.</p>
              {userInfo?.referralCode && (
                <code className="block bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded text-lg font-mono" onClick={() => copy(userInfo.referralCode, "Code")}>{userInfo.referralCode}</code>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Referrals</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} / {referrals.length}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Tìm theo tên, email, mã, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {list.map((r) => (
                  <div key={r.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{r.name}</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">{r.referralCode}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.user?.provider ?? "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>
                      {r.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    {r.user?.id && <button type="button" onClick={() => copy(r.user.id, "ID")} className="mt-1 text-xs text-gray-500 hover:underline">ID: {r.user.id.slice(0, 8)}...</button>}
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Trang {page} / {totalPages}</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50" aria-label="Trang trước"><ChevronLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50" aria-label="Trang sau"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70" aria-label="Close">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
