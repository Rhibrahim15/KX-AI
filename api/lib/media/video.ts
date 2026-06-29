/**
 * Multi-Provider Video Generation Engine
 * 
 * Supports uncensored Image-to-Video and Text-to-Video across:
 * 1. Seedance 2.0 (ByteDance via PiAPI)
 * 2. Kling AI 3.0 (Kuaishou)
 * 3. MiniMax Hailuo
 * 4. Luma Dream Machine
 */

export type VideoProvider = 'seedance' | 'kling' | 'minimax' | 'luma'

export interface VideoGenOptions {
  prompt: string
  imageUrl?: string
  lastFrameUrl?: string
  aspectRatio?: '16:9' | '9:16' | '1:1'
  provider?: VideoProvider
}

export interface VideoTaskResult {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  provider: string
  error?: string
}

export async function generateVideo(options: VideoGenOptions): Promise<VideoTaskResult> {
  const provider = options.provider || 'seedance'

  switch (provider) {
    case 'seedance':
      return callSeedance(options)
    case 'kling':
      return callKling(options)
    case 'minimax':
      return callMiniMax(options)
    case 'luma':
      return callLuma(options)
    default:
      return callSeedance(options)
  }
}

async function callSeedance(options: VideoGenOptions): Promise<VideoTaskResult> {
  const key = process.env.PIAPI_API_KEY
  if (!key) throw new Error('PIAPI_API_KEY not configured for Seedance')

  const res = await fetch('https://api.piapi.ai/api/v1/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
    body: JSON.stringify({
      model: 'seedance-2-fast',
      task_type: options.imageUrl ? 'image_to_video' : 'text_to_video',
      input: {
        prompt: options.prompt,
        image_url: options.imageUrl,
        last_frame_url: options.lastFrameUrl,
        aspect_ratio: options.aspectRatio || '16:9',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Seedance API failure: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  return {
    taskId: data.data?.task_id || 'unknown',
    status: 'pending',
    provider: 'Seedance 2.0 (PiAPI)',
  }
}

async function callKling(options: VideoGenOptions): Promise<VideoTaskResult> {
  const key = process.env.KLING_API_KEY
  if (!key) throw new Error('KLING_API_KEY not configured')

  const endpoint = options.imageUrl
    ? 'https://api.klingai.com/v1/videos/image2video'
    : 'https://api.klingai.com/v1/videos/text2video'

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      prompt: options.prompt,
      image: options.imageUrl,
      aspect_ratio: options.aspectRatio || '16:9',
      duration: '5',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Kling API failure: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  return {
    taskId: data.data?.task_id || 'unknown',
    status: 'pending',
    provider: 'Kling AI 3.0',
  }
}

async function callMiniMax(options: VideoGenOptions): Promise<VideoTaskResult> {
  const key = process.env.MINIMAX_API_KEY
  if (!key) throw new Error('MINIMAX_API_KEY not configured')

  const res = await fetch('https://api.minimax.chat/v1/video_generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      prompt: options.prompt,
      first_frame_image: options.imageUrl,
    }),
  })

  if (!res.ok) throw new Error(`MiniMax failure: HTTP ${res.status}`)
  const data = await res.json()
  return { taskId: data.task_id || 'unknown', status: 'pending', provider: 'MiniMax Hailuo' }
}

async function callLuma(options: VideoGenOptions): Promise<VideoTaskResult> {
  const key = process.env.LUMA_API_KEY
  if (!key) throw new Error('LUMA_API_KEY not configured')

  const res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      prompt: options.prompt,
      keyframes: options.imageUrl ? { frame0: { type: 'image', url: options.imageUrl } } : undefined,
    }),
  })

  if (!res.ok) throw new Error(`Luma failure: HTTP ${res.status}`)
  const data = await res.json()
  return { taskId: data.id || 'unknown', status: 'pending', provider: 'Luma Dream Machine' }
}
