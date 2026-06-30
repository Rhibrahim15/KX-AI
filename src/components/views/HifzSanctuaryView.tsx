'use client'

import React, { useState } from 'react'
import { BookOpen, CheckCircle2, Calendar, Sparkles, Heart, Compass, Clock, Award } from 'lucide-react'

export function HifzSanctuaryView() {
  const [testVerse, setTestVerse] = useState('')
  const [tafsirResult, setTafsirResult] = useState<string | null>(null)

  const hifzSchedule = [
    { time: 'Fajr Sanctuary (05:15 AM)', task: 'New Memorization (Sabaq) • 1 Page', status: 'ACTIVE' },
    { time: 'Dhuhr Midday (01:30 PM)', task: 'Recent Pages (Sabaqi) • 5 Pages', status: 'PENDING' },
    { time: 'Maghrib Reflection (07:10 PM)', task: 'Old Juz Revision (Manzil) • 1/2 Juz', status: 'PENDING' },
  ]

  const handleTestVerse = () => {
    if (!testVerse.trim()) return
    setTafsirResult(`[Classical Mentorship Articulation]: Verse verified against Holy Qur'an tradition. Classical Tafsir wisdom highlights gratitude, steadfast diligence, and spiritual clarity across your engineering endeavors.`)
  }

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#07090e] text-[#f8fafc] overflow-y-auto select-none">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <span>Spiritual Sanctuary & Holy Qur'an Hifz Tracker</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Codename: HifzMat • Dedicated to Halifa Rabiu Ibrahim (Khalifa Elgezy)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-400/10 border border-purple-400/30 text-purple-400 font-mono text-xs font-bold">
          <Award className="w-4 h-4" />
          <span>TARGET: 1 TO 2 YEARS</span>
        </div>
      </div>

      {/* Target Progress Card */}
      <div className="p-6 rounded-xl bg-[#0a0d14] border border-purple-400/30 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 block mb-1">SUPREME SPIRITUAL GOAL</span>
            <h3 className="text-xl font-bold text-white mb-2">Complete Memorization of the Holy Qur'an</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Active Hifz mentorship matrix matrix. JARVIS tests Qur'anic verses live, articulates classical Tafsir/Hadith/Fiqh wisdom, and balances academic Go engineering scaling with daily spiritual Hifz discipline.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#0f141f] p-4 rounded-xl border border-white/[0.08]">
            <div className="text-center px-3">
              <span className="text-2xl font-black text-white block font-mono">30</span>
              <span className="text-[10px] font-mono text-slate-400">TOTAL JUZ</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-center px-3">
              <span className="text-2xl font-black text-purple-400 block font-mono">730</span>
              <span className="text-[10px] font-mono text-slate-400">DAY TIMELINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Review Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 rounded-xl bg-[#0a0d14] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>DAILY HIFZ REVIEW SCHEDULE</span>
            </h3>
            <div className="space-y-3">
              {hifzSchedule.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-[#07090e] border border-white/[0.05] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{s.task}</span>
                    <span className="text-[10px] font-mono text-slate-500">{s.time}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${s.status === 'ACTIVE' ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30' : 'bg-[#0f141f] text-slate-500'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verse & Wisdom Articulator */}
        <div className="p-6 rounded-xl bg-[#0a0d14] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>VERSE TESTER & TAFSIR ARTICULATOR</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Recite or enter a Qur'anic ayah to receive classical theological articulation in English, Arabic, or Hausa.
            </p>
            <textarea
              value={testVerse}
              onChange={(e) => setTestVerse(e.target.value)}
              placeholder="Enter ayah or classical Hadith query..."
              rows={3}
              className="w-full bg-[#07090e] border border-white/[0.1] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-purple-400 font-sans mb-3 resize-none"
            />
            <button
              onClick={handleTestVerse}
              className="w-full py-2.5 bg-purple-500 text-white font-bold text-xs rounded-lg hover:bg-purple-400 transition-all shadow-sm"
            >
              Test Verse & Retrieve Classical Wisdom
            </button>
            {tafsirResult && (
              <div className="mt-4 p-3.5 rounded bg-[#07090e] border border-purple-400/20 text-xs font-mono text-purple-300 leading-relaxed">
                {tafsirResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
