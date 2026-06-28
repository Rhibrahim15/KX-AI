# 🚀 Quick Start - What You Need to Do Now

## Step 1: Get API Keys (5 minutes)

All providers have **free tiers** with generous limits:

### OpenRouter (Fallback for everything)
1. Go to https://openrouter.ai/keys
2. Create account (email instant verification)
3. Copy API key
4. Paste into `.env` as `OPENROUTER_API_KEY=sk-or-v1-...`

### Groq (Fastest)
1. Go to https://console.groq.com/keys
2. Create account
3. Copy API key
4. Paste into `.env` as `GROQ_API_KEY=gsk_...`

### NVIDIA NIM (Powerful)
1. Go to https://build.nvidia.com/nim
2. Create account
3. Copy API key
4. Paste into `.env` as `NVIDIA_NIM_API_KEY=nvapi-...`

### Ollama (Optional - Local)
```bash
# Download from https://ollama.ai
ollama pull mistral
ollama serve
# Will be available at http://localhost:11434
```

---

## Step 2: Set Up Environment (2 minutes)

```bash
# Copy the example config
cp .env.example .env

# Edit .env and paste your API keys
nano .env  # or use your editor

# Should have at least:
OPENROUTER_API_KEY=sk-or-v1-...
GROQ_API_KEY=gsk_...
NVIDIA_NIM_API_KEY=nvapi-...
```

---

## Step 3: Verify Installation (3 minutes)

```bash
# Install dependencies (if needed)
npm install

# Start API server
npm run api:dev

# Should see:
# [ProviderRegistry] Health check completed
# ✅ All providers loaded successfully
```

---

## Step 4: Test the New System

Once the server is running, you can test in another terminal:

```bash
curl -X POST http://localhost:7860/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "hello"}],
    "model": "gpt-4",
    "openrouter_api_key": "YOUR_KEY_HERE"
  }'
```

The request will:
1. Try Groq (fastest)
2. If Groq fails → try OpenRouter
3. If OpenRouter fails → try NVIDIA NIM
4. If all fail → try Ollama (if running)

---

## That's It! ✅

Once your `.env` is configured, I'll proceed to **Phase A Step 2** where I'll:
- Integrate the new router into `api/routes/chat.ts`
- Update `api/routes/ultraplinian.ts` for multi-provider racing
- Update `api/routes/consortium.ts` for ensemble synthesis

**Tell me when you've:**
1. ✅ Got API keys
2. ✅ Created `.env` file
3. ✅ Ran `npm run api:dev` successfully

Then we move to Phase A2!

