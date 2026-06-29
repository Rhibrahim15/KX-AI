/**
 * Google Gemini Provider Implementation
 * 
 * Implements BaseProvider for Google Gemini via OpenAI-Compatible Endpoint.
 * Generous free tier: 1,500 requests/day, 1 Million TPM, 15 RPM.
 * 
 * Models: gemini-2.5-flash, gemini-1.5-pro, gemini-1.5-flash
 * Specialty: 1M+ context window, codebase ingestion, Arabic/Hausa translation.
 */

import { BaseProvider, Message, ModelParams, ProviderResponse } from './base'

const GEMINI_OPENAI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'

export const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
]

export class GeminiProvider extends BaseProvider {
  constructor(apiKey: string) {
    super(
      'Google Gemini',
      apiKey,
      'https://generativelanguage.googleapis.com/v1beta/openai',
      GEMINI_MODELS
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
        error: 'Google Gemini API key not configured',
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

      const response = await fetch(GEMINI_OPENAI_URL, {
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
        this.updateStatus(false, duration, 'Empty response from Google Gemini')
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
      throw new Error('Google Gemini API key not configured')
    }

    const body: Record<string, any> = {
      model,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 4096,
      stream: true,
    }

    if (params.top_p !== undefined) body.top_p = params.top_p

    const response = await fetch(GEMINI_OPENAI_URL, {
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
      throw new Error(`Google Gemini stream error: ${errorMsg}`)
    }

    return response
  }

  async healthCheck(): Promise<boolean> {
    const startTime = Date.now()
    try {
      const response = await fetch(GEMINI_OPENAI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
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
