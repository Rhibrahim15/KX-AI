/**
 * Meta Cloud API WhatsApp Bridge Gateway (Live Messaging Edition)
 * 
 * Exposes webhook verification and message dispatching for WhatsApp Business accounts.
 * Automatically replies to incoming farmer queries and personal chats.
 */

import { Router } from 'express'
import { getRouter, type Message } from '../api/lib/llm_router'
import { GODMODE_SYSTEM_PROMPT } from '../src/lib/kx-constitution'

export const whatsappRoutes = Router()

// In-memory conversation history per phone number
const phoneHistory: Map<string, Array<Message>> = new Map()

async function sendWhatsAppMessage(toPhone: string, text: string) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneId || !token) return

  await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone,
      type: 'text',
      text: { body: text },
    }),
  }).catch(err => console.error('[WhatsApp Send Error]', err))
}

// Meta Cloud API Webhook Verification Challenge
whatsappRoutes.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'greenbyte_secret_token'
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token && mode === 'subscribe' && token === verifyToken) {
    console.log('✔ [WhatsApp Webhook] Verification challenge accepted!')
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
            console.log(`[WhatsApp] Message from ${phone}: "${userText}"`)

            const history = phoneHistory.get(phone) || []
            const messagesToSend: Message[] = [
              { role: 'system', content: GODMODE_SYSTEM_PROMPT },
              ...history.slice(-10),
              { role: 'user', content: `[Incoming WhatsApp Chat]: "${userText}"` }
            ]

            const router = getRouter()
            const reply = await router.execute(messagesToSend, 'reasoning')
            const replyText = reply.content || 'Brother Khalifa, system ready.'

            history.push({ role: 'user', content: userText })
            history.push({ role: 'assistant', content: replyText })
            phoneHistory.set(phone, history)

            await sendWhatsAppMessage(phone, replyText)
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
