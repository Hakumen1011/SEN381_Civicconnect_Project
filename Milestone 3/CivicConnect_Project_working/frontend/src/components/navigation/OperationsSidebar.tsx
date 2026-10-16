import type { MouseEvent } from "react";
import { useOptionalAuth } from "../../auth/AuthContext";
import { NAVIGATION, navigationForRole, type NavigationId } from "../../auth/roles";
import "./OperationsSidebar.css";
import RouteAnchor from "./RouteAnchor";

interface OperationsSidebarProps { activeNavigation?: NavigationId; onNavigate?: (navigationId: NavigationId) => void; }

export default function OperationsSidebar({ activeNavigation = "requester-self-service", onNavigate }: OperationsSidebarProps) {
  const auth = useOptionalAuth();
  const entries = auth ? (auth.session ? navigationForRole(auth.session.user.role) : []) : NAVIGATION;
  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, navigationId: NavigationId) {
    if (onNavigate) { event.preventDefault(); onNavigate(navigationId); }
  }
  return <aside className="operations-sidebar">
    <div className="operations-sidebar__main"><div className="operations-sidebar__heading">{auth?.session?.user.role === "REQUESTER" ? "My Requests" : "Operations Dispatch"}</div>
      <nav aria-label="Operations navigation">
        {entries.map(entry => <RouteAnchor key={entry.id} href={entry.path} className={`operations-sidebar__link ${activeNavigation === entry.id ? "is-active" : ""}`} current={activeNavigation === entry.id ? "page" : undefined} onClick={e => handleNavigation(e,entry.id)}><span className="material-symbols-outlined" aria-hidden="true">{entry.icon}</span><span>{entry.sidebarLabel}</span></RouteAnchor>)}
      </nav>
    </div>
    <div className="operations-sidebar__footer"><div className="operations-sidebar__station">{auth?.session ? `Account role: ${auth.session.user.role}` : "Access controlled by account role"}</div></div>
  </aside>;
}
