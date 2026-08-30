import { Request, Response } from 'express';
import { config, validateEnvironment } from '../lib/config';
import { adapterRegistry } from '../adapters/registry';

export class HealthController {
  static getHealth(_req: Request, res: Response) {
    const envValidation = validateEnvironment();
    res.json({
      status: 'ok',
      service: 'statintel-backend',
      timestamp: new Date().toISOString(),
      version: '0.2.0',
      database: {
        isRemoteConfigured: config.isSupabaseConfigured,
        mode: config.isSupabaseConfigured ? 'supabase_remote' : 'local_prototype_adapter'
      },
      resourcesCount: adapterRegistry.getAllResources().length,
      warnings: envValidation.warnings
    });
  }
}
