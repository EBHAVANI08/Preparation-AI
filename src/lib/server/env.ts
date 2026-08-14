import { z } from 'zod';

const optionalString = () =>
  z.preprocess((val) => {
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      return undefined;
    }
    return val;
  }, z.string().min(1).optional());

const requiredString = (defaultVal: string) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      return defaultVal;
    }
    return val;
  }, z.string().min(1));

const safeUrl = (defaultVal: string) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      return defaultVal;
    }
    return val;
  }, z.string().url());

const safeNumber = (defaultVal: number) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defaultVal;
    const num = Number(val);
    return Number.isNaN(num) ? defaultVal : num;
  }, z.number().int().min(1000).max(120000));

const schema = z.object({
  NODE_ENV: z.preprocess(
    (val) => (val === 'production' || val === 'test' ? val : 'development'),
    z.enum(['development', 'test', 'production'])
  ),
  MONGODB_URI: optionalString(),
  MONGODB_DB: requiredString('preparation_ai'),
  AUTH_SECRET: optionalString(),
  AI_PROVIDER_ORDER: requiredString('groq,zai'),
  AI_TIMEOUT_MS: safeNumber(25000),
  GROQ_API_KEY: optionalString(),
  GROQ_MODEL: requiredString('llama-3.3-70b-versatile'),
  ZAI_API_KEY: optionalString(),
  ZAI_BASE_URL: safeUrl('https://api.z.ai/api/paas/v4'),
  ZAI_MODEL: requiredString('glm-4.5-flash'),
});

export const env = schema.parse(process.env);

export function assertProductionEnvironment(): void {
  if (env.NODE_ENV !== 'production') return;
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required in production');
  if (!env.AUTH_SECRET) throw new Error('AUTH_SECRET is required in production');
}



