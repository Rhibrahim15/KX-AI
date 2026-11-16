import { OpenAICompatibleAdapter } from "../adapters/OpenAICompatibleAdapter";
import type { ModelAdapter } from "../adapters/types";
import type { ContextPackage, LLMCallResult, ModelProvider } from "../types/core";

export interface LLMRouterOptions {
  adapters: ModelAdapter[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "info" | "warn" | "error">;
}

export class ProviderRequestError extends Error {
  readonly provider: ModelProvider;
  readonly status: number;
  readonly fatal: boolean;

  constructor(provider: ModelProvider, status: number, message: string) {
    super(message);
    this.name = "ProviderRequestError";
    this.provider = provider;
    this.status = status;
    this.fatal = status === 400;
  }
}

const providerDefaults = [
  {
    provider: "groq",
    keyName: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1",
    modelName: "GROQ_MODEL",
    defaultModel: "openai/gpt-oss-120b",
  },
  {
    provider: "openrouter",
    keyName: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1",
    modelName: "OPENROUTER_MODEL",
    defaultModel: "openrouter/free",
  },
  {
    provider: "cerebras",
    keyName: "CEREBRAS_API_KEY",
    baseUrl: "https://api.cerebras.ai/v1",
    modelName: "CEREBRAS_MODEL",
    defaultModel: "llama-3.3-70b",
  },
  {
    provider: "mistral",
    keyName: "MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1",
    modelName: "MISTRAL_MODEL",
    defaultModel: "mistral-small-latest",
  },
] as const;

type ConfiguredProvider = (typeof providerDefaults)[number];

export class LLMRouter {
  private readonly adapters: ModelAdapter[];
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly logger: Pick<Console, "info" | "warn" | "error">;

  constructor(options: LLMRouterOptions) {
    this.adapters = options.adapters;
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.logger = options.logger ?? console;
  }

  async executeCall(context: ContextPackage): Promise<LLMCallResult> {
    if (this.adapters.length === 0) {
      throw new Error("No LLM providers are configured. Add at least one provider API key.");
    }

    const failures: string[] = [];

    for (const adapter of this.adapters) {
      this.logger.info(`[LLMRouter] attempting ${adapter.providerName}/${adapter.model}`);
      try {
        const payload = adapter.formatPayload(context);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        let response: Response;
        try {
          response = await this.fetchImpl(payload.endpoint, {
            method: "POST",
            headers: payload.headers,
            body: JSON.stringify(payload.body),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }

        if (!response.ok) {
          const detail = (await response.text()).slice(0, 500);
          const error = new ProviderRequestError(
            adapter.providerName,
            response.status,
            `${adapter.providerName} returned HTTP ${response.status}: ${detail || response.statusText}`,
          );
          this.logger.warn(`[LLMRouter] ${adapter.providerName} failed: HTTP ${response.status}`);

          // A 400 indicates a malformed request from our application, not a provider outage.
          if (error.fatal) throw error;

          failures.push(error.message);
          continue;
        }

        const result = adapter.parseResponse(await response.json());
        this.logger.info(`[LLMRouter] ${adapter.providerName} responded successfully`);
        return { text: result, provider: adapter.providerName, model: adapter.model };
      } catch (error) {
        if (error instanceof ProviderRequestError && error.fatal) throw error;

        const reason = error instanceof Error ? error.message : "Unknown provider error";
        failures.push(`${adapter.providerName}: ${reason}`);
        this.logger.warn(`[LLMRouter] ${adapter.providerName} unavailable: ${reason}`);
      }
    }

    throw new Error(`All configured LLM providers failed. ${failures.join(" | ")}`);
  }
}

export function createDefaultLLMRouter(
  env: NodeJS.ProcessEnv = process.env,
  options: Omit<LLMRouterOptions, "adapters"> = {},
): LLMRouter {
  const byName = new Map<string, ConfiguredProvider>(
    providerDefaults.map((provider) => [provider.provider, provider]),
  );
  const configuredOrder = (env.LLM_PROVIDER_ORDER || "groq,openrouter,cerebras,mistral")
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);

  const adapters = configuredOrder.flatMap((name) => {
    const provider = byName.get(name);
    if (!provider) return [];

    const apiKey = env[provider.keyName];
    if (!apiKey) return [];

    return [
      new OpenAICompatibleAdapter({
        providerName: provider.provider,
        baseUrl: provider.baseUrl,
        apiKey,
        model: env[provider.modelName] || provider.defaultModel,
        ...(provider.provider === "openrouter"
          ? { referer: env.OPENROUTER_HTTP_REFERER, title: env.OPENROUTER_APP_TITLE || "KX Sanctuary OS" }
          : {}),
      }),
    ];
  });

  return new LLMRouter({ ...options, adapters });
}
