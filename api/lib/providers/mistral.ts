/**
 * Mistral AI Provider Implementation
 * 
 * Implements BaseProvider for Mistral AI (La Plateforme).
 * Generous experimentation tier for developers.
 * 
 * Models: codestral-latest, mistral-large-latest, mistral-small-latest
 * Specialty: World-class code generation and syntax refactoring.
 */

import { BaseProvider, Message, ModelParams, ProviderResponse } from './base'

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

export const MISTRAL_MODELS = [
  'codestral-latest',
  'mistral-large-latest',
  'mistral-small-latest',
]

export class MistralProvider extends BaseProvider {
  constructor(apiKey: string) {
    super(
      'Mistral',
      apiKey,
      'https://api.mistral.ai/v1',
      MISTRAL_MODELS
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
        error: 'Mistral API key not configured',
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

      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
        this.updateStatus(false, duration, 'Empty response from Mistral')
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
      throw new Error('Mistral API key not configured')
    }

    const body: Record<string, any> = {
      model,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 4096,
      stream: true,
    }

    if (params.top_p !== undefined) body.top_p = params.top_p

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const errorMsg = (errData as any).error?.message || `HTTP ${response.status}`
      throw new Error(`Mistral stream error: ${errorMsg}`)
    }

    return response
  }

  async healthCheck(): Promise<boolean> {
    const startTime = Date.now()
    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
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
