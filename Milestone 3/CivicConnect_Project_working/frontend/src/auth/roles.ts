export const ROLES = ["REQUESTER", "STAFF", "MANAGER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
export interface Session {
  token: string;
  user: AuthenticatedUser;
}
export type LoginMode = "requester" | "staff";

export function isRole(input: unknown): input is Role {
  return typeof input === "string" && (ROLES as readonly string[]).includes(input);
}

export function homeForRole(role: Role): string {
  if (role === "REQUESTER") return "/requester-self-service";
  if (role === "STAFF") return "/staff-triage";
  return "/management";
}

export function mayAccess(role: Role, path: string): boolean {
  if (path === "/requester-self-service") return role === "REQUESTER";
  if (path === "/staff-triage" || path === "/request-management") return role !== "REQUESTER";
  if (path === "/management") return role === "MANAGER" || role === "ADMIN";
  return false;
}

export type NavigationId = "staff-triage" | "request-management" | "requester-self-service" | "management-analytics";
export interface NavEntry { id: NavigationId; label: string; path: string; icon: string; sidebarLabel: string; }
export const NAVIGATION: readonly NavEntry[] = [
  { id: "staff-triage", label: "Staff Triage Queue", sidebarLabel: "Triage Inbox", path: "/staff-triage", icon: "inbox" },
  { id: "request-management", label: "Request Management", sidebarLabel: "Live Request Register", path: "/request-management", icon: "assignment" },
  { id: "requester-self-service", label: "Requester Self-Service", sidebarLabel: "My Service Requests", path: "/requester-self-service", icon: "public" },
  { id: "management-analytics", label: "Management & Analytics", sidebarLabel: "Live Analytics", path: "/management", icon: "bar_chart" },
];
export function navigationForRole(role: Role): NavEntry[] {
  return NAVIGATION.filter((entry) => mayAccess(role, entry.path));
}
