/**
 * Media Generation API Routes
 * 
 * POST /v1/media/video  — Uncensored AI video generation (Seedance, Kling, Hailuo, Luma)
 * POST /v1/media/image  — Uncensored AI image generation (FLUX, Imagen 3, Together)
 */

import { Router } from 'express'
import { generateVideo, type VideoGenOptions } from '../lib/media/video'
import { generateImage, type ImageGenOptions } from '../lib/media/image'

export const mediaRoutes = Router()

mediaRoutes.post('/video', async (req, res) => {
  try {
    const { prompt, image_url, last_frame_url, provider, aspect_ratio } = req.body
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: { message: 'Missing "prompt" string parameter' } })
      return
    }

    const opts: VideoGenOptions = {
      prompt,
      imageUrl: image_url,
      lastFrameUrl: last_frame_url,
      provider,
      aspectRatio: aspect_ratio,
    }

    const result = await generateVideo(opts)
    res.json({ success: true, task: result })
  } catch (err: any) {
    console.error('[Media Video Error]', err)
    res.status(500).json({ error: { message: err.message || 'Video generation failure' } })
  }
})

mediaRoutes.post('/image', async (req, res) => {
  try {
    const { prompt, provider, aspect_ratio } = req.body
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: { message: 'Missing "prompt" string parameter' } })
      return
    }

    const opts: ImageGenOptions = {
      prompt,
      provider,
      aspectRatio: aspect_ratio,
    }

    const result = await generateImage(opts)
    res.json(result)
  } catch (err: any) {
    console.error('[Media Image Error]', err)
    res.status(500).json({ error: { message: err.message || 'Image generation failure' } })
  }
})
