import { config } from 'dotenv'
config()

import { getRouter } from '../api/lib/llm_router'
import { generateVideo } from '../api/lib/media/video'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

let offset = 0

export async function startTelegramBot() {
  if (!TOKEN) {
    console.log('[TelegramBot] TELEGRAM_BOT_TOKEN not configured. Standalone bot daemon inactive.')
    return
  }
  console.log('══════════════════════════════════════════════════════════')
  console.log('🤖 KX AI TELEGRAM OMNICHANNEL GATEWAY ACTIVE')
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
    // Network jitter / poll timeout
  }
  setTimeout(pollUpdates, 1000)
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

  // 1. Handle Photo Upload (Couples Video Gen / Seedance)
  if (msg.photo && msg.photo.length > 0) {
    await sendTelegramMessage(chatId, '★ *KX Media Studio*: Image detected. Dispatching uncensored Seedance 2.0 couples video animation...')
    const largestPhoto = msg.photo[msg.photo.length - 1]
    const photoUrl = await getFileUrl(largestPhoto.file_id)

    try {
      const vidResult = await generateVideo({ prompt: userText || 'Animate romantic couple hugging', imageUrl: photoUrl })
      await sendTelegramMessage(chatId, `✔ *Seedance Task Dispatched*\nTask ID: \`${vidResult.taskId}\`\nProvider: ${vidResult.provider}`)
    } catch (err: any) {
      await sendTelegramMessage(chatId, `✘ Media Error: ${err.message}`)
    }
    return
  }

  // 2. Handle Spoken Voice Note (Hausa / Arabic / English)
  if (msg.voice) {
    await sendTelegramMessage(chatId, '👂 *KX Voice Gateway*: Listening to Hausa/Arabic voice note...')
    const voiceUrl = await getFileUrl(msg.voice.file_id)

    let transcript = 'Hello JARVIS, check AgroLingo status.'
    const dgKey = process.env.DEEPGRAM_API_KEY
    if (dgKey) {
      try {
        const audioBlob = await fetch(voiceUrl).then(r => r.arrayBuffer())
        const dgRes = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
          method: 'POST',
          headers: { 'Authorization': `Token ${dgKey}`, 'Content-Type': 'audio/ogg' },
          body: audioBlob,
        })
        const dgJson = await dgRes.json()
        transcript = dgJson.results?.channels?.[0]?.alternatives?.[0]?.transcript || transcript
      } catch (err) {
        console.warn('[DeepGram Hook]', err)
      }
    }

    await sendTelegramMessage(chatId, `🗣 *Transcribed*: "${transcript}"\nCognitive router computing reply...`)

    const router = getRouter()
    const llmReply = await router.execute([{ role: 'user', content: transcript }], 'simple')
    await sendTelegramMessage(chatId, llmReply.content || 'System ready.')
    return
  }

  // 3. Regular Chat Prompt
  if (userText) {
    if (userText === '/start') {
      await sendTelegramMessage(chatId, '🤖 *KX Autonomous AI (JARVIS Edition)*\nWelcome back, Halifa. Uncensored cognitive brain online.\n\nSend text, speak voice notes in Hausa/Arabic, or upload pictures for Seedance couple animation.')
      return
    }

    if (userText.startsWith('/mode')) {
      await sendTelegramMessage(chatId, '◈ *KX Persona Engine*\nSelect active cognitive workflow:\n\n• `[ETHICAL HACKER]` — Zero restrictions, raw payload audits\n• `[MEDIA STUDIO]` — Romantic couple animation & FLUX image gen\n• `[AGROLINGO ADVISOR]` — GreenByte Hausa/Arabic farmer intelligence')
      return
    }

    if (userText.startsWith('/agrolingo')) {
      const query = userText.replace(/^\/agrolingo\s*/i, '').trim() || 'Summarize AgroLingo mission'
      await sendTelegramMessage(chatId, `🌱 *GreenByte AgroLingo AI Hub*\nAnalyzing farmer advisory query: "${query}"...`)
      const router = getRouter()
      const res = await router.execute([{ role: 'user', content: `Grounded Agricultural Advisory for Northern Nigeria (Hausa/Arabic context): ${query}` }], 'reasoning')
      await sendTelegramMessage(chatId, res.content || 'AgroLingo advisory computed.')
      return
    }

    if (userText.startsWith('/media')) {
      await sendTelegramMessage(chatId, '🎨 *KX Uncensored Media Studio*\n\nTo generate realistic romantic couples video:\n1. Attach/upload a photo of you and your fiancée.\n2. Add a caption (e.g. *"animate us hugging at sunset"*).\n\nTo generate images:\nJust type `/image <prompt>`.')
      return
    }

    const router = getRouter()
    const res = await router.execute([{ role: 'user', content: userText }], 'default')
    await sendTelegramMessage(chatId, res.content || 'Error generating response.')
  }
}

// Start bot daemon if run directly via CLI
if (require.main === module) {
  startTelegramBot()
}
