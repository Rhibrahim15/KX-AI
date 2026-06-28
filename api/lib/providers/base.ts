/**
 * Base Provider Interface
 * 
 * Abstract interface for LLM providers.
 * All providers (Groq, NVIDIA NIM, OpenRouter, Ollama, etc.) implement this.
 */

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ModelParams {
  temperature?: number
  max_tokens?: number
  top_p?: number
  top_k?: number
  frequency_penalty?: number
  presence_penalty?: number
  repetition_penalty?: number
}

export interface ProviderResponse {
  success: boolean
  content?: string
  error?: string
  duration_ms: number
  model: string
}

export interface ProviderStatus {
  name: string
  isHealthy: boolean
  lastCheck: number
  responseTime: number
  errorCount: number
  errorMessage?: string
}

/**
 * Base abstract class for all LLM providers
 */
export abstract class BaseProvider {
  protected name: string
  protected apiKey: string
  protected baseUrl: string
  protected models: string[]
  protected status: ProviderStatus

  constructor(name: string, apiKey: string, baseUrl: string, models: string[] = []) {
    this.name = name
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.models = models
    this.status = {
      name,
      isHealthy: true,
      lastCheck: Date.now(),
      responseTime: 0,
      errorCount: 0,
    }
  }

  /**
   * Send a message to the LLM
   */
  abstract sendMessage(
    messages: Message[],
    model: string,
    params: ModelParams,
    signal?: AbortSignal
  ): Promise<ProviderResponse>

  /**
   * Get provider status for health checking
   */
  getStatus(): ProviderStatus {
    return this.status
  }

  /**
   * Update provider health status
   */
  protected updateStatus(isHealthy: boolean, responseTime: number, error?: string) {
    this.status.isHealthy = isHealthy
    this.status.responseTime = responseTime
    this.status.lastCheck = Date.now()
    if (!isHealthy) {
      this.status.errorCount++
      this.status.errorMessage = error
    } else {
      this.status.errorCount = 0
      this.status.errorMessage = undefined
    }
  }

  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[] {
    return this.models
  }

  /**
   * Check if provider has an API key configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Health check - override in subclasses for provider-specific checks
   */
  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now()
      const response = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(5000) })
      const duration = Date.now() - startTime
      
      if (response.ok) {
        this.updateStatus(true, duration)
        return true
      } else {
        this.updateStatus(false, duration, `HTTP ${response.status}`)
        return false
      }
    } catch (err: any) {
      const duration = Date.now()
      this.updateStatus(false, duration, err.message)
      return false
    }
  }
}
