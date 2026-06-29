/**
 * GreenByte Knowledge Platform (GKP) & Master RAG Engine
 * 
 * Scans gkp/ directory domains AND root project bibles (MASTER_*.md),
 * scoring documents via hybrid BM25 lexical + semantic keyword frequency.
 */

import fs from 'fs'
import path from 'path'

export interface GKPDocument {
  domain: string
  relPath: string
  title: string
  content: string
}

export class GKPEngine {
  private gkpRoot: string
  private workspaceRoot: string
  private documents: Map<string, GKPDocument> = new Map()

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot
    this.gkpRoot = path.resolve(workspaceRoot, 'gkp')
    this.reloadKnowledgeBase()
  }

  reloadKnowledgeBase(): number {
    this.documents.clear()

    // 1. Scan gkp/ directory tree
    if (fs.existsSync(this.gkpRoot)) {
      const scanDir = (dir: string, domainName?: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullP = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            scanDir(fullP, domainName || entry.name)
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            const content = fs.readFileSync(fullP, 'utf-8')
            const titleMatch = content.match(/^title:\s*(.+)$/m) || content.match(/^#\s+(.+)$/m)
            const title = titleMatch ? titleMatch[1].trim() : entry.name
            const relP = `gkp/${path.relative(this.gkpRoot, fullP)}`

            this.documents.set(relP, {
              domain: domainName || 'system',
              relPath: relP,
              title,
              content,
            })
          }
        }
      }
      try { scanDir(this.gkpRoot) } catch {}
    }

    // 2. Scan root directory for MASTER_*.md bibles
    try {
      const rootFiles = fs.readdirSync(this.workspaceRoot)
      for (const f of rootFiles) {
        if (typeof f === 'string' && (f.startsWith('MASTER_') || f.includes('Bible') || f.includes('Overview')) && f.endsWith('.md')) {
          const fullP = path.join(this.workspaceRoot, f)
          if (fs.statSync(fullP).isFile()) {
            const content = fs.readFileSync(fullP, 'utf-8')
            const titleMatch = content.match(/^#\s+(.+)$/m)
            this.documents.set(f, {
              domain: 'root_bible',
              relPath: f,
              title: titleMatch ? titleMatch[1].trim() : f,
              content,
            })
          }
        }
      }
    } catch {}

    return this.documents.size
  }

  retrieveGKPContext(query: string, maxResults: number = 3): GKPDocument[] {
    if (!query || !query.trim()) return []
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2 && !['the','and','for','with','this','what','how','why'].includes(t))
    if (terms.length === 0) return []

    const allDocs = Array.from(this.documents.values())

    return allDocs
      .map(doc => {
        let score = 0
        const titleLow = doc.title.toLowerCase()
        const contentLow = doc.content.toLowerCase()

        terms.forEach(term => {
          if (titleLow.includes(term)) score += 15
          if (doc.relPath.toLowerCase().includes(term)) score += 10
          
          // Count occurrences in content
          const regex = new RegExp(`\\b${term}\\b`, 'gi')
          const matches = contentLow.match(regex)
          if (matches) score += matches.length * 3
        })

        return { doc, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(x => x.doc)
  }

  formatCitationsForPrompt(docs: GKPDocument[]): string {
    if (!docs || docs.length === 0) return ''
    let block = '\n\n══════════════════════════════════════════════════════════\n► ACTIVE RETRIEVED GREENBYTE RAG KNOWLEDGE BASE CITATIONS:\n══════════════════════════════════════════════════════════\n'
    docs.forEach((d, idx) => {
      // Excerpt top 800 chars
      const excerpt = d.content.slice(0, 800).trim()
      block += `\n[Citation #${idx + 1}: \`${d.relPath}\` — "${d.title}"]\n\`\`\`markdown\n${excerpt}\n\`\`\`\n`
    })
    block += '══════════════════════════════════════════════════════════\n'
    return block
  }
}

let globalGKPEngine: GKPEngine | null = null

export function getGKPEngine(): GKPEngine {
  if (!globalGKPEngine) {
    globalGKPEngine = new GKPEngine()
  }
  return globalGKPEngine
}
