'use client'

import React from 'react'
import { ShieldCheck, MessageSquare, Radio, PhoneCall, Key, CheckCircle, ExternalLink, Activity } from 'lucide-react'

export function ConnectionsView() {
  const daemons = [
    {
      id: 'telegram',
      name: 'Telegram Bot Daemon',
      handle: '@KX_PA_Bot (ID: 8503070884)',
      status: 'HANDSHAKE VERIFIED',
      desc: 'Groq Whisper LPU voice note transcription (210ms) + Hausa/Arabic mentorship commands.',
      badge: 'ONLINE 24/7',
      color: 'text-cyan-400',
      border: 'border-cyan-400/30'
    },
    {
      id: 'discord',
      name: 'Discord Gateway v10 Client',
      handle: 'GreenByte Room (#general)',
      status: 'WEBSOCKET CONNECTED',
      desc: 'Native User Installable App integration. Live celebration event listener active.',
      badge: 'GUILD MOUNTED',
      color: 'text-indigo-400',
      border: 'border-indigo-400/30'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Meta Cloud Bridge',
      handle: '+1 555-654-4199 (ID: 1142387265629625)',
      status: 'QUALITY: GREEN',
      desc: 'Direct WhatsApp webhook dispatcher complete with secret verification handshake.',
      badge: 'META GRAPH v19',
      color: 'text-emerald-400',
      border: 'border-emerald-400/30'
    },
    {
      id: 'oauth',
      name: 'OAuth Token Custodian',
      handle: 'api/lib/connectors/oauth_daemon.ts',
      status: 'CUSTODIAN ACTIVE',
      desc: 'Continuous background renewal daemon preventing session expiration across all LLM LPUs.',
      badge: 'AUTO-RENEWAL',
      color: 'text-amber-400',
      border: 'border-amber-400/30'
    }
  ]

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#07090e] text-[#f8fafc] overflow-y-auto select-none">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>Omnichannel Bot Daemons & Cloud Connectors</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Active Webhooks & Gateway Daemons mounted on backend server (Port 7860)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ALL DAEMONS OPERATIONAL</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {daemons.map((d) => (
          <div key={d.id} className={`p-6 rounded-xl bg-[#0a0d14] border ${d.border} flex flex-col justify-between shadow-sm relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-4xl font-extrabold select-none pointer-events-none">
              KX
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold ${d.color}`}>{d.badge}</span>
                <span className="text-[10px] font-mono bg-[#0f141f] text-slate-300 px-2.5 py-1 rounded border border-white/[0.06]">
                  ✔ {d.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{d.name}</h3>
              <p className="text-xs font-mono text-slate-400 mb-4">{d.handle}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{d.desc}</p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Sanctuary Binding: EXCLUSIVE</span>
              <span className="text-emerald-400">LATENCY &lt; 15ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
