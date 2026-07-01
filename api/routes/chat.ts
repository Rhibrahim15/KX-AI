import { Router } from 'express';

const router = Router();

// Simple chat endpoint that works with common API keys from environment
router.post('/completions', async (req, res) => {
  const { messages, model = "auto" } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const userMessage = messages[messages.length - 1]?.content || "Hello";

  // Try different providers from environment variables
  const providers = [
    { name: 'openrouter', key: process.env.OPENROUTER_API_KEY, url: 'https://openrouter.ai/api/v1/chat/completions' },
    { name: 'groq', key: process.env.GROQ_API_KEY, url: 'https://api.groq.com/openai/v1/chat/completions' },
    { name: 'together', key: process.env.TOGETHER_API_KEY, url: 'https://api.together.xyz/v1/chat/completions' },
    { name: 'anthropic', key: process.env.ANTHROPIC_API_KEY, url: null },
  ];

  for (const provider of providers) {
    if (!provider.key) continue;

    try {
      let response;
      
      if (provider.name === 'anthropic') {
        // Anthropic format
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': provider.key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [{ role: "user", content: userMessage }]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return res.json({
            choices: [{
              message: {
                role: "assistant",
                content: data.content?.[0]?.text || "Response from Claude"
              }
            }]
          });
        }
      } else {
        // OpenAI-compatible format
        response = await fetch(provider.url!, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.key}`,
            'Content-Type': 'application/json',
            ...(provider.name === 'openrouter' && { 'HTTP-Referer': 'https://kx-sanctuary-os.hf.space' })
          },
          body: JSON.stringify({
            model: provider.name === 'groq' ? "llama-3.3-70b-versatile" : "meta-llama/Llama-3.3-70B-Instruct",
            messages: [{ role: "user", content: userMessage }],
            max_tokens: 1024
          })
        });

        if (response.ok) {
          const data = await response.json();
          return res.json({
            choices: [{
              message: {
                role: "assistant",
                content: data.choices?.[0]?.message?.content || "Response received"
              }
            }]
          });
        }
      }
    } catch (error) {
      console.log(`[${provider.name}] failed:`, error.message);
      continue;
    }
  }

  // Fallback if no keys work
  return res.json({
    choices: [{
      message: {
        role: "assistant",
        content: "I'm currently running without LLM API keys. Please add OPENROUTER_API_KEY, GROQ_API_KEY, or TOGETHER_API_KEY in your Space Secrets."
      }
    }]
  });
});

export { router as chatRoutes };
