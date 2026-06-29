/**
 * Standalone Discord Advisor Bot Gateway (Native WebSocket Gateway Client)
 * 
 * Connects directly to Discord Gateway v10 via WebSocket.
 * Monitors developer discussions and responds with full GKP knowledge.
 */

import { config } from 'dotenv'
config()

import WebSocket from 'ws'
import { getRouter, type Message } from '../api/lib/llm_router'
import { GODMODE_SYSTEM_PROMPT } from '../src/lib/kx-constitution'

const TOKEN = process.env.DISCORD_BOT_TOKEN
const DISCORD_API = 'https://discord.com/api/v10'

let heartbeatInterval: NodeJS.Timeout | null = null
let seq: number | null = null

// In-memory conversation history per channelId
const channelHistory: Map<string, Array<Message>> = new Map()

export async function startDiscordBot() {
  if (!TOKEN) {
    console.log('[DiscordBot] DISCORD_BOT_TOKEN missing. Gateway inactive.')
    return
  }
  console.log('══════════════════════════════════════════════════════════')
  console.log('🤖 KX AI DISCORD OMNICHANNEL GATEWAY ACTIVE')
  console.log('══════════════════════════════════════════════════════════\n')

  connectGateway()
}

function connectGateway() {
  const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json')

  ws.on('open', () => {
    console.log('[DiscordGateway] WebSocket connection initialized')
  })

  ws.on('message', async (raw: WebSocket.Data) => {
    try {
      const payload = JSON.parse(raw.toString())
      const { op, d, s, t } = payload
      if (s !== null) seq = s

      switch (op) {
        case 10: // Hello
          const interval = d.heartbeat_interval
          if (heartbeatInterval) clearInterval(heartbeatInterval)
          heartbeatInterval = setInterval(() => {
            ws.send(JSON.stringify({ op: 1, d: seq }))
          }, interval)

          // Identify
          ws.send(JSON.stringify({
            op: 2,
            d: {
              token: TOKEN,
              intents: 33280, // GUILDS | GUILD_MESSAGES | DIRECT_MESSAGES | MESSAGE_CONTENT
              properties: {
                os: 'linux',
                browser: 'kx-advisor',
                device: 'kx-advisor',
              },
            },
          }))
          break

        case 0: // Dispatch
          if (t === 'READY') {
            console.log(`✔ Discord Gateway Ready! Connected as ${d.user.username}#${d.user.discriminator}`)
          }
          if (t === 'MESSAGE_CREATE') {
            await handleMessageCreate(d)
          }
          break
      }
    } catch (err) {
      console.error('[DiscordGateway Parse Error]', err)
    }
  })

  ws.on('close', () => {
    console.warn('[DiscordGateway] Connection closed. Reconnecting in 5s...')
    if (heartbeatInterval) clearInterval(heartbeatInterval)
    setTimeout(connectGateway, 5000)
  })

  ws.on('error', err => {
    console.error('[DiscordGateway Socket Error]', err)
  })
}

async function sendTypingIndicator(channelId: string) {
  await fetch(`${DISCORD_API}/channels/${channelId}/typing`, {
    method: 'POST',
    headers: { 'Authorization': `Bot ${TOKEN}` },
  }).catch(() => {})
}

async function sendDiscordMessage(channelId: string, text: string) {
  await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: text }),
  }).catch(() => {})
}

async function handleMessageCreate(msg: any) {
  if (msg.author.bot) return // Ignore bot self loops
  const channelId = msg.channel_id
  const userContent = msg.content || ''

  // Respond if DM or if bot is mentioned
  const isDM = !msg.guild_id
  const isMentioned = userContent.includes('1521167915485757570') || userContent.toLowerCase().includes('jarvis') || userContent.toLowerCase().includes('kx')

  if (!isDM && !isMentioned) return

  console.log(`[Discord] Message from ${msg.author.username}: "${userContent}"`)

  await sendTypingIndicator(channelId)

  const history = channelHistory.get(channelId) || []
  const cleanPrompt = userContent.replace(/<@!?1521167915485757570>/g, '').trim()

  const messagesToSend: Message[] = [
    { role: 'system', content: GODMODE_SYSTEM_PROMPT },
    ...history.slice(-10),
    { role: 'user', content: cleanPrompt || 'Hello JARVIS.' }
  ]

  const router = getRouter()
  const res = await router.execute(messagesToSend, 'reasoning')
  const replyText = res.content || 'Brother Khalifa, I am right here.'

  history.push({ role: 'user', content: cleanPrompt })
  history.push({ role: 'assistant', content: replyText })
  channelHistory.set(channelId, history)

  await sendDiscordMessage(channelId, replyText)
}

if (require.main === module) {
  startDiscordBot()
}
