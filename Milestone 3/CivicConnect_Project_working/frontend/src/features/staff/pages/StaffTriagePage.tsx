import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import OperationsShell from "../../../layouts/OperationsShell";

import {
  mockFieldCrewUnits,
  mockServiceRequests,
} from "../components/staffData";

import type {
  CrewAvailability,
  FieldCrewUnit,
  RequestCategory,
  RequestPriority,
  RequestStatus,
  ServiceRequest,
  StaffQuickView,
} from "../components/staffTypes";

import "./StaffTriagePage.css";

// The existing app uses one consistent list of permitted request statuses.
const STATUSES: RequestStatus[] = [
  "Submitted",
  "In Triage",
  "In Progress",
  "Pending Info",
  "Escalated",
  "Resolved",
  "Closed",
];

// These values must match RequestCategory in staffTypes.ts.
const CATEGORIES: RequestCategory[] = [
  "Roads & Pavement",
  "Street Lighting",
  "Water & Drainage",
  "Sanitation & Waste",
  "Parks & Forestry",
  "Other",
];

const PRIORITIES: RequestPriority[] = [
  "P1 Critical",
  "P2 High",
  "P3 Medium",
  "P4 Low",
];

// Used for sorting: a smaller number means a higher priority.
const PRIORITY_ORDER: Record<RequestPriority, number> = {
  "P1 Critical": 1,
  "P2 High": 2,
  "P3 Medium": 3,
  "P4 Low": 4,
};

type SortOption =
  | "sla-ascending"
  | "priority"
  | "newest"
  | "oldest";

type AssigneeFilter = "all" | "assigned" | "unassigned";

type ViewMode = "standard" | "compact";

interface QuickViewDefinition {
  id: StaffQuickView;
  label: string;
  icon: string;
}

const QUICK_VIEWS: QuickViewDefinition[] = [
  {
    id: "all",
    label: "All Requests",
    icon: "inbox",
  },
  {
    id: "immediate-triage",
    label: "Needs Immediate Triage",
    icon: "priority_high",
  },
  {
    id: "sla-risk",
    label: "SLA At Risk / Overdue",
    icon: "timer",
  },
  {
    id: "unassigned",
    label: "Unassigned",
    icon: "person_search",
  },
  {
    id: "my-units",
    label: "My Dispatched Units",
    icon: "local_shipping",
  },
  {
    id: "escalated",
    label: "Escalated",
    icon: "warning",
  },
];

// The first version uses one demonstration operator and unit.
// Replace these constants with the authenticated user's data later.
const CURRENT_OPERATOR = "Eleanor Vance";
const DEMO_ASSIGNMENT_UNIT = "FIELD-004";
const DEMO_ASSIGNMENT_OFFICER = "David Flores";

function isActiveRequest(request: ServiceRequest): boolean {
  // Resolved and closed requests are not considered active work.
  return (
    request.status !== "Resolved" &&
    request.status !== "Closed"
  );
}

function formatSla(remainingMinutes: number): string {
  // Negative minutes mean the SLA target has been exceeded.
  if (remainingMinutes < 0) {
    const overdueMinutes = Math.abs(remainingMinutes);

    if (overdueMinutes < 60) {
      return `+${overdueMinutes}m past`;
    }

    const hours = Math.floor(overdueMinutes / 60);
    const minutes = overdueMinutes % 60;

    return `+${hours}h ${minutes}m past`;
  }

  if (remainingMinutes === 0) {
    return "Due now";
  }

  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (hours === 0) {
    return `${minutes}m left`;
  }

  return `${hours}h ${minutes}m left`;
}

function getSlaPercentage(request: ServiceRequest): number {
  // Percentage represents approximate time consumed from the SLA window.
  // This is a frontend estimate based on the mock remaining-time value.
  if (
    request.status === "Resolved" ||
    request.status === "Closed"
  ) {
    return 100;
  }

  if (request.slaMinutesRemaining < 0) {
    return 100;
  }

  const percentage =
    100 -
    (request.slaMinutesRemaining /
      Math.max(request.slaTargetMinutes, 1)) *
      100;

  return Math.max(0, Math.min(100, Math.round(percentage)));
}

function getSlaTone(
  request: ServiceRequest,
): "safe" | "warning" | "danger" | "complete" {
  if (
    request.status === "Resolved" ||
    request.status === "Closed"
  ) {
    return "complete";
  }

  if (request.slaMinutesRemaining < 0) {
    return "danger";
  }

  if (request.slaMinutesRemaining <= 120) {
    return "warning";
  }

  return "safe";
}

