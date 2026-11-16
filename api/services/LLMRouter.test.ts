import assert from "node:assert/strict";
import test from "node:test";
import { LLMRouter, ProviderRequestError } from "./LLMRouter";
import type { ModelAdapter } from "../adapters/types";
import type { ContextPackage } from "../types/core";

const context: ContextPackage = {
  sessionId: "test-session",
  history: [{ role: "user", content: "Hello", timestamp: "2026-01-01T00:00:00.000Z" }],
  systemPrompt: "You are KX.",
  tokenEstimate: 10,
};

const logger = { info() {}, warn() {}, error() {} };

function adapter(providerName: "groq" | "openrouter"): ModelAdapter {
  return {
    providerName,
    model: "test-model",
    formatPayload: () => ({
      endpoint: `https://${providerName}.example.test/chat/completions`,
      headers: { "Content-Type": "application/json" },
      body: { messages: [] },
    }),
    parseResponse: (raw) => {
      const value = raw as { text?: string };
      if (!value.text) throw new Error("missing response text");
      return value.text;
    },
  };
}

test("fails over after a provider outage and reports the provider that answered", async () => {
  let calls = 0;
  const router = new LLMRouter({
    adapters: [adapter("groq"), adapter("openrouter")],
    logger,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) return new Response("temporarily unavailable", { status: 503 });
      return new Response(JSON.stringify({ text: "Hello from the backup" }), { status: 200 });
    },
  });

  const result = await router.executeCall(context);
  assert.equal(result.text, "Hello from the backup");
  assert.equal(result.provider, "openrouter");
  assert.equal(calls, 2);
});

test("treats HTTP 400 as a fatal payload error and does not fail over", async () => {
  let calls = 0;
  const router = new LLMRouter({
    adapters: [adapter("groq"), adapter("openrouter")],
    logger,
    fetchImpl: async () => {
      calls += 1;
      return new Response("invalid request body", { status: 400 });
    },
  });

  await assert.rejects(
    router.executeCall(context),
    (error: unknown) =>
      error instanceof ProviderRequestError &&
      error.status === 400 &&
      error.fatal,
  );
  assert.equal(calls, 1);
});
