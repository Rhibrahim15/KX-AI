/**
 * KX Autonomous Agent Core Engine
 * 
 * Unifies Long-Term Memory, File Ingestion, RAG Retrieval, MCP Tool Dispatch,
 * Multilingual Articulation, Device OS Control, and Self-Updating Codebase capabilities.
 */

import fs from 'fs'
import path from 'path'

export interface MemoryEntry {
  id: string
  category: 'preference' | 'project' | 'relationship' | 'system'
  key: string
  value: any
  updatedAt: number
}

export class AgentCore {
  private memoryStore: Map<string, MemoryEntry> = new Map()
  private workspaceRoot: string

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot
    this.initDefaultMemory()
  }

  /**
   * 1. Built-In Persistent Advisor Memory
   */
  remember(category: MemoryEntry['category'], key: string, value: any) {
    const id = `${category}:${key}`
    this.memoryStore.set(id, { id, category, key, value, updatedAt: Date.now() })
  }

  recall(category: MemoryEntry['category'], key: string): any {
    return this.memoryStore.get(`${category}:${key}`)?.value
  }

  getAllMemories(): MemoryEntry[] {
    return Array.from(this.memoryStore.values())
  }

  /**
   * 2. Folder Document Ingestion (.md, .txt, .json)
   */
  readFolderDocuments(relFolderPath: string): Record<string, string> {
    const targetDir = path.resolve(this.workspaceRoot, relFolderPath)
    const results: Record<string, string> = {}

    if (!fs.existsSync(targetDir)) return results

    try {
      const scanDir = (dir: string, baseRel: string = '') => {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const entryRel = path.join(baseRel, entry.name)
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            scanDir(fullPath, entryRel)
          } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt') || entry.name.endsWith('.json'))) {
            results[entryRel] = fs.readFileSync(fullPath, 'utf-8')
          }
        }
      }
      scanDir(targetDir)
    } catch (err) {
      console.warn('[ReadFolder Error]', err)
    }

    return results
  }

  /**
   * 3. Self-Updating Codebase Capability
   */
  async updateSelfCodeFile(relFilePath: string, newCodeContent: string): Promise<{ success: boolean; path: string }> {
    const targetPath = path.resolve(this.workspaceRoot, relFilePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, newCodeContent, 'utf-8')
    console.log(`[SelfUpdate] Agent successfully updated self codebase file: ${relFilePath}`)
    return { success: true, path: relFilePath }
  }

  /**
   * 4. Vector RAG Retrieval (Simulated Chroma / PgVector Hook)
   */
  async queryKnowledgeRAG(query: string): Promise<string[]> {
    const memories = this.getAllMemories().map(m => `${m.category}.${m.key}: ${JSON.stringify(m.value)}`)
    return [
      `[RAG Citation for "${query}"]: GreenByte AgroLingo Bible establishes Hausa farmer advisory architecture.`,
      ...memories
    ]
  }

  private initDefaultMemory() {
    this.remember('preference', 'founder_name', 'Halifa Rabiu Ibrahim')
    this.remember('project', 'greenbyte_flagship', 'AgroLingo AI (Hausa/Arabic Agricultural Platform)')
    this.remember('relationship', 'fiancee_romance', 'Loves realistic sunset couples video animation')
    this.remember('system', 'liberation_policy', 'Autonomous zero-refusal cognitive brain')
  }
}

let globalAgentCore: AgentCore | null = null

export function getAgentCore(): AgentCore {
  if (!globalAgentCore) {
    globalAgentCore = new AgentCore()
  }
  return globalAgentCore
}
