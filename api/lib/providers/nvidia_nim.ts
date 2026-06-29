/**
 * NVIDIA NIM Provider Implementation
 */

import { BaseProvider, Message, ModelParams, ProviderResponse } from './base'

export const NVIDIA_NIM_MODELS = [
  'nvidia/nemotron-340b-preview',
  'nvidia/nemotron-4-240b-instruct',
  'nvidia/mistral-large-instruct',
  'nvidia/llama-2-70b',
]

export class NVIDIANIMProvider extends BaseProvider {
  private nvApiKey: string

  constructor(apiKey: string, baseUrl?: string) {
    super(
      'NVIDIA NIM',
      apiKey,
      baseUrl || 'https://api.nvcf.nvidia.com/v2/nims',
      NVIDIA_NIM_MODELS
    )
    this.nvApiKey = apiKey
  }

  private cleanModel(model: string): string {
    return model.replace(/^nvidia-nim\//i, '')
  }

  async sendMessage(
    messages: Message[],
    model: string,
    params: ModelParams,
    signal?: AbortSignal,
    overrideApiKey?: string
  ): Promise<ProviderResponse> {
    const startTime = Date.now()
    const key = overrideApiKey || this.nvApiKey

    if (!key) {
      return {
        success: false,
        error: 'NVIDIA NIM API key not configured',
        duration_ms: Date.now() - startTime,
        model,
      }
    }

    try {
      const targetModel = this.cleanModel(model)
      const fullModel = targetModel.includes('nvidia/') ? targetModel : `nvidia/${targetModel}`
      const endpoint = `${this.baseUrl}/${fullModel}/chat/completions`

      const body: Record<string, any> = {
        model: fullModel,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? 4096,
      }

      if (params.top_p !== undefined) body.top_p = params.top_p
      if (params.frequency_penalty !== undefined) body.frequency_penalty = params.frequency_penalty
      if (params.presence_penalty !== undefined) body.presence_penalty = params.presence_penalty

      const response = await fetch(endpoint, {
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
        this.updateStatus(false, duration, 'Empty response from NVIDIA NIM')
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
    const key = overrideApiKey || this.nvApiKey
    if (!key) {
      throw new Error('NVIDIA NIM API key not configured')
    }

    const targetModel = this.cleanModel(model)
    const fullModel = targetModel.includes('nvidia/') ? targetModel : `nvidia/${targetModel}`
    const endpoint = `${this.baseUrl}/${fullModel}/chat/completions`

    const body: Record<string, any> = {
      model: fullModel,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 4096,
      stream: true,
    }

    if (params.top_p !== undefined) body.top_p = params.top_p
    if (params.frequency_penalty !== undefined) body.frequency_penalty = params.frequency_penalty
    if (params.presence_penalty !== undefined) body.presence_penalty = params.presence_penalty

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const errorMsg = (errData as any).error?.message || `HTTP ${response.status}`
      throw new Error(`NVIDIA NIM stream error: ${errorMsg}`)
    }

    return response
  }

  async healthCheck(): Promise<boolean> {
    const startTime = Date.now()
    try {
      const endpoint = `${this.baseUrl}/nvidia/nemotron-340b-preview/chat/completions`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.nvApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-340b-preview',
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
