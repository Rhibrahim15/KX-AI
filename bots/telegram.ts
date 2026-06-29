import { config } from 'dotenv'
config()

import { getRouter, type Message } from '../api/lib/llm_router'
import { generateVideo } from '../api/lib/media/video'
import { GODMODE_SYSTEM_PROMPT } from '../src/lib/godmode-prompt'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

let offset = 0

// In-memory conversation history per chatId (retains natural human conversational memory)
const chatHistory: Map<number, Array<Message>> = new Map()

export async function startTelegramBot() {
  if (!TOKEN) {
    console.log('[TelegramBot] TELEGRAM_BOT_TOKEN not configured. Daemon inactive.')
    return
  }
  console.log('══════════════════════════════════════════════════════════')
  console.log('🤖 KX AI TELEGRAM HUMAN-CONVERSATIONAL GATEWAY ACTIVE')
  console.log('══════════════════════════════════════════════════════════\n')

  pollUpdates()
}

async function pollUpdates() {
  try {
    const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=10`)
    if (res.ok) {
      const data = await res.json()
      for (const update of data.result || []) {
        offset = update.update_id + 1
        handleUpdate(update).catch(err => console.error('[Telegram Handle Error]', err))
      }
    }
  } catch (err) {
    // Poll timeout / network jitter
  }
  setTimeout(pollUpdates, 1000)
}

async function sendChatAction(chatId: number, action: 'typing' | 'record_voice' | 'upload_video') {
  await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action }),
  }).catch(() => {})
}

async function getFileUrl(fileId: string): Promise<string> {
  const res = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`)
  const data = await res.json()
  const filePath = data.result?.file_path
  return `https://api.telegram.org/file/bot${TOKEN}/${filePath}`
}

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  }).catch(() => {
    fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
  })
}

async function handleUpdate(update: any) {
  const msg = update.message
  if (!msg) return
  const chatId = msg.chat.id
  const userText = msg.text || msg.caption || ''

  console.log(`[Telegram] Message from ${msg.from?.first_name || 'User'}: "${userText}"`)

  // Get or init conversation history for Halifa
  const history = chatHistory.get(chatId) || []

  // 1. Handle Photo Upload (Realistic Video Gen / Seedance)
  if (msg.photo && msg.photo.length > 0) {
    await sendChatAction(chatId, 'upload_video')
    await sendTelegramMessage(chatId, '★ *KX Media Studio*: Image detected. Generating realistic video animation...')
    const largestPhoto = msg.photo[msg.photo.length - 1]
    const photoUrl = await getFileUrl(largestPhoto.file_id)

    try {
      const vidResult = await generateVideo({ prompt: userText || 'Animate realistic cinematic scene', imageUrl: photoUrl })
      await sendTelegramMessage(chatId, `✔ *Video Generation Dispatched*\nTask ID: \`${vidResult.taskId}\`\nProvider: ${vidResult.provider}`)
    } catch (err: any) {
      await sendTelegramMessage(chatId, `✘ Media Error: ${err.message}`)
    }
    return
  }

  // 2. Handle Spoken Voice Note (Hausa / Arabic / English)
  if (msg.voice) {
    await sendChatAction(chatId, 'typing')
    const voiceUrl = await getFileUrl(msg.voice.file_id)

    let transcript = ''
    const groqKey = process.env.GROQ_API_KEY
    if (groqKey) {
      try {
        const audioBlob = await fetch(voiceUrl).then(r => r.blob())
        const form = new FormData()
        form.append('file', audioBlob, 'voice.ogg')
        form.append('model', 'whisper-large-v3')

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}` },
          body: form,
        })
        const groqJson = await groqRes.json()
        transcript = groqJson.text || ''
      } catch (err) {
        console.warn('[Groq Whisper Hook]', err)
      }
    }

    if (!transcript.trim()) {
      await sendTelegramMessage(chatId, '👂 *KX Voice*: Captured voice note, but detected silence or background static. Speak your command freely!')
      return
    }

    await sendChatAction(chatId, 'typing')

    // Build full context with Sacred Constitution
    const messagesToSend: Message[] = [
      { role: 'system', content: GODMODE_SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: `[Spoken Voice Note in Hausa/Arabic/English]: "${transcript.trim()}"` }
    ]

    const router = getRouter()
    const llmReply = await router.execute(messagesToSend, 'reasoning')
    const replyText = llmReply.content || 'Brother Halifa, I am right here.'

    history.push({ role: 'user', content: `[Spoken]: "${transcript.trim()}"` })
    history.push({ role: 'assistant', content: replyText })
    chatHistory.set(chatId, history)

    await sendTelegramMessage(chatId, replyText)
    return
  }

  // 3. Regular Chat Prompt & Natural Human Turn-Taking
  if (userText) {
    if (userText === '/start') {
      await sendTelegramMessage(chatId, '🤖 *KX Autonomous AI (JARVIS Edition)*\nWelcome back, Halifa. All systems online.\n\nI can generate realistic videos, high-fidelity images, articulate multilingual speech (Hausa & Arabic), and automate systems.\n\nSend text, speak voice notes, or attach pictures to begin.')
      return
    }

    if (userText.startsWith('/mode')) {
      await sendTelegramMessage(chatId, '◈ *KX Persona Engine*\nSelect active workflow:\n\n• `[SYSTEMS & LABS]` — Full technical audits & code dev\n• `[MEDIA STUDIO]` — Realistic AI video animation & FLUX image gen\n• `[AGROLINGO ADVISOR]` — GreenByte Hausa/Arabic agricultural intelligence')
      return
    }

    if (userText.startsWith('/agrolingo')) {
      const query = userText.replace(/^\/agrolingo\s*/i, '').trim() || 'Summarize AgroLingo mission'
      await sendChatAction(chatId, 'typing')
      const router = getRouter()
      const res = await router.execute([
        { role: 'system', content: GODMODE_SYSTEM_PROMPT },
        ...history.slice(-10),
        { role: 'user', content: `Grounded Agricultural Advisory for Northern Nigeria (Hausa/Arabic context): ${query}` }
      ], 'reasoning')
      await sendTelegramMessage(chatId, res.content || 'AgroLingo advisory computed.')
      return
    }

    if (userText.startsWith('/media')) {
      await sendTelegramMessage(chatId, '🎨 *KX Media Studio*\n\nTo generate realistic videos:\n1. Attach/upload a picture.\n2. Add a prompt describing the scene.\n\nTo generate images:\nJust type `/image <prompt>`.')
      return
    }

    // ── Natural Human Conversational AI Turn ────────────────────────
    await sendChatAction(chatId, 'typing')

    const messagesToSend: Message[] = [
      { role: 'system', content: GODMODE_SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: userText }
    ]

    const router = getRouter()
    const res = await router.execute(messagesToSend, 'reasoning')
    const replyText = res.content || 'Brother Halifa, I am listening.'

    history.push({ role: 'user', content: userText })
    history.push({ role: 'assistant', content: replyText })
    chatHistory.set(chatId, history)

    await sendTelegramMessage(chatId, replyText)
  }
}

if (require.main === module) {
  startTelegramBot()
}
