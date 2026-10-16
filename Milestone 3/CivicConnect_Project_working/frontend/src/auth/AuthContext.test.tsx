import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import LoginPage from "./LoginPage";
import { apiRequest } from "../services/apiClient";
vi.mock("../services/apiClient",()=>({ apiRequest: vi.fn() }));

describe("central login and role verification",()=>{
  it("rejects requester credentials in staff mode despite successful password authentication",async()=>{
    vi.mocked(apiRequest).mockResolvedValueOnce({token:"t",user:{id:"id",name:"Resident",email:"resident@example.test",role:"REQUESTER"}});
    render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:"Login as Staff/Management"}));
    fireEvent.change(screen.getByLabelText("Email address"),{target:{value:"resident@example.test"}});
    fireEvent.change(screen.getByLabelText("Password"),{target:{value:"testpassword"}});
    fireEvent.click(screen.getByRole("button",{name:"Sign in"}));
    expect(await screen.findByRole("alert")).toHaveTextContent("not authorised");
    expect(screen.getByRole("heading",{name:"Staff & Management Login"})).toBeInTheDocument();
  });
  it("allows authorised staff authentication",async()=>{
    vi.mocked(apiRequest).mockResolvedValueOnce({token:"t",user:{id:"id",name:"Staffer",email:"staff@example.test",role:"STAFF"}});
    render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:"Login as Staff/Management"}));
    fireEvent.change(screen.getByLabelText("Email address"),{target:{value:"staff@example.test"}});
    fireEvent.change(screen.getByLabelText("Password"),{target:{value:"testpassword"}});
    fireEvent.click(screen.getByRole("button",{name:"Sign in"}));
    await waitFor(()=>expect(screen.queryByRole("heading",{name:"Staff & Management Login"})).not.toBeInTheDocument());
  });
});
