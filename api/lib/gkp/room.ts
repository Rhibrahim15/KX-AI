/**
 * GreenByte Virtual OS Room & Conversational VFS Engine
 * 
 * Enables Khalifa Elgezy to treat the GreenByte knowledge platform as an interactive room.
 * Supports natural language folder creation, file co-authoring, and live directory tree visualization.
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
   * 1. Create Folder
   */
  createFolder(relFolderPath: string): RoomActionResult {
    const targetDir = path.resolve(this.roomRoot, relFolderPath)
    fs.mkdirSync(targetDir, { recursive: true })
    return {
      action: 'create_folder',
      path: relFolderPath,
      summary: `✔ Created virtual room folder: \`gkp/${relFolderPath}\``,
    }
  }

  /**
   * 2. Create / Overwrite File
   */
  createFile(relFilePath: string, content: string = ''): RoomActionResult {
    const targetFile = path.resolve(this.roomRoot, relFilePath)
    fs.mkdirSync(path.dirname(targetFile), { recursive: true })
    fs.writeFileSync(targetFile, content, 'utf-8')
    return {
      action: 'create_file',
      path: relFilePath,
      content,
      summary: `✔ Created room file: \`gkp/${relFilePath}\` (${content.length} chars)`,
    }
  }

  /**
   * 3. Visual ASCII Directory Tree
   */
  getRoomTreeASCII(subRelDir: string = ''): string {
    const target = path.resolve(this.roomRoot, subRelDir)
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

  /**
   * 4. Conversational Natural Language Command Dispatcher
   */
  executeNaturalCommand(userMessage: string): RoomActionResult {
    const msg = userMessage.trim()

    // Match "create folder <name>" or "make directory <name>"
    const folderMatch = msg.match(/(?:create|make|open)\s+(?:a\s+)?(?:new\s+)?(?:folder|directory)\s+[`'"]?([a-zA-Z0-9_\-\/]+)[`'"]?/i)
    if (folderMatch) {
      let folderName = folderMatch[1]
      if (!folderName.endsWith('/')) folderName += '/'
      return this.createFolder(folderName)
    }

    // Match "create file <name>" or "make file <name>"
    const fileMatch = msg.match(/(?:create|make|touch)\s+(?:a\s+)?(?:new\s+)?file\s+[`'"]?([a-zA-Z0-9_\-\/\.]+)[`'"]?(?:\s+(?:with\s+content|saying)\s+[`'"]?(.+)[`'"]?)?/i)
    if (fileMatch) {
      const fileName = fileMatch[1]
      const fileContent = fileMatch[2] || `# ${path.basename(fileName, '.md')}\n\nCo-authored by Khalifa Elgezy & JARVIS inside GreenByte Room.\n`
      return this.createFile(fileName, fileContent)
    }

    // Match "show tree" or "list folder" or "what's inside"
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
