'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { Loader2, Send, Square } from 'lucide-react'
import { useStore } from '@/store'
import { sendMessage } from '@/lib/openrouter'

export function ChatInput() {
  const {
    conversations,
    currentConversationId,
    addMessage,
    isStreaming,
    setIsStreaming,
  } = useStore()

  const [input, setInput] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  async function handleSubmit() {
    const content = input.trim()
    const sessionId = currentConversationId

    if (!content || !sessionId || isStreaming) return

    const conversation = conversations.find((item) => item.id === sessionId)
    const history = (conversation?.messages ?? [])
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      }))

    setInput('')
    setIsStreaming(true)
    addMessage(sessionId, { role: 'user', content })

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const result = await sendMessage({
        messages: [...history, { role: 'user', content }],
        signal: controller.signal,
      })

      addMessage(sessionId, {
        role: 'assistant',
        content: result.content,
        model: `${result.provider} · ${result.model}`,
      })
    } catch (cause) {
      const wasCancelled =
        cause instanceof Error &&
        (cause.name === 'AbortError' || cause.name === 'TimeoutError')

      const message = wasCancelled
        ? 'Response stopped.'
        : cause instanceof Error
          ? cause.message
          : 'KX could not complete this request. Please try again.'

      addMessage(sessionId, {
        role: 'assistant',
        content: wasCancelled
          ? `_${message}_`
          : `**KX could not respond.** ${message}`,
      })
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
      setIsStreaming(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSubmit()
    }
  }

  function handleStop() {
    abortControllerRef.current?.abort()
  }

  return (
    <div className="border-t border-white/[0.07] bg-[#090c13]/90 p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3">
        <div className="relative min-w-0 flex-1">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message KX… (Shift+Enter for a new line)"
            aria-label="Message KX"
            disabled={isStreaming}
            rows={1}
            maxLength={20_000}
            className="w-full resize-none rounded-xl border border-white/[0.09] bg-[#0a0d14] px-4 py-3 pr-16 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/40 disabled:opacity-60"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
          {input.length > 0 && (
            <span className="absolute bottom-3 right-3 text-[10px] tabular-nums text-slate-600">
              {input.length.toLocaleString()}/20,000
            </span>
          )}
        </div>

        {isStreaming ? (
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop response"
            title="Stop response"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-300/[0.08] text-rose-200 transition hover:bg-rose-300/[0.14]"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!input.trim() || !currentConversationId}
            aria-label="Send message"
            title="Send message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/[0.09] text-sky-100 transition hover:bg-sky-300/[0.15] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-4xl text-[10px] text-slate-600">
        KX uses server-managed model routing. Check important answers and verify external actions.
      </p>
    </div>
  )
}
