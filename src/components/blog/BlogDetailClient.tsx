"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Share2, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { REACTION_ICONS } from "~/constants/posts";
import { BlogPostDetail } from "~/constants/posts";
import { Comment } from "~/constants/comment";
import { useToastContext } from "~/components/toast-provider";
import { TipTapPreview } from "~/components/ui/tiptap-preview";
import { scrollToCommentWithRetry } from "~/lib/mention-highlight";
import Header from "~/components/header";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import CommentSection from "~/components/blog/CommentSection";
import OlderNewsList from "~/components/blog/OlderNewsList";

const VI_WEEKDAY = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const formatDate = (s: string) => {
  const d = new Date(s);
  return `${VI_WEEKDAY[d.getDay()] ?? ""} - ${d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
};
const ytId = (url: string) => url?.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/#\s]{11})/)?.[1] ?? "";

const REACTIONS = [
  { image: "/images/reaction/like.png", type: "LIKE" },
  { image: "/images/reaction/tym.png", type: "HEART" },
  { image: "/images/reaction/haha.png", type: "HAHA" },
  { image: "/images/reaction/wow.png", type: "WOW" },
  { image: "/images/reaction/sad.png", type: "SAD" },
  { image: "/images/reaction/angry.png", type: "ANGRY" },
] as const;

type RawComment = { id: string; text?: string; content?: string; createdAt?: string; userId?: string; user?: { wallet?: string; image?: string; displayName?: string } | null; parentCommentId?: string | null; author?: string; avatar?: string };
function toFlat(cs: RawComment[]): Comment[] {
  return cs.map((c) => ({
    id: c.id,
    content: c.text ?? c.content ?? "",
    createdAt: c.createdAt ?? "",
    userId: c.userId ?? "",
    user: c.user ?? null,
    parentCommentId: c.parentCommentId ?? null,
    replies: [],
    author: c.user?.wallet ?? c.author ?? "",
    avatar: c.user?.image ?? c.avatar ?? "",
  }));
}
function toNested(flat: Comment[], authorId: string, authorWallet?: string): Comment[] {
  const map = new Map<string, Comment & { replies: Comment[]; parentUserId?: string; parentAuthor?: string }>();
  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  const roots: (Comment & { replies: Comment[]; parentUserId?: string; parentAuthor?: string })[] = [];
  const getDepth = (c: Comment): number => {
    let d = 1, cur: Comment | undefined = c;
    while (cur?.parentCommentId) {
      cur = map.get(cur.parentCommentId);
      if (!cur) break;
      d++;
    }
    return d;
  };
  flat.forEach((c) => {
    if (!c.parentCommentId) {
      roots.push(map.get(c.id)!);
      return;
    }
    let parent = map.get(c.parentCommentId);
    if (getDepth(c) > 3 && parent) {
      let cur = map.get(c.id)!;
      let d = getDepth(c);
      while (d > 3 && cur.parentCommentId) {
        cur = map.get(cur.parentCommentId)!;
        d--;
      }
      parent = cur;
    }
    if (parent) {
      const node = map.get(c.id)!;
      node.parentUserId = parent.userId;
      node.parentAuthor = parent.user?.wallet ?? parent.author ?? "";
      (parent.replies ??= []).push(node);
    }
  });
  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const mapOne = (c: Comment & { replies?: Comment[] }): Comment => ({
    ...c,
    author: c.userId && c.userId === authorId ? (authorWallet ?? c.user?.wallet ?? c.author ?? "") : (c.user?.displayName ?? c.user?.wallet ?? c.author ?? ""),
    isPostAuthor: !!(c.userId && authorId && c.userId === authorId),
    replies: (c.replies ?? []).map(mapOne),
  });
  return roots.map(mapOne);
}

const blueBtn = "inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50";

export default function BlogDetailClient({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToastContext();
  const [showReactions, setShowReactions] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [showAllComments] = useState(true);
  const proseRef = useRef<HTMLDivElement>(null);
  const reactionWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (reactionWrapRef.current && !reactionWrapRef.current.contains(e.target as Node)) setShowReactions(false);
    };
    if (showReactions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showReactions]);

  useEffect(() => {
    if (!slug || !session?.user) return;
    fetch("/api/blog/seen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: slug }), credentials: "include" }).catch(() => {});
    fetch(`/api/blog/seen?postId=${encodeURIComponent(slug)}`, { credentials: "include" })
      .then((r) => r.json().catch(() => ({})))
      .then((data) => {});
  }, [slug, session?.user]);

  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.replace("#comment-", "");
      if (id) setTimeout(() => scrollToCommentWithRetry(id), 1000);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const { data: postData, refetch: refetchPost } = useQuery({
    queryKey: ["public-post-detail", slug],
    queryFn: () => fetch(`/api/admin/posts/${slug}?public=1`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed")))),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
  const post: BlogPostDetail | null = postData?.data ?? null;

  const { data: reactData, refetch: refetchReactions } = useQuery({
    queryKey: ["post-reactions", slug],
    queryFn: () => fetch(`/api/blog/react?postId=${slug}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed")))),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
  const reactions: Record<string, number> = reactData?.data?.reactions ?? {};

  const { data: meReactData, refetch: refetchMeReact } = useQuery({
    queryKey: ["post-current-user-reaction", slug, !!session?.user],
    queryFn: () => (session?.user ? fetch(`/api/blog/react?postId=${slug}&me=1`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed")))) : Promise.resolve({ data: { currentUserReaction: null } })),
    enabled: !!slug && !!session?.user,
    staleTime: 2 * 60 * 1000,
  });
  const currentUserReaction: string | null = meReactData?.data?.currentUserReaction ?? null;

  const { data: relatedData } = useQuery({
    queryKey: ["related-posts", slug, post?.tags],
    queryFn: () => {
      if (!post?.tags?.length) return Promise.resolve({ data: [] });
      const tags = post.tags.map((t) => (typeof t === "string" ? t : t.name)).map((t) => `tags=${encodeURIComponent(t)}`).join("&");
      return fetch(`/api/admin/posts?public=1&${tags}&exclude=${slug}&limit=6`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed"))));
    },
    enabled: !!post?.tags?.length,
    staleTime: 5 * 60 * 1000,
  });
  const relatedPosts = relatedData?.data ?? [];

  useEffect(() => {
    const el = proseRef.current;
    if (!el) return;
    el.querySelectorAll(".code-copy-btn").forEach((b) => b.remove());
    el.querySelectorAll("pre > code").forEach((code) => {
      const pre = code.parentElement;
      if (!pre) return;
      const btn = document.createElement("button");
      btn.className = "code-copy-btn absolute top-2 right-2 px-2 py-1 text-xs bg-transparent text-gray-500 rounded hover:bg-blue-500/20 hover:text-blue-600 z-10 flex items-center gap-1";
      btn.innerHTML = '<span class="flex items-center gap-1"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span class="font-medium">Copy</span></span>';
      btn.onclick = () => navigator.clipboard.writeText(code.textContent ?? "").then(() => showSuccess("Copied!")).catch(() => {});
      pre.style.position = "relative";
      pre.appendChild(btn);
    });
  }, [post?.content, showSuccess]);

  const handleReact = async (type: string) => {
    if (!session?.user || !post) {
      showError("You need to sign in to react!");
      return;
    }
    if (isReacting) return;
    setIsReacting(true);
    try {
      const res = await fetch("/api/blog/react", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: slug, type }) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showError(err?.error ?? "Failed to react.");
        return;
      }
      await Promise.all([refetchReactions(), refetchMeReact()]);
    } catch {
      showError("Failed to react.");
    } finally {
      setIsReacting(false);
    }
  };

  const handleComment = async (text: string) => {
    if (!post) return;
    const res = await fetch("/api/blog/comment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: post.id, content: text }) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error ?? "Failed to comment.");
      return;
    }
    refetchPost();
  };

  if (!post) return null;

  const media = post.media?.[0];
  const isYt = media?.type === "YOUTUBE";
  const likeCount = Object.values(reactions).reduce((a, b) => a + b, 0);
  const nestedComments = toNested(toFlat(post.comments ?? []), post.authorId ?? "", post.authorWallet);

  return (
    <main className="relative min-h-screen bg-white dark:bg-gray-950 scrollbar-hide pt-16">
      <BackgroundMotion />
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gray-100/80 dark:bg-gray-950/85" aria-hidden />
      <Header />
      <div className="pt-6 sm:pt-8">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pb-20 lg:px-8">
          <article className="min-w-0 max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-6">
              <ArrowLeft className="w-4 h-4" /> Trở lại trang blog
            </Link>
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white break-words sm:text-3xl lg:text-4xl">{post.title}</h1>
            <time className="block text-sm text-gray-600 dark:text-gray-400 mb-6">{formatDate(post.createdAt)}</time>

            <div className="mb-8 relative h-64 w-full overflow-hidden rounded-lg sm:h-80 lg:h-96">
              {media ? (
                isYt ? (
                  <iframe src={`https://www.youtube.com/embed/${media.id || ytId(media.url)}`} title={post.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                ) : (
                  <img src={media.url} alt={post.title} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }} />
                )
              ) : (
                <img src="/images/common/loading.png" alt={post.title} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }} />
              )}
              <div className="hidden w-full h-full bg-gray-100 flex items-center justify-center"><span className="text-gray-400">Image not available</span></div>
            </div>

            <div ref={proseRef}><TipTapPreview content={post.content} /></div>

            <div className="mt-8 text-right text-sm text-gray-600 dark:text-gray-400">
              Tác giả: <span className="font-semibold text-gray-900 dark:text-white">{post.author || "Admin"}</span>
            </div>

            {post.githubRepo && (
              <div className="my-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                <div className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Support the project on GitHub</div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">If you find <strong>{post.githubRepo.includes("http") ? post.githubRepo.split("/").pop() : post.githubRepo.split("/")[1]}</strong> useful, please click ⭐ to support!</div>
                <a href={post.githubRepo.startsWith("http") ? post.githubRepo : `https://github.com/${post.githubRepo}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
                  Star on GitHub
                </a>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="relative" ref={reactionWrapRef}>
                <button type="button" onClick={() => setShowReactions((v) => !v)} disabled={isReacting} className={blueBtn}>
                  {currentUserReaction ? <Image src={REACTION_ICONS[currentUserReaction]} alt="" width={18} height={18} className="w-[18px] h-[18px]" /> : <ThumbsUp className="w-4 h-4" />}
                  <span>Thích {likeCount}</span>
                </button>
                {showReactions && (
                  <div className="absolute bottom-full left-0 mb-1 z-50 p-1">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
                      {REACTIONS.map((r) => (
                        <button key={r.type} type="button" onClick={() => { handleReact(r.type); setShowReactions(false); }} disabled={isReacting} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Image src={r.image} alt={r.type} width={24} height={24} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank", "noopener,noreferrer,width=600,height=400")} className={blueBtn}>
                <Share2 className="w-4 h-4" /> Chia sẻ
              </button>
            </div>

            <OlderNewsList posts={relatedPosts.map((p: { id: string; title: string; slug?: string; createdAt: string }) => ({ id: p.id, title: p.title, slug: p.slug ?? p.id, createdAt: p.createdAt }))} />

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <CommentSection comments={nestedComments} postId={post.id} onSubmitComment={handleComment} showAllComments={showAllComments} />
            </div>

          </article>
        </div>
      </div>
    </main>
  );
}
