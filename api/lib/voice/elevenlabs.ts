/**
 * ElevenLabs Neural Voice Provider
 * 
 * Synthesizes lifelike multilingual speech (Arabic, English, Hausa accents)
 * via ElevenLabs API (https://api.elevenlabs.io/v1).
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

  const voiceId = options.voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
  const modelId = options.modelId || 'eleven_multilingual_v2'

  const endpoint = `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`

  const response = await fetch(endpoint, {
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

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(`ElevenLabs TTS error: ${JSON.stringify(errData)}`)
  }

  return response
}
