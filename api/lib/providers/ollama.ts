/**
 * Ollama Provider Implementation
 * 
 * Implements BaseProvider for Ollama.
 * Run open-source models locally (no API cost).
 * Requires Ollama to be running on local machine or accessible server.
 * 
 * Models: Any GGUF model (Llama 2, Mistral, etc.)
 * Cost: Free (local compute)
 */

import { BaseProvider, Message, ModelParams, ProviderResponse } from './base'

export class OllamaProvider extends BaseProvider {
  private baseUrl: string

  constructor(baseUrl?: string) {
    super(
      'Ollama',
      'local', // No API key for local Ollama
      baseUrl || 'http://localhost:11434',
      [] // Models are dynamic
    )
    this.baseUrl = baseUrl || 'http://localhost:11434'
  }

  async sendMessage(
    messages: Message[],
    model: string,
    params: ModelParams,
    signal?: AbortSignal
  ): Promise<ProviderResponse> {
    const startTime = Date.now()

    try {
      const endpoint = `${this.baseUrl}/api/chat`

      const body: Record<string, any> = {
        model,
        messages,
        stream: false,
        options: {
          temperature: params.temperature ?? 0.7,
          top_p: params.top_p,
          top_k: params.top_k,
        },
      }

      // Ollama doesn't support all OpenAI params, so we only set what it supports
      if (params.temperature !== undefined) body.options.temperature = params.temperature
      if (params.top_p !== undefined) body.options.top_p = params.top_p
      if (params.top_k !== undefined) body.options.top_k = params.top_k

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error || `HTTP ${response.status}`
        this.updateStatus(false, duration, errorMsg)
        return {
          success: false,
          error: errorMsg,
          duration_ms: duration,
          model,
        }
      }

      const data = await response.json()
      const content = data.message?.content || ''

      if (!content) {
        this.updateStatus(false, duration, 'Empty response from Ollama')
        return {
          success: false,
          error: 'Empty response',
          duration_ms: duration,
          model,
        }
      }

      this.updateStatus(true, duration)
      return {
        success: true,
        content,
        duration_ms: duration,
        model,
      }
    } catch (err: any) {
      const duration = Date.now() - startTime
      const errorMsg = err.message || 'Unknown error'
      this.updateStatus(false, duration, errorMsg)
      return {
        success: false,
        error: errorMsg,
        duration_ms: duration,
        model,
      }
    }
  }

  /**
   * Ollama-specific health check
   * Checks if Ollama is running and accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now()
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })

      const duration = Date.now() - startTime

      if (response.ok) {
        this.updateStatus(true, duration)
        return true
      } else {
        this.updateStatus(false, duration, `HTTP ${response.status}`)
        return false
      }
    } catch (err: any) {
      const duration = Date.now() - startTime
      this.updateStatus(false, duration, err.message)
      return false
    }
  }

  /**
   * Get list of available models from Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      const data = await response.json()
      return (data.models || []).map((m: any) => m.name || m)
    } catch (err) {
      return []
    }
  }
}
