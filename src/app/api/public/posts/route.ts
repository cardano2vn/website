import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

const CACHE_REVALIDATE = 60; // 1 min

function getYoutubeIdFromUrl(url: string) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/#\s]{11})/);
  return match ? match[1] : '';
}

async function fetchPublicPosts(opts: {
  titleQuery: string;
  page: number;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  tags: string[];
  exclude: string | null;
}) {
  const { titleQuery, page, limit, offset, sortBy, sortOrder, tags, exclude } = opts;
  let where: any = { status: 'PUBLISHED' };
  if (titleQuery) {
    where.title = { contains: titleQuery, mode: 'insensitive' };
  }
  if (tags.length > 0) {
    where.tags = { some: { tag: { name: { in: tags } } } };
  }
  if (exclude) {
    where.NOT = { OR: [{ id: exclude }, { slug: exclude }] };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        shares: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments_rel: true,
            postViews: true,
            reactions: true,
          } as any,
        },
        author: { select: { name: true } },
        tags: { select: { tag: { select: { id: true, name: true } } } },
        media: { select: { url: true, type: true, id: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const mapped = posts.map((post) => {
    const raw = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
    const excerpt = raw ? raw.substring(0, 150).trim() + (raw.length > 150 ? '...' : '') : '';
    return {
      id: post.id,
      title: post.title,
      slug: post.slug || post.id,
      excerpt,
      shares: post.shares,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      comments: (post as any)._count?.comments_rel ?? 0,
      reactions: (post as any)._count?.reactions ?? 0,
      media: Array.isArray(post.media)
        ? post.media.map((m: { url: string; type: string; id: string }) =>
            m.type === 'YOUTUBE'
              ? { ...m, id: m.id && m.id.length === 11 ? m.id : getYoutubeIdFromUrl(m.url) }
              : m
          )
        : [],
      author: post.author?.name ?? 'Admin',
      tags: post.tags?.map((t: any) => t.tag) ?? [],
      totalViews: (post as any)._count?.postViews ?? 0,
    };
  });

  const totalPages = Math.ceil(total / limit);
  return {
    data: mapped,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const titleQuery = searchParams.get('title') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const tags = searchParams.getAll('tags');
  const exclude = searchParams.get('exclude');

  try {
    const cached = unstable_cache(
      () =>
        fetchPublicPosts({
          titleQuery,
          page,
          limit,
          offset,
          sortBy,
          sortOrder,
          tags,
          exclude,
        }),
      ['public-posts', String(page), String(limit), sortBy, sortOrder, titleQuery, tags.join(','), exclude ?? ''],
      { revalidate: CACHE_REVALIDATE, tags: ['public-posts'] }
    );
    const result = await cached();

    const res = NextResponse.json(createSuccessResponse(result.data, result.pagination));
    res.headers.set('Cache-Control', `public, s-maxage=${CACHE_REVALIDATE}, stale-while-revalidate=120`);
    return res;
  } catch (error) {
    console.error('Error fetching public posts:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
