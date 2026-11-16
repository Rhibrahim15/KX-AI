import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 20_000;
const MAX_TOTAL_CHARS = 60_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function validateMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) {
    return null;
  }

  const messages: ChatMessage[] = [];
  let totalChars = 0;

  for (const item of value) {
    if (!item || typeof item !== "object" || !("role" in item) || !("content" in item)) {
      return null;
    }

    // Client-supplied system prompts are ignored. The authoritative KX prompt
    // is applied by the backend and cannot be overridden by the browser.
    if (item.role === "system") continue;

    if (
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string" ||
      item.content.trim().length === 0 ||
      item.content.length > MAX_MESSAGE_CHARS
    ) {
      return null;
    }

    totalChars += item.content.length;
    if (totalChars > MAX_TOTAL_CHARS) return null;

    messages.push({ role: item.role, content: item.content });
  }

  return messages.length > 0 ? messages : null;
}

export async function POST(request: NextRequest) {
  const backendUrl = process.env.KX_AI_BACKEND_URL?.trim();
  const backendToken = process.env.KX_AI_BACKEND_TOKEN?.trim();

  if (!backendUrl) {
    return NextResponse.json(
      { error: "KX backend is not configured. Set KX_AI_BACKEND_URL on the web deployment." },
      { status: 503 },
    );
  }

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const messages = validateMessages(
    parsed && typeof parsed === "object" && "messages" in parsed
      ? (parsed as { messages?: unknown }).messages
      : undefined,
  );

  if (!messages) {
    return NextResponse.json(
      { error: `messages must contain 1–${MAX_MESSAGES} valid user/assistant entries.` },
      { status: 400 },
    );
  }

  let target: URL;
  try {
    target = new URL("/v1/chat/completions", backendUrl);
    if (process.env.NODE_ENV === "production" && target.protocol !== "https:") {
      return NextResponse.json(
        { error: "The configured KX backend must use HTTPS in production." },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json({ error: "KX_AI_BACKEND_URL is not a valid URL." }, { status: 500 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (backendToken) headers.Authorization = `Bearer ${backendToken}`;

  try {
    const upstream = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

    const responseText = await upstream.text();
    let body: unknown;
    try {
      body = JSON.parse(responseText);
    } catch {
      body = { error: "KX backend returned an invalid response." };
    }

    return NextResponse.json(body, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "KX backend request timed out." : "KX backend is unavailable." },
      { status: timedOut ? 504 : 502 },
    );
  }
}
