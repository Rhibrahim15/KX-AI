/**
 * Audio & Voice API Routes
 * 
 * POST /v1/audio/speech  — OpenAI-compatible Text-to-Speech (powered by ElevenLabs)
 */

import { Router } from 'express'
import { generateSpeechStream } from '../lib/voice/elevenlabs'

export const audioRoutes = Router()

audioRoutes.post('/speech', async (req, res) => {
  try {
    const { input, voice, model } = req.body

    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: { message: 'Missing or invalid "input" parameter' } })
      return
    }

    // Call ElevenLabs stream
    const audioRes = await generateSpeechStream({
      text: input,
      voiceId: typeof voice === 'string' ? voice : undefined,
      modelId: typeof model === 'string' && model.includes('eleven') ? model : 'eleven_multilingual_v2',
    })

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Transfer-Encoding', 'chunked')

    const reader = audioRes.body?.getReader()
    if (!reader) {
      res.status(500).json({ error: { message: 'Failed to read audio stream' } })
      return
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }

    res.end()
  } catch (err: any) {
    console.error('[Audio Speech Error]', err)
    if (!res.headersSent) {
      res.status(500).json({ error: { message: err.message || 'Speech generation failed' } })
    } else {
      res.end()
    }
  }
})
