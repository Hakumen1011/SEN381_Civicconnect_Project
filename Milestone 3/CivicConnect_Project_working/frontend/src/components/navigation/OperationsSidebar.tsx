import type { MouseEvent } from "react";
import type { NavigationId } from "./TopNavigation";
import "./OperationsSidebar.css";

interface OperationsSidebarProps {
  activeNavigation?: NavigationId;
  onNavigate?: (navigationId: NavigationId) => void;
}

const sidebarItems: Array<{
  id: NavigationId;
  label: string;
  icon: string;
  badge?: string;
}> = [
  {
    id: "staff-triage",
    label: "Triage Inbox",
    icon: "inbox",
    badge: "18",
  },
  {
    id: "request-management",
    label: "All Work Orders",
    icon: "assignment",
  },
  {
    id: "request-management",
    label: "Field Crew Units",
    icon: "local_shipping",
  },
  {
    id: "management-analytics",
    label: "SLA Compliance",
    icon: "bar_chart",
  },
  {
    id: "requester-self-service",
    label: "Citizen Portal Feed",
    icon: "public",
  },
];

export default function OperationsSidebar({
  activeNavigation = "requester-self-service",
  onNavigate,
}: OperationsSidebarProps) {
  const handleNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    navigationId: NavigationId,
  ) => {
    event.preventDefault();

    onNavigate?.(navigationId);
  };

  return (
    <aside className="operations-sidebar">
      <div className="operations-sidebar__main">
        <div className="operations-sidebar__heading">
          Operations Dispatch
        </div>

        <nav aria-label="Operations navigation">
          {sidebarItems.map((item, index) => {
            const isActive =
              item.id === activeNavigation &&
              item.label === "Citizen Portal Feed";

            return (
              <a
                key={`${item.label}-${index}`}
                href="#"
                className={`operations-sidebar__link ${
                  isActive ? "is-active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) =>
                  handleNavigation(event, item.id)
                }
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {item.badge && (
                  <span className="operations-sidebar__badge">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="operations-sidebar__footer">
        <div className="operations-sidebar__station">
          Station Node: SEC-04-NORTH
        </div>

        <button
          type="button"
          className="operations-sidebar__audit-button"
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            shield
          </span>

          <span>Security &amp; Audit</span>
        </button>
      </div>
    </aside>
  );
}