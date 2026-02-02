import { NextResponse } from 'next/server';

const BASE_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

const CACHE_TTL_MS = 60 * 60 * 24 * 7 * 1000; // 7 days
const CDN_MAX_AGE = 60 * 60 * 24 * 7;
const STALE_WHILE_REVALIDATE = 60 * 60 * 24;

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 120;    // per IP per minute (trang our-service ~6–10 req, cho dư)

type CacheEntry = {
  body: string;
  contentType: string;
  status: number;
  expiresAt: number;
};

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const memoryCache = new Map<string, CacheEntry>();
const rateLimitMap = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() ?? 'unknown';
  const xri = req.headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    rateLimitMap.set(ip, entry);
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

function getCacheKey(reqUrl: URL): string {
  return reqUrl.pathname + reqUrl.search;
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    const ip = getClientIp(req);
    const { allowed: rateLimitOk, retryAfterSec } = checkRateLimit(ip);
    if (!rateLimitOk) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing Blockfrost API key' }, { status: 500 });
    }

    const params = await ctx.params;
    const subPath = Array.isArray(params?.path) ? params.path.join('/') : '';

    const allowedPaths = [
      'pools',
      'accounts',
      'governance/dreps',
      'epochs/latest/parameters',
    ];
    const isAllowed = allowedPaths.some((prefix: string) => subPath.startsWith(prefix));
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Path not allowed' }, { status: 400 });
    }

    const reqUrl = new URL(req.url);
    const cacheKey = getCacheKey(reqUrl);
    const now = Date.now();
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return new NextResponse(cached.body, {
        status: cached.status,
        headers: {
          'content-type': cached.contentType || 'application/json',
          'X-Cache-Status': 'HIT',
          'X-Cache-Expires-At': new Date(cached.expiresAt).toISOString(),
          'Cache-Control': `public, s-maxage=${CDN_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        },
      });
    }

    const url = new URL(`${BASE_URL}/${subPath}`);
    reqUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
      headers: { project_id: apiKey },
    });

    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();
    const bodyStr = contentType.includes('application/json') ? JSON.stringify(body) : (body as string);
    const expiresAt = now + CACHE_TTL_MS;

    memoryCache.set(cacheKey, {
      body: bodyStr,
      contentType: contentType || 'application/json',
      status: res.status,
      expiresAt,
    });

    return new NextResponse(bodyStr, {
      status: res.status,
      headers: {
        'content-type': contentType || 'application/json',
        'X-Cache-Status': 'MISS',
        'X-Cache-Expires-At': new Date(expiresAt).toISOString(),
        'Cache-Control': `public, s-maxage=${CDN_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Blockfrost proxy error' }, { status: 500 });
  }
}


