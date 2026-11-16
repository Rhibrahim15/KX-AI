import type { Message, ModelProvider, SessionState } from "../types/core";

/**
 * Minimal structural subset of PrismaClient used by this repository.
 * The generated PrismaClient can be passed directly once @prisma/client is installed.
 */
type PrismaDelegate = {
  findUnique(args: Record<string, unknown>): Promise<any>;
  upsert(args: Record<string, unknown>): Promise<any>;
  createMany(args: Record<string, unknown>): Promise<{ count: number }>;
  update(args: Record<string, unknown>): Promise<any>;
};

export interface PrismaSessionClient {
  session: PrismaDelegate;
  message: PrismaDelegate;
}

export interface ISessionRepository {
  getSession(sessionId: string): Promise<SessionState | null>;
  createSession(
    sessionId: string,
    initialMetadata?: Record<string, unknown>,
  ): Promise<SessionState>;
  addMessages(sessionId: string, messages: Message[]): Promise<void>;
  updateProvider(sessionId: string, provider: ModelProvider): Promise<void>;
}

function toMessage(record: any): Message {
  return {
    id: record.id,
    role: record.role,
    content: record.content,
    timestamp: new Date(record.timestamp).toISOString(),
    isImportant: record.isImportant,
    ...(record.category ? { category: record.category } : {}),
    ...(record.toolCalls ? { toolCalls: record.toolCalls } : {}),
    ...(record.toolCallId ? { toolCallId: record.toolCallId } : {}),
    ...(record.metadata ? { metadata: record.metadata } : {}),
  };
}

function toSession(record: any): SessionState {
  return {
    sessionId: record.id,
    messages: (record.messages ?? []).map(toMessage),
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
    ...(record.lastSuccessfulProvider
      ? { lastSuccessfulProvider: record.lastSuccessfulProvider as ModelProvider }
      : {}),
    ...(record.metadata ? { metadata: record.metadata } : {}),
  };
}

export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaSessionClient) {}

  async getSession(sessionId: string): Promise<SessionState | null> {
    const record = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });

    return record ? toSession(record) : null;
  }

  async createSession(
    sessionId: string,
    initialMetadata: Record<string, unknown> = {},
  ): Promise<SessionState> {
    await this.prisma.session.upsert({
      where: { id: sessionId },
      update: {},
      create: { id: sessionId, metadata: initialMetadata },
    });

    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} could not be created.`);
    return session;
  }

  async addMessages(sessionId: string, messages: Message[]): Promise<void> {
    if (messages.length === 0) return;

    await this.prisma.message.createMany({
      data: messages.map((message) => ({
        ...(message.id ? { id: message.id } : {}),
        sessionId,
        role: message.role,
        content: message.content,
        timestamp: new Date(message.timestamp),
        isImportant: message.isImportant ?? false,
        category: message.category ?? null,
        toolCalls: message.toolCalls ?? undefined,
        toolCallId: message.toolCallId ?? null,
        metadata: message.metadata ?? undefined,
      })),
    });
  }

  async updateProvider(sessionId: string, provider: ModelProvider): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastSuccessfulProvider: provider },
    });
  }
}
