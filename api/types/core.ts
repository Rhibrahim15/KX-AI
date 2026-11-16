export type MessageRole = "user" | "assistant" | "system" | "function" | "tool";

export type MessageCategory = "task" | "deadline" | "appointment" | "general";

export type ModelProvider =
  | "groq"
  | "openrouter"
  | "cerebras"
  | "mistral"
  | "gemini"
  | "ollama";

export interface Message {
  id?: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isImportant?: boolean;
  category?: MessageCategory;
  toolCalls?: unknown[];
  toolCallId?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionState {
  sessionId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastSuccessfulProvider?: ModelProvider;
  metadata?: Record<string, unknown>;
}

export interface ContextPackage {
  sessionId: string;
  history: Message[];
  systemPrompt: string;
  ragContext?: string;
  tokenEstimate: number;
}

export interface LLMCallResult {
  text: string;
  provider: ModelProvider;
  model: string;
}
