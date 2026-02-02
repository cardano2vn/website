import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';
import { validateRequest, CreatePostSchema } from '~/lib/validation';

export const revalidate = 300;

function getYoutubeIdFromUrl(url: string) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/#\s]{11})/);
  return match ? match[1] : '';
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isPublic = searchParams.get('public') === '1';
  const titleQuery = searchParams.get('title') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const status = searchParams.get('status');
  const authorId = searchParams.get('authorId');
  const tags = searchParams.getAll('tags');
  const exclude = searchParams.get('exclude');

  try {
    let where: any = {};
    if (titleQuery) {
      where.title = {
        contains: titleQuery,
        mode: 'insensitive',
      };
    }
    
    if (isPublic) {
      where.status = 'PUBLISHED';
    }
    
    if (status) {
      where.status = status as any;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: tags
            }
          }
        }
      };
    }

    if (exclude) {
      where.NOT = {
        OR: [
          { id: exclude },
          { slug: exclude }
        ]
      };
    }

    const selectFields = isPublic ? {
      id: true,
      title: true,
      slug: true,
      content: true, 
      status: true,
      shares: true,
      createdAt: true,
      updatedAt: true,
      _count: { 
        select: { 
          comments_rel: true,
          postViews: true,
          reactions: true
        } as any 
      },
      author: { select: { name: true } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
      media: { select: { url: true, type: true, id: true } },
    } : {
      id: true,
      title: true,
      slug: true,
      content: true,
      status: true,
      shares: true,
      createdAt: true,
      updatedAt: true,
      comments_rel: { select: { id: true, userId: true } },
      reactions: { select: { type: true, userId: true } },
      author: { select: { name: true } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
      media: { select: { url: true, type: true, id: true } },
      _count: { select: { postViews: true } as any },
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: selectFields,
      }),
      prisma.post.count({ where })
    ]);

    const mapped = posts.map(post => {
      const excerpt = post.content 
        ? post.content.replace(/<[^>]*>/g, '').substring(0, 150).trim() + (post.content.length > 150 ? '...' : '')
        : '';

      if (isPublic) {
        return {
          id: post.id,
          title: post.title,
          slug: post.slug || post.id,
          excerpt,
          status: post.status,
          shares: post.shares,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          comments: (post as any)._count?.comments_rel || 0,
          reactions: (post as any)._count?.reactions || 0,
          media: Array.isArray(post.media)
            ? post.media.map((m: { url: string; type: string; id: string }) =>
                m.type === 'YOUTUBE'
                  ? { ...m, id: m.id && m.id.length === 11 ? m.id : getYoutubeIdFromUrl(m.url) }
                  : m
              )
            : [],
          author: post.author?.name || 'Admin',
          tags: post.tags?.map((t: any) => t.tag) || [],
          totalViews: (post as any)._count?.postViews || 0,
        };
      }

      const reactionCount: Record<string, number> = {};
      for (const r of (post as any).reactions) {
        reactionCount[r.type] = (reactionCount[r.type] || 0) + 1;
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        excerpt,
        status: post.status,
        shares: post.shares,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        comments: (post as any).comments_rel?.length || 0,
        comments_rel: (post as any).comments_rel, 
        reactions: (post as any).reactions,
        media: Array.isArray(post.media)
          ? post.media.map((m: { url: string; type: string; id: string }) =>
              m.type === 'YOUTUBE'
                ? { ...m, id: m.id && m.id.length === 11 ? m.id : getYoutubeIdFromUrl(m.url) }
                : m
            )
          : [],
        author: post.author?.name || 'Admin',
        tags: post.tags?.map((t: any) => t.tag) || [],
        ...reactionCount,
        totalViews: (post as any)._count?.postViews || 0,
      };
    });
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return NextResponse.json(createSuccessResponse(mapped, pagination));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

export const POST = withAdmin(async (req, user) => {
  if (!user) {
    return NextResponse.json(createErrorResponse('User not found', 'USER_NOT_FOUND'), { status: 404 });
  }

  try {
    const body = await req.json();
    const { title, slug, content, status, tags, media, githubRepo } = validateRequest(CreatePostSchema, body);

    const existingPost = await prisma.post.findFirst({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json(createErrorResponse('Post with this slug already exists', 'SLUG_EXISTS'), { status: 409 });
    }

    const tagConnections = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        if (typeof tagName === 'string' && tagName.trim()) {
          let tag = await prisma.tag.findFirst({
            where: { name: tagName.trim() }
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName.trim() }
            });
          }

          tagConnections.push({ tagId: tag.id });
        }
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        status: status.toUpperCase() as any,
        authorId: user.id,
        githubRepo: githubRepo || null,
        tags: {
          create: tagConnections
        },
        media: {
          create: media?.map((item: { url: string; type: string }) => ({
            url: item.url,
            type: item.type.toUpperCase() as any
          })) || []
        }
      },
      include: {
        tags: { include: { tag: true } },
        media: true,
      },
    });

    revalidateTag('public-posts');
    return NextResponse.json(createSuccessResponse(post));
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return NextResponse.json(createErrorResponse(error.message, 'VALIDATION_ERROR'), { status: 400 });
    }
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});