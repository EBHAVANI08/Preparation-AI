import { z } from 'zod';

const emptyToUndefined = (val: unknown) => (typeof val === 'string' && val.trim() === '' ? undefined : val);

const schema = z.object({
  NODE_ENV: z.preprocess(emptyToUndefined, z.enum(['development', 'test', 'production']).default('development')),
  MONGODB_URI: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  MONGODB_DB: z.preprocess(emptyToUndefined, z.string().min(1).default('preparation_ai')),
  AUTH_SECRET: z.preprocess(emptyToUndefined, z.string().min(32).optional()),
  AI_PROVIDER_ORDER: z.preprocess(emptyToUndefined, z.string().default('groq,zai')),
  AI_TIMEOUT_MS: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1000).max(120000).default(25000)
  ),
  GROQ_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  GROQ_MODEL: z.preprocess(emptyToUndefined, z.string().default('llama-3.3-70b-versatile')),
  ZAI_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  ZAI_BASE_URL: z.preprocess(emptyToUndefined, z.string().url().default('https://api.z.ai/api/paas/v4')),
  ZAI_MODEL: z.preprocess(emptyToUndefined, z.string().default('glm-4.5-flash')),
});

export const env = schema.parse(process.env);

export function assertProductionEnvironment(): void {
  if (env.NODE_ENV !== 'production') return;
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required in production');
  if (!env.AUTH_SECRET) throw new Error('AUTH_SECRET is required in production');
}

