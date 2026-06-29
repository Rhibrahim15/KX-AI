/**
 * OpenRouter Provider Implementation
 */

import { BaseProvider, Message, ModelParams, ProviderResponse } from './base'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export class OpenRouterProvider extends BaseProvider {
  constructor(apiKey: string) {
    super(
      'OpenRouter',
      apiKey,
      'https://openrouter.ai/api/v1',
      []
    )
  }

  private cleanModel(model: string): string {
    return model.replace(/^openrouter\//i, '')
  }

  async sendMessage(
    messages: Message[],
    model: string,
    params: ModelParams,
    signal?: AbortSignal,
    overrideApiKey?: string
  ): Promise<ProviderResponse> {
    const startTime = Date.now()
    const key = overrideApiKey || this.apiKey

    if (!key) {
      return {
        success: false,
        error: 'OpenRouter API key not configured',
        duration_ms: Date.now() - startTime,
        model,
      }
    }

    try {
      const targetModel = this.cleanModel(model)
      const body: Record<string, any> = {
        model: targetModel,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? 4096,
      }

      if (params.top_p !== undefined) body.top_p = params.top_p
      if (params.frequency_penalty !== undefined) body.frequency_penalty = params.frequency_penalty
      if (params.presence_penalty !== undefined) body.presence_penalty = params.presence_penalty
      if (params.repetition_penalty !== undefined) body.repetition_penalty = params.repetition_penalty

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://godmod3.ai',
          'X-Title': 'KX-AI-kx-advisor',
        },
        body: JSON.stringify(body),
        signal,
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`
        this.updateStatus(false, duration, errorMsg)
        return {
          success: false,
          error: errorMsg,
          duration_ms: duration,
          model,
        }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      if (!content) {
        this.updateStatus(false, duration, 'Empty response from OpenRouter')
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
    const key = overrideApiKey || this.apiKey
    if (!key) {
      throw new Error('OpenRouter API key not configured')
    }

    const targetModel = this.cleanModel(model)
    const body: Record<string, any> = {
      model: targetModel,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 4096,
      stream: true,
    }

    if (params.top_p !== undefined) body.top_p = params.top_p
    if (params.frequency_penalty !== undefined) body.frequency_penalty = params.frequency_penalty
    if (params.presence_penalty !== undefined) body.presence_penalty = params.presence_penalty
    if (params.repetition_penalty !== undefined) body.repetition_penalty = params.repetition_penalty

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://godmod3.ai',
        'X-Title': 'KX-AI-kx-advisor',
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const errorMsg = (errData as any).error?.message || `HTTP ${response.status}`
      throw new Error(`OpenRouter stream error: ${errorMsg}`)
    }

    return response
  }

  async healthCheck(): Promise<boolean> {
    const startTime = Date.now()
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
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
