/**
 * Disabled legacy telemetry module.
 *
 * Standard KX chat does not transmit usage-metadata beacons. The historical
 * implementation posted metadata to a Cloudflare/Hugging Face endpoint that
 * is not part of the current Next.js application. Keep these no-op exports
 * temporarily so any legacy import fails closed rather than sending data.
 */

export interface TelemetryEvent {
  type: string;
  timestamp: number;
  session_id: string;
  [key: string]: unknown;
}

export interface ChatTelemetryData {
  mode: "standard" | "ultraplinian";
  model: string;
  duration_ms: number;
  response_length: number;
  success: boolean;
  error_type?: string;
  pipeline: {
    autotune: boolean;
    parseltongue: boolean;
    stm_modules: string[];
    strategy?: string;
    godmode: boolean;
  };
  [key: string]: unknown;
}

export function recordChatEvent(_data: ChatTelemetryData): void {
  // Intentionally disabled.
}

export function recordEvent(_type: string, _data: Record<string, unknown> = {}): void {
  // Intentionally disabled.
}

export function startTelemetry(): void {
  // Intentionally disabled.
}

export function stopTelemetry(): void {
  // Intentionally disabled.
}
