import type { Category, Priority } from './request.types.js';


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
