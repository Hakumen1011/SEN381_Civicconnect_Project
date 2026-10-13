import type { ReactNode } from "react";
import TopNavigation, {
  type NavigationId,
} from "../components/navigation/TopNavigation";
import OperationsSidebar from "../components/navigation/OperationsSidebar";
import "./OperationsShell.css";

interface OperationsShellProps {
  children: ReactNode;
  activeNavigation?: NavigationId;
  onNavigate?: (navigationId: NavigationId) => void;
}

export default function OperationsShell({
  children,
  activeNavigation = "requester-self-service",
  onNavigate,
}: OperationsShellProps) {
  return (
    <div className="operations-shell">
      <TopNavigation
        activeNavigation={activeNavigation}
        onNavigate={onNavigate}
      />

      <OperationsSidebar
        activeNavigation={activeNavigation}
        onNavigate={onNavigate}
      />

      <main id="main-content" className="operations-main">
        {children}
      </main>
    </div>
  );
}