/**
 * KX-AI Research Preview API
 *
 * Exposes the core engines (AutoTune, Parseltongue, STM, Feedback Loop)
 * and the flagship ULTRAPLINIAN multi-model racing mode as a REST API.
 *
 * Includes opt-in dataset collection for building an open source research dataset.
 * Enterprise paywall: tier-based access control (free/pro/enterprise).
 *
 * Designed for deployment on Hugging Face Spaces (Docker) or any container host.
 */

// Load .env file ONLY if running locally (not on HF Spaces)
import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'

// Only load .env when NOT running on Hugging Face Spaces
if (!process.env.SPACE_ID && !process.env.HF_SPACE) {
  loadEnv({ path: resolve(process.cwd(), '.env') })
  console.log('◇ Loaded local .env file')
} else {
  console.log('◇ Running on Hugging Face Spaces — using injected secrets')
}

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from './middleware/rateLimit'
import { apiKeyAuth } from './middleware/auth'
import { tierGate } from './middleware/tierGate'
import { autotuneRoutes } from './routes/autotune'
import { parseltongueRoutes } from './routes/parseltongue'
import { transformRoutes } from './routes/transform'
import { chatRoutes } from './routes/chat'
import { feedbackRoutes } from './routes/feedback'
import { ultraplinianRoutes } from './routes/ultraplinian'
import { consortiumRoutes } from './routes/consortium'
import { datasetRoutes } from './routes/dataset'
import { metadataRoutes } from './routes/metadata'
import { researchRoutes } from './routes/research'
import { audioRoutes } from './routes/audio'
import { toolsRoutes } from './routes/tools'
import { mediaRoutes } from './routes/media'
import { gkpRoutes } from './routes/gkp'
import { connectorsRoutes } from './routes/connectors'
import { exportRoutes } from './routes/export'
import { whatsappRoutes } from '../bots/whatsapp'
import { startTelegramBot } from '../bots/telegram'
import { startDiscordBot } from '../bots/discord'
import { getGKPAutoIndexer } from './lib/gkp/auto_indexer'
import { getOAuthDaemon } from './lib/connectors/oauth_daemon'
import { isPublisherEnabled, startPeriodicFlush, shutdownFlush, getPublisherStatus } from './lib/hf-publisher'
import { TIER_CONFIGS } from './lib/tiers'
import { ULTRAPLINIAN_MODELS } from './lib/ultraplinian'
import type { TierConfig } from './lib/tiers'

const app = express()
const PORT = parseInt(process.env.PORT || '7860', 10)
