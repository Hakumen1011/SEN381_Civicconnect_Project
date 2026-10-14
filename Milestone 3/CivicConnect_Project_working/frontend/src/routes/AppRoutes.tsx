
/**
 * CivicConnect — Application Routes
 *
 * SEN381 Milestone 3:
 * Integrates the confirmed frontend page components.
 *
 * Requester Self-Service remains a clearly identified
 * integration gap until its page component is available.
 */

import { Link, Navigate, Route, Routes } from "react-router-dom";

import StaffTriagePage from "../features/staff/pages/StaffTriagePage";
import RequestManagementLifecyclePage from "../features/request-management/pages/RequestManagementLifecyclePage";
import ManagementPerformancePage from "../features/management/pages/ManagementPerformancePage";
import RequesterPortal from "../features/requester/RequesterPortal";

import OperationsShell from "../layouts/OperationsShell";

/**
 * Temporary destination.
 *
 * This makes the navigation route explicit without
 * pretending an unintegrated requester workflow is working.
 */
function RequesterIntegrationPending() {
  return (
    <OperationsShell activeNavigation="requester-self-service">
      <section
        aria-labelledby="requester-pending-title"
        style={{ padding: "2rem", maxWidth: "48rem" }}
      >
        <h1 id="requester-pending-title">
          Requester Self-Service
        </h1>

        <p>
          The Requester Self-Service page is awaiting
          integration with the current application branch.
        </p>

        <p>
          This is a temporary integration screen, not
          the completed requester workflow.
        </p>

        <Link to="/request-management">
          Return to Request Management
        </Link>
      </section>
    </OperationsShell>
  );
}

/**
 * Fallback for invalid URLs.
 */
function NotFoundPage() {
  return (
    <main
      style={{
        maxWidth: "40rem",
        margin: "4rem auto",
        padding: "1.5rem",
      }}
    >
      <h1>Page not found</h1>

      <p>
        The requested CivicConnect page does not exist.
      </p>

      <Link to="/request-management">
        Return to Request Management
      </Link>
    </main>
  );
}

/**
 * BrowserRouter or MemoryRouter must be mounted
 * above this component.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to="/request-management" replace />
        }
      />

      <Route
        path="/staff-triage"
        element={<StaffTriagePage />}
      />

      <Route
        path="/request-management"
        element={<RequestManagementLifecyclePage />}
      />

      <Route
         path="/requester-self-service"
         element={<RequesterPortal />}
      />

      <Route
        path="/management"
        element={<ManagementPerformancePage />}
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}
