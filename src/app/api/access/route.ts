import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "kx_access";
const SESSION_HOURS = 12;

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

  const response = NextResponse.json({ ok: true });
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
