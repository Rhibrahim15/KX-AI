/**
 * Intelligent LLM Router with Fallback Chain
 * 
 * Routes requests to available providers based on:
 * - Task type (simple, reasoning, code, etc.)
 * - Provider health
 * - Response time
 * - Cost optimization
 */

import { Message, ModelParams, ProviderResponse } from './providers'
export type { Message, ModelParams, ProviderResponse }
import { ProviderRegistry, createDefaultRegistry } from './providers/index'

export type TaskType = 'simple' | 'reasoning' | 'code' | 'creative' | 'analysis' | 'default'

export interface RoutingDecision {
  provider: string
  model: string
  fallbacks: Array<{ provider: string; model: string }>
  reasoning: string
}

/**
 * LLM Router - intelligent provider selection with fallback
 */
export class LLMRouter {
  private registry: ProviderRegistry
  private modelPreferences: Record<TaskType, string[]> = {
    simple: ['cerebras/llama-3.3-70b', 'groq/llama-3.3-70b-versatile', 'gemini/gemini-2.5-flash', 'openrouter/'],
    reasoning: ['gemini/gemini-1.5-pro', 'openrouter/deepseek/deepseek-r1:free', 'mistral/mistral-large-latest', 'nvidia-nim/nemotron-340b-preview'],
    code: ['mistral/codestral-latest', 'groq/qwen-2.5-coder-32b', 'openrouter/qwen/qwen-2.5-coder-32b-instruct', 'gemini/gemini-2.5-flash'],
    creative: ['gemini/gemini-2.5-flash', 'openrouter/anthropic/claude-3.5-sonnet', 'groq/mixtral-8x7b-32768', 'ollama/'],
    analysis: ['gemini/gemini-1.5-pro', 'openrouter/deepseek/deepseek-chat:free', 'nvidia-nim/nemotron-340b-preview', 'groq/'],
    default: ['groq/', 'cerebras/', 'gemini/', 'mistral/', 'openrouter/', 'nvidia-nim/', 'ollama/'],
  }

  constructor(registry?: ProviderRegistry) {
    this.registry = registry || createDefaultRegistry()
  }

  private readonly knownProviders = ['openrouter', 'groq', 'nvidia-nim', 'ollama', 'gemini', 'cerebras', 'mistral']

  private isProviderPrefix(candidate: string): boolean {
    return this.knownProviders.includes(candidate)
  }

  private getDefaultModelForProvider(provider: string): string {
    switch (provider) {
      case 'openrouter': return 'deepseek/deepseek-r1:free'
      case 'groq': return 'llama-3.3-70b-versatile'
      case 'nvidia-nim': return 'nvidia/nemotron-340b-preview'
      case 'ollama': return 'mistral'
      case 'gemini': return 'gemini-2.5-flash'
      case 'cerebras': return 'llama-3.3-70b'
      case 'mistral': return 'codestral-latest'
      default: return `${provider}/default`
    }
  }

  /**
   * Decide which provider and model to use
   */
  async decideRoute(
    taskType: TaskType = 'default',
    preferredModel?: string
  ): Promise<RoutingDecision> {
    // Ensure health checks are current
    await this.registry.checkAllHealth()
    const healthyProviders = this.registry.getHealthyProviders()
    const preferences = this.modelPreferences[taskType] || this.modelPreferences.default

    if (preferredModel) {
      const trimmed = preferredModel.trim()
      const [candidateProvider] = trimmed.split('/')
      const hasProviderPrefix = this.isProviderPrefix(candidateProvider)

      if (hasProviderPrefix && healthyProviders.includes(candidateProvider)) {
        return {
          provider: candidateProvider,
          model: trimmed,
          fallbacks: this.buildFallbacks(taskType, trimmed, false),
          reasoning: `User specified provider model: ${trimmed}`,
        }
      }

      if (!hasProviderPrefix) {
        const primaryProvider = healthyProviders.find(provider => this.knownProviders.includes(provider))
        if (primaryProvider) {
          return {
            provider: primaryProvider,
            model: trimmed,
            fallbacks: this.buildFallbacks(taskType, trimmed, true),
            reasoning: `User specified raw model: ${trimmed}. Routed via ${primaryProvider}`,
          }
        }
      }
    }

    for (const pref of preferences) {
      const [providerName] = pref.split('/')
      if (!healthyProviders.includes(providerName)) continue
      if (!pref.endsWith('/')) {
        return {
          provider: providerName,
          model: pref,
          fallbacks: this.buildFallbacks(taskType, pref, false),
          reasoning: `Task-based selection for "${taskType}" task`,
        }
      }
    }

    if (healthyProviders.length > 0) {
      const fallbackProvider = healthyProviders[0]
      return {
        provider: fallbackProvider,
        model: this.getDefaultModelForProvider(fallbackProvider),
        fallbacks: healthyProviders.slice(1).map(p => ({ provider: p, model: this.getDefaultModelForProvider(p) })),
        reasoning: `Fallback to first healthy provider: ${fallbackProvider}`,
      }
    }

    throw new Error('No healthy providers available')
  }

