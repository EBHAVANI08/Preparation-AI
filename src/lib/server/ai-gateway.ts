export type AIMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type AITask = 'mentor' | 'analysis' | 'planning';
import { env } from './env';

type Provider = {
  name: string;
  configured: () => boolean;
  complete: (messages: AIMessage[], signal: AbortSignal) => Promise<{ content: string; model: string; inputTokens: number; outputTokens: number }>;
};

async function openAICompatible(
  name: string, baseUrl: string, apiKey: string, model: string,
  messages: AIMessage[], signal: AbortSignal,
) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', signal,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 700 }),
  });
  if (!response.ok) throw new Error(`${name} returned ${response.status}`);
  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error(`${name} returned an empty response`);
  return { content: content.trim(), model: body.model || model, inputTokens: Number(body.usage?.prompt_tokens || 0), outputTokens: Number(body.usage?.completion_tokens || 0) };
}

const providers: Record<string, Provider> = {
  groq: {
    name: 'groq', configured: () => Boolean(env.GROQ_API_KEY),
    complete: (messages, signal) => openAICompatible('groq', 'https://api.groq.com/openai/v1', env.GROQ_API_KEY ?? '', env.GROQ_MODEL, messages, signal),
  },
  zai: {
    name: 'zai', configured: () => Boolean(env.ZAI_API_KEY),
    complete: (messages, signal) => openAICompatible('zai', env.ZAI_BASE_URL, env.ZAI_API_KEY ?? '', env.ZAI_MODEL, messages, signal),
  },
};

export async function completeAI(task: AITask, messages: AIMessage[]) {
  const requested = env.AI_PROVIDER_ORDER.split(',').map((value) => value.trim().toLowerCase());
  const order = task === 'analysis' ? [...requested].sort((a) => a === 'zai' ? -1 : 1) : requested;
  const failures: string[] = [];
  const startedAt = Date.now();
  for (const providerName of order) {
    const provider = providers[providerName];
    if (!provider?.configured()) continue;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);
    try {
      const result = await provider.complete(messages, controller.signal);
      return { ...result, provider: provider.name, fallbackUsed: failures.length > 0, latencyMs: Date.now() - startedAt };
    } catch (error) {
      failures.push(`${provider.name}:${error instanceof Error ? error.message : 'failed'}`);
    } finally { clearTimeout(timeout); }
  }
  console.error(JSON.stringify({ level: 'error', event: 'ai_all_providers_failed', task, failures }));
  throw new Error('AI_UNAVAILABLE');
}

export function configuredAIProviders() {
  return Object.values(providers).filter((provider) => provider.configured()).map((provider) => provider.name);
}
