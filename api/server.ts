import "dotenv/config";

import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { KX_SYSTEM_PROMPT } from "./agent/prompts";
import { ContextManager, ContextBudgetError } from "./services/ContextManager";
import { createDefaultLLMRouter, ProviderRequestError } from "./services/LLMRouter";
import type { Message, MessageRole } from "./types/core";

const app = express();
const port = Number.parseInt(process.env.PORT || "7860", 10);
const isProduction = process.env.NODE_ENV === "production";
const apiAuthToken = process.env.API_AUTH_TOKEN;

if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
  throw new Error("PORT must be a valid TCP port.");
}
if (isProduction && !apiAuthToken) {
  throw new Error("API_AUTH_TOKEN is required when NODE_ENV=production.");
}

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

if (allowedOrigins.has("*")) {
  throw new Error("Wildcard CORS is not allowed. Configure explicit CORS_ORIGINS.");
}

const contextManager = new ContextManager();
const llmRouter = createDefaultLLMRouter();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, allowedOrigins.has(origin) ? origin : false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1mb" }));

// Health remains public for hosting-platform health checks. Other /v1 routes
// require a bearer token in production; local development can run without one.
app.use("/v1", (req, res, next) => {
  if (req.path === "/health" || !apiAuthToken) return next();

  const authorization = req.header("authorization");
  if (authorization !== `Bearer ${apiAuthToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
});

app.get("/v1/health", (_req, res) => {
  res.json({ status: "ok", service: "kx-sanctuary-api" });
});

app.get("/", (_req, res) => {
  res.json({
    name: "KX Sanctuary OS API",
    status: "running",
    health: "/v1/health",
  });
});

app.post("/v1/chat/completions", async (req, res) => {
  const requestId = randomUUID();
  const input = req.body?.messages;

  if (!Array.isArray(input) || input.length === 0 || input.length > 100) {
    return res.status(400).json({ error: "messages must contain 1–100 entries", requestId });
  }

  const messages: Message[] = [];
  let totalCharacters = 0;
  for (const item of input) {
    const role = item?.role as MessageRole;
    if (role !== "user" && role !== "assistant") {
      return res.status(400).json({
        error: "Only user and assistant messages are accepted from clients.",
        requestId,
      });
    }
    if (
      typeof item.content !== "string" ||
      !item.content.trim() ||
      item.content.length > 20_000
    ) {
      return res.status(400).json({
        error: "Every message must contain 1–20,000 characters of text.",
        requestId,
      });
    }

    totalCharacters += item.content.length;
    if (totalCharacters > 60_000) {
      return res.status(400).json({ error: "Total message content exceeds 60,000 characters.", requestId });
    }

    messages.push({
      role,
      content: item.content,
      timestamp:
        typeof item.timestamp === "string" && !Number.isNaN(Date.parse(item.timestamp))
          ? new Date(item.timestamp).toISOString()
          : new Date().toISOString(),
    });
  }

  const sessionId =
    typeof req.body.sessionId === "string" && req.body.sessionId.trim()
      ? req.body.sessionId.trim()
      : requestId;

  try {
    const context = contextManager.buildContext(
      { sessionId, messages },
      KX_SYSTEM_PROMPT,
    );
    const result = await llmRouter.executeCall(context);

    // OpenAI-compatible response shape keeps existing chat clients interoperable.
    return res.json({
      id: `kx-${requestId}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: result.model,
      provider: result.provider,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: result.text },
          finish_reason: "stop",
        },
      ],
    });
  } catch (error) {
    if (error instanceof ContextBudgetError) {
      return res.status(400).json({ error: error.message, requestId });
    }
    if (error instanceof ProviderRequestError && error.fatal) {
      console.error(`[KX:${requestId}] Provider rejected the request as invalid.`);
      return res.status(400).json({ error: "The model provider rejected the request payload.", requestId });
    }

    const reason = error instanceof Error ? error.message : "Unknown server error";
    console.error(`[KX:${requestId}] Chat request failed: ${reason}`);
    const noProviders = reason.includes("No LLM providers are configured");
    return res.status(noProviders ? 503 : 502).json({
      error: noProviders ? "No model provider is configured." : "All configured model providers are unavailable.",
      requestId,
    });
  }
});

// Media is deliberately unavailable until a real provider integration and
// task-status lifecycle exist. Never return a success-shaped placeholder.
app.all("/v1/media/video/image", (_req, res) => {
  res.status(501).json({
    error: "Media generation is not implemented on this API version.",
    code: "NOT_IMPLEMENTED",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`KX Sanctuary OS API listening on port ${port}`);
  console.log(`Allowed browser origins: ${[...allowedOrigins].join(", ") || "(none)"}`);
});
