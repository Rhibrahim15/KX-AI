'use client'

import { Sparkles } from 'lucide-react'

export interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  context: string
}

/**
 * Standard chat uses server-side model routing. The browser cannot select
 * arbitrary upstream models until a server-side allowlist is implemented.
 */
export const MODELS: ModelInfo[] = [
  {
    id: 'kx-auto',
    name: 'KX Automatic',
    provider: 'KX',
    description: 'Server-managed provider failover',
    context: 'Managed',
  },
]

export function ModelSelector() {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Model routing
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
        <Sparkles className="h-4 w-4 text-sky-300" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-200">KX Automatic</p>
          <p className="text-[10px] text-slate-500">Server-managed provider failover</p>
        </div>
      </div>
    </div>
  )
}
