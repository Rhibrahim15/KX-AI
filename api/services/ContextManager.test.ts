import assert from "node:assert/strict";
import test from "node:test";
import { ContextBudgetError, ContextManager } from "./ContextManager";
import type { Message } from "../types/core";

const message = (
  id: string,
  content: string,
  timestamp: string,
  isImportant = false,
): Message => ({
  id,
  role: "user",
  content,
  timestamp,
  isImportant,
});

test("keeps pinned messages and the newest ordinary messages in chronological order", () => {
  const manager = new ContextManager({
    maxContextTokens: 100,
    maxHistoryTokens: 20,
    maxMessages: 3,
  });
  const context = manager.buildContext(
    {
      sessionId: "session-1",
      messages: [
        message("old", "oldest", "2026-01-01T00:00:00.000Z"),
        message("pin", "remember this", "2026-01-02T00:00:00.000Z", true),
        message("new", "newest", "2026-01-03T00:00:00.000Z"),
        message("middle", "middle", "2026-01-02T12:00:00.000Z"),
      ],
    },
    "You are KX.",
  );

  assert.deepEqual(context.history.map((item) => item.id), ["pin", "middle", "new"]);
  assert.equal(context.sessionId, "session-1");
});

test("deduplicates messages by id", () => {
  const manager = new ContextManager({ maxContextTokens: 100, maxHistoryTokens: 30 });
  const context = manager.buildContext(
    {
      sessionId: "session-1",
      messages: [
        message("same", "first", "2026-01-01T00:00:00.000Z"),
        message("same", "second", "2026-01-02T00:00:00.000Z"),
      ],
    },
    "You are KX.",
  );

  assert.equal(context.history.length, 1);
  assert.equal(context.history[0].content, "second");
});

test("fails clearly when system and retrieved context exceed the full budget", () => {
  const manager = new ContextManager({ maxContextTokens: 2 });
  assert.throws(
    () => manager.buildContext({ sessionId: "s", messages: [] }, "This prompt is too long"),
    ContextBudgetError,
  );
});
