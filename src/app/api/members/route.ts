import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "~/lib/prisma";
import { createSuccessResponse, createErrorResponse } from "~/lib/api-response";

const CACHE_REVALIDATE = 300;

const getMembers = unstable_cache(
  () =>
    prisma.member.findMany({
      where: {
        isActive: true,
        publishStatus: "PUBLISHED",
      },
      orderBy: { order: "asc" },
      include: {
        tab: true,
      },
    }),
  ["members"],
  { revalidate: CACHE_REVALIDATE, tags: ["members"] },
);

export async function GET() {
  try {
    const members = await getMembers();
    const res = NextResponse.json(createSuccessResponse(members));
    res.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_REVALIDATE}, stale-while-revalidate=600`,
    );
    return res;
  } catch (error) {
    return NextResponse.json(
      createErrorResponse("Internal server error", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}
