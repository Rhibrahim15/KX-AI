/**
 * Meta Cloud API WhatsApp Bridge Gateway
 * 
 * Exposes webhook verification and message dispatching for WhatsApp Business accounts.
 */

import { Router } from 'express'
import { getRouter } from '../api/lib/llm_router'

export const whatsappRoutes = Router()

// Meta Cloud API Webhook Verification Challenge
whatsappRoutes.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'greenbyte_secret_token'
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token && mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification challenge accepted!')
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Verification failed')
  }
})

// Incoming WhatsApp Message Webhook Receiver
whatsappRoutes.post('/webhook', async (req, res) => {
  try {
    const body = req.body
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value
          const message = value.messages?.[0]
          if (message && message.text) {
            const phone = message.from
            const userText = message.text.body
            console.log(`[WhatsApp] Incoming message from ${phone}: "${userText}"`)

            // Consult cognitive router
            const router = getRouter()
            const reply = await router.execute([{ role: 'user', content: userText }], 'default')
            
            // Dispatch response hook (Simulated Meta Graph API POST)
            console.log(`[WhatsApp Hook] Replying to ${phone}: "${reply.content?.slice(0, 50)}..."`)
          }
        }
      }
      res.status(200).send('EVENT_RECEIVED')
    } else {
      res.sendStatus(404)
    }
  } catch (err) {
    console.error('[WhatsApp Webhook Error]', err)
    res.sendStatus(500)
  }
})
