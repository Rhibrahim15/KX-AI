/**
 * MCP & Tools API Routes
 * 
 * GET  /v1/tools          — List all registered OpenAI/MCP tools
 * POST /v1/tools/execute  — Invoke a tool by name with arguments
 */

import { Router } from 'express'
import { getMCPHub } from '../lib/mcp/hub'

export const toolsRoutes = Router()

toolsRoutes.get('/', (_req, res) => {
  const hub = getMCPHub()
  res.json({
    object: 'list',
    data: hub.getOpenAITools(),
  })
})

toolsRoutes.post('/execute', async (req, res) => {
  try {
    const { name, arguments: args } = req.body
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: { message: 'Missing "name" string parameter' } })
      return
    }

    const hub = getMCPHub()
    const result = await hub.executeTool(name, args || {})
    res.json({ tool: name, result })
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message || 'Tool execution failure' } })
  }
})
