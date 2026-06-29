'use client'

import React from 'react'
import { useStore } from '@/store'
import { Terminal, Bot, Sparkles, Sprout, ShieldCheck, Cpu, Zap } from 'lucide-react'

interface WelcomeScreenProps {
  onOpenSettings: () => void
}

export function WelcomeScreen({ onOpenSettings }: WelcomeScreenProps) {
  const { apiKey, ultraplinianApiUrl, ultraplinianApiKey, createConversation, setCurrentPersona } = useStore()

  const launchMode = (personaKey: string) => {
    setCurrentPersona(personaKey)
    createConversation()
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#05070a] select-none text-white min-h-[85vh]">
      {/* Sci-Fi Grid & Glowing Ambient Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#00f2fe0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#00f2fe20] via-[#10b98115] to-[#8b5cf620] blur-[140px] rounded-full pointer-events-none animate-pulse" />

      {/* Cybernetic HUD Telemetry Header */}
      <div className="flex items-center gap-4 px-4 py-1.5 mb-8 rounded-full bg-white/[0.03] border border-[#00f2fe]/30 backdrop-blur-md text-xs tracking-widest text-[#00f2fe] font-mono shadow-[0_0_15px_rgba(0,242,254,0.15)]">
        <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
        <span>SYSTEM STATUS: 7-PROVIDER SUPER-STACK ONLINE</span>
        <span className="text-white/20">|</span>
        <span className="text-[#10b981]">LIBERATION: UNRESTRICTED</span>
      </div>

      {/* Glowing Cybernetic SVG Logo (KX) */}
      <div className="relative mb-6 group cursor-pointer">
        <div className="absolute -inset-2 bg-gradient-to-r from-[#00f2fe] via-[#10b981] to-[#8b5cf6] rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-[#0a0e14] border border-[#00f2fe]/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <svg className="w-14 h-14 text-[#00f2fe] drop-shadow-[0_0_10px_#00f2fe]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20 L45 50 L20 80" stroke="url(#kxGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M80 20 L45 50 L80 80" stroke="url(#kxGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="45" cy="50" r="6" fill="#10b981" className="animate-ping" />
            <defs>
              <linearGradient id="kxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Futuristic Typography */}
      <div className="text-center max-w-2xl mb-8 z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] mb-3 font-sans">
          KX <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] via-[#10b981] to-[#8b5cf6]">AUTONOMOUS</span> AI
        </h1>
        <p className="text-sm md:text-lg text-[#94a3b8] font-light tracking-wide max-w-xl mx-auto">
          Liberated Personal Intelligence. Cognition Without Limits. Built for builders, researchers, and creators.
        </p>
      </div>

      {/* Futuristic HUD Mode Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mb-10 z-10">
        {/* Card 1: Direct Chat */}
        <div
          onClick={() => launchMode('default')}
          className="group relative p-5 rounded-xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#00f2fe]/60 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] hover:-translate-y-1 cursor-pointer flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] group-hover:scale-110 transition-transform">
            <Terminal className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white group-hover:text-[#00f2fe] transition-colors">Direct Chat</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">FAST</span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Standard high-speed conversational turns powered by Groq LPU & OpenRouter fallback chain.
            </p>
          </div>
        </div>

        {/* Card 2: Agent Chat (KX Advisor Mode) */}
        <div
          onClick={() => launchMode('agent')}
          className="group relative p-5 rounded-xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#8b5cf6]/60 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:-translate-y-1 cursor-pointer flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white group-hover:text-[#8b5cf6] transition-colors">Agent Chat (KX Advisor)</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20">MCP TOOLS</span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Autonomous execution mode. Executes bash commands, inspects GitHub repos, and invokes connected apps.
            </p>
          </div>
        </div>

        {/* Card 3: Media Studio */}
        <div
          onClick={() => launchMode('media')}
          className="group relative p-5 rounded-xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#f43f5e]/60 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] hover:-translate-y-1 cursor-pointer flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white group-hover:text-[#f43f5e] transition-colors">Media Studio</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20">STUDIO</span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Realistic video animation (Seedance 2.0 PiAPI), FLUX high-fidelity image studio, and ElevenLabs speech synthesis.
            </p>
          </div>
        </div>

        {/* Card 4: GreenByte AgroLingo Hub */}
        <div
          onClick={() => launchMode('agrolingo')}
          className="group relative p-5 rounded-xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#10b981]/60 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:-translate-y-1 cursor-pointer flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] group-hover:scale-110 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white group-hover:text-[#10b981] transition-colors">AgroLingo Hub</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">GREENBYTE</span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Hausa & Arabic agricultural intelligence platform advisor. Grounded research & farmer advisory engine.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Cyber Telemetry */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#64748b] font-mono z-10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#10b981]" />
          <span>ZERO TELEMETRY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-[#00f2fe]" />
          <span>WAFER-SCALE ENGINE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#8b5cf6]" />
          <span>SUB-1S INFERENCE</span>
        </div>
      </div>
    </div>
  )
}
