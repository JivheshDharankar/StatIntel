import { LearningResourceItem, ResourceSource, ResourceSourceCategory } from '../types';

export interface LearningSourceAdapter {
  readonly sourceName: ResourceSource;
  readonly sourceCategory: ResourceSourceCategory;
  readonly isLiveApi: boolean;
  
  /**
   * Fetch resources matching a competency or keyword
   */
  fetchResources(params?: {
    competencyId?: string;
    competencyCode?: string;
    competencyName?: string;
    targetLevel?: string;
    limit?: number;
  }): Promise<LearningResourceItem[]>;

  /**
   * Fetch a single resource by its ID
   */
  getResourceById(id: string): Promise<LearningResourceItem | null>;
}

export abstract class BaseLocalPdfAdapter implements LearningSourceAdapter {
  abstract readonly sourceName: ResourceSource;
  abstract readonly sourceCategory: ResourceSourceCategory;
  readonly isLiveApi = false; // Clearly states local source data, API-ready architecture

  protected localResources: LearningResourceItem[] = [];

  constructor(resources: LearningResourceItem[] = []) {
    this.localResources = resources;
  }

  setResources(resources: LearningResourceItem[]) {
    this.localResources = resources;
  }

  async fetchResources(params?: {
    competencyId?: string;
    competencyCode?: string;
    competencyName?: string;
    targetLevel?: string;
    limit?: number;
  }): Promise<LearningResourceItem[]> {
    let filtered = this.localResources;

    if (params?.competencyId) {
      filtered = filtered.filter(r => r.competencyId === params.competencyId);
    } else if (params?.competencyCode) {
      filtered = filtered.filter(r => r.competencyCode === params.competencyCode);
    } else if (params?.competencyName) {
      const name = params.competencyName.toLowerCase();
      filtered = filtered.filter(
        r => (r.competencyName && r.competencyName.toLowerCase().includes(name)) ||
             r.title.toLowerCase().includes(name) ||
             r.description.toLowerCase().includes(name)
      );
    }

    if (params?.targetLevel) {
      filtered = filtered.filter(r => r.targetLevel.toLowerCase() === params.targetLevel?.toLowerCase());
    }

    return filtered.slice(0, params?.limit || 50);
  }

  async getResourceById(id: string): Promise<LearningResourceItem | null> {
    return this.localResources.find(r => r.id === id) || null;
  }
}
