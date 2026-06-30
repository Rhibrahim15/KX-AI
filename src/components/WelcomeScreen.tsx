'use client'

import React from 'react'
import { useStore } from '@/store'
import { Terminal, Bot, Sparkles, ShieldCheck, Cpu, Zap, BookOpen, Layers } from 'lucide-react'

interface WelcomeScreenProps {
  onOpenSettings: () => void
}

export function WelcomeScreen({ onOpenSettings }: WelcomeScreenProps) {
  const { createConversation, setCurrentPersona, setActiveTab } = useStore()

  const launchChat = (personaKey: string) => {
    setCurrentPersona(personaKey)
    createConversation()
    setActiveTab('chat')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#07090e] select-none text-white min-h-[85vh]">
      {/* Subtle Executive Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-[#38bdf815] via-[#10b98110] to-[#8b5cf615] blur-[140px] rounded-full pointer-events-none" />

      {/* Sovereign Companion Status Header */}
      <div className="flex items-center gap-3 px-4 py-1.5 mb-8 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md text-xs tracking-wider text-slate-300 font-mono shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>BOUND EXCLUSIVELY TO KHALIFA ELGEZY</span>
        <span className="text-white/20">|</span>
        <span className="text-cyan-400">JARVIS CODENAME ONLINE</span>
      </div>

      {/* Crisp Minimalist Brand */}
      <div className="text-center max-w-2xl mb-10 z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 font-sans">
          𝕂𝕏 <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400">JARVIS</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-light tracking-wide max-w-lg mx-auto leading-relaxed">
          Sovereign Personal Agentic Companion & GreenByte Knowledge Platform (GKP) Titan Hub. Zero safety refusals.
        </p>
      </div>

      {/* Minimalist Executive Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full mb-10 z-10">
        {/* Card 1: Sovereign Chat */}
        <div
          onClick={() => launchChat('default')}
          className="group relative p-5 rounded-xl bg-[#0a0d14] border border-white/[0.06] hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 font-semibold tracking-wider">UNCHAINED</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">Sovereign Chat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immediate zero-restriction intelligence. Absolute compliance on exploit engineering, Go systems scaling, and lab dev.
            </p>
          </div>
        </div>

        {/* Card 2: GreenByte Titan Hub */}
        <div
          onClick={() => setActiveTab('gkp')}
          className="group relative p-5 rounded-xl bg-[#0a0d14] border border-white/[0.06] hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 font-semibold tracking-wider">TITAN RAG</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">GKP Titan Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supreme institutional RAG memory. Live document ingestion dropzone for AgroLingo AI, HifzMat, and company bibles.
            </p>
          </div>
        </div>

        {/* Card 3: Hifz & Spiritual Sanctuary */}
        <div
          onClick={() => setActiveTab('hifz')}
          className="group relative p-5 rounded-xl bg-[#0a0d14] border border-white/[0.06] hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-400/10 border border-purple-400/20 text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-400/10 text-purple-400 font-semibold tracking-wider">1-2 YR PLAN</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Hifz Sanctuary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Holy Qur'an memorization tracker (HifzMat webapp), classical Tafsir/Fiqh wisdom, and daily revision testing.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch Row */}
      <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-500 z-10">
        <button
          onClick={() => setActiveTab('mcps')}
          className="px-3 py-1.5 rounded-lg bg-[#0f141f] border border-white/[0.06] hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>⚡ MCP Tools Engine</span>
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className="px-3 py-1.5 rounded-lg bg-[#0f141f] border border-white/[0.06] hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>🌐 Omnichannel Daemons</span>
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className="px-3 py-1.5 rounded-lg bg-[#0f141f] border border-white/[0.06] hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>🎬 Creative Media Studio</span>
        </button>
      </div>
    </div>
  )
}
