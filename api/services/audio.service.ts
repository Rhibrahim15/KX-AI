export interface AudioServiceConfig {
  telegramBotToken: string;
  groqApiKey: string;
  fetchImpl?: typeof fetch;
}

export interface TranscriptionResult {
  text: string;
}

/** Shared voice-note transcription service. Language is intentionally auto-detected. */
export class AudioService {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: AudioServiceConfig) {
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async transcribeTelegramVoiceNote(fileId: string): Promise<TranscriptionResult> {
    if (!this.config.telegramBotToken || !this.config.groqApiKey) {
      throw new Error("Telegram and Groq credentials are required for voice transcription.");
    }
    if (!fileId.trim()) throw new Error("A Telegram voice file ID is required.");

    const telegramBase = `https://api.telegram.org/bot${this.config.telegramBotToken}`;
    const metadataResponse = await this.fetchImpl(
      `${telegramBase}/getFile?file_id=${encodeURIComponent(fileId)}`,
    );
    if (!metadataResponse.ok) {
      throw new Error(`Telegram getFile failed with HTTP ${metadataResponse.status}.`);
    }

    const metadata = (await metadataResponse.json()) as {
      ok?: boolean;
      result?: { file_path?: string };
    };
    const filePath = metadata.result?.file_path;
    if (!metadata.ok || !filePath) {
      throw new Error("Telegram did not return a downloadable voice-note path.");
    }

    const audioResponse = await this.fetchImpl(
      `https://api.telegram.org/file/bot${this.config.telegramBotToken}/${filePath}`,
    );
    if (!audioResponse.ok) {
      throw new Error(`Telegram voice download failed with HTTP ${audioResponse.status}.`);
    }

    const audioBlob = await audioResponse.blob();
    const form = new FormData();
    form.append("file", audioBlob, "voice.ogg");
    form.append("model", "whisper-large-v3");
    form.append("response_format", "json");

    const transcriptionResponse = await this.fetchImpl(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${this.config.groqApiKey}` },
        body: form,
      },
    );

    if (!transcriptionResponse.ok) {
      const detail = (await transcriptionResponse.text()).slice(0, 300);
      throw new Error(
        `Groq transcription failed with HTTP ${transcriptionResponse.status}: ${detail}`,
      );
    }

    const result = (await transcriptionResponse.json()) as { text?: string };
    const text = result.text?.trim();
    if (!text) throw new Error("Groq returned an empty voice transcription.");

    return { text };
  }
}
