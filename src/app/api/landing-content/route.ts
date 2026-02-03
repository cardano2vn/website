import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "~/lib/prisma";
import { createSuccessResponse, createErrorResponse } from "~/lib/api-response";

const CACHE_REVALIDATE = 300;

const getLandingContent = unstable_cache(
  () =>
    prisma.landingContent.findMany({
      where: {
        isActive: true,
        publishStatus: "PUBLISHED",
      },
      orderBy: { order: "asc" },
    }),
  ["landing-content"],
  { revalidate: CACHE_REVALIDATE, tags: ["landing-content"] },
);

export async function GET() {
  try {
    const content = await getLandingContent();
    const res = NextResponse.json(createSuccessResponse(content));
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
