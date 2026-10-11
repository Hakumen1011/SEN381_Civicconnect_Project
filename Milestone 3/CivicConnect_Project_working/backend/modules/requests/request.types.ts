
export const CATEGORIES = [
  'FACILITY_FAULT',
  'DAMAGED_EQUIPMENT',
  'SECURITY_CONCERN',
  'IT_SUPPORT',
  'MAINTENANCE',
  'LOST_PROPERTY',
  'OTHER',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  FACILITY_FAULT: 'Facility fault',
  DAMAGED_EQUIPMENT: 'Damaged equipment',
  SECURITY_CONCERN: 'Security concern',
  IT_SUPPORT: 'IT support',
  MAINTENANCE: 'Maintenance',
  LOST_PROPERTY: 'Lost property',
  OTHER: 'Other',
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
