/**
 * GreenByte Knowledge Platform (GKP) Ingestion Gateway ("The Mouth")
 * 
 * POST /v1/gkp/ingest  — Infuse markdown documents or text snippets directly into GKP room domains.
 * GET  /v1/gkp/tree    — Get current visual room directory tree.
 */

import { Router } from 'express'
import { getGreenByteRoom } from '../lib/gkp/room'
import { getGKPEngine } from '../lib/gkp/index'

export const gkpRoutes = Router()

gkpRoutes.get('/tree', (_req, res) => {
  const room = getGreenByteRoom()
  res.json({ tree: room.getRoomTreeASCII() })
})

gkpRoutes.post('/ingest', async (req, res) => {
  try {
    const { domain, filename, content, title } = req.body

    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: { message: 'Missing "content" string parameter' } })
      return
    }

    const validDomains = ['identity', 'company', 'projects', 'research', 'opportunities', 'engineering', 'decisions', 'journal', 'templates', 'system']
    const targetDomain = validDomains.includes(domain) ? domain : 'projects'

    const cleanName = (filename || title || `doc_${Date.now()}`)
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .replace(/\.md$/i, '') + '.md'

    const relPath = `${targetDomain}/${cleanName}`

    // 1. Write file into GreenByte Room VFS
    const room = getGreenByteRoom()
    const action = room.createFile(relPath, content)

    // 2. Reload GKP RAG index
    const gkp = getGKPEngine()
    const totalDocs = gkp.reloadKnowledgeBase()

    console.log(`[GKPIngest] Successfully infused knowledge through feeding mouth: gkp/${relPath}`)

    res.json({
      status: 'success',
      infused_path: `gkp/${relPath}`,
      domain: targetDomain,
      document_length: content.length,
      total_gkp_corpus_size: totalDocs,
      vfs_tree: room.getRoomTreeASCII(targetDomain),
    })
  } catch (err: any) {
    console.error('[GKPIngestion Error]', err)
    res.status(500).json({ error: { message: err.message || 'Knowledge infusion failed' } })
  }
})
