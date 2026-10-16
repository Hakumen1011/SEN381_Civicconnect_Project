import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { mayAccess, navigationForRole, type Role, type Session } from "./roles";
import OperationsSidebar from "../components/navigation/OperationsSidebar";
import TopNavigation from "../components/navigation/TopNavigation";

const sessionFor = (role: Role): Session => ({token:"test-token",user:{id:"test-id",name:"Verified Tester",email:"test@example.test",role}});

describe("role-based navigation",()=>{
  it("limits requester tabs to their own service portal",()=>{
    render(<AuthProvider initialSession={sessionFor("REQUESTER")}><TopNavigation /><OperationsSidebar /></AuthProvider>);
    expect(screen.getByRole("link",{name:"Requester Self-Service"})).toBeInTheDocument();
    expect(screen.queryByRole("link",{name:"Management & Analytics"})).not.toBeInTheDocument();
    expect(screen.queryByRole("link",{name:"Staff Triage Queue"})).not.toBeInTheDocument();
    expect(screen.queryByText("Eleanor Vance")).not.toBeInTheDocument();
    expect(screen.getByText("Verified Tester")).toBeInTheDocument();
  });
  it("does not show management to staff, but does to manager",()=>{
    const staffLinks = navigationForRole("STAFF").map(x=>x.path);
    const managerLinks = navigationForRole("MANAGER").map(x=>x.path);
    expect(staffLinks).toContain("/staff-triage");
    expect(staffLinks).not.toContain("/management");
    expect(managerLinks).toContain("/management");
  });
  it("keeps the route inside React Router when navigating between staff screens",()=>{
    function Path() { const {pathname} = useLocation(); return <output data-testid="path">{pathname}</output>; }
    render(<MemoryRouter initialEntries={["/staff-triage"]}><AuthProvider initialSession={sessionFor("STAFF")}><OperationsSidebar /><Path /></AuthProvider></MemoryRouter>);
    fireEvent.click(screen.getByRole("link", {name:"Live Request Register"}));
    expect(screen.getByTestId("path")).toHaveTextContent("/request-management");
  });
  it("denies requester role access to operations",()=>{
    expect(mayAccess("REQUESTER","/staff-triage")).toBe(false);
    expect(mayAccess("REQUESTER","/management")).toBe(false);
  });
});
