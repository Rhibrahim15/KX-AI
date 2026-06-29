/**
 * Multi-Provider Video Generation Engine (Resilient Failover)
 * 
 * Automatically fails over across Kling AI, PiAPI Seedance 2.0, MiniMax, and Luma.
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
  const providers: VideoProvider[] = options.provider
    ? [options.provider]
    : ['kling', 'seedance', 'minimax', 'luma']

  const errors: string[] = []

  for (const p of providers) {
    try {
      if (p === 'kling') return await callKling(options)
      if (p === 'seedance') return await callSeedance(options)
      if (p === 'minimax') return await callMiniMax(options)
      if (p === 'luma') return await callLuma(options)
    } catch (err: any) {
      console.warn(`[VideoEngine] Provider "${p}" failed: ${err.message}`)
      errors.push(`${p} (${err.message})`)
    }
  }

  throw new Error(`All video generation APIs exhausted: ${errors.join(' | ')}`)
}

async function callSeedance(options: VideoGenOptions): Promise<VideoTaskResult> {
  const key = process.env.PIAPI_API_KEY
  if (!key) throw new Error('PIAPI_API_KEY missing')

  const res = await fetch('https://api.piapi.ai/api/v1/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
    body: JSON.stringify({
      model: 'kling',
      task_type: options.imageUrl ? 'image_to_video' : 'text_to_video',
      input: {
        prompt: options.prompt,
        image_url: options.imageUrl,
        aspect_ratio: options.aspectRatio || '16:9',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(err)}`)
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
  if (!key) throw new Error('KLING_API_KEY missing')

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
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(err)}`)
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
  if (!key) throw new Error('MINIMAX_API_KEY missing')

  const res = await fetch('https://api.minimax.chat/v1/video_generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      prompt: options.prompt,
      first_frame_image: options.imageUrl,
    }),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return { taskId: data.task_id || 'unknown', status: 'pending', provider: 'MiniMax Hailuo' }
}

async function callLuma(options: VideoGenOptions): Promise<VideoTaskResult> {
  const key = process.env.LUMA_API_KEY
  if (!key) throw new Error('LUMA_API_KEY missing')

  const res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      prompt: options.prompt,
      keyframes: options.imageUrl ? { frame0: { type: 'image', url: options.imageUrl } } : undefined,
    }),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return { taskId: data.id || 'unknown', status: 'pending', provider: 'Luma Dream Machine' }
}
