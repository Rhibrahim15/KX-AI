/**
 * File Export Studio API Routes
 * 
 * POST /v1/export/file  — Export design or document to .pdf, .docx, .pptx, .xlsx, .csv, Figma, or Canva.
 */

import { Router } from 'express'
import { getExportStudio, type ExportOptions } from '../lib/files/export_studio'

export const exportRoutes = Router()

exportRoutes.post('/file', async (req, res) => {
  try {
    const { filename, format, title, content } = req.body

    if (!filename || !content || typeof filename !== 'string' || typeof content !== 'string') {
      res.status(400).json({ error: { message: 'Missing required "filename" and "content" string parameters' } })
      return
    }

    const validFormats = ['pdf', 'docx', 'pptx', 'xlsx', 'csv', 'svg', 'png', 'html', 'figma', 'canva']
    const targetFormat = validFormats.includes(format) ? format : 'pdf'

    const studio = getExportStudio()
    const result = await studio.exportAsset({
      filename,
      format: targetFormat as any,
      title,
      content,
    })

    res.json(result)
  } catch (err: any) {
    console.error('[ExportStudio Error]', err)
    res.status(500).json({ error: { message: err.message || 'File export failed' } })
  }
})
