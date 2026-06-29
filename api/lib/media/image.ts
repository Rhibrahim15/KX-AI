/**
 * Multi-Provider Image Generation Engine
 * 
 * Supports uncensored Text-to-Image and Image-to-Image across:
 * 1. Hugging Face Serverless FLUX.1 (Free)
 * 2. Google Imagen 3 (Gemini API Studio Free Tier)
 * 3. Together AI FLUX Schnell
 */

export type ImageProvider = 'huggingface' | 'imagen' | 'together'

export interface ImageGenOptions {
  prompt: string
  aspectRatio?: '16:9' | '9:16' | '1:1'
  provider?: ImageProvider
}

export interface ImageResult {
  success: boolean
  imageBase64?: string
  imageUrl?: string
  provider: string
  error?: string
}

export async function generateImage(options: ImageGenOptions): Promise<ImageResult> {
  const provider = options.provider || 'huggingface'

  switch (provider) {
    case 'huggingface':
      return callHuggingFaceFLUX(options)
    case 'imagen':
      return callGoogleImagen(options)
    case 'together':
      return callTogetherFLUX(options)
    default:
      return callHuggingFaceFLUX(options)
  }
}

async function callHuggingFaceFLUX(options: ImageGenOptions): Promise<ImageResult> {
  const key = process.env.HUGGINGFACE_API_KEY
  if (!key) throw new Error('HUGGINGFACE_API_KEY not configured')

  const model = 'black-forest-labs/FLUX.1-schnell'
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: options.prompt }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HuggingFace FLUX failure: ${err}`)
  }

  const blob = await res.arrayBuffer()
  const base64 = Buffer.from(blob).toString('base64')
  return {
    success: true,
    imageBase64: `data:image/png;base64,${base64}`,
    provider: 'HuggingFace Serverless FLUX.1',
  }
}

async function callGoogleImagen(options: ImageGenOptions): Promise<ImageResult> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not configured')

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: options.prompt }],
      parameters: { sampleCount: 1, aspectRatio: options.aspectRatio || '1:1' },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Imagen 3 failure: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  const b64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error('No image data returned from Imagen')

  return {
    success: true,
    imageBase64: `data:image/png;base64,${b64}`,
    provider: 'Google Imagen 3',
  }
}

async function callTogetherFLUX(options: ImageGenOptions): Promise<ImageResult> {
  const key = process.env.TOGETHER_API_KEY
  if (!key) throw new Error('TOGETHER_API_KEY not configured')

  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt: options.prompt,
      steps: 4,
      n: 1,
    }),
  })

  if (!res.ok) throw new Error(`Together failure: HTTP ${res.status}`)
  const data = await res.json()
  const url = data.data?.[0]?.url
  return { success: true, imageUrl: url, provider: 'Together AI FLUX Free' }
}
