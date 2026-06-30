'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal,
  ShieldCheck,
  Sprout,
  Bot,
  Sparkles,
  BookOpen,
  Layers,
  Activity
} from 'lucide-react'
import { PersonaSelector } from './PersonaSelector'
import { ModelSelector } from './ModelSelector'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const {
    conversations,
    currentConversationId,
    createConversation,
    selectConversation,
    deleteConversation,
    setShowSettings,
    activeTab,
    setActiveTab
  } = useStore()

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleNewChat = () => {
    createConversation()
    setActiveTab('chat')
  }

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 p-2 bg-[#0f141f] border border-slate-800 rounded-lg hover:border-slate-600 transition-all text-white shadow-md"
          aria-label="Open sidebar"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 h-screen
          bg-[#0a0d14] border-r border-slate-800/80 text-slate-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-0'}
          overflow-hidden select-none
        `}
      >
        <div className="flex flex-col h-full w-64 justify-between">
          {/* Top Brand & Action Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-sm">
                  KX
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight">
                    𝕂𝕏 JARVIS
                  </h1>
                  <span className="text-[10px] font-mono text-emerald-400 font-medium tracking-wider">● UNRESTRICTED</span>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Action */}
            <div className="p-3 border-b border-slate-800/80">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-2 px-3
                  bg-slate-900/80 border border-slate-800 rounded-lg font-medium text-xs text-white
                  hover:bg-slate-800 hover:border-slate-700 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Executive Sanctuary OS Navigation */}
            <div className="p-2 border-b border-slate-800/80 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 px-2 py-0.5 tracking-wider font-mono">SANCTUARY OS</div>
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${(!activeTab || activeTab === 'chat') ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}`}
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>💬 Sovereign Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('mcps')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${activeTab === 'mcps' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ MCP Tools Hub</span>
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${activeTab === 'connections' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>🌐 Omni Daemons</span>
              </button>
              <button
                onClick={() => setActiveTab('gkp')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${activeTab === 'gkp' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>🏛️ GKP Titan Hub</span>
              </button>
              <button
                onClick={() => setActiveTab('hifz')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${activeTab === 'hifz' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>📖 Hifz Sanctuary</span>
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${activeTab === 'media' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>🎬 Media Studio</span>
              </button>
            </div>

            {/* Model Selector */}
            <div className="p-3 border-b border-slate-800/80">
              <ModelSelector />
            </div>

            {/* Navigation Workspaces */}
            <div className="p-2 space-y-1 overflow-y-auto flex-1">
              <div className="text-[10px] font-bold text-slate-500 px-2 py-1 tracking-wider font-mono">RECENT CHATS</div>
              {conversations.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-light">
                  <Terminal className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                  <p>No chat logs</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`
                      group flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer
                      transition-all text-xs font-normal
                      ${currentConversationId === conv.id && (!activeTab || activeTab === 'chat')
                        ? 'bg-slate-900 text-white border border-slate-800'
                        : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                      }
                    `}
                    onClick={() => {
                      selectConversation(conv.id)
                      setActiveTab('chat')
                    }}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span className="flex-1 truncate">
                      {conv.title}
                    </span>
                    {hoveredId === conv.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conv.id)
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Founder Identity */}
          <div className="p-3 border-t border-slate-800/80 space-y-3 bg-[#080a10]">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center justify-between py-1.5 px-3
                bg-slate-900/60 border border-slate-800/80 rounded-md
                hover:border-slate-700 transition-all text-xs text-slate-300 font-medium"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings & Keys</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">⌘+K</span>
            </button>

            {/* Founder Identity Card */}
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-extrabold text-xs shadow-sm">
                K
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white tracking-tight truncate">Khalifa Elgezy</h4>
                <p className="text-[10px] text-slate-500 font-mono truncate">GreenByte • Founder</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
