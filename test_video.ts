import { config } from 'dotenv'
config()
import { generateVideo } from './api/lib/media/video'

async function run() {
  console.log('► Testing video failover engine...')
  try {
    const res = await generateVideo({ prompt: 'Test couple video', imageUrl: 'https://api.telegram.org/file/bot8503070884:AAE1zLPQ2biPJdSO-Je5csj8hLdACneL1U0/photos/file_1.jpg' })
    console.log('✔ SUCCESS!', res)
  } catch (err: any) {
    console.log('✘ Exhausted:', err.message)
  }
}
run()
