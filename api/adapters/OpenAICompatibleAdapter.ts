import type { ContextPackage } from "../types/core";
import type { ModelAdapter, ProviderAdapterConfig, ProviderPayload } from "./types";

interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

export class OpenAICompatibleAdapter implements ModelAdapter {
  readonly providerName: ProviderAdapterConfig["providerName"];
  readonly model: string;
  private readonly config: ProviderAdapterConfig;

  constructor(config: ProviderAdapterConfig) {
    this.config = config;
    this.providerName = config.providerName;
    this.model = config.model;
  }

  formatPayload(context: ContextPackage): ProviderPayload {
    const systemContent = context.ragContext
      ? `${context.systemPrompt}\n\n[RETRIEVED KNOWLEDGE]\n${context.ragContext}`
      : context.systemPrompt;

    const messages: OpenAIMessage[] = [
      { role: "system", content: systemContent },
      ...context.history.map((message): OpenAIMessage => ({
        role: message.role === "function" ? "tool" : message.role,
        content: message.content,
        ...(message.toolCallId ? { tool_call_id: message.toolCallId } : {}),
      })),
    ];

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };

    if (this.config.referer) headers["HTTP-Referer"] = this.config.referer;
    if (this.config.title) headers["X-Title"] = this.config.title;

    return {
      endpoint: `${this.config.baseUrl.replace(/\/+$/, "")}/chat/completions`,
      headers,
      body: {
        model: this.model,
        messages,
        temperature: 0.7,
        stream: false,
      },
    };
  }

  parseResponse(rawResponse: unknown): string {
    if (!rawResponse || typeof rawResponse !== "object") {
      throw new Error(`${this.providerName} returned an invalid response object.`);
    }

    const response = rawResponse as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = response.choices?.[0]?.message?.content;

    if (typeof content === "string" && content.trim()) return content.trim();

    if (Array.isArray(content)) {
      const text = content
        .filter((part): part is { type: "text"; text: string } =>
          Boolean(part && typeof part === "object" && (part as { type?: string }).type === "text" && typeof (part as { text?: unknown }).text === "string"),
        )
        .map((part) => part.text)
        .join("");

      if (text.trim()) return text.trim();
    }

    throw new Error(`${this.providerName} returned no assistant text.`);
  }
}
