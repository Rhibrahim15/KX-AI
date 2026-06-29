/**
 * ElevenLabs Neural Voice Provider
 */

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export interface TextToSpeechOptions {
  text: string
  voiceId?: string
  modelId?: string
  stability?: number
  similarityBoost?: number
  style?: number
}

export async function generateSpeechStream(
  options: TextToSpeechOptions,
  apiKey?: string
): Promise<Response> {
  const key = apiKey || process.env.ELEVENLABS_API_KEY
  if (!key) {
    throw new Error('ElevenLabs API key not configured')
  }

  let voiceId = options.voiceId || process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb' // Default George
  const modelId = options.modelId || 'eleven_multilingual_v2'

  const executeRequest = async (targetVoice: string) => {
    return fetch(`${ELEVENLABS_API_URL}/text-to-speech/${targetVoice}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': key,
      },
      body: JSON.stringify({
        text: options.text,
        model_id: modelId,
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0.0,
          use_speaker_boost: true,
        },
      }),
    })
  }

  let response = await executeRequest(voiceId)

  // Auto-healing: If user provided a library voice that requires paid plan, fallback to standard free George voice
  if (response.status === 402 || response.status === 403) {
    console.warn(`[ElevenLabs] Voice "${voiceId}" restricted on current tier (HTTP ${response.status}). Auto-healing with free Premade voice "JBFqnCBsd6RMkjVDRZzb"...`)
    response = await executeRequest('JBFqnCBsd6RMkjVDRZzb')
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(`ElevenLabs TTS error: ${JSON.stringify(errData)}`)
  }

  return response
}
