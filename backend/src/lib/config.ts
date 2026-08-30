import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseAnonKey: string;
  isSupabaseConfigured: boolean;
  sourceDataDir: string;
  processedDataDir: string;
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

const isPlaceholder = (val: string) => !val || val.includes('placeholder') || val.includes('your-supabase');

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !isPlaceholder(supabaseUrl) &&
  (supabaseServiceRoleKey && !isPlaceholder(supabaseServiceRoleKey))
);

export const config: ServerConfig = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  supabaseUrl,
  supabaseServiceRoleKey,
  supabaseAnonKey,
  isSupabaseConfigured,
  sourceDataDir: process.env.SOURCE_DATA_DIR || path.resolve(__dirname, '../../..'),
  processedDataDir: process.env.PROCESSED_DATA_DIR || path.resolve(__dirname, '../../data/processed')
};

export function validateEnvironment(): { isValid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!isSupabaseConfigured) {
    warnings.push(
      '[Config Warning] Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) not configured or using placeholders. Running in local standalone adapter mode with local database seed fallback.'
    );
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}
