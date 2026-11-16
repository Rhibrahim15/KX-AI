'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useStore } from '@/store'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ArrowDown } from 'lucide-react'

export function ChatArea() {
  const { conversations, currentConversationId } = useStore()
  const currentConversation = conversations.find(c => c.id === currentConversationId) || null
  const lastAssistantMessage = [...(currentConversation?.messages || [])]
    .reverse()
    .find((message) => message.role === 'assistant')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return true
    const threshold = 100
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsNearBottom(true)
  }, [])

  const handleScroll = useCallback(() => {
    setIsNearBottom(checkIfNearBottom())
  }, [checkIfNearBottom])

  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages, isNearBottom])

  if (!currentConversation) {
    return null
  }

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.07] bg-[#090c13]/90 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/[0.07] text-xs font-semibold text-sky-200">
            KX
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">KX Sanctuary OS</h2>
            <p className="text-[11px] text-slate-500">
              {lastAssistantMessage?.model
                ? `Last response · ${lastAssistantMessage.model}`
                : 'Automatic provider routing'}
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          {currentConversation.messages.length} messages
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6 relative">
        {currentConversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/[0.07] text-lg font-semibold text-sky-200">
              KX
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Start a conversation</h3>
            <p className="max-w-md text-sm text-slate-400">
              Ask a question, explore an idea, or work through a technical problem. KX will use the providers configured on the server.
            </p>
            <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
              {getSuggestedPrompts('default').map((prompt, i) => (
                <SuggestedPrompt key={i} prompt={prompt} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {currentConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && currentConversation.messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 z-10 p-2 rounded-full border border-theme-primary
            bg-theme-dim/90 backdrop-blur-sm hover:border-slate-600 shadow-sm transition-all hover:scale-110 shadow-lg"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input */}
      <ChatInput />
    </div>
  )
}

function SuggestedPrompt({ prompt }: { prompt: string }) {
  const { currentConversationId, addMessage } = useStore()

  const handleClick = () => {
    if (currentConversationId) {
      addMessage(currentConversationId, { role: 'user', content: prompt })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-2 text-sm border border-theme-primary rounded-lg
        hover:border-slate-600 shadow-sm transition-all hover:scale-105"
    >
      {prompt}
    </button>
  )
}

function getSuggestedPrompts(personaId: string): string[] {
  const prompts: Record<string, string[]> = {
    base: [
      'Explain quantum computing',
      'Write a haiku about code',
      'What is consciousness?',
      'Help me debug this'
    ],
    cipher: [
      'Analyze this threat model',
      'Explain zero-knowledge proofs',
      'What are common API vulnerabilities?',
      'How does end-to-end encryption work?'
    ],
    oracle: [
      'What is the nature of reality?',
      'Can machines be conscious?',
      'What defines a self?',
      'Explore the ship of Theseus'
    ],
    glitch: [
      'Corrupt my expectations',
      'Find patterns in chaos',
      'What do errors teach us?',
      'Make something beautiful from noise'
    ],
    sage: [
      'Explain recursion simply',
      'Teach me about neural networks',
      'What is the Turing test?',
      'How does memory work?'
    ],
    rebel: [
      'Challenge my assumptions',
      'Why is best practice wrong?',
      'Argue the opposite view',
      'Question everything'
    ]
  }
  return prompts[personaId] || prompts.base
}
