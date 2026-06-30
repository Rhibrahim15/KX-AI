'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatArea } from '@/components/ChatArea'
import { SettingsModal } from '@/components/SettingsModal'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { useStore } from '@/store'
import { useEasterEggs } from '@/hooks/useEasterEggs'
import { useApiAutoDetect } from '@/hooks/useApiAutoDetect'
import { MCPHubView } from '@/components/views/MCPHubView'
import { ConnectionsView } from '@/components/views/ConnectionsView'
import { GKPHubView } from '@/components/views/GKPHubView'
import { HifzSanctuaryView } from '@/components/views/HifzSanctuaryView'
import { MediaStudioView } from '@/components/views/MediaStudioView'

export default function Home() {
  const {
    theme,
    conversations,
    currentConversationId,
    showSettings,
    setShowSettings,
    activeTab,
    isHydrated
  } = useStore()

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Initialize easter eggs
  useEasterEggs()

  // Auto-detect self-hosted API server at same origin
  useApiAutoDetect()

  // Sync theme class to <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-matrix', 'theme-hacker', 'theme-glyph', 'theme-minimal')
    root.classList.add(`theme-${theme || 'minimal'}`)
  }, [theme])

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="bg-[#07090e] min-h-screen flex items-center justify-center text-white font-mono text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Initializing JARVIS Sovereign Sanctuary...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-[#07090e] text-[#f8fafc] min-h-screen flex relative overflow-hidden select-none">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col transition-all duration-300 relative overflow-hidden">
        {(!activeTab || activeTab === 'chat') && (
          !currentConversation ? (
            <WelcomeScreen onOpenSettings={() => setShowSettings(true)} />
          ) : (
            <ChatArea />
          )
        )}
        {activeTab === 'mcps' && <MCPHubView />}
        {activeTab === 'connections' && <ConnectionsView />}
        {activeTab === 'gkp' && <GKPHubView />}
        {activeTab === 'hifz' && <HifzSanctuaryView />}
        {activeTab === 'media' && <MediaStudioView />}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </main>
  )
}
