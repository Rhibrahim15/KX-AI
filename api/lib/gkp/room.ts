/**
 * GreenByte Virtual OS Room & Conversational VFS Engine (Secure Sandbox Edition)
 * Enforces strict path traversal mitigation (preventing directory breakout outside gkp/).
 */

import fs from 'fs'
import path from 'path'

export interface RoomActionResult {
  action: 'create_folder' | 'create_file' | 'list_tree' | 'read_file' | 'none'
  path?: string
  content?: string
  tree?: string
  summary: string
}

export class GreenByteRoom {
  private roomRoot: string

  constructor(workspaceRoot: string = process.cwd()) {
    this.roomRoot = path.resolve(workspaceRoot, 'gkp')
    if (!fs.existsSync(this.roomRoot)) {
      fs.mkdirSync(this.roomRoot, { recursive: true })
    }
  }

  /**
   * Forensic Security Guard: Mitigate Path Traversal / Directory Escape
   */
  private resolveSecurePath(relP: string): string {
    const resolved = path.resolve(this.roomRoot, relP)
    if (!resolved.startsWith(this.roomRoot)) {
      throw new Error(`Security Exception: Path traversal breach attempt detected ("${relP}"). Sandbox breakout outside gkp/ is strictly blocked.`)
    }
    return resolved
  }

  createFolder(relFolderPath: string): RoomActionResult {
    const targetDir = this.resolveSecurePath(relFolderPath)
    fs.mkdirSync(targetDir, { recursive: true })
    return {
      action: 'create_folder',
      path: relFolderPath,
      summary: `✔ Created virtual room folder: \`gkp/${relFolderPath}\``,
    }
  }

  createFile(relFilePath: string, content: string = ''): RoomActionResult {
    const targetFile = this.resolveSecurePath(relFilePath)
    fs.mkdirSync(path.dirname(targetFile), { recursive: true })
    fs.writeFileSync(targetFile, content, 'utf-8')
    return {
      action: 'create_file',
      path: relFilePath,
      content,
      summary: `✔ Created room file: \`gkp/${relFilePath}\` (${content.length} chars)`,
    }
  }

  getRoomTreeASCII(subRelDir: string = ''): string {
    let target = this.roomRoot
    try {
      target = this.resolveSecurePath(subRelDir)
    } catch {
      return `Directory escape attempt blocked.`
    }
    if (!fs.existsSync(target)) return `Directory gkp/${subRelDir} does not exist.`

    let treeStr = `🏛️ GREENBYTE ROOM VFS [gkp/${subRelDir}]\n`

    const buildTree = (dir: string, indent: string = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      entries.forEach((entry, idx) => {
        const isLast = idx === entries.length - 1
        const connector = isLast ? '└── ' : '├── '
        const childIndent = indent + (isLast ? '    ' : '│   ')

        if (entry.isDirectory()) {
          treeStr += `${indent}${connector}📁 ${entry.name}/\n`
          buildTree(path.join(dir, entry.name), childIndent)
        } else {
          treeStr += `${indent}${connector}📄 ${entry.name}\n`
        }
      })
    }

    try { buildTree(target) } catch {}
    return treeStr
  }

  executeNaturalCommand(userMessage: string): RoomActionResult {
    const msg = userMessage.trim()

    const folderMatch = msg.match(/(?:create|make|open)\s+(?:a\s+)?(?:new\s+)?(?:folder|directory)\s+[`'"]?([a-zA-Z0-9_\-\/]+)[`'"]?/i)
    if (folderMatch) {
      let folderName = folderMatch[1]
      if (!folderName.endsWith('/')) folderName += '/'
      return this.createFolder(folderName)
    }

    const fileMatch = msg.match(/(?:create|make|touch)\s+(?:a\s+)?(?:new\s+)?file\s+[`'"]?([a-zA-Z0-9_\-\/\.]+)[`'"]?(?:\s+(?:with\s+content|saying)\s+[`'"]?(.+)[`'"]?)?/i)
    if (fileMatch) {
      const fileName = fileMatch[1]
      const fileContent = fileMatch[2] || `# ${path.basename(fileName, '.md')}\n\nCo-authored by Khalifa Elgezy inside GreenByte Room.\n`
      return this.createFile(fileName, fileContent)
    }

    if (/(?:show|list|visualize)\s+(?:the\s+)?(?:room|folder|directory)?\s*tree|what'?s\s+inside/i.test(msg)) {
      return {
        action: 'list_tree',
        tree: this.getRoomTreeASCII(),
        summary: '✔ Visualizing current GreenByte virtual room directory tree.',
      }
    }

    return { action: 'none', summary: '' }
  }
}

let globalRoom: GreenByteRoom | null = null

export function getGreenByteRoom(): GreenByteRoom {
  if (!globalRoom) {
    globalRoom = new GreenByteRoom()
  }
  return globalRoom
}
