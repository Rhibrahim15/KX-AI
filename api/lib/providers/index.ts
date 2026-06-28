/**
 * Provider Index & Health Checker
 * 
 * Exports all providers and manages health checking across the provider ecosystem.
 */

import { BaseProvider, ProviderStatus } from './base'
import { OpenRouterProvider } from './openrouter'
import { GroqProvider } from './groq'
import { NVIDIANIMProvider } from './nvidia_nim'
import { OllamaProvider } from './ollama'

export { BaseProvider, ProviderResponse, ProviderStatus, Message, ModelParams } from './base'
export { OpenRouterProvider } from './openrouter'
export { GroqProvider, GROQ_MODELS } from './groq'
export { NVIDIANIMProvider, NVIDIA_NIM_MODELS } from './nvidia_nim'
export { OllamaProvider } from './ollama'

/**
 * Provider Registry & Health Monitor
 * 
 * Manages all available providers and monitors their health status.
 * Provides fallback chain: primary → secondary → tertiary → quaternary
 */
export class ProviderRegistry {
  private providers: Map<string, BaseProvider> = new Map()
  private healthyProviders: string[] = []
  private healthCheckInterval: NodeJS.Timeout | null = null

  /**
   * Register a provider
   */
  registerProvider(name: string, provider: BaseProvider) {
    this.providers.set(name, provider)
  }

  /**
   * Get a specific provider
   */
  getProvider(name: string): BaseProvider | undefined {
    return this.providers.get(name)
  }

  /**
   * Get all providers
   */
  getAllProviders(): Map<string, BaseProvider> {
    return this.providers
  }

  /**
   * Get currently healthy providers (in priority order)
   */
  getHealthyProviders(): string[] {
    return this.healthyProviders
  }

  /**
   * Get provider status
   */
  getStatus(): Record<string, ProviderStatus> {
    const status: Record<string, ProviderStatus> = {}
    for (const [name, provider] of this.providers) {
      status[name] = provider.getStatus()
    }
    return status
  }

  /**
   * Run health check on all providers
   */
  async checkAllHealth(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    const checks = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      try {
        const isHealthy = await provider.healthCheck()
        results[name] = isHealthy
      } catch (err) {
        results[name] = false
      }
    })

    await Promise.all(checks)

    // Update healthy providers list (maintain priority order)
    this.healthyProviders = Array.from(this.providers.keys()).filter(name => results[name])

    return results
  }

  /**
   * Start periodic health checking
   */
  startHealthCheck(intervalMs: number = 300000) {
    // Default: check every 5 minutes
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval)

    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllHealth()
      console.log('[ProviderRegistry] Health check completed')
    }, intervalMs)
  }

  /**
   * Stop periodic health checking
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

/**
 * Default provider registry instance
 * Initialized with all available providers
 */
export interface ProviderRegistryConfig {
  openrouterApiKey?: string
  groqApiKey?: string
  nvidiaNimApiKey?: string
  ollamaBaseUrl?: string
}

export function createDefaultRegistry(config: ProviderRegistryConfig = {}): ProviderRegistry {
  const registry = new ProviderRegistry()

  // Register providers in priority order
  const openrouterKey = config.openrouterApiKey ?? process.env.OPENROUTER_API_KEY
  const groqKey = config.groqApiKey ?? process.env.GROQ_API_KEY
  const nvidiaKey = config.nvidiaNimApiKey ?? process.env.NVIDIA_NIM_API_KEY
  const ollamaUrl = config.ollamaBaseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'

  // Priority 1: OpenRouter (100+ models, reliable fallback)
  if (openrouterKey) {
    registry.registerProvider('openrouter', new OpenRouterProvider(openrouterKey))
  }

  // Priority 2: Groq (fastest for simple tasks)
  if (groqKey) {
    registry.registerProvider('groq', new GroqProvider(groqKey))
  }

  // Priority 3: NVIDIA NIM (powerful, enterprise-grade)
  if (nvidiaKey) {
    registry.registerProvider('nvidia-nim', new NVIDIANIMProvider(nvidiaKey))
  }

  // Priority 4: Ollama (local, zero-cost fallback)
  registry.registerProvider('ollama', new OllamaProvider(ollamaUrl))

  return registry
}
