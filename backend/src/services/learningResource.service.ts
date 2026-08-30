import { adapterRegistry } from '../adapters/registry';
import { LearningResourceItem, ResourceSourceCategory } from '../types';

export class LearningResourceService {
  /**
   * Retrieves all learning resources with optional filtering
   */
  static async getResources(filters?: {
    category?: ResourceSourceCategory;
    competencyId?: string;
    competencyCode?: string;
    competencyName?: string;
    targetLevel?: string;
    search?: string;
    limit?: number;
  }): Promise<LearningResourceItem[]> {
    let resources = await adapterRegistry.fetchAllMatching(filters);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      resources = resources.filter(
        r => r.title.toLowerCase().includes(q) || 
             r.description.toLowerCase().includes(q) ||
             (r.competencyName && r.competencyName.toLowerCase().includes(q))
      );
    }

    return resources.slice(0, filters?.limit || 50);
  }

  /**
   * Retrieves a single learning resource by ID
   */
  static async getResourceById(id: string): Promise<LearningResourceItem | null> {
    return adapterRegistry.getResourceById(id);
  }
}
