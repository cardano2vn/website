import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

const CACHE_REVALIDATE = 120; // 2 min

export const GET = async () => {
  try {
    const total = await unstable_cache(
      () => prisma.user.count(),
      ['public-stats-users'],
      { revalidate: CACHE_REVALIDATE, tags: ['stats-users'] }
    )();
    const res = NextResponse.json(createSuccessResponse({ total }));
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_REVALIDATE}, stale-while-revalidate=300`);
    return res;
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch users count', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


