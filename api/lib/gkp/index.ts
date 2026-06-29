/**
 * GreenByte Knowledge Platform (GKP) Engine
 * 
 * Centralized knowledge consumer, RAG retrieval engine, proactive recommendation generator,
 * and ambiguity interrogator for GreenByte ecosystem.
 */

import fs from 'fs'
import path from 'path'

export interface GKPDocument {
  domain: 'identity' | 'company' | 'projects' | 'research' | 'opportunities' | 'engineering' | 'decisions' | 'system'
  relPath: string
  title: string
  metadata: Record<string, string>
  content: string
}

export class GKPEngine {
  private gkpRoot: string
  private documents: Map<string, GKPDocument> = new Map()

  constructor(workspaceRoot: string = process.cwd()) {
    this.gkpRoot = path.resolve(workspaceRoot, 'gkp')
    this.reloadKnowledgeBase()
  }

  /**
   * Scan and reload all GKP domain documents
   */
  reloadKnowledgeBase(): number {
    this.documents.clear()
    if (!fs.existsSync(this.gkpRoot)) return 0

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
          const relP = path.relative(this.gkpRoot, fullP)

          this.documents.set(relP, {
            domain: (domainName || 'system') as any,
            relPath: relP,
            title,
            metadata: {},
            content,
          })
        }
      }
    }

    try { scanDir(this.gkpRoot) } catch {}
    return this.documents.size
  }

  /**
   * RAG Retrieval across GreenByte Knowledge Platform
   */
  retrieveGKPContext(query: string, maxResults: number = 3): GKPDocument[] {
    const qLower = query.toLowerCase()
    const allDocs = Array.from(this.documents.values())

    // Simple keyword score match simulation
    return allDocs
      .map(doc => {
        let score = 0
        if (doc.title.toLowerCase().includes(qLower)) score += 10
        if (doc.content.toLowerCase().includes(qLower)) score += 5
        if (doc.domain.includes(qLower)) score += 3
        return { doc, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(x => x.doc)
  }

  /**
   * Proactive Mentorship Suggestions based on GKP state
   */
  generateValuableSuggestions(): string[] {
    return [
      '► [ABROAD SCHOLARSHIP]: Chevening & Commonwealth Master fellowships open next month. Prepare B.Sc. CS 2:1 transcripts.',
      '► [AGROLINGO SCALE]: Wire up GreenByte pest diagnosis dataset batch into PgVector.',
      '► [DAILY HABIT]: Dedicate 45 mins to Golang backend concurrency & 30 mins to Qur\'anic Hifz revision.'
    ]
  }

  /**
   * Ask for clarity whenever input documents confuse or lack metadata
   */
  interrogateClarity(inputSnippet: string): string | null {
    if (!inputSnippet.includes('title:') && !inputSnippet.includes('type:')) {
      return 'Brother Khalifa, this pasted knowledge snippet lacks GKP YAML frontmatter metadata (title, type, status). Which domain (`projects/`, `engineering/`, `decisions/`) shall we index this under?'
    }
    return null
  }
}

let globalGKPEngine: GKPEngine | null = null

export function getGKPEngine(): GKPEngine {
  if (!globalGKPEngine) {
    globalGKPEngine = new GKPEngine()
  }
  return globalGKPEngine
}