  /**
   * Build fallback chain for a routing decision
   */
  private buildFallbacks(
    taskType: TaskType,
    primaryModel: string,
    preserveRawModel: boolean
  ): Array<{ provider: string; model: string }> {
    const preferences = this.modelPreferences[taskType]
    const healthyProviders = this.registry.getHealthyProviders()
    const [primaryProvider] = primaryModel.split('/')

    return preferences
      .filter(pref => !pref.startsWith(primaryProvider))
      .map(pref => {
        const [providerName] = pref.split('/')
        const model = preserveRawModel
          ? primaryModel
          : pref.endsWith('/')
            ? this.getDefaultModelForProvider(providerName)
            : pref

        return { provider: providerName, model }
      })
      .filter(f => healthyProviders.includes(f.provider))
      .slice(0, 3)
  }

  /**
   * Execute a request with automatic fallback
   */
  async execute(
    messages: Message[],
    taskType: TaskType = 'default',
    params: ModelParams = {},
    preferredModel?: string,
    maxRetries: number = 3,
    overrideApiKey?: string
  ): Promise<ProviderResponse> {
    const route = await this.decideRoute(taskType, preferredModel)
    const allAttempts: Array<{ provider: string; model: string; error?: string }> = []

    // Try primary
    const primaryProvider = this.registry.getProvider(route.provider)
    if (primaryProvider) {
      try {
        const result = await primaryProvider.sendMessage(messages, route.model, params, undefined, overrideApiKey)
        if (result.success) {
          return result
        }
        allAttempts.push({ provider: route.provider, model: route.model, error: result.error })
      } catch (err: any) {
        allAttempts.push({ provider: route.provider, model: route.model, error: err.message })
      }
    }

    // Try fallbacks
    for (const fallback of route.fallbacks) {
      const fallbackProvider = this.registry.getProvider(fallback.provider)
      if (fallbackProvider) {
        try {
          const result = await fallbackProvider.sendMessage(messages, fallback.model, params, undefined, overrideApiKey)
          if (result.success) {
            return result
          }
          allAttempts.push({ provider: fallback.provider, model: fallback.model, error: result.error })
        } catch (err: any) {
          allAttempts.push({ provider: fallback.provider, model: fallback.model, error: err.message })
        }
      }
    }

    // All failed
    return {
      success: false,
      error: `All providers exhausted. Attempts: ${JSON.stringify(allAttempts)}`,
      duration_ms: 0,
      model: 'none',
    }
  }

  /**
   * Execute a streaming request with automatic failover
   */
  async executeStream(
    messages: Message[],
    taskType: TaskType = 'default',
    params: ModelParams = {},
    preferredModel?: string,
    overrideApiKey?: string
  ): Promise<{ response: Response; provider: string; model: string }> {
    const route = await this.decideRoute(taskType, preferredModel)
    const allAttempts: Array<{ provider: string; model: string; error?: string }> = []

    // Try primary
    const primaryProvider = this.registry.getProvider(route.provider)
    if (primaryProvider) {
      try {
        const response = await primaryProvider.streamMessage(messages, route.model, params, undefined, overrideApiKey)
        return { response, provider: route.provider, model: route.model }
      } catch (err: any) {
        allAttempts.push({ provider: route.provider, model: route.model, error: err.message })
      }
    }

    // Try fallbacks
    for (const fallback of route.fallbacks) {
      const fallbackProvider = this.registry.getProvider(fallback.provider)
      if (fallbackProvider) {
        try {
          const response = await fallbackProvider.streamMessage(messages, fallback.model, params, undefined, overrideApiKey)
          return { response, provider: fallback.provider, model: fallback.model }
        } catch (err: any) {
          allAttempts.push({ provider: fallback.provider, model: fallback.model, error: err.message })
        }
      }
    }

    throw new Error(`All providers exhausted for stream. Attempts: ${JSON.stringify(allAttempts)}`)
  }

  /**
   * Get router status for debugging
   */
  getStatus() {
    return {
      providers: this.registry.getStatus(),
      healthyProviders: this.registry.getHealthyProviders(),
      preferences: this.modelPreferences,
    }
  }

  /**
   * Start background health monitoring
   */
  startHealthMonitoring(intervalMs?: number) {
    this.registry.startHealthCheck(intervalMs)
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    this.registry.stopHealthCheck()
  }
}

/**
 * Global LLM router instance
 */
let globalRouter: LLMRouter | null = null

export function getRouter(): LLMRouter {
  if (!globalRouter) {
    globalRouter = new LLMRouter()
  }
  return globalRouter
}

export function setRouter(router: LLMRouter) {
  globalRouter = router
}
