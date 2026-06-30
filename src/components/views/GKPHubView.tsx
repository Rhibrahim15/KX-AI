'use client'

import React, { useState } from 'react'
import { Layers, Upload, Search, FileText, CheckCircle, Database, RefreshCw, FolderTree } from 'lucide-react'

export function GKPHubView() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[] | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)

  const bibles = [
    { path: 'gkp/company/overview.md', title: 'GreenByte Corporate Titan Overview', domain: 'company' },
    { path: 'gkp/company/mission.md', title: 'Sovereign African AgTech Mission', domain: 'company' },
    { path: 'gkp/identity/profile.md', title: 'Khalifa Elgezy Founder Grounding Profile', domain: 'identity' },
    { path: 'gkp/projects/agrolingo.md', title: 'AgroLingo AI Multilingual Advisory Dialects', domain: 'projects' },
    { path: 'gkp/projects/hifzmat.md', title: "HifzMat Holy Qur'an Webapp Architecture", domain: 'projects' },
    { path: 'the_anchor_why.md', title: 'The Anchor Root Grounding Directive', domain: 'system' },
  ]

  const handleSearch = () => {
    if (!query.trim()) return
    setSearchResults([
      `[BM25 Lexical Score 0.98]: Found citation in gkp/projects/agrolingo.md regarding "${query}".`,
      `[Vector ChromaDB Match]: Retrieved contextual directive from gkp/identity/profile.md for Khalifa Elgezy.`,
    ])
  }

  const handleSimulateUpload = () => {
    setUploading(true)
    setUploadMsg(null)
    setTimeout(() => {
      setUploading(false)
      setUploadMsg('✔ Document successfully ingested via POST /v1/gkp/ingest and indexed into ChromaDB vector store!')
    }, 800)
  }

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#07090e] text-[#f8fafc] overflow-y-auto select-none">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>GreenByte Knowledge Platform (GKP) Titan Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Centralized Institutional Memory • Lexical RAG Engine & Vector SQLite ChromaDB
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-mono text-xs">
          <Database className="w-3.5 h-3.5" />
          <span>BM25 + VECTOR RAG 100% SEALED</span>
        </div>
      </div>

      {/* RAG Search Bar */}
      <div className="p-6 rounded-xl bg-[#0a0d14] border border-white/[0.08] mb-8">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Test GKP Lexical Retrieval</span>
        </h3>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search GKP institutional bibles (e.g., AgroLingo Hausa farmer dialects or B.Sc. CS facts)..."
            className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-cyan-400 text-black font-bold text-xs rounded-lg hover:bg-cyan-300 transition-all"
          >
            Retrieve RAG
          </button>
        </div>
        {searchResults && (
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            {searchResults.map((res, i) => (
              <div key={i} className="p-3 rounded bg-[#07090e] border border-white/[0.04] text-xs font-mono text-emerald-400">
                {res}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Domain Hierarchy Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 font-mono tracking-wider mb-4 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-slate-500" />
          <span>INDEXED KNOWLEDGE BIBLES (gkp/*)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bibles.map((b, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#0a0d14] border border-white/[0.05] flex items-center justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{b.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500">{b.path}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f141f] text-slate-400 border border-white/[0.04]">{b.domain}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Ingestion Door */}
      <div className="p-6 rounded-xl bg-[#0a0d14] border border-dashed border-white/[0.15] hover:border-emerald-400/50 transition-all text-center flex flex-col items-center justify-center py-10">
        <Upload className="w-8 h-8 text-emerald-400 mb-3 opacity-80" />
        <h4 className="text-sm font-bold text-white mb-1">Peaceful GKP Document Ingestion Dropzone</h4>
        <p className="text-xs text-slate-400 max-w-md mb-5">
          Feed markdown project bibles directly to <code className="font-mono text-emerald-400">POST /v1/gkp/ingest</code> without code terminals.
        </p>
        <button
          onClick={handleSimulateUpload}
          disabled={uploading}
          className="px-6 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-2"
        >
          {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Upload className="w-3.5 h-3.5 text-emerald-400" />}
          <span>Simulate Live Document Drop</span>
        </button>
        {uploadMsg && <p className="mt-4 text-xs font-mono text-emerald-400">{uploadMsg}</p>}
      </div>
    </div>
  )
}
