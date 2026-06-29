import { config } from 'dotenv'
config()

import { getRouter } from './api/lib/llm_router'
import { generateSpeechStream } from './api/lib/voice/elevenlabs'

async function runTests() {
  console.log('══════════════════════════════════════════════════════════')
  console.log('🤖 KX AI (JARVIS) COGNITIVE & VOICE ENGINE LIVE TEST')
  console.log('══════════════════════════════════════════════════════════\n')

  const router = getRouter()

  // Test 1: Simple task (Should route to Groq or Cerebras)
  console.log('► Test 1: Simple Conversational Query ("Hello JARVIS")')
  const startTime1 = Date.now()
  const res1 = await router.execute(
    [{ role: 'user', content: 'You are JARVIS. Reply in 1 sentence welcoming me back.' }],
    'simple'
  )
  console.log(`  ✔ Status: ${res1.success ? 'SUCCESS' : 'FAILED'}`)
  if (!res1.success) console.log(`  ✘ Error Reason: ${res1.error}`)
  console.log(`  ✔ Provider/Model: ${res1.model}`)
  console.log(`  ✔ Latency: ${Date.now() - startTime1}ms`)
  console.log(`  ✔ Response: "${res1.content?.trim()}"\n`)

  // Test 2: Code task (Should route to Mistral or Groq)
  console.log('► Test 2: Code Generation Task')
  const startTime2 = Date.now()
  const res2 = await router.execute(
    [{ role: 'user', content: 'Write a TypeScript function to reverse a string. Code only.' }],
    'code'
  )
  console.log(`  ✔ Status: ${res2.success ? 'SUCCESS' : 'FAILED'}`)
  if (!res2.success) console.log(`  ✘ Error Reason: ${res2.error}`)
  console.log(`  ✔ Provider/Model: ${res2.model}`)
  console.log(`  ✔ Latency: ${Date.now() - startTime2}ms`)
  console.log(`  ✔ Snippet length: ${res2.content?.length} chars\n`)

  // Test 3: ElevenLabs Voice Synthesis
  console.log('► Test 3: ElevenLabs Neural Speech Synthesis')
  try {
    const startTime3 = Date.now()
    const speechRes = await generateSpeechStream({ text: 'Welcome home, sir. All systems online.' })
    console.log(`  ✔ Status: ${speechRes.ok ? 'SUCCESS' : 'FAILED (HTTP ' + speechRes.status + ')'}`)
    console.log(`  ✔ Content-Type: ${speechRes.headers.get('content-type')}`)
    console.log(`  ✔ Latency: ${Date.now() - startTime3}ms\n`)
  } catch (err: any) {
    console.log(`  ✘ ElevenLabs Error: ${err.message}\n`)
  }

  console.log('══════════════════════════════════════════════════════════')
  console.log('🎉 ALL ENGINE VERIFICATIONS COMPLETED!')
  console.log('══════════════════════════════════════════════════════════')
}

runTests().catch(console.error)
