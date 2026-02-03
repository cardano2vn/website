"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Member from "~/components/member";
import MemberModal from "~/components/MemberModal";
import Title from "~/components/title";
import AboutSection from "~/components/project/AboutSection";
import AboutContactForm from "~/components/about/AboutContactForm";
import Pagination from "../pagination";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { useToastContext } from "~/components/toast-provider";
import { useNotifications } from "~/hooks/useNotifications";
import { ContactFormData, FormErrors } from "~/constants/contact";
import { MemberType, Tab } from "~/constants/members";

const ITEMS_PER_PAGE = 6;
const LAYOUT = "mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-20";
const MAIN_CLASS = "relative pt-16 bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900";

const initialFormData: ContactFormData = {
  "your-name": "", "your-number": "", "your-email": "", "address-wallet": "", "email-intro": "", "event-location": "", "your-course": "", message: "",
};

function useMembers() {
  const q = useQuery({ queryKey: ["members"], queryFn: async () => { const r = await fetch("/api/members"); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  return { members: (q.data?.data || []) as MemberType[], isLoading: q.isLoading };
}

function useTabs() {
  const q = useQuery({ queryKey: ["tabs"], queryFn: async () => { const r = await fetch("/api/tabs"); if (!r.ok) throw new Error("Failed"); return r.json(); } });
  return { tabs: (q.data?.data || []) as Tab[] };
}

function MembersSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-64 mb-4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function AboutSectionSkeleton() {
  return (
    <div className="w-full max-w-[1200px] animate-pulse">
      <div className="aspect-video w-full rounded-2xl bg-gray-300 dark:bg-gray-700 mb-6" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function MemberPageClient() {
  useNotifications();
  const { data: session } = useSession();
  const { showSuccess, showError } = useToastContext();
  const { members, isLoading } = useMembers();
  const { tabs } = useTabs();

  const [selectedMember, setSelectedMember] = useState<MemberType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  const sortedTabs = [...tabs].sort((a, b) => a.order - b.order);
  const filteredMembers = members.filter((m) => activeTab === null ? true : activeTab === "no-tab" ? !m.tab : m.tab?.id === activeTab);
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.hash = `members?page=${page}`;
    window.history.replaceState(null, "", url.toString());
    document.getElementById("members")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith("members")) {
        const p = new URLSearchParams(hash.split("?")[1] || "").get("page");
        if (p) setCurrentPage(Math.max(1, Math.min(Number(p) || 1, totalPages)));
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [totalPages]);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  useEffect(() => {
    const user = session?.user as { address?: string; email?: string } | undefined;
    if (!user?.address && !user?.email) return;
    const url = new URL("/api/user", window.location.origin);
    if (user?.address) url.searchParams.set("address", user.address);
    if (user?.email) url.searchParams.set("email", user.email);
    fetch(url.toString()).then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.user?.email) setFormData((prev) => ({ ...prev, "your-email": d.user.email }));
    }).catch(() => {});
  }, [session]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData["your-name"].trim()) e["your-name"] = "Name is required";
    const email = formData["your-email"].trim();
    if (!email) e["your-email"] = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e["your-email"] = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (errors.contact && (name === "your-number" || name === "your-email")) setErrors((prev) => ({ ...prev, contact: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !captchaValid) {
      if (!captchaValid) setErrors((prev) => ({ ...prev, contact: "Please complete the captcha" }));
      return;
    }
    setIsSubmitting(true);
    try {
      const r = await fetch("/api/member/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formData, captchaText, captchaAnswer }) });
      if (!r.ok) throw new Error("Failed");
      setFormData(initialFormData);
      setErrors({});
      setCaptchaValid(false);
      setCaptchaText("");
      setCaptchaAnswer("");
      setCaptchaKey((k) => k + 1);
      showSuccess("Message sent successfully.");
    } catch {
      showError("Failed to send. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedIndex = () => selectedMember ? filteredMembers.findIndex((m) => m.id === selectedMember.id) : 0;

  if (isLoading) {
    return (
      <main className={MAIN_CLASS}>
        <BackgroundMotion />
        <section className={LAYOUT} id="about-top">
          <div id="executive-team" className="scroll-mt-28 md:scroll-mt-40"><Title title="Executive Team" description="Đội ngũ nòng cốt Cardano2VN." /></div>
          <div id="about-section" className="scroll-mt-28 md:scroll-mt-40 mb-16"><AboutSectionSkeleton /></div>
          <div id="our-cardano-team" className="scroll-mt-28 md:scroll-mt-40 mb-16">
            <div className="rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 p-8">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse" />
              <div className="space-y-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse" /><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 animate-pulse" /></div>
            </div>
          </div>
          <div id="members" className="scroll-mt-28 md:scroll-mt-40 pb-20"><MembersSkeleton /></div>
        </section>
        <section id="contact" className="scroll-mt-28 md:scroll-mt-40 pt-32 pb-12 lg:pt-40 lg:pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
          <div className={LAYOUT}>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2"><Title title="Get in Touch" description="Liên hệ với chúng tôi." /></div>
              <div className="w-full lg:w-1/2"><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={MAIN_CLASS} suppressHydrationWarning>
      <BackgroundMotion />
      <section className={LAYOUT} id="about-top">
        <div id="executive-team" className="scroll-mt-28 md:scroll-mt-40">
          <Title title="Executive Team" description="Đội ngũ nòng cốt Cardano2VN gồm những thành viên chủ chốt, trực tiếp định hướng chiến lược và phát triển dự án trên Cardano." />
        </div>
        <div id="about-section" className="scroll-mt-28 md:scroll-mt-40"><AboutSection /></div>
        <div id="our-cardano-team" className="scroll-mt-28 md:scroll-mt-40 mb-16">
          <div className="rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 p-8 backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Đội ngũ Cardano2VN</h3>
            <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">Cardano2VN là đội ngũ các chuyên gia và nhà phát triển giàu kinh nghiệm, cùng chung mục tiêu thúc đẩy việc ứng dụng và mở rộng hệ sinh thái Cardano tại Việt Nam và khu vực.</p>
            <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">Nhóm quy tụ nhiều thành viên có thành tích nổi bật trong các dự án quốc tế, được tài trợ bởi Project Catalyst. Với nền tảng chuyên môn vững chắc, Cardano2VN hướng tới xây dựng những giải pháp an toàn, minh bạch và hiệu quả.</p>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">Cardano2VN cam kết trở thành đối tác tin cậy, đồng hành cùng các dự án trong hành trình phát triển bền vững trên Cardano.</p>
          </div>
        </div>

        {sortedTabs.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex flex-wrap gap-1 sm:gap-2 md:gap-8 overflow-x-auto pb-2">
              <button type="button" onClick={() => setActiveTab(null)} className={`py-2 px-2 sm:px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${activeTab === null ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}>
                <span className="hidden sm:inline">All Members</span><span className="sm:hidden">All</span>
              </button>
              {sortedTabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 sm:px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}>
                  {tab.name.length > 8 ? tab.name.slice(0, 8) + "…" : tab.name}
                </button>
              ))}
            </nav>
          </div>
        )}

        <div id="members" className="scroll-mt-28 md:scroll-mt-40 pb-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedMembers.map((member) => (
              <Member key={member.id} name={member.name} description={member.description} role={member.role} image={member.image} onClick={() => { setSelectedMember(member); setIsModalOpen(true); }} />
            ))}
          </div>
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setPage} />}
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 md:scroll-mt-40 pt-32 pb-12 lg:pt-40 lg:pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
        <div className={LAYOUT}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2"><Title title="Get in Touch" description="Chúng tôi trân trọng mọi ý kiến và đóng góp của bạn. Hãy chia sẻ suy nghĩ hoặc liên hệ hợp tác cùng Cardano2vn." /></div>
            <div className="w-full lg:w-1/2">
              {session ? (
                <AboutContactForm formData={formData} errors={errors} isSubmitting={isSubmitting} captchaValid={captchaValid} captchaKey={captchaKey} onInputChange={onInputChange} onSubmit={handleSubmit} onCaptchaChange={({ isValid, text, answer }) => { setCaptchaValid(isValid); setCaptchaText(text); setCaptchaAnswer(answer); }} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Login Required</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">You need to be logged in to submit the contact form.</p>
                  <a href="/login" className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 focus:ring-2 focus:ring-blue-500">Login Now</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedMember && <MemberModal member={selectedMember} members={filteredMembers} initialIndex={getSelectedIndex()} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedMember(null); }} />}
    </main>
  );
}
