"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WelcomeModalData } from "~/constants/admin";
import { useToastContext } from "~/components/toast-provider";
import { TipTapPreview, TipTapEditor } from "~/components/ui/tiptap-editor";
import MediaInput from "~/components/ui/media-input";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const empty: WelcomeModalData = { title: "", description: "", imageUrl: "", buttonLink: "", startDate: "", endDate: "", publishStatus: "DRAFT", isActive: true };

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { data: session } = useSession();
  const [edit, setEdit] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<WelcomeModalData>(empty);
  const qc = useQueryClient();
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    if (!session?.user) return setIsAdmin(false);
    const u = session.user as { address?: string; email?: string };
    const url = new URL("/api/user", window.location.origin);
    if (u.address) url.searchParams.set("address", u.address);
    if (u.email) url.searchParams.set("email", u.email);
    fetch(url.toString()).then((r) => r.ok && r.json()).then((d) => setIsAdmin(d?.data?.role?.name === "ADMIN")).catch(() => setIsAdmin(false));
  }, [session]);

  const { data, isLoading } = useQuery({
    queryKey: ["welcome-modal"],
    queryFn: async () => {
      const r = await fetch("/api/welcome-modal");
      if (!r.ok) return null;
      const json = await r.json();
      return json?.data ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title ?? "",
      description: data.description ?? "",
      imageUrl: data.imageUrl ?? "",
      buttonLink: data.buttonLink ?? "",
      startDate: data.startDate ? (typeof data.startDate === "string" ? data.startDate : new Date(data.startDate).toISOString().slice(0, 10)) : "",
      endDate: data.endDate ? (typeof data.endDate === "string" ? data.endDate : new Date(data.endDate).toISOString().slice(0, 10)) : "",
      publishStatus: data.publishStatus ?? "DRAFT",
      isActive: data.isActive ?? true,
    });
  }, [data]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) { window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn); }
  }, [isOpen, onClose]);

  const save = useMutation({
    mutationFn: (body: WelcomeModalData) =>
      fetch("/api/admin/welcome-modal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Save failed"); return r.json(); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["welcome-modal"] }); showSuccess("Saved"); setEdit(false); },
    onError: () => showError("Save failed"),
  });

  const show = isAdmin || (data?.publishStatus === "PUBLISHED" && (!data?.startDate || new Date(data.startDate) <= new Date()) && (!data?.endDate || new Date(data.endDate) >= new Date()));
  if (!isOpen || !show) return null;

  const d = data ?? form;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-[40px] ">
          <div className="aspect-video rounded-t-[40px] overflow-hidden">
            <img src={d?.imageUrl || "/images/common/loading.png"} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).src = "/images/common/loading.png")} />
          </div>
          <div className="p-8">
            {!edit ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{d?.title ?? ""}</h3>
                {(d?.startDate || d?.endDate) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {d?.startDate && `From: ${new Date(d.startDate).toLocaleDateString("en-US")}`}
                    {d?.startDate && d?.endDate && " — "}
                    {d?.endDate && `To: ${new Date(d.endDate).toLocaleDateString("en-US")}`}
                  </p>
                )}
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4">
                  <TipTapPreview content={d?.description ?? ""} />
                </div>
                <button type="button" onClick={() => { if (form.buttonLink) window.open(form.buttonLink, "_blank"); onClose(); }} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 mb-2">
                  Get Started
                </button>
              </>
            ) : isLoading ? (
              <div className="space-y-3"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /><div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></div>
            ) : (
              <div className="space-y-3">
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <MediaInput onMediaAdd={(m) => setForm((f) => ({ ...f, imageUrl: m.url }))} showVideoLibrary={false} />
                <TipTapEditor content={form.description ?? ""} onChange={(c) => setForm((f) => ({ ...f, description: c }))} placeholder="Description" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={form.startDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="date" value={form.endDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <input type="url" value={form.buttonLink ?? ""} onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))} placeholder="Button URL" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <select value={form.publishStatus} onChange={(e) => setForm((f) => ({ ...f, publishStatus: e.target.value as "DRAFT" | "PUBLISHED" }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
                <button type="button" onClick={() => save.mutate(form)} disabled={save.isPending} className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">{save.isPending ? "Đang lưu..." : "Lưu"}</button>
              </div>
            )}
            {isAdmin && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button type="button" onClick={() => setEdit((e) => !e)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{edit ? "Huỷ" : "Sửa"}</button>
              </div>
            )}
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
