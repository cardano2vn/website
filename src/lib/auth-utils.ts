import { cache } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { prisma } from "~/lib/prisma";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  wallet: string | null;
  image: string | null;
  role: {
    name: string;
  };
}

async function getCurrentUserUncached(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const sessionUser = session.user as { address?: string; email?: string };
    if (sessionUser.address) {
      const user = await prisma.user.findUnique({
        where: { wallet: sessionUser.address },
        select: { id: true, name: true, email: true, wallet: true, image: true, role: { select: { name: true } } },
      });
      return user as AuthUser | null;
    }
    if (sessionUser.email) {
      const user = await prisma.user.findUnique({
        where: { email: sessionUser.email },
        select: { id: true, name: true, email: true, wallet: true, image: true, role: { select: { name: true } } },
      });
      return user as AuthUser | null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Deduped per-request: same request only hits session + DB once. */
export const getCurrentUser = cache(getCurrentUserUncached);

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role.name !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role.name === "ADMIN";
}
