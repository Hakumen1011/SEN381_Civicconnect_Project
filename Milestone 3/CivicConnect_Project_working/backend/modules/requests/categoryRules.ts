import type { Category, Priority } from './request.types.js';

/**
 * Design decision 2 (Engineering Decision Log, Decision 9):
 * all category-specific rules sit behind this one interface. For now a single class uses
 * simple conditions. If categories later need clearly different rules, each category can get
 * its own Strategy class implementing this interface, without changing RequestService.
 */
export interface CategoryRules {
  /** Initial priority for a newly submitted request. */
  initialPriority(category: Category): Priority;
  /** Whether a specific location must be given for this category. */
  requiresLocation(category: Category): boolean;
}

export class SimpleCategoryRules implements CategoryRules {
  initialPriority(category: Category): Priority {
    if (category === 'SECURITY_CONCERN') return 'HIGH';
    if (category === 'LOST_PROPERTY' || category === 'OTHER') return 'LOW';
    return 'MEDIUM';
  }

  requiresLocation(category: Category): boolean {
    return category !== 'IT_SUPPORT' && category !== 'OTHER';
  }
}
