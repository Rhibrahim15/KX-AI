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
  BookOpen,
  Layers,
} from 'lucide-react'
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
    setActiveTab,
  } = useStore()

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleNewChat = () => {
    createConversation()
    setActiveTab('chat')
  }

  const navItems = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, status: 'Core' },
    { id: 'gkp' as const, label: 'Project knowledge', icon: Layers, status: 'Preview' },
    { id: 'hifz' as const, label: 'Hifz workspace', icon: BookOpen, status: 'Preview' },
  ]

  return (
    <>
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 rounded-lg border border-white/10 bg-[#0f141f] p-2 text-white shadow-md transition hover:border-white/20"
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </button>
      )}

      <aside
        className={`fixed z-40 h-screen overflow-hidden border-r border-white/[0.07] bg-[#090c13] text-slate-200 transition-all duration-300 ease-in-out md:relative ${
          isOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold">
                KX
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-wide text-white">KX Sanctuary OS</h1>
                <p className="mt-0.5 text-[10px] text-slate-500">Personal AI workspace</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="rounded p-1 text-slate-500 transition hover:text-white"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-white/[0.07] p-3">
            <button
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-300/20 bg-sky-300/[0.08] px-3 py-2.5 text-xs font-medium text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-300/[0.12]"
            >
              <Plus className="h-4 w-4" />
              New conversation
            </button>
          </div>

          <nav className="space-y-1 border-b border-white/[0.07] p-3" aria-label="Main navigation">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</p>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.id || (!activeTab && item.id === 'chat')
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                    active
                      ? 'border border-white/[0.08] bg-white/[0.06] text-white'
                      : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[9px] uppercase tracking-wide text-slate-600">{item.status}</span>
                </button>
              )
            })}
          </nav>

          <div className="border-b border-white/[0.07] p-3">
            <ModelSelector />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Recent conversations
            </div>
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-600">
                <MessageSquare className="mx-auto mb-2 h-5 w-5 opacity-40" />
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition ${
                    currentConversationId === conversation.id && (!activeTab || activeTab === 'chat')
                      ? 'bg-white/[0.06] text-white'
                      : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                  }`}
                  onClick={() => {
                    selectConversation(conversation.id)
                    setActiveTab('chat')
                  }}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectConversation(conversation.id)
                      setActiveTab('chat')
                    }
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
                  <span className="flex-1 truncate">{conversation.title}</span>
                  {hoveredId === conversation.id && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        deleteConversation(conversation.id)
                      }}
                      className="rounded p-1 text-slate-500 transition hover:text-rose-400"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/[0.07] bg-[#080a10] p-3">
            <button
              onClick={() => setShowSettings(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2 text-xs text-slate-300 transition hover:border-white/20 hover:bg-white/[0.035] hover:text-white"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              Settings
            </button>
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] text-[10px] font-semibold text-slate-200">
                K
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">Khalifa Elgezy</p>
                <p className="truncate text-[10px] text-slate-600">GreenByte · Founder</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
