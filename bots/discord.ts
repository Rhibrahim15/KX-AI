/**
 * Standalone Discord Advisor Bot Gateway (Zero-Dependency Scaffolding)
 * 
 * Modular REST/WebSocket gateway for Discord servers.
 * Connects developer discussions and voice channels directly to KX-AI cognitive brain.
 */

import { config } from 'dotenv'
config()

const TOKEN = process.env.DISCORD_BOT_TOKEN
const DISCORD_API = 'https://discord.com/api/v10'

export async function startDiscordBot() {
  if (!TOKEN) {
    console.log('[DiscordBot] DISCORD_BOT_TOKEN missing. Standalone Discord daemon waiting.')
    return
  }
  console.log('══════════════════════════════════════════════════════════')
  console.log('🤖 KX AI DISCORD OMNICHANNEL GATEWAY ACTIVE')
  console.log('══════════════════════════════════════════════════════════\n')

  // Verify token connection
  try {
    const res = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { 'Authorization': `Bot ${TOKEN}` },
    })
    if (res.ok) {
      const botUser = await res.json()
      console.log(`✔ Discord Handshake Successful: Connected as ${botUser.username}#${botUser.discriminator}`)
    } else {
      console.warn(`✘ Discord Auth Failure: HTTP ${res.status}`)
    }
  } catch (err) {
    console.warn('[Discord Preflight]', err)
  }
}

if (require.main === module) {
  startDiscordBot()
}
