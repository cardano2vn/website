import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

const CACHE_REVALIDATE = 120; // 2 min

async function fetchTags() {
  return prisma.tag.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  });
}

export const GET = async () => {
  try {
    const tags = await unstable_cache(fetchTags, ['public-tags'], {
      revalidate: CACHE_REVALIDATE,
      tags: ['tags'],
    })();
    const res = NextResponse.json(createSuccessResponse(tags));
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_REVALIDATE}, stale-while-revalidate=300`);
    return res;
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


