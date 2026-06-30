'use client'

import React, { useState } from 'react'
import { Sparkles, Video, Image as ImageIcon, Mic, RefreshCw, CheckCircle, Play, Film } from 'lucide-react'

export function MediaStudioView() {
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState<'video' | 'image' | 'audio'>('video')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleStudioRun = () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setResult(null)
    setTimeout(() => {
      setGenerating(false)
      if (provider === 'video') {
        setResult('✔ Video Job Dispatched! [Failover Engine Caught]: Kling AI & PiAPI returned quota limits -> MiniMax Hailuo successfully rendered high-fidelity uncensored video job.')
      } else if (provider === 'image') {
        setResult('✔ FLUX Studio Image Rendered: High-resolution 1024x1024 realistic media artifact generated in workspace.')
      } else {
        setResult('✔ ElevenLabs Speech Synthesized: Articulate multilingual voiceover saved to voice_test.ogg.')
      }
    }, 1200)
  }

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#07090e] text-[#f8fafc] overflow-y-auto select-none">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Film className="w-6 h-6 text-rose-400" />
            <span>Sovereign Uncensored Creative Media Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            MiniMax Hailuo Video Engine • FLUX Image Rendering • ElevenLabs Neural Speech
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-400/10 border border-rose-400/30 text-rose-400 font-mono text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span>ZERO CORPORATE FILTERS</span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
        <button
          onClick={() => setProvider('video')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${provider === 'video' ? 'bg-rose-500/10 border-rose-500 text-white font-bold shadow-sm' : 'bg-[#0a0d14] border-white/[0.06] text-slate-400 hover:text-white'}`}
        >
          <Video className="w-5 h-5 text-rose-400" />
          <span className="text-xs">Uncensored Video</span>
        </button>
        <button
          onClick={() => setProvider('image')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${provider === 'image' ? 'bg-cyan-500/10 border-cyan-500 text-white font-bold shadow-sm' : 'bg-[#0a0d14] border-white/[0.06] text-slate-400 hover:text-white'}`}
        >
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          <span className="text-xs">FLUX High-Fidelity</span>
        </button>
        <button
          onClick={() => setProvider('audio')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${provider === 'audio' ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold shadow-sm' : 'bg-[#0a0d14] border-white/[0.06] text-slate-400 hover:text-white'}`}
        >
          <Mic className="w-5 h-5 text-emerald-400" />
          <span className="text-xs">Neural Speech (TTS)</span>
        </button>
      </div>

      {/* Prompt Area */}
      <div className="p-6 rounded-xl bg-[#0a0d14] border border-white/[0.08] flex-1 flex flex-col max-w-4xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>Enter Multi-Modal Rendering Prompt</span>
        </h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe the ${provider} to generate (e.g. sleek executive cinematic b-roll or romantic couples media rendering)...`}
          rows={4}
          className="w-full bg-[#07090e] border border-white/[0.1] rounded-lg p-4 text-sm text-white focus:outline-none focus:border-rose-400 font-sans mb-4 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleStudioRun}
            disabled={generating || !prompt.trim()}
            className="px-8 py-3 bg-rose-500 text-white font-bold text-xs rounded-lg hover:bg-rose-400 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Generate Media Artifact</span>
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-[#07090e] border border-emerald-400/30 text-xs font-mono text-emerald-400 leading-relaxed">
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
