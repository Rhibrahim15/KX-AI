'use client'

import { useStore } from '@/store'
import { BookOpen, Layers, MessageSquare, Settings2 } from 'lucide-react'

interface WelcomeScreenProps {
  onOpenSettings: () => void
}

export function WelcomeScreen({ onOpenSettings }: WelcomeScreenProps) {
  const { createConversation, setCurrentPersona, setActiveTab } = useStore()

  const startChat = () => {
    setCurrentPersona('default')
    createConversation()
    setActiveTab('chat')
  }

  return (
    <section className="relative flex min-h-screen flex-1 items-center justify-center overflow-y-auto bg-[#07090e] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_68%)]" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold tracking-wide">
              KX
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">KX Sanctuary OS</p>
              <p className="text-[11px] text-slate-500">Personal AI workspace</p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Settings
          </button>
        </div>

        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-sky-400">
            Think clearly. Build deliberately.
          </p>
          <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your personal workspace for ideas, engineering, and learning.
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            One assistant identity, server-managed model routing, and a growing set of tools.
            KX is being rebuilt around reliable foundations, persistent memory, and honest execution.
          </p>
        </div>

        <button
          onClick={startChat}
          className="group mb-12 flex w-full items-center justify-between rounded-2xl border border-sky-400/20 bg-sky-400/[0.07] p-5 text-left transition hover:border-sky-300/40 hover:bg-sky-400/[0.10] sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Start a conversation</p>
              <p className="mt-1 text-xs text-slate-400">Ask a question, explore an idea, or work through a problem.</p>
            </div>
          </div>
          <span className="text-xl text-sky-300 transition-transform group-hover:translate-x-1">→</span>
        </button>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspaces</h2>
          <span className="text-[11px] text-slate-600">Preview areas</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setActiveTab('gkp')}
            className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
          >
            <div className="mb-4 flex items-center justify-between">
              <Layers className="h-5 w-5 text-emerald-300" />
              <span className="rounded-full border border-emerald-300/20 px-2 py-1 text-[10px] text-emerald-300">In development</span>
            </div>
            <p className="font-medium text-white">Project knowledge</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              A future home for GreenByte, AgroLingo AI, and research materials. Retrieval is not yet connected to chat.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('hifz')}
            className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
          >
            <div className="mb-4 flex items-center justify-between">
              <BookOpen className="h-5 w-5 text-violet-300" />
              <span className="rounded-full border border-violet-300/20 px-2 py-1 text-[10px] text-violet-300">Preview</span>
            </div>
            <p className="font-medium text-white">Hifz workspace</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              A separate space for Qur’an memorisation and revision. It is not yet integrated with KX shared memory.
            </p>
          </button>
        </div>

        <p className="mt-10 text-center text-[11px] text-slate-600">
          Development build · Features are marked as previews until verified end to end.
        </p>
      </div>
    </section>
  )
}
