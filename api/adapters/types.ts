import type { ContextPackage, ModelProvider } from "../types/core";

export interface ProviderPayload {
  endpoint: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface ModelAdapter {
  readonly providerName: ModelProvider;
  readonly model: string;
  formatPayload(context: ContextPackage): ProviderPayload;
  parseResponse(rawResponse: unknown): string;
}

export interface ProviderAdapterConfig {
  providerName: Exclude<ModelProvider, "gemini" | "ollama">;
  baseUrl: string;
  apiKey: string;
  model: string;
  referer?: string;
  title?: string;
}
