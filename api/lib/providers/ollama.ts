/**
 * Ollama Provider Implementation
 */

import { BaseProvider, Message, ModelParams, ProviderResponse } from './base'

export class OllamaProvider extends BaseProvider {
  constructor(baseUrl?: string) {
    super(
      'Ollama',
      'local',
      baseUrl || 'http://localhost:11434',
      []
    )
  }

  private cleanModel(model: string): string {
    return model.replace(/^ollama\//i, '')
  }

  async sendMessage(
    messages: Message[],
    model: string,
    params: ModelParams,
    signal?: AbortSignal,
    overrideApiKey?: string
  ): Promise<ProviderResponse> {
    const startTime = Date.now()

    try {
      const endpoint = `${this.baseUrl}/api/chat`
      const targetModel = this.cleanModel(model)

      const body: Record<string, any> = {
        model: targetModel,
        messages,
        stream: false,
        options: {
          temperature: params.temperature ?? 0.7,
        },
      }

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

  async streamMessage(
    messages: Message[],
    model: string,
    params: ModelParams,
    signal?: AbortSignal,
    overrideApiKey?: string
  ): Promise<Response> {
    const endpoint = `${this.baseUrl}/v1/chat/completions`
    const targetModel = this.cleanModel(model)

    const body: Record<string, any> = {
      model: targetModel,
      messages,
      stream: true,
      temperature: params.temperature ?? 0.7,
    }

    if (params.top_p !== undefined) body.top_p = params.top_p
    if (params.max_tokens !== undefined) body.max_tokens = params.max_tokens

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = (errorData as any).error?.message || `HTTP ${response.status}`
      throw new Error(`Ollama stream error: ${errorMsg}`)
    }

    return response
  }

  async healthCheck(): Promise<boolean> {
    const startTime = Date.now()
    try {
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
}
