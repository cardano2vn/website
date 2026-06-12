import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

const NEXT_PUBLIC_WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4001';
const FAKE_BASE_USERS = 3722;

export const revalidate = 0;

let cachedPayload: { total: number; authenticated: number; anonymous: number; peak: boolean } | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5_000;
const HOUR_MS = 60 * 60 * 1000;

type WindowHits = { timestamps: number[] };
const ipWindows = new Map<string, WindowHits>();
const WINDOW_MS = 60_000;
const MAX_REQ_PER_WINDOW = 60;

function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter(t => now - t <= WINDOW_MS);
  if (entry.timestamps.length >= MAX_REQ_PER_WINDOW) {
    ipWindows.set(ip, entry);
    return true;
  }
  entry.timestamps.push(now);
  ipWindows.set(ip, entry);
  return false;
}

function getHourlyRandom(min: number, max: number): number {
  const now = new Date();
  const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
  let hash = 0;
  for (let i = 0; i < hourKey.length; i++) {
    const char = hourKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const normalized = Math.abs(hash) / 0x7FFFFFFF;
  return Math.floor(min + normalized * (max - min));
}

function computeFakeOnline(realOnline: number, realTotal: number): number {
  const base = FAKE_BASE_USERS + realTotal;
  const ratio = realTotal > 0 ? realOnline / realTotal : 0;
  let min: number, max: number;
  if (ratio >= 0.07) {
    min = Math.max(50, Math.floor(base * 0.13));
    max = Math.max(100, Math.floor(base * 0.18));
  } else {
    min = Math.max(20, Math.floor(base * 0.02));
    max = Math.max(80, Math.floor(base * 0.08));
  }
  return getHourlyRandom(min, max);
}

let lastHourCheck = 0;
let cachedFakeOnline = 0;
let lastRealTotal = 0;
let lastRealOnline = 0;

function getCachedFakeOnline(realOnline: number, realTotal: number): number {
  const hourBucket = Math.floor(Date.now() / HOUR_MS);
  if (hourBucket !== lastHourCheck || realTotal !== lastRealTotal || realOnline !== lastRealOnline) {
    lastHourCheck = hourBucket;
    lastRealTotal = realTotal;
    lastRealOnline = realOnline;
    cachedFakeOnline = computeFakeOnline(realOnline, realTotal);
  }
  return cachedFakeOnline;
}

export const GET = async (req: Request) => {
  try {
    const ip = getIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        createErrorResponse('Too many requests', 'RATE_LIMITED'),
        { status: 429 }
      );
    }

    const now = Date.now();
    if (cachedPayload && now - cachedAt < CACHE_TTL_MS) {
      return NextResponse.json(createSuccessResponse(cachedPayload));
    }

    const [onlineRes, realTotal] = await Promise.all([
      fetch(`${NEXT_PUBLIC_WEBSOCKET_URL}/api/online-users`, { cache: 'no-store' }),
      prisma.user.count(),
    ]);
    if (!onlineRes.ok) throw new Error(`Upstream status ${onlineRes.status}`);
    const data = await onlineRes.json();
    const realOnline = data?.stats?.total ?? 0;

    const fakeOnline = getCachedFakeOnline(realOnline, realTotal);
    const total = fakeOnline + realOnline;
    const authenticated = data?.stats?.authenticated ?? 0;
    const anonymous = data?.stats?.anonymous ?? 0;
    const peak = realTotal > 0 && (realOnline / realTotal) >= 0.07;

    cachedPayload = { total, authenticated, anonymous, peak };
    cachedAt = now;
    return NextResponse.json(createSuccessResponse(cachedPayload));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch online count', 'WEBSOCKET_ERROR'),
      { status: 500 }
    );
  }
};


