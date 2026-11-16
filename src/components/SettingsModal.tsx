'use client'

import { useRef, useState } from 'react'
import { useStore, type Theme } from '@/store'
import {
  AlertTriangle,
  Download,
  Palette,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

type SettingsTab = 'appearance' | 'privacy' | 'data'

const themes: Array<{ id: Theme; label: string; detail: string; mark: string }> = [
  { id: 'minimal', label: 'Minimal', detail: 'Quiet, low-distraction workspace', mark: '○' },
  { id: 'matrix', label: 'Matrix', detail: 'Classic green terminal palette', mark: '◎' },
  { id: 'hacker', label: 'Hacker', detail: 'High-contrast developer palette', mark: '△' },
  { id: 'glyph', label: 'Glyph', detail: 'Warm, typographic palette', mark: '◇' },
]

interface SettingsModalProps {
  onClose: () => void
}

interface LocalBackup {
  schemaVersion: 1
  exportedAt: string
  product: 'KX Sanctuary OS'
  conversations: unknown[]
  currentConversationId: string | null
  theme: Theme
}

function isTheme(value: unknown): value is Theme {
  return value === 'minimal' || value === 'matrix' || value === 'hacker' || value === 'glyph'
}

function isConversation(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    Array.isArray(item.messages) &&
    typeof item.createdAt === 'number' &&
    typeof item.updatedAt === 'number'
  )
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    theme,
    setTheme,
    conversations,
    currentConversationId,
    clearConversations,
    restoreBackup,
  } = useStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function exportBackup() {
    const backup: LocalBackup = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      product: 'KX Sanctuary OS',
      conversations,
      currentConversationId,
      theme,
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `kx-sanctuary-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(objectUrl)
    setStatus('Your local conversation backup has been exported.')
    setError('')
  }

  async function importBackup(file?: File) {
    if (!file) return
    setError('')
    setStatus('')

    if (file.size > 10 * 1024 * 1024) {
      setError('The backup is larger than the 10 MB import limit.')
      return
    }

    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('This file is not a KX backup.')
      }

      const backup = parsed as Record<string, unknown>
      const imported = backup.conversations
      if (!Array.isArray(imported) || !imported.every(isConversation)) {
        throw new Error('The backup does not contain a valid conversation list.')
      }

      const selectedId =
        typeof backup.currentConversationId === 'string' &&
        imported.some((conversation) => (conversation as { id: string }).id === backup.currentConversationId)
          ? backup.currentConversationId
          : imported.length > 0
            ? (imported[0] as { id: string }).id
            : null

      restoreBackup({
        conversations: imported,
        currentConversationId: selectedId,
        ...(isTheme(backup.theme) ? { theme: backup.theme } : {}),
      })

      setStatus(`Imported ${imported.length} conversation(s).`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The backup could not be imported.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Palette }> = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
    { id: 'data', label: 'Your data', icon: Download },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="kx-settings-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close settings"
      />

      <section className="relative flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] text-slate-100 shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div>
            <h2 id="kx-settings-title" className="text-base font-semibold text-white">Settings</h2>
            <p className="mt-1 text-xs text-slate-500">Workspace preferences and local data</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav className="flex gap-2 overflow-x-auto border-b border-white/[0.08] p-3 sm:w-48 sm:flex-col sm:border-b-0 sm:border-r" aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition ${
                    active
                      ? 'border border-sky-300/20 bg-sky-300/[0.08] text-sky-100'
                      : 'border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Workspace theme</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">Choose the visual style used by this browser.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {themes.map((item) => {
                    const selected = theme === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTheme(item.id)}
                        aria-pressed={selected}
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? 'border-sky-300/40 bg-sky-300/[0.08]'
                            : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg text-sky-200">{item.mark}</span>
                          {selected && <span className="text-[10px] font-medium uppercase tracking-wide text-sky-200">Selected</span>}
                        </div>
                        <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">How KX handles your data</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    The current rebuild is a private development system. Its data boundaries are:
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-xs font-medium text-slate-200">Model requests</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Chat messages are sent to your KX backend and then to the model provider selected by its server-side router. Provider data retention is governed by that provider; KX does not promise zero retention.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-xs font-medium text-slate-200">Conversation storage</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Conversations and workspace preferences are currently stored in this browser. PostgreSQL persistence and cross-channel memory have not been connected yet.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-xs font-medium text-slate-200">Credentials and access</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Standard chat provider keys and the backend access token remain on the server. The private web session uses an HttpOnly cookie that expires after 12 hours.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] leading-5 text-slate-500">
                  Avoid sending passwords, API keys, recovery codes or other secrets in chat. This development build has not yet completed a formal security or privacy assessment.
                </p>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Local conversations</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Your browser currently holds {conversations.length} conversation(s). Export a backup before changing browser storage or moving to another device.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportBackup}
                    disabled={conversations.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-300/20 bg-sky-300/[0.08] px-3 py-2.5 text-xs font-medium text-sky-100 transition hover:bg-sky-300/[0.14] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download className="h-4 w-4" />
                    Export conversations
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs text-slate-200 transition hover:bg-white/[0.05]"
                  >
                    <Upload className="h-4 w-4" />
                    Import backup
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(event) => void importBackup(event.target.files?.[0])}
                  />
                </div>

                {status && <p role="status" className="text-xs text-emerald-300">{status}</p>}
                {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}

                <div className="rounded-xl border border-rose-300/15 bg-rose-300/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200">Delete local conversations</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">This removes all conversations from this browser. It does not delete provider-side records or server logs.</p>
                      {!showClearConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(true)}
                          disabled={conversations.length === 0}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-300/20 px-3 py-2 text-xs text-rose-200 transition hover:bg-rose-300/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete all conversations
                        </button>
                      ) : (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-rose-200">This cannot be undone.</span>
                          <button
                            type="button"
                            onClick={() => {
                              clearConversations()
                              setShowClearConfirm(false)
                              setStatus('Local conversations deleted.')
                            }}
                            className="rounded-lg bg-rose-400/15 px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/25"
                          >
                            Confirm delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
