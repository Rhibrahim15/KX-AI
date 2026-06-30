/**
 * KX-AI Research Preview API + Web UI
 */
console.log('===== Application Startup at', new Date().toISOString(), '=====');

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import express from 'express';
import path from 'path';

if (!process.env.SPACE_ID && !process.env.HF_SPACE) {
  loadEnv({ path: resolve(process.cwd(), '.env') });
  console.log('◇ Loaded local .env file');
} else {
  console.log('◇ Running on Hugging Face Spaces — using injected secrets');
}

const app = express();
const PORT = parseInt(process.env.PORT || '7860', 10);

app.use(express.json());

// Serve static files from /out (Next.js) and root HTML files
app.use(express.static(path.join(process.cwd(), 'out')));
app.use(express.static(process.cwd()));

// Health check
app.get('/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Main UI routes
app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'kx_sanctuary_os.html'));
});

app.get('/master', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'kx_master_ui.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KX-AI API + Web UI running on port ${PORT}`);
  console.log('HF Publishing:', process.env.HF_TOKEN ? 'ENABLED' : 'DISABLED');
  console.log('Main UI: /');
});
