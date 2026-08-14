import { Db, MongoClient } from 'mongodb';
import { env } from './env';

const uri = env.MONGODB_URI;
const databaseName = env.MONGODB_DB;

type MongoGlobal = typeof globalThis & { __prepMongo?: Promise<MongoClient> };
const mongoGlobal = globalThis as MongoGlobal;

export function isDatabaseConfigured(): boolean {
  return Boolean(uri);
}

export async function database(): Promise<Db> {
  if (!uri) throw new Error('MONGODB_URI is not configured');
  mongoGlobal.__prepMongo ??= new MongoClient(uri, {
    maxPoolSize: 20,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
  }).connect();
  return (await mongoGlobal.__prepMongo).db(databaseName);
}

export async function ensureIndexes(): Promise<void> {
  const db = await database();
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('organizations').createIndex({ slug: 1 }, { unique: true }),
    db.collection('memberships').createIndex({ organizationId: 1, userId: 1 }, { unique: true }),
    db.collection('attempts').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('attempts').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }),
    db.collection('audit_events').createIndex({ organizationId: 1, createdAt: -1 }),
    db.collection('ai_requests').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('ai_requests').createIndex({ organizationId: 1, createdAt: -1 }),
    db.collection('ai_conversations').createIndex({ organizationId: 1, userId: 1, feature: 1 }, { unique: true }),
    db.collection('study_plans').createIndex({ organizationId: 1, userId: 1, status: 1 }, { unique: true }),
  ]);
}
