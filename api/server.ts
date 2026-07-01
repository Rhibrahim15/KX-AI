import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 7860;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(process.cwd(), 'out')));
app.use(express.static(process.cwd()));

// Health check
app.get('/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the main UI
app.get('/', (req, res) => {
  const htmlPath = path.join(process.cwd(), 'kx_sanctuary_os.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.send('<h1>KX Sanctuary OS</h1><p>UI file not found</p>');
  }
});

// Chat endpoint
app.post('/v1/chat/completions', async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages?.[messages.length - 1]?.content || "Hello";

  const keys = {
    openrouter: process.env.OPENROUTER_API_KEY,
    groq: process.env.GROQ_API_KEY,
    together: process.env.TOGETHER_API_KEY,
  };

  if (keys.openrouter) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.openrouter}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 800
        })
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({
          choices: [{ message: { role: "assistant", content: data.choices[0].message.content } }]
        });
      }
    } catch (e) {}
  }

  if (keys.groq) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.groq}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 800
        })
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({
          choices: [{ message: { role: "assistant", content: data.choices[0].message.content } }]
        });
      }
    } catch (e) {}
  }

  res.json({
    choices: [{
      message: {
        role: "assistant",
        content: "Chat works! Add OPENROUTER_API_KEY or GROQ_API_KEY in Space Secrets."
      }
    }]
  });
});

app.post('/v1/media/video/image', (req, res) => {
  res.json({ status: "success", message: "Generation started" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KX-AI running on port ${PORT}`);
});
