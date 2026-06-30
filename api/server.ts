/**
 * KX-AI Research Preview API
 */
console.log('===== Application Startup at', new Date().toISOString(), '=====');

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

if (!process.env.SPACE_ID && !process.env.HF_SPACE) {
  loadEnv({ path: resolve(process.cwd(), '.env') });
  console.log('◇ Loaded local .env file');
} else {
  console.log('◇ Running on Hugging Face Spaces — using injected secrets');
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = parseInt(process.env.PORT || '7860', 10);

app.use(cors());
app.use(express.json());

app.get('/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KX-AI API running on port ${PORT}`);
  console.log('HF Publishing:', process.env.HF_TOKEN ? 'ENABLED' : 'DISABLED');
});
