import { Link, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import LiveStaffTriagePage from "../features/staff/pages/LiveStaffTriagePage";
import LiveRequestRegisterPage from "../features/request-management/pages/LiveRequestRegisterPage";
import ManagementPerformancePage from "../features/management/pages/ManagementPerformancePage";
import RequesterPortal from "../features/requester/RequesterPortal";
import LoginPage from "../auth/LoginPage";
import { useAuth } from "../auth/AuthContext";
import { homeForRole, mayAccess } from "../auth/roles";

function PrivatePage({ path, children }: { path: string; children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (!mayAccess(session.user.role, path)) {
    return <main style={{ padding: "3rem", maxWidth: "42rem" }} role="alert"><h1>Access denied</h1><p>Your account does not have permission to view this page.</p><Link to={homeForRole(session.user.role)}>Go to my dashboard</Link></main>;
  }
  return <>{children}</>;
}

function Home() {
  const { session } = useAuth();
  return <Navigate to={session ? homeForRole(session.user.role) : "/login"} replace />;
}

function NotFoundPage() {
  const { session } = useAuth();
  return <main style={{padding: "3rem"}}><h1>Page not found</h1><Link to={session ? homeForRole(session.user.role) : "/login"}>Return to {session ? "my dashboard" : "login"}</Link></main>;
}

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/requester-self-service" element={<PrivatePage path="/requester-self-service"><RequesterPortal /></PrivatePage>} />
    <Route path="/staff-triage" element={<PrivatePage path="/staff-triage"><LiveStaffTriagePage /></PrivatePage>} />
    <Route path="/request-management" element={<PrivatePage path="/request-management"><LiveRequestRegisterPage /></PrivatePage>} />
    <Route path="/management" element={<PrivatePage path="/management"><ManagementPerformancePage /></PrivatePage>} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
