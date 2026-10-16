import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import type { Role, Session } from "../auth/roles";
import AppRoutes from "./AppRoutes";

vi.mock("../features/staff/pages/LiveStaffTriagePage", () => ({ default: () => <h1>Staff Triage Test Page</h1> }));
vi.mock("../features/request-management/pages/LiveRequestRegisterPage", () => ({ default: () => <h1>Request Management Test Page</h1> }));
vi.mock("../features/management/pages/ManagementPerformancePage", () => ({ default: () => <h1>Management Analytics Test Page</h1> }));
vi.mock("../features/requester/RequesterPortal", () => ({ default: () => <h1>Requester Portal Test Page</h1> }));

function RouteProbe(){ const { pathname } = useLocation(); return <output data-testid="current-route">{pathname}</output>; }
const withRole = (role: Role): Session => ({token: "isolated-test-token",user:{id:"test-user", name:"Test User", email:"test@example.test",role}});
function renderRoute(path: string, role?: Role){
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider initialSession={role ? withRole(role) : null}><AppRoutes /><RouteProbe /></AuthProvider></MemoryRouter>);
}

describe("CivicConnect protected application routing",()=>{
  it("shows the login screen at the root without a session",()=>{ renderRoute("/"); expect(screen.getByRole("heading",{name:"Requester Login"})).toBeInTheDocument(); expect(screen.getByTestId("current-route")).toHaveTextContent("/login"); });
  it("redirects unauthenticated direct access to login",()=>{ renderRoute("/management"); expect(screen.getByTestId("current-route")).toHaveTextContent("/login"); });
  it("sends requesters to their own portal",()=>{ renderRoute("/","REQUESTER"); expect(screen.getByTestId("current-route")).toHaveTextContent("/requester-self-service"); });
  it("sends staff to triage",()=>{ renderRoute("/","STAFF"); expect(screen.getByTestId("current-route")).toHaveTextContent("/staff-triage"); });
  it("sends managers to analytics",()=>{ renderRoute("/","MANAGER"); expect(screen.getByTestId("current-route")).toHaveTextContent("/management"); });
  it("rejects requester navigation to management",()=>{ renderRoute("/management","REQUESTER"); expect(screen.getByRole("heading",{name:"Access denied"})).toBeInTheDocument(); expect(screen.queryByText("Management Analytics Test Page")).not.toBeInTheDocument(); });
  it("rejects staff navigation to management",()=>{ renderRoute("/management","STAFF"); expect(screen.getByRole("heading",{name:"Access denied"})).toBeInTheDocument(); });
  it("rejects staff navigation to requester portal",()=>{ renderRoute("/requester-self-service","STAFF"); expect(screen.getByRole("heading",{name:"Access denied"})).toBeInTheDocument(); });
  it("allows manager to access management",()=>{ renderRoute("/management","MANAGER"); expect(screen.getByRole("heading",{name:"Management Analytics Test Page"})).toBeInTheDocument(); });
  it("allows admin to access management",()=>{ renderRoute("/management","ADMIN"); expect(screen.getByRole("heading",{name:"Management Analytics Test Page"})).toBeInTheDocument(); });
  it("allows staff triage to staff",()=>{ renderRoute("/staff-triage","STAFF"); expect(screen.getByRole("heading",{name:"Staff Triage Test Page"})).toBeInTheDocument(); });
  it("preserves helpful fallback on unknown URLs",()=>{ renderRoute("/invalid-civicconnect-url","STAFF"); expect(screen.getByRole("heading",{name:"Page not found"})).toBeInTheDocument(); });
});
