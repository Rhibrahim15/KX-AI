import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "kx_access";

function decodeBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const decoded = atob(padded);
  const buffer = new ArrayBuffer(decoded.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return buffer;
}

function encodeText(value: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(value);
  const buffer = new ArrayBuffer(encoded.length);
  new Uint8Array(buffer).set(encoded);
  return buffer;
}

async function hasValidSession(request: NextRequest, secret: string): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [payload, encodedSignature, ...extra] = token.split(".");
  if (!payload || !encodedSignature || extra.length > 0) return false;

  const [version, expiryText, nonce, ...payloadExtra] = payload.split(":");
  const expiry = Number(expiryText);
  if (
    version !== "v1" ||
    !nonce ||
    payloadExtra.length > 0 ||
    !Number.isSafeInteger(expiry) ||
    expiry <= Date.now()
  ) {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encodeText(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      encodeText(payload),
    );
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/login" || pathname === "/api/access") {
    return NextResponse.next();
  }

  const password = process.env.KX_WEB_ACCESS_PASSWORD;
  const secret = process.env.KX_WEB_SESSION_SECRET;
  const configured = Boolean(password && secret && secret.length >= 32);

  // Fail closed in production. Local development may run without a gate.
  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Web access protection is not configured." },
          { status: 503 },
        );
      }
      return NextResponse.redirect(new URL("/login?setup=required", request.url));
    }
    return NextResponse.next();
  }

  if (secret && (await hasValidSession(request, secret))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