function getStatusClass(status: RequestStatus): string {
  // Keep status styling in CSS instead of hard-coding inline colours.
  const statusClasses: Record<RequestStatus, string> = {
    Submitted: "submitted",
    "In Triage": "triage",
    "In Progress": "progress",
    "Pending Info": "pending",
    "Pending Verification": "pending-verification",
    Escalated: "escalated",
    Resolved: "resolved",
    Closed: "closed",
  };

  return statusClasses[status];
}

function getPriorityClass(priority: RequestPriority): string {
  const priorityClasses: Record<RequestPriority, string> = {
    "P1 Critical": "critical",
    "P2 High": "high",
    "P3 Medium": "medium",
    "P4 Low": "low",
  };

  return priorityClasses[priority];
}

function getCrewAvailabilityClass(
  availability: CrewAvailability,
): string {
  const classes: Record<CrewAvailability, string> = {
    Available: "available",
    "On Route": "on-route",
    "At Capacity": "at-capacity",
  };

  return classes[availability];
}

function formatReportedDate(value: string): string {
  // Format the ISO date for the table without changing the stored value.
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toCsvValue(value: string | number): string {
  // Escape quotes and wrap CSV values so commas don't corrupt columns.
  const escaped = String(value).replaceAll('"', '""');

  return `"${escaped}"`;
}

export default function StaffTriagePage() {
  // Copy the starter data into component state so demo actions can update it.
  const [requests, setRequests] =
    useState<ServiceRequest[]>(() => [...mockServiceRequests]);

  const [crewUnits] = useState<FieldCrewUnit[]>(
    () => [...mockFieldCrewUnits],
  );

  const [activeQuickView, setActiveQuickView] =
    useState<StaffQuickView>("all");

  // Search and filter state.
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | RequestStatus>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<"all" | RequestCategory>("all");
  const [priorityFilter, setPriorityFilter] =
    useState<"all" | RequestPriority>("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] =
    useState<AssigneeFilter>("all");

  const [sortOption, setSortOption] =
    useState<SortOption>("sla-ascending");

  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("standard");

  // Pagination and row-selection state.
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedReferences, setSelectedReferences] =
    useState<Set<string>>(() => new Set());

  // Notices explain the results of local demonstration actions.
  const [notice, setNotice] = useState("");

  // Manual request dialog state.
  const [showManualRequest, setShowManualRequest] =
    useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [manualCategory, setManualCategory] =
    useState<RequestCategory>("Roads & Pavement");
  const [nextReferenceNumber, setNextReferenceNumber] =
    useState(8500);

  // Keep pagination sensible when the user changes filters or search.
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeQuickView,
    searchTerm,
    statusFilter,
    categoryFilter,
    priorityFilter,
    wardFilter,
    assigneeFilter,
    sortOption,
    rowsPerPage,
  ]);

  // KPI values are always calculated from the current local dataset.
  const activeRequests = useMemo(
    () => requests.filter(isActiveRequest),
    [requests],
  );

  const quickViewCounts = useMemo<Record<StaffQuickView, number>>(
    () => ({
      all: requests.length,

      "immediate-triage": activeRequests.filter(
        (request) =>
          request.status === "Submitted" ||
          request.status === "In Triage" ||
          request.priority === "P1 Critical",
      ).length,

      "sla-risk": activeRequests.filter(
        (request) => request.slaMinutesRemaining <= 120,
      ).length,

      unassigned: activeRequests.filter(
        (request) =>
          request.assignedOfficer === null ||
          request.assignedUnitId === null,
      ).length,

      "my-units": activeRequests.filter(
        (request) =>
          request.assignedOfficer === CURRENT_OPERATOR ||
          request.assignedUnitId === "FIELD-012",
      ).length,

      escalated: activeRequests.filter(
        (request) => request.status === "Escalated",
      ).length,
    }),
    [requests, activeRequests],
  );

  // Compute search, quick view, dropdown filters, and sorting in one place.
  // This makes the results consistent regardless of which control is used.
  const filteredRequests = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();

    const filtered = requests.filter((request) => {
      const matchesSearch =
        normalisedSearch.length === 0 ||
        [
          request.caseReference,
          request.title,
          request.category,
          request.location,
          request.ward,
          request.reportedBy,
          request.assignedOfficer ?? "",
          request.assignedUnitId ?? "",
        ].some((value) =>
          value.toLowerCase().includes(normalisedSearch),
        );

      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        request.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        request.priority === priorityFilter;

      const matchesWard =
        wardFilter === "all" ||
        request.ward === wardFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "assigned" &&
          request.assignedOfficer !== null &&
          request.assignedUnitId !== null) ||
        (assigneeFilter === "unassigned" &&
          (request.assignedOfficer === null ||
            request.assignedUnitId === null));

      let matchesQuickView = true;

      switch (activeQuickView) {
        case "immediate-triage":
          matchesQuickView =
            isActiveRequest(request) &&
            (request.status === "Submitted" ||
              request.status === "In Triage" ||
              request.priority === "P1 Critical");
          break;

        case "sla-risk":
          matchesQuickView =
            isActiveRequest(request) &&
            request.slaMinutesRemaining <= 120;
          break;

        case "unassigned":
          matchesQuickView =
            isActiveRequest(request) &&
            (request.assignedOfficer === null ||
              request.assignedUnitId === null);
          break;

        case "my-units":
          matchesQuickView =
            isActiveRequest(request) &&
            (request.assignedOfficer === CURRENT_OPERATOR ||
              request.assignedUnitId === "FIELD-012");
          break;

        case "escalated":
          matchesQuickView =
            isActiveRequest(request) &&
            request.status === "Escalated";
          break;

        case "all":
          matchesQuickView = true;
          break;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesWard &&
        matchesAssignee &&
        matchesQuickView
      );
    });

    return filtered.sort((first, second) => {
      switch (sortOption) {
        case "priority":
          return (
            PRIORITY_ORDER[first.priority] -
            PRIORITY_ORDER[second.priority]
          );

        case "newest":
          return (
            new Date(second.reportedAt).getTime() -
            new Date(first.reportedAt).getTime()
          );

        case "oldest":
          return (
            new Date(first.reportedAt).getTime() -
            new Date(second.reportedAt).getTime()
          );

        case "sla-ascending":
        default:
          return (
            first.slaMinutesRemaining -
            second.slaMinutesRemaining
          );
      }
    });
  }, [
    requests,
    searchTerm,
    statusFilter,
    categoryFilter,
    priorityFilter,
    wardFilter,
    assigneeFilter,
    activeQuickView,
    sortOption,
  ]);

  // Calculate which results should be visible on the current page.
  const pageCount = Math.max(
    1,
    Math.ceil(filteredRequests.length / rowsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, pageCount);

  const visibleRequests = filteredRequests.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage,
  );

  const visibleReferences = visibleRequests.map(
    (request) => request.caseReference,
  );

  const allVisibleSelected =
    visibleReferences.length > 0 &&
    visibleReferences.every((reference) =>
      selectedReferences.has(reference),
    );

  const activeFilterCount = [
    statusFilter !== "all",
    categoryFilter !== "all",
    priorityFilter !== "all",
    wardFilter !== "all",
    assigneeFilter !== "all",
  ].filter(Boolean).length;

  const wardOptions = Array.from(
    new Set(requests.map((request) => request.ward)),
  ).sort();

  // Select or deselect every request on the visible table page.
  function handleSelectVisibleRows() {
    setSelectedReferences((current) => {
      const updated = new Set(current);

      if (allVisibleSelected) {
        visibleReferences.forEach((reference) =>
          updated.delete(reference),
        );
      } else {
        visibleReferences.forEach((reference) =>
          updated.add(reference),
        );
      }

      return updated;
    });
  }

  function handleSelectRow(reference: string) {
    setSelectedReferences((current) => {
      const updated = new Set(current);

      if (updated.has(reference)) {
        updated.delete(reference);
      } else {
        updated.add(reference);
      }

      return updated;
    });
  }

  // Reset filters without changing request records.
  function handleResetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setWardFilter("all");
    setAssigneeFilter("all");
    setActiveQuickView("all");
    setSortOption("sla-ascending");
    setSelectedReferences(new Set());
    setNotice("Filters have been reset.");
  }

  // Export the currently filtered records as a genuine CSV download.
  function handleExportCsv() {
    const headings = [
      "Case Reference",
      "Category",
      "Title",
      "Location",
      "Ward",
      "Reported By",
      "Reported At",
      "Status",
      "Priority",
      "SLA Minutes Remaining",
      "Assigned Officer",
      "Assigned Unit",
    ];

    const rows = filteredRequests.map((request) => [
      request.caseReference,
      request.category,
      request.title,
      request.location,
      request.ward,
      request.reportedBy,
      request.reportedAt,
      request.status,
      request.priority,
      request.slaMinutesRemaining,
      request.assignedOfficer ?? "Unassigned",
      request.assignedUnitId ?? "Unassigned",
    ]);

    const csvContent = [
      headings.map(toCsvValue).join(","),
      ...rows.map((row) => row.map(toCsvValue).join(",")),
    ].join("\n");

    const file = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = "civicconnect-staff-triage.csv";
    downloadLink.click();

    URL.revokeObjectURL(downloadUrl);

    setNotice(
      `Exported ${filteredRequests.length} demonstration records to CSV.`,
    );
  }

  // A clearly labelled frontend-only assignment demonstration.
  // The backend must enforce permissions, capacity, and valid transitions.
 function handleAssignRequest(reference: string) {
  // Find the selected record before attempting an assignment.
  const target = requests.find(
    (request) => request.caseReference === reference,
  );

  if (!target) {
    setNotice("The selected request could not be found.");
    return;
  }

  // Completed requests cannot be assigned through this action.
  if (!isActiveRequest(target)) {
    setNotice(
      "Resolved or closed requests cannot be assigned through this action.",
    );
    return;
  }

  // This update changes local demonstration state only.
  setRequests((current) =>
    current.map((request) => {
      if (request.caseReference !== reference) {
        return request;
      }

      return {
        ...request,
        assignedOfficer: DEMO_ASSIGNMENT_OFFICER,
        assignedUnitId: DEMO_ASSIGNMENT_UNIT,
        status:
          request.status === "Submitted"
            ? "In Triage"
            : request.status,
      };
    }),
  );

  setNotice(
    `${reference} was assigned locally for demonstration only. No server update occurred.`,
  );
}

  function handleAssignSelected() {
    const referencesToAssign = [...selectedReferences];

    if (referencesToAssign.length === 0) {
      setNotice("Select at least one request first.");
      return;
    }

    setRequests((current) =>
      current.map((request) => {
        if (
          !selectedReferences.has(request.caseReference)
        ) {
          return request;
        }

        return {
          ...request,
          assignedOfficer: DEMO_ASSIGNMENT_OFFICER,
          assignedUnitId: DEMO_ASSIGNMENT_UNIT,
          status:
            request.status === "Submitted"
              ? "In Triage"
              : request.status,
        };
      }),
    );

    setSelectedReferences(new Set());

    setNotice(
      `Assigned ${referencesToAssign.length} selected request(s) locally for demonstration only. Changes have not been saved to a server.`,
    );
  }

  function handleCreateManualRequest(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!manualTitle.trim() || !manualLocation.trim()) {
      setNotice("Enter a title and location for the manual request.");
      return;
    }

    const reference =
      `CC-2026-${String(nextReferenceNumber).padStart(5, "0")}`;

    const newRequest: ServiceRequest = {
      caseReference: reference,
      category: manualCategory,
      title: manualTitle.trim(),
      location: manualLocation.trim(),
      ward: "Sector 4 (North)",
      reportedBy: CURRENT_OPERATOR,
      reportedAt: new Date().toISOString(),
      status: "Submitted",
      priority: "P3 Medium",
      slaTargetMinutes: 480,
      slaMinutesRemaining: 480,
      assignedOfficer: null,
      assignedUnitId: null,
    };

    setRequests((current) => [newRequest, ...current]);
    setNextReferenceNumber((current) => current + 1);

    // Clear the dialog once the local demonstration record is created.
    setManualTitle("");
    setManualLocation("");
    setManualCategory("Roads & Pavement");
    setShowManualRequest(false);
    setActiveQuickView("all");
    setSearchTerm("");
    setNotice(
      `${reference} was added to the local demonstration dataset. It has not been sent to a backend.`,
    );
  }

  return (
    <OperationsShell activeNavigation="staff-triage">
      <div className="staff-page">
        {/* Page heading and context follow the Stitch operations style. */}
        <div className="staff-page__heading">
          <div>
            <span className="staff-eyebrow">
              OPERATIONS CONTROL CENTRE
            </span>
            <h1>Staff Triage Queue</h1>
            <p>
              Review priority-sorted service requests and coordinate
              municipal response activity.
            </p>
          </div>

          <div className="staff-page__heading-status">
            <span className="staff-live-dot" />
            <span>Local demo data</span>
          </div>
        </div>

        {/* KPI cards use the same definitions as the quick-view filters. */}
        <section
          className="staff-kpi-grid"
          aria-label="Service request overview"
        >
          <button
            type="button"
            className={`staff-kpi-card ${
              activeQuickView === "all" ? "is-active" : ""
            }`}
            onClick={() => setActiveQuickView("all")}
          >
            <span className="staff-kpi-card__label">
              All Requests
            </span>
            <strong>{quickViewCounts.all}</strong>
            <span className="staff-kpi-card__footnote">
              Demonstration records
            </span>
            <span className="staff-kpi-card__meter staff-kpi-card__meter--blue" />
          </button>

          <button
            type="button"
            className={`staff-kpi-card ${
              activeQuickView === "immediate-triage"
                ? "is-active"
                : ""
            }`}
            onClick={() =>
              setActiveQuickView("immediate-triage")
            }
          >
            <span className="staff-kpi-card__label">
              Needs Immediate Triage
            </span>
            <strong>{quickViewCounts["immediate-triage"]}</strong>
            <span className="staff-kpi-card__footnote">
              Submitted, triage or critical
            </span>
            <span className="staff-kpi-card__meter staff-kpi-card__meter--red" />
          </button>

          <button
            type="button"
            className={`staff-kpi-card ${
              activeQuickView === "sla-risk" ? "is-active" : ""
            }`}
            onClick={() => setActiveQuickView("sla-risk")}
          >
            <span className="staff-kpi-card__label">
              SLA At Risk / Overdue
            </span>
            <strong>{quickViewCounts["sla-risk"]}</strong>
            <span className="staff-kpi-card__footnote">
              Active cases with limited SLA time
            </span>
            <span className="staff-kpi-card__meter staff-kpi-card__meter--orange" />
          </button>

          <button
            type="button"
            className={`staff-kpi-card ${
              activeQuickView === "unassigned"
                ? "is-active"
                : ""
            }`}
            onClick={() => setActiveQuickView("unassigned")}
          >
            <span className="staff-kpi-card__label">
              Unassigned Requests
            </span>
            <strong>{quickViewCounts.unassigned}</strong>
            <span className="staff-kpi-card__footnote">
              Awaiting officer or unit assignment
            </span>
            <span className="staff-kpi-card__meter staff-kpi-card__meter--navy" />
          </button>

          <button
            type="button"
            className={`staff-kpi-card ${
              activeQuickView === "my-units" ? "is-active" : ""
            }`}
            onClick={() => setActiveQuickView("my-units")}
          >
            <span className="staff-kpi-card__label">
              My Dispatched Units
            </span>
            <strong>{quickViewCounts["my-units"]}</strong>
            <span className="staff-kpi-card__footnote">
              Requests connected to demo units
            </span>
            <span className="staff-kpi-card__meter staff-kpi-card__meter--green" />
          </button>
        </section>

        {/* Notices clearly distinguish a local action from a server update. */}
        {notice && (
          <div className="staff-notice" role="status">
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              info
            </span>
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                close
              </span>
            </button>
          </div>
        )}

        {/* Main workbench: quick views, controls and the requests table. */}
        <section className="staff-workbench">
          <header className="staff-workbench__header">
            <div className="staff-workbench__title">
              <span
                className="staff-workbench__title-marker"
                aria-hidden="true"
              />
              <div>
                <h2>Service Request Operations Workbench</h2>
                <p>
                  Reviewing priority-sorted municipal casework and
                  dispatch information.
                  <span className="staff-sync-badge">
                    Live UI demo
                  </span>
                </p>
              </div>
            </div>

            <div className="staff-workbench__actions">
              <button
                type="button"
                className="staff-button staff-button--secondary"
                onClick={handleExportCsv}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  download
                </span>
                Export CSV
              </button>

              <button
                type="button"
                className="staff-button staff-button--secondary"
                disabled
                title="PDF generation awaits a backend/document service."
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  picture_as_pdf
                </span>
                Daily PDF Audit
              </button>

              <button
                type="button"
                className="staff-button staff-button--primary"
                onClick={() => setShowManualRequest(true)}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  add
                </span>
                Log Manual Request
              </button>
            </div>
          </header>

          {/* Quick-view chips behave as filters, not just decorations. */}
          <div
            className="staff-quick-views"
            aria-label="Quick request filters"
          >
            <span className="staff-quick-views__label">
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                filter_alt
              </span>
              Quick views:
            </span>

            {QUICK_VIEWS.map((view) => {
              const count = quickViewCounts[view.id];
              const selected = activeQuickView === view.id;

              return (
                <button
                  key={view.id}
                  type="button"
                  className={`staff-quick-chip ${
                    selected ? "is-active" : ""
                  } staff-quick-chip--${view.id}`}
                  onClick={() => setActiveQuickView(view.id)}
                  aria-pressed={selected}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    {view.icon}
                  </span>
                  {view.label}
                  <span className="staff-quick-chip__count">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and expandable filters narrow the same result set. */}
          <div className="staff-filter-area">
            <div className="staff-search">
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                search
              </span>

              <input
                type="search"
                aria-label="Search service requests"
                placeholder="Search ticket ID, address, incident..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    close
                  </span>
                </button>
              )}
            </div>

            <button
              type="button"
              className={`staff-button staff-button--filter ${
                showFilters ? "is-active" : ""
              }`}
              onClick={() => setShowFilters((current) => !current)}
              aria-expanded={showFilters}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                tune
              </span>
              Filters
              <span className="staff-filter-count">
                {activeFilterCount}
              </span>
            </button>

            <button
              type="button"
              className="staff-reset-button"
              onClick={handleResetFilters}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                refresh
              </span>
              Reset
            </button>
          </div>

          {showFilters && (
            <div className="staff-select-filters">
              <label>
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "all"
                        | RequestStatus,
                    )
                  }
                >
                  <option value="all">All statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Category</span>
                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value as
                        | "all"
                        | RequestCategory,
                    )
                  }
                >
                  <option value="all">All categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Priority</span>
                <select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(
                      event.target.value as
                        | "all"
                        | RequestPriority,
                    )
                  }
                >
                  <option value="all">All priorities</option>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Ward</span>
                <select
                  value={wardFilter}
                  onChange={(event) =>
                    setWardFilter(event.target.value)
                  }
                >
                  <option value="all">All wards</option>
                  {wardOptions.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Assignment</span>
                <select
                  value={assigneeFilter}
                  onChange={(event) =>
                    setAssigneeFilter(
                      event.target.value as AssigneeFilter,
                    )
                  }
                >
                  <option value="all">All assignments</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </label>
            </div>
          )}

          <div className="staff-result-toolbar">
            <div className="staff-result-toolbar__summary">
              <strong>
                {filteredRequests.length} records found
              </strong>
              <span>
                From {requests.length} local demonstration records
              </span>
              {selectedReferences.size > 0 && (
                <span className="staff-selected-count">
                  {selectedReferences.size} selected
                </span>
              )}
            </div>

            <div className="staff-result-toolbar__controls">
              {selectedReferences.size > 0 && (
                <button
                  type="button"
                  className="staff-button staff-button--secondary"
                  onClick={handleAssignSelected}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    assignment_ind
                  </span>
                  Assign selected ({selectedReferences.size})
                </button>
              )}

              <label className="staff-sort-control">
                <span>Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(
                      event.target.value as SortOption,
                    )
                  }
                >
                  <option value="sla-ascending">
                    SLA urgency (ascending)
                  </option>
                  <option value="priority">
                    Priority (highest first)
                  </option>
                  <option value="newest">
                    Recently reported
                  </option>
                  <option value="oldest">
                    Oldest reported
                  </option>
                </select>
              </label>

              <div className="staff-view-controls">
                <button
                  type="button"
                  className={`staff-view-button ${
                    viewMode === "standard" ? "is-active" : ""
                  }`}
                  onClick={() => setViewMode("standard")}
                  aria-label="Standard table density"
                  aria-pressed={viewMode === "standard"}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    table_rows
                  </span>
                </button>

                <button
                  type="button"
                  className={`staff-view-button ${
                    viewMode === "compact" ? "is-active" : ""
                  }`}
                  onClick={() => setViewMode("compact")}
                  aria-label="Compact table density"
                  aria-pressed={viewMode === "compact"}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    density_small
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="staff-table-wrapper">
            <table
              className={`staff-request-table ${
                viewMode === "compact" ? "is-compact" : ""
              }`}
            >
              <thead>
                <tr>
                  <th className="staff-table__checkbox">
                    <input
                      type="checkbox"
                      aria-label="Select all visible requests"
                      checked={allVisibleSelected}
                      onChange={handleSelectVisibleRows}
                    />
                  </th>
                  <th>Case Reference</th>
                  <th>Category</th>
                  <th>Incident Details &amp; Location</th>
                  <th>Citizen / Origin</th>
                  <th>Status</th>
                  <th>SLA Window</th>
                  <th>Assigned Dispatch</th>
                </tr>
              </thead>

              <tbody>
                {visibleRequests.map((request) => {
                  const isOverdue =
                    request.slaMinutesRemaining < 0;
                  const slaTone = getSlaTone(request);
                  const selected = selectedReferences.has(
                    request.caseReference,
                  );

                  return (
                    <tr
                      key={request.caseReference}
                      className={selected ? "is-selected" : ""}
                    >
                      <td className="staff-table__checkbox">
                        <input
                          type="checkbox"
                          checked={selected}
                          aria-label={`Select ${request.caseReference}`}
                          onChange={() =>
                            handleSelectRow(request.caseReference)
                          }
                        />
                      </td>

                      <td>
                        <div
                          className={`staff-case-reference staff-priority--${getPriorityClass(
                            request.priority,
                          )}`}
                        >
                          <span className="staff-priority-dot" />
                          <div>
                            <strong>{request.caseReference}</strong>
                            <span>{request.priority}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="staff-category-tag">
                          {request.category}
                        </span>
                      </td>

                      <td className="staff-incident-cell">
                        <strong>{request.title}</strong>
                        <span>
                          <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                          >
                            location_on
                          </span>
                          {request.location}
                        </span>
                        <small>{request.ward}</small>
                      </td>

                      <td className="staff-origin-cell">
                        <strong>{request.reportedBy}</strong>
                        <span>
                          {formatReportedDate(request.reportedAt)}
                        </span>
                      </td>

                      <td>
                        <div className="staff-status-cell">
                          <span
                            className={`staff-status-badge staff-status--${getStatusClass(
                              request.status,
                            )}`}
                          >
                            {request.status}
                          </span>

                          {isOverdue &&
                            isActiveRequest(request) && (
                              <span className="staff-overdue-note">
                                SLA breached
                              </span>
                            )}
                        </div>
                      </td>

                      <td>
                        <div
                          className={`staff-sla-cell staff-sla--${slaTone}`}
                        >
                          <div className="staff-sla-cell__label">
                            <span>
                              {formatSla(
                                request.slaMinutesRemaining,
                              )}
                            </span>
                            <strong>
                              {getSlaPercentage(request)}%
                            </strong>
                          </div>

                          <div
                            className="staff-sla-meter"
                            role="progressbar"
                            aria-label={`SLA window for ${request.caseReference}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={getSlaPercentage(request)}
                          >
                            <span
                              style={{
                                width: `${getSlaPercentage(request)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        {request.assignedOfficer &&
                        request.assignedUnitId ? (
                          <div className="staff-assignment-cell">
                            <span className="staff-officer-avatar">
                              {request.assignedOfficer
                                .split(" ")
                                .map((part: string) => part[0])
                                .join("")
                                .slice(0, 2)}
                            </span>

                            <div>
                              <strong>
                                {request.assignedOfficer}
                              </strong>
                              <span>{request.assignedUnitId}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="staff-unassigned-button"
                            onClick={() =>
                              handleAssignRequest(
                                request.caseReference,
                              )
                            }
                            title="Demonstrate a local assignment to Field Unit 004"
                          >
                            <span
                              className="material-symbols-outlined"
                              aria-hidden="true"
                            >
                              assignment_ind
                            </span>
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {visibleRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="staff-empty-state"
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        search_off
                      </span>
                      <strong>No matching requests</strong>
                      <span>
                        Change your search or reset the filters to
                        see more records.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="staff-table-footer">
            <div>
              Showing{" "}
              {filteredRequests.length === 0
                ? 0
                : (safeCurrentPage - 1) * rowsPerPage + 1}
              {"–"}
              {Math.min(
                safeCurrentPage * rowsPerPage,
                filteredRequests.length,
              )}{" "}
              of {filteredRequests.length} filtered records

              <label className="staff-rows-per-page">
                Rows per page
                <select
                  value={rowsPerPage}
                  onChange={(event) =>
                    setRowsPerPage(Number(event.target.value))
                  }
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </label>
            </div>

            <div className="staff-pagination">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                aria-label="Previous page"
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  chevron_left
                </span>
              </button>

              <span>
                Page {safeCurrentPage} of {pageCount}
              </span>

              <button
                type="button"
                disabled={safeCurrentPage >= pageCount}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(pageCount, page + 1),
                  )
                }
                aria-label="Next page"
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>
            </div>
          </footer>
        </section>

        {/* Lower panels mirror the map and crew cards in the Stitch screen. */}
        <section className="staff-bottom-grid">
          <div className="staff-map-card">
            <header className="staff-panel-header">
              <div>
                <h2>
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    explore
                  </span>
                  Sector 4 Geospatial Incidents &amp; Field Clusters
                </h2>
                <p>
                  Illustrative case locations and field cluster overview
                </p>
              </div>
              <span className="staff-cluster-alert">
                {quickViewCounts["sla-risk"]} SLA risks
              </span>
            </header>

            {/* This is a schematic map, not a real map or live location feed. */}
            <div
              className="staff-map-placeholder"
              role="img"
              aria-label="Illustrative schematic of streets, parks and service request markers. Live map integration is not connected."
            >
              <div className="staff-map-park staff-map-park--one">
                Civic Park
              </div>
              <div className="staff-map-park staff-map-park--two">
                Greenway
              </div>
              <div className="staff-map-water" />

              <div className="staff-map-road staff-map-road--one" />
              <div className="staff-map-road staff-map-road--two" />
              <div className="staff-map-road staff-map-road--three" />
              <div className="staff-map-road staff-map-road--four" />
              <div className="staff-map-road staff-map-road--five" />

              <span className="staff-map-label staff-map-label--one">
                Meridian Ave
              </span>
              <span className="staff-map-label staff-map-label--two">
                Oakridge Terrace
              </span>

              <span className="staff-map-marker staff-map-marker--critical staff-map-marker--one">
                1
              </span>
              <span className="staff-map-marker staff-map-marker--critical staff-map-marker--two">
                2
              </span>
              <span className="staff-map-marker staff-map-marker--active staff-map-marker--three">
                3
              </span>
              <span className="staff-map-marker staff-map-marker--active staff-map-marker--four">
                4
              </span>
              <span className="staff-map-marker staff-map-marker--sensor staff-map-marker--five">
                5
              </span>

              <div className="staff-map-legend">
                <span>
                  <i className="staff-map-legend__critical" />
                  P1 emergency
                </span>
                <span>
                  <i className="staff-map-legend__active" />
                  Active case
                </span>
                <span>
                  <i className="staff-map-legend__sensor" />
                  Sensor report
                </span>
              </div>

              <span className="staff-map-demo-label">
                SCHEMATIC DEMO — NOT LIVE MAP DATA
              </span>
            </div>
          </div>

          <div className="staff-crew-card">
            <header className="staff-panel-header">
              <div>
                <h2>
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    badge
                  </span>
                  On-Duty Field Crew
                </h2>
                <p>Illustrative dispatch capacity</p>
              </div>

              <button
                type="button"
                className="staff-link-button"
                onClick={() =>
                  setNotice(
                    "Crew roster management requires a connected staff/crew service.",
                  )
                }
              >
                Manage Roster
              </button>
            </header>

            <div className="staff-crew-list">
              {crewUnits.map((unit) => (
                <div className="staff-crew-unit" key={unit.id}>
                  <div className="staff-crew-avatar">
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      local_shipping
                    </span>
                  </div>

                  <div className="staff-crew-unit__details">
                    <strong>{unit.name}</strong>
                    <span>{unit.department}</span>
                    <span>
                      {unit.assignedTaskCount} / {unit.taskCapacity} tasks
                    </span>
                  </div>

                  <span
                    className={`staff-crew-status staff-crew-status--${getCrewAvailabilityClass(
                      unit.availability,
                    )}`}
                  >
                    {unit.availability}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="staff-auto-dispatch-button"
              disabled
              title="Automated dispatch optimisation has not been integrated."
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                route
              </span>
              Optimize Auto-Dispatch Schedule
            </button>

            <p className="staff-integration-note">
              Live roster, map and auto-dispatch integration are not
              connected in this frontend demo.
            </p>
          </div>
        </section>

        {/* Manual request form: creates a local demo record only. */}
        {showManualRequest && (
          <div
            className="staff-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowManualRequest(false);
              }
            }}
          >
            <section
              className="staff-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="staff-manual-request-title"
            >
              <header className="staff-modal__header">
                <div>
                  <span className="staff-eyebrow">
                    STAFF OPERATIONS
                  </span>
                  <h2 id="staff-manual-request-title">
                    Log Manual Request
                  </h2>
                </div>

                <button
                  type="button"
                  className="staff-modal__close"
                  onClick={() => setShowManualRequest(false)}
                  aria-label="Close manual request form"
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    close
                  </span>
                </button>
              </header>

              <form
                className="staff-manual-form"
                onSubmit={handleCreateManualRequest}
              >
                <label>
                  Request title
                  <input
                    required
                    maxLength={120}
                    value={manualTitle}
                    onChange={(event) =>
                      setManualTitle(event.target.value)
                    }
                    placeholder="Briefly describe the issue"
                  />
                </label>

                <label>
                  Category
                  <select
                    value={manualCategory}
                    onChange={(event) =>
                      setManualCategory(
                        event.target.value as RequestCategory,
                      )
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Physical location
                  <input
                    required
                    maxLength={160}
                    value={manualLocation}
                    onChange={(event) =>
                      setManualLocation(event.target.value)
                    }
                    placeholder="Street, building or landmark"
                  />
                </label>

                <div className="staff-modal__demo-note">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    info
                  </span>
                  This adds a demonstration record to local page state.
                  It does not create a persisted municipal request.
                </div>

                <footer className="staff-modal__actions">
                  <button
                    type="button"
                    className="staff-button staff-button--secondary"
                    onClick={() => setShowManualRequest(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="staff-button staff-button--primary"
                  >
                    Add Demo Request
                  </button>
                </footer>
              </form>
            </section>
          </div>
        )}
      </div>
    </OperationsShell>
  );
}