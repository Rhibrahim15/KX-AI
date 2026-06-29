/**
 * Groq Provider Implementation
 * 
 * Implements BaseProvider for Groq.
 * Fastest open-source LLM inference via Groq's LPU.
 * 
 * Models: Mixtral 8x7B, LLama 2, etc.
 * Free tier: Good rate limits
 */

import { BaseProvider, Message, ModelParams, ProviderResponse } from './base'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const GROQ_MODELS = [
  'mixtral-8x7b-32768',
  'llama-2-70b-chat',
  'llama2-70b-4096',
  'gemma-7b-it',
]

export class GroqProvider extends BaseProvider {
  constructor(apiKey: string) {
    super(
      'Groq',
      apiKey,
      'https://api.groq.com/openai/v1',
      GROQ_MODELS
    )
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
        error: 'Groq API key not configured',
        duration_ms: Date.now() - startTime,
        model,
      }
    }

    try {
      const body: Record<string, any> = {
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? 4096,
      }

      if (params.top_p !== undefined) body.top_p = params.top_p
      if (params.top_k !== undefined) body.top_k = params.top_k
      if (params.frequency_penalty !== undefined) body.frequency_penalty = params.frequency_penalty
      if (params.presence_penalty !== undefined) body.presence_penalty = params.presence_penalty

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
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
        this.updateStatus(false, duration, 'Empty response from Groq')
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
      throw new Error('Groq API key not configured')
    }

    const body: Record<string, any> = {
      model,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 4096,
      stream: true,
    }

    if (params.top_p !== undefined) body.top_p = params.top_p
    if (params.top_k !== undefined) body.top_k = params.top_k
    if (params.frequency_penalty !== undefined) body.frequency_penalty = params.frequency_penalty
    if (params.presence_penalty !== undefined) body.presence_penalty = params.presence_penalty

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const errorMsg = (errData as any).error?.message || `HTTP ${response.status}`
      throw new Error(`Groq stream error: ${errorMsg}`)
    }

    return response
  }

  /**
   * Groq-specific health check
   */
  async healthCheck(): Promise<boolean> {
    const startTime = Date.now()
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user' as const, content: 'ping' }],
          max_tokens: 10,
        }),
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
