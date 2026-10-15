

/**
 * CivicConnect service request categories.
 *
 * The six municipal categories support the approved
 * municipal service reporting domain.
 *
 * Existing categories are retained temporarily
 * for backward compatibility with existing tests
 * and other team modules.
 */
export const CATEGORIES = [
  // Existing categories
  'FACILITY_FAULT',
  'DAMAGED_EQUIPMENT',
  'SECURITY_CONCERN',
  'IT_SUPPORT',
  'MAINTENANCE',
  'LOST_PROPERTY',
  'OTHER',

  // Municipal service categories
  'ROAD_PAVEMENT',
  'STREET_LIGHTING',
  'STORMWATER_DRAIN',
  'SOLID_WASTE',
  'PARKS_GREENERY',
  'CODE_COMPLIANCE',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  // Existing category labels
  FACILITY_FAULT: 'Facility fault',
  DAMAGED_EQUIPMENT: 'Damaged equipment',
  SECURITY_CONCERN: 'Security concern',
  IT_SUPPORT: 'IT support',
  MAINTENANCE: 'Maintenance',
  LOST_PROPERTY: 'Lost property',
  OTHER: 'Other',

  // Municipal category labels
  ROAD_PAVEMENT: 'Road & Pavement',
  STREET_LIGHTING: 'Street Lighting',
  STORMWATER_DRAIN: 'Stormwater & Drain',
  SOLID_WASTE: 'Solid Waste',
  PARKS_GREENERY: 'Parks & Greenery',
  CODE_COMPLIANCE: 'Code Compliance',
};


export const STATUSES = [
  'SUBMITTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'ON_HOLD',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
] as const;
export type RequestStatus = (typeof STATUSES)[number];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface ServiceRequest {
  id: string;
 
  reference: string;
  requesterId: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  priority: Priority;
  status: RequestStatus;
  assigneeId: string | null;
  resolution: string | null;
  
  dueAt: string;
  createdAt: string;
  updatedAt: string;
  
  version: number;
}


export interface StatusHistoryEntry {
  id: string;
  requestId: string;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  changedById: string;
  note: string | null;
  changedAt: string;
}


export interface Comment {
  id: string;
  requestId: string;
  authorId: string;
  body: string;
  createdAt: string;
}
