import type { RequestManagementDetails } from "./requestManagementTypes";

// Demonstration data based on the type of case shown in the Stitch design.
// These details are illustrative and are not connected to a live municipality.
export const mockRequestManagementCase: RequestManagementDetails = {
  caseReference: "CC-2026-08477",

  subcategory: "Pressurised Main Rupture",
  routingDepartment: "Water & Heavy Road Services",
  origin: "Verified Resident Mobile App",

  constituentNarrative:
    "A large water leak is reported beneath the north asphalt shoulder. " +
    "Water is bubbling from the road surface and runoff may affect nearby " +
    "properties. The location needs assessment and appropriate isolation.",

  latitude: -25.7479,
  longitude: 28.2293,

  currentStage: "In Progress",

  // Sample timestamps allow the lifecycle timeline to show its history.
  stageTimestamps: {
    Submitted: "2026-10-14T08:12:00+02:00",
    Triaged: "2026-10-14T08:34:00+02:00",
    "In Progress": "2026-10-14T09:10:00+02:00",
  },

  ownerName: "Eleanor Vance",
  ownerRole: "Lead Triage Specialist",
  activeFieldUnit: "Crew Unit #12 (Hydraulic)",

  crewSummary: "3 technicians · Vehicle 991",

  targetSlaMinutes: 240,
  remainingSlaMinutes: 164,

  messages: [
    {
      id: "MSG-001",
      type: "Internal Staff Note",
      author: "Eleanor Vance",
      role: "Dispatch Lead",
      timestamp: "2026-10-14T08:35:00+02:00",
      content:
        "Spoke with the district superintendent. The field crew " +
        "has been directed to inspect the affected section and " +
        "report back before work continues.",
    },
    {
      id: "MSG-002",
      type: "Internal Staff Note",
      author: "Dave Kowalski",
      role: "Field Foreman",
      timestamp: "2026-10-14T09:22:00+02:00",
      content:
        "The crew is on site assessing the affected main. " +
        "Further work depends on confirming the isolation procedure.",
    },
    {
      id: "MSG-003",
      type: "Public Citizen Message",
      author: "Resident Portal",
      role: "Public update",
      timestamp: "2026-10-14T09:30:00+02:00",
      content:
        "The request remains in progress. The responsible municipal " +
        "team is assessing the reported issue.",
    },
  ],

  auditEvents: [
    {
      id: "AUD-001",
      actor: "Resident Portal",
      action: "Request submitted",
      timestamp: "2026-10-14T08:12:00+02:00",
      details: "The request entered the service-request lifecycle.",
    },
    {
      id: "AUD-002",
      actor: "Eleanor Vance",
      action: "Triage completed",
      timestamp: "2026-10-14T08:34:00+02:00",
      details: "The case was reviewed and routed to the relevant team.",
    },
    {
      id: "AUD-003",
      actor: "Eleanor Vance",
      action: "Field unit assigned",
      timestamp: "2026-10-14T09:10:00+02:00",
      details: "Crew Unit #12 was recorded against this demonstration case.",
    },
  ],

  rootCause: "RC-204: Suspected water-main failure",
  materialsAndLabourCode: "BILL-MUNI-PW-2026-C12",
  resolutionSummary: "",
  supervisorSignoffRequired: true,
};