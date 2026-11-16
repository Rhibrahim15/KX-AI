import type { ContextPackage, Message, SessionState } from "../types/core";

export interface ContextManagerOptions {
  /** Maximum estimated tokens available to the full prompt. */
  maxContextTokens?: number;
  /** Preferred maximum estimated tokens for conversation history. */
  maxHistoryTokens?: number;
  /** Maximum number of ordinary (unpinned) messages to retain. */
  maxMessages?: number;
}

export class ContextBudgetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContextBudgetError";
  }
}

const estimateTokens = (value: string): number => Math.ceil(value.length / 4);

function messageKey(message: Message): string {
  if (message.id) return `id:${message.id}`;
  return `fallback:${message.role}:${message.timestamp}:${message.content.slice(0, 20)}`;
}

export class ContextManager {
  private readonly maxContextTokens: number;
  private readonly maxHistoryTokens: number;
  private readonly maxMessages: number;

  constructor(options: ContextManagerOptions = {}) {
    this.maxContextTokens = options.maxContextTokens ?? 12_000;
    this.maxHistoryTokens = options.maxHistoryTokens ?? 8_000;
    this.maxMessages = options.maxMessages ?? 20;

    if (this.maxContextTokens <= 0 || this.maxHistoryTokens <= 0 || this.maxMessages <= 0) {
      throw new Error("Context limits must be positive numbers.");
    }
  }

  buildContext(
    session: Pick<SessionState, "sessionId" | "messages">,
    systemPrompt: string,
    ragContext?: string,
  ): ContextPackage {
    const normalizedSystemPrompt = systemPrompt.trim();
    const normalizedRagContext = ragContext?.trim() || undefined;
    const promptTokens =
      estimateTokens(normalizedSystemPrompt) +
      (normalizedRagContext ? estimateTokens(normalizedRagContext) : 0);

    if (promptTokens > this.maxContextTokens) {
      throw new ContextBudgetError(
        `System prompt and retrieved context require ~${promptTokens} tokens; the configured context budget is ${this.maxContextTokens}.`,
      );
    }

    const availableHistoryTokens = Math.min(
      this.maxHistoryTokens,
      this.maxContextTokens - promptTokens,
    );

    const uniqueMessages = new Map<string, Message>();
    for (const message of session.messages) {
      uniqueMessages.set(messageKey(message), message);
    }

    const messages = [...uniqueMessages.values()];
    const pinned = messages.filter((message) => message.isImportant);
    const ordinary = messages
      .filter((message) => !message.isImportant)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const pinnedTokens = pinned.reduce(
      (total, message) => total + estimateTokens(message.content),
      0,
    );

    if (pinnedTokens > availableHistoryTokens) {
      throw new ContextBudgetError(
        `Pinned messages require ~${pinnedTokens} history tokens, exceeding the available ${availableHistoryTokens}. Increase the context budget or review pinned memory.`,
      );
    }

    const selected = [...pinned];
    let historyTokens = pinnedTokens;
    let ordinaryCount = 0;

    for (const message of ordinary) {
      if (ordinaryCount >= this.maxMessages - pinned.length) break;

      const messageTokens = estimateTokens(message.content);
      if (historyTokens + messageTokens > availableHistoryTokens) break;

      selected.push(message);
      historyTokens += messageTokens;
      ordinaryCount += 1;
    }

    selected.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return {
      sessionId: session.sessionId,
      history: selected,
      systemPrompt: normalizedSystemPrompt,
      ragContext: normalizedRagContext,
      tokenEstimate: promptTokens + historyTokens,
    };
  }
}

export { estimateTokens };
