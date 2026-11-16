import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "kx_access";
const SESSION_HOURS = 12;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_RATE_LIMIT_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
if current >= tonumber(ARGV[1]) then
  local ttl = redis.call("TTL", KEYS[1])
  return {0, math.max(ttl, 1)}
end
current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2]))
end
local ttl = redis.call("TTL", KEYS[1])
return {1, math.max(ttl, 1)}
`;

function createSessionToken(secret: string): string {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const nonce = randomBytes(18).toString("base64url");
  const payload = `v1:${expiresAt}:${nonce}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function passwordMatches(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (candidateBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

function getClientAddress(request: NextRequest): string | null {
  // Vercel sets this header at the edge. Do not trust arbitrary X-Forwarded-For
  // chains supplied by clients when constructing a rate-limit identity.
  const value = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip");
  const address = value?.split(",")[0]?.trim();
  return address && address.length <= 128 ? address : null;
}

async function consumeLoginAttempt(request: NextRequest): Promise<
  { allowed: true } | { allowed: false; retryAfter: number } | { allowed: false; unavailable: true }
> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const address = getClientAddress(request);

  if (!redisUrl || !redisToken || !address) {
    if (process.env.NODE_ENV === "production") return { allowed: false, unavailable: true };
    return { allowed: true };
  }

  let endpoint: URL;
  try {
    endpoint = new URL(redisUrl);
    if (endpoint.protocol !== "https:") throw new Error("HTTPS is required");
  } catch {
    return { allowed: false, unavailable: true };
  }

  const addressHash = createHash("sha256").update(address).digest("hex");
  const key = `kx:login: ${addressHash}`.replace(" ", "");
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        LOGIN_RATE_LIMIT_SCRIPT,
        "1",
        key,
        String(LOGIN_MAX_ATTEMPTS),
        String(LOGIN_WINDOW_SECONDS),
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(2_500),
    });
    if (!response.ok) return { allowed: false, unavailable: true };

    const payload = (await response.json()) as {
      result?: unknown;
      error?: unknown;
    };
    if (typeof payload.error === "string" || !Array.isArray(payload.result)) {
      return { allowed: false, unavailable: true };
    }

    const [allowed, retryAfter] = payload.result;
    if (allowed === 1) return { allowed: true };
    if (allowed === 0 && typeof retryAfter === "number" && Number.isFinite(retryAfter)) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil(retryAfter)) };
    }
    return { allowed: false, unavailable: true };
  } catch {
    return { allowed: false, unavailable: true };
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Cross-origin sign-in requests are not allowed." },
      { status: 403 },
    );
  }

  const expectedPassword = process.env.KX_WEB_ACCESS_PASSWORD;
  const sessionSecret = process.env.KX_WEB_SESSION_SECRET;

  if (!expectedPassword || !sessionSecret || sessionSecret.length < 32) {
    return NextResponse.json(
      { error: "Web access protection is not configured correctly." },
      { status: 503 },
    );
  }

  const limit = await consumeLoginAttempt(request);
  if (!limit.allowed) {
    if ("unavailable" in limit) {
      console.error("[KX Auth] Shared login rate limiter is unavailable.");
      return NextResponse.json(
        { error: "Sign-in protection is temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter), "Cache-Control": "no-store" },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const password =
    body && typeof body === "object" && "password" in body
      ? (body as { password?: unknown }).password
      : undefined;

  if (typeof password !== "string" || password.length === 0 || password.length > 512) {
    return NextResponse.json({ error: "Enter your access password." }, { status: 400 });
  }

  if (!passwordMatches(password, expectedPassword)) {
    return NextResponse.json({ error: "The access password is incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(COOKIE_NAME, createSessionToken(sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
