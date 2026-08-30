import fs from 'fs';
import path from 'path';
import { LearningResourceItem, ResourceSourceCategory } from '../types';
import { LearningSourceAdapter } from './index';
import { 
  LocalIGOTAdapter, 
  LocalNSSTAAdapter, 
  LocalTPACAdapter, 
  LocalLearningMaterialAdapter 
} from './adapters';

export class AdapterRegistry {
  private adapters: Map<ResourceSourceCategory, LearningSourceAdapter> = new Map();
  private allResources: LearningResourceItem[] = [];

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters() {
    const igotAdapter = new LocalIGOTAdapter();
    const nsstaAdapter = new LocalNSSTAAdapter();
    const tpacAdapter = new LocalTPACAdapter();
    const materialAdapter = new LocalLearningMaterialAdapter();

    this.adapters.set('iGOT', igotAdapter);
    this.adapters.set('NSSTA', nsstaAdapter);
    this.adapters.set('TPAC', tpacAdapter);
    this.adapters.set('Learning Material', materialAdapter);

    this.loadExtractedResources();
  }

  public loadExtractedResources() {
    const candidates = [
      path.resolve(__dirname, '../../../data/processed/normalized_learning_resources.json'),
      path.resolve(__dirname, '../../data/processed/normalized_learning_resources.json'),
      path.resolve(process.cwd(), 'data/processed/normalized_learning_resources.json'),
      path.resolve(process.cwd(), '../data/processed/normalized_learning_resources.json')
    ];

    let loaded = false;
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.allResources = JSON.parse(raw);
          loaded = true;
          break;
        } catch (e) {
          console.error(`[AdapterRegistry] Failed to parse ${filePath}:`, e);
        }
      }
    }

    if (!loaded) {
      console.warn('[AdapterRegistry] normalized_learning_resources.json not found. Using fallback seed catalogue.');
      this.allResources = [];
    }

    // Distribute resources to adapters by source category
    const igot = this.allResources.filter(r => r.sourceCategory === 'iGOT');
    const nssta = this.allResources.filter(r => r.sourceCategory === 'NSSTA');
    const tpac = this.allResources.filter(r => r.sourceCategory === 'TPAC');
    const mat = this.allResources.filter(r => r.sourceCategory === 'Learning Material');

    (this.adapters.get('iGOT') as LocalIGOTAdapter)?.setResources(igot);
    (this.adapters.get('NSSTA') as LocalNSSTAAdapter)?.setResources(nssta);
    (this.adapters.get('TPAC') as LocalTPACAdapter)?.setResources(tpac);
    (this.adapters.get('Learning Material') as LocalLearningMaterialAdapter)?.setResources(mat);

    console.log(`[AdapterRegistry] Loaded ${this.allResources.length} learning resources (iGOT: ${igot.length}, NSSTA: ${nssta.length}, TPAC: ${tpac.length}, Material: ${mat.length})`);
  }

  public getAdapter(category: ResourceSourceCategory): LearningSourceAdapter | undefined {
    return this.adapters.get(category);
  }

  public getAllResources(): LearningResourceItem[] {
    return this.allResources;
  }

  public async fetchAllMatching(params?: {
    competencyId?: string;
    competencyCode?: string;
    competencyName?: string;
    sourceCategory?: ResourceSourceCategory;
    targetLevel?: string;
    limit?: number;
  }): Promise<LearningResourceItem[]> {
    if (params?.sourceCategory && this.adapters.has(params.sourceCategory)) {
      return this.adapters.get(params.sourceCategory)!.fetchResources(params);
    }

    const results: LearningResourceItem[] = [];
    for (const adapter of this.adapters.values()) {
      const items = await adapter.fetchResources(params);
      results.push(...items);
    }

    return results.slice(0, params?.limit || 50);
  }

  public async getResourceById(id: string): Promise<LearningResourceItem | null> {
    for (const adapter of this.adapters.values()) {
      const item = await adapter.getResourceById(id);
      if (item) return item;
    }
    return null;
  }
}

export const adapterRegistry = new AdapterRegistry();
