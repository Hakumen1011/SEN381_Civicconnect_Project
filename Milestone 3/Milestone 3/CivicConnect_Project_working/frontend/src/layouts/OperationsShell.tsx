import type { ReactNode } from "react";
import TopNavigation, {
  type NavigationId,
} from "../components/navigation/TopNavigation";
import OperationsSidebar from "../components/navigation/OperationsSidebar";
import "./OperationsShell.css";

// Props for the OperationsShell component
interface OperationsShellProps {
  children: ReactNode;
  activeNavigation?: NavigationId;
  onNavigate?: (navigationId: NavigationId) => void;
}
 // OperationsShell component that provides a layout with top navigation, sidebar, and main content area
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