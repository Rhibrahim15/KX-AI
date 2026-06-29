/**
 * Provider Index & Health Checker
 * 
 * Exports all providers and manages health checking across the 7-Provider ecosystem.
 */

import { BaseProvider, ProviderStatus } from './base'
import { OpenRouterProvider } from './openrouter'
import { GroqProvider } from './groq'
import { NVIDIANIMProvider } from './nvidia_nim'
import { OllamaProvider } from './ollama'
import { GeminiProvider } from './gemini'
import { CerebrasProvider } from './cerebras'
import { MistralProvider } from './mistral'

export { BaseProvider } from './base'
export type { ProviderResponse, ProviderStatus, Message, ModelParams } from './base'
export { OpenRouterProvider } from './openrouter'
export { GroqProvider, GROQ_MODELS } from './groq'
export { NVIDIANIMProvider, NVIDIA_NIM_MODELS } from './nvidia_nim'
export { OllamaProvider } from './ollama'
export { GeminiProvider, GEMINI_MODELS } from './gemini'
export { CerebrasProvider, CEREBRAS_MODELS } from './cerebras'
export { MistralProvider, MISTRAL_MODELS } from './mistral'

export class ProviderRegistry {
  private providers: Map<string, BaseProvider> = new Map()
  private healthyProviders: string[] = []
  private healthCheckInterval: NodeJS.Timeout | null = null

  registerProvider(name: string, provider: BaseProvider) {
    this.providers.set(name, provider)
  }

  getProvider(name: string): BaseProvider | undefined {
    return this.providers.get(name)
  }

  getAllProviders(): Map<string, BaseProvider> {
    return this.providers
  }

  getHealthyProviders(): string[] {
    return this.healthyProviders
  }

  getStatus(): Record<string, ProviderStatus> {
    const status: Record<string, ProviderStatus> = {}
    for (const [name, provider] of this.providers) {
      status[name] = provider.getStatus()
    }
    return status
  }

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
    this.healthyProviders = Array.from(this.providers.keys()).filter(name => results[name])
    return results
  }

  startHealthCheck(intervalMs: number = 300000) {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval)

    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllHealth()
      console.log('[ProviderRegistry] Health check completed')
    }, intervalMs)
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

export interface ProviderRegistryConfig {
  openrouterApiKey?: string
  groqApiKey?: string
  nvidiaNimApiKey?: string
  ollamaBaseUrl?: string
  geminiApiKey?: string
  cerebrasApiKey?: string
  mistralApiKey?: string
}

export function createDefaultRegistry(config: ProviderRegistryConfig = {}): ProviderRegistry {
  const registry = new ProviderRegistry()

  const openrouterKey = config.openrouterApiKey ?? process.env.OPENROUTER_API_KEY
  const groqKey = config.groqApiKey ?? process.env.GROQ_API_KEY
  const nvidiaKey = config.nvidiaNimApiKey ?? process.env.NVIDIA_NIM_API_KEY
  const ollamaUrl = config.ollamaBaseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const geminiKey = config.geminiApiKey ?? process.env.GEMINI_API_KEY
  const cerebrasKey = config.cerebrasApiKey ?? process.env.CEREBRAS_API_KEY
  const mistralKey = config.mistralApiKey ?? process.env.MISTRAL_API_KEY

  // Priority 1: Groq (fastest overall)
  if (groqKey) registry.registerProvider('groq', new GroqProvider(groqKey))

  // Priority 2: Cerebras (instantaneous voice tokens)
  if (cerebrasKey) registry.registerProvider('cerebras', new CerebrasProvider(cerebrasKey))

  // Priority 3: Gemini (1,500 RPD free tier + massive context)
  if (geminiKey) registry.registerProvider('gemini', new GeminiProvider(geminiKey))

  // Priority 4: Mistral (code & syntax specialist)
  if (mistralKey) registry.registerProvider('mistral', new MistralProvider(mistralKey))

  // Priority 5: OpenRouter (100+ models variety fallback)
  if (openrouterKey) registry.registerProvider('openrouter', new OpenRouterProvider(openrouterKey))

  // Priority 6: NVIDIA NIM
  if (nvidiaKey) registry.registerProvider('nvidia-nim', new NVIDIANIMProvider(nvidiaKey))

  // Priority 7: Ollama (local fallback)
  registry.registerProvider('ollama', new OllamaProvider(ollamaUrl))

  return registry
}
