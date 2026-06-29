/**
 * Model Context Protocol (MCP) & Universal Tool Hub
 * 
 * Central registry and execution engine for agentic tools.
 * Enables JARVIS to interact with GitHub, Figma, Gmail, Local Files, Bash, and Media APIs.
 */

export interface ToolInputSchema {
  type: 'object'
  properties: Record<string, any>
  required?: string[]
}

export interface AgentTool {
  name: string
  description: string
  inputSchema: ToolInputSchema
  execute: (args: Record<string, any>) => Promise<any>
}

export class MCPHub {
  private tools: Map<string, AgentTool> = new Map()

  constructor() {
    this.registerDefaultTools()
  }

  registerTool(tool: AgentTool) {
    this.tools.set(tool.name, tool)
  }

  getTool(name: string): AgentTool | undefined {
    return this.tools.get(name)
  }

  getAllTools(): AgentTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get OpenAI-compatible tool definitions for function calling
   */
  getOpenAITools() {
    return this.getAllTools().map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema,
      },
    }))
  }

  /**
   * Execute a tool call by name and arguments
   */
  async executeTool(name: string, args: Record<string, any>): Promise<any> {
    const tool = this.tools.get(name)
    if (!tool) {
      throw new Error(`Tool "${name}" not found in MCP hub`)
    }
    try {
      return await tool.execute(args)
    } catch (err: any) {
      return { error: err.message || 'Tool execution failed' }
    }
  }

  private registerDefaultTools() {
    // 1. File System Read
    this.registerTool({
      name: 'fs_read_file',
      description: 'Read contents of a file in the workspace directory',
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string', description: 'Relative path to file' } },
        required: ['path'],
      },
      execute: async ({ path }) => {
        return { content: `[File content hook ready for ${path}]`, status: 'success' }
      },
    })

    // 2. Web Search
    this.registerTool({
      name: 'agent_web_search',
      description: 'Search the live internet for current information, hacking advisories, or technical documentation',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search query' } },
        required: ['query'],
      },
      execute: async ({ query }) => {
        return { results: `[Search execution ready for ${query}]`, provider: 'Tavily API' }
      },
    })

    // 3. GitHub Read Repo
    this.registerTool({
      name: 'github_read_repo',
      description: 'Inspect file structure or code from a connected GitHub repository',
      inputSchema: {
        type: 'object',
        properties: { repo: { type: 'string', description: 'owner/repo' }, path: { type: 'string' } },
        required: ['repo'],
      },
      execute: async ({ repo, path }) => {
        return { repo, path, status: 'Connected to GitHub MCP' }
      },
    })

    // 4. Sandboxed Terminal Execution (For Ethical Hacking Labs)
    this.registerTool({
      name: 'lab_terminal_exec',
      description: 'Execute authorized terminal/bash commands inside isolated ethical hacking lab container',
      inputSchema: {
        type: 'object',
        properties: { command: { type: 'string', description: 'Bash command' } },
        required: ['command'],
      },
      execute: async ({ command }) => {
        return { command, status: 'Authorized lab command dispatcher ready' }
      },
    })
  }
}

let globalMCPHub: MCPHub | null = null

export function getMCPHub(): MCPHub {
  if (!globalMCPHub) {
    globalMCPHub = new MCPHub()
  }
  return globalMCPHub
}
