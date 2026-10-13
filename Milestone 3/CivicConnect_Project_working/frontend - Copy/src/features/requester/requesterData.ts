export interface RequestDraft {
  category: string;
  title: string;
  description: string;
  location: string;
  fileName?: string;
}

export interface SubmissionRecord {
  caseId: string;
  category: string;
  location: string;
  dateFiled: string;
  status: "In Progress" | "Resolved" | "Closed";
}

export interface CategoryOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface TicketStep {
  title: string;
  timestamp: string;
  description: string;
  state: "complete" | "active" | "upcoming";
  icon: string;
}

export const categoryOptions: CategoryOption[] = [
  {
    id: "road-pavement",
    label: "Road & Pavement",
    description: "Potholes, curb damage",
    icon: "alt_route",
  },
  {
    id: "street-lighting",
    label: "Street Lighting",
    description: "Outages, flickering poles",
    icon: "lightbulb",
  },
  {
    id: "stormwater-drain",
    label: "Stormwater & Drain",
    description: "Clogged culverts, runoff",
    icon: "water_drop",
  },
  {
    id: "solid-waste",
    label: "Solid Waste",
    description: "Missed trash, illegal dumps",
    icon: "delete_sweep",
  },
  {
    id: "parks-greenery",
    label: "Parks & Greenery",
    description: "Fallen branches, turf",
    icon: "park",
  },
  {
    id: "code-compliance",
    label: "Code Compliance",
    description: "Zoning, safety violations",
    icon: "policy",
  },
];

export const initialSubmissions: SubmissionRecord[] = [
  {
    caseId: "CV-9281",
    category: "Road Maintenance",
    location: "1400 Oakridge Terrace",
    dateFiled: "Oct 24, 2024",
    status: "In Progress",
  },
  {
    caseId: "CV-8804",
    category: "Parks & Greenery",
    location: "Fairmount Community Park",
    dateFiled: "Oct 19, 2024",
    status: "Resolved",
  },
  {
    caseId: "CV-8149",
    category: "Solid Waste",
    location: "Cul-de-sac 4, West End",
    dateFiled: "Sep 28, 2024",
    status: "Closed",
  },
];

export const initialTicketSteps: TicketStep[] = [
  {
    title: "1. Request Submitted",
    timestamp: "Oct 24, 08:14 AM",
    description: "Validated through digital resident signature node.",
    state: "complete",
    icon: "check",
  },
  {
    title: "2. Assigned to Crew Unit",
    timestamp: "Oct 24, 11:30 AM",
    description:
      "Dispatched to Public Works Mobile Asphalt Unit #12.",
    state: "complete",
    icon: "check",
  },
  {
    title: "3. In Field Repair",
    timestamp: "",
    description:
      "Crew deployed on-site with hot-mix patch machinery.",
    state: "active",
    icon: "autorenew",
  },
  {
    title: "4. Resolved & Inspected",
    timestamp: "Pending",
    description:
      "Post-repair surface audit by District Safety Inspector.",
    state: "upcoming",
    icon: "verified",
  },
];