import { useState, type FormEvent } from "react";
import {
  assignToMe,
  changeRequestStatus,
  getStaffAuditTrail,
  listStaffRequests,
  loginStaff,
  statusesStaffMaySet,
  type BackendStatus,
  type LiveRequest,
  type StaffAuditTrail,
  type StaffSession,
} from "./staffApi";

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "The API operation failed.";
}

function statusLabel(status: BackendStatus): string {
  return status.replaceAll("_", " ");
}

/** Authenticated staff view. The original illustrative triage UI remains in Demo mode. */
export default function StaffLiveWorkbench() {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState<LiveRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [choices, setChoices] = useState<Record<string, BackendStatus | "">>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [audit, setAudit] = useState<StaffAuditTrail | null>(null);

  async function load(token: string) {
    const response = await listStaffRequests(token);
    setRequests(response.items);
    setTotal(response.total);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const authenticated = await loginStaff(email, password);
      setSession(authenticated);
      setPassword("");
      try {
        await load(authenticated.token);
        setNotice("Staff session authenticated. Showing live backend requests.");
      } catch (loadError) {
        setError(`Signed in, but requests could not load: ${errorText(loadError)}`);
      }
    } catch (loginError) {
      setError(errorText(loginError));
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!session || loading) return;
    setLoading(true);
    setError("");
    try {
      await load(session.token);
      setNotice("Requests refreshed from the backend.");
    } catch (refreshError) {
      setError(errorText(refreshError));
    } finally {
      setLoading(false);
    }
  }

  async function assign(request: LiveRequest) {
    if (!session || busyId) return;
    setBusyId(request.id);
    setError("");
    try {
      const updated = await assignToMe(request.id, session.token);
      setRequests((previous) => previous.map((item) => item.id === request.id ? updated.request : item));
      setNotice(`${updated.request.reference} assigned by the backend to your staff account.`);
      setAudit(null);
    } catch (assignError) {
      setError(errorText(assignError));
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(request: LiveRequest) {
    if (!session || busyId) return;
    const nextStatus = choices[request.id];
    if (!nextStatus) return;
    setBusyId(request.id);
    setError("");
    try {
      const updated = await changeRequestStatus(
        request,
        nextStatus,
        notes[request.id] ?? "",
        session.token,
      );
      setRequests((previous) => previous.map((item) => item.id === request.id ? updated.request : item));
      setChoices((previous) => ({ ...previous, [request.id]: "" }));
      setNotes((previous) => ({ ...previous, [request.id]: "" }));
      setNotice(`${updated.request.reference} updated to ${statusLabel(updated.request.status)} on the backend.`);
      setAudit(null);
    } catch (statusError) {
      setError(errorText(statusError));
    } finally {
      setBusyId(null);
    }
  }

  async function viewAudit(request: LiveRequest) {
    if (!session || busyId) return;
    setBusyId(request.id);
    setError("");
    try {
      setAudit(await getStaffAuditTrail(request.id, session.token));
    } catch (auditError) {
      setError(errorText(auditError));
    } finally {
      setBusyId(null);
    }
  }

  function signOut() {
    setSession(null);
    setRequests([]);
    setAudit(null);
    setPassword("");
    setNotice("");
    setError("");
  }

  const visible = requests.filter((request) =>
    [request.reference, request.title, request.category, request.location, request.status]
      .some((value) => value.toLowerCase().includes(search.trim().toLowerCase())),
  );

  if (!session) {
    return (
      <section className="staff-workbench" aria-label="Live staff authentication" style={{ padding: "1.5rem" }}>
        <h2>Live Staff Triage — Sign In</h2>
        <p>Use an existing STAFF or MANAGER account. Public requester registration cannot create staff accounts.</p>
        {error && <p role="alert">{error}</p>}
        <form className="staff-manual-form" onSubmit={signIn}>
          <label htmlFor="staffLiveEmail">Staff email</label>
          <input id="staffLiveEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="staffLivePassword">Password</label>
          <input id="staffLivePassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="staff-button staff-button--primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in as staff"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="staff-workbench" aria-label="Live staff operations" style={{ padding: "1.5rem" }}>
      <header className="staff-workbench__header">
        <div>
          <h2>Staff Triage Queue — Live Backend</h2>
          <p>Signed in as {session.user.name} ({session.user.role}). Changes are submitted to Express.</p>
        </div>
        <div className="staff-workbench__actions">
          <button className="staff-button staff-button--secondary" type="button" onClick={refresh} disabled={loading || !!busyId}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="staff-button staff-button--secondary" type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
      <p>Showing {visible.length} matching requests from the first {requests.length} of {total} server results.</p>
      <label htmlFor="staffLiveSearch">Search loaded requests</label>
      <input
        id="staffLiveSearch"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Case reference, title, location or status"
      />

      <div className="staff-table-wrapper">
        <table className="staff-request-table">
          <thead>
            <tr><th>Reference</th><th>Incident</th><th>Status</th><th>Priority / due</th><th>Staff action</th></tr>
          </thead>
          <tbody>
            {visible.map((request) => {
              const allowed = statusesStaffMaySet(request, session);
              const canSelfAssign =
                (session.user.role === "STAFF" || session.user.role === "MANAGER") &&
                (request.assigneeId === null || request.assigneeId === session.user.id) &&
                request.status === "SUBMITTED";
              return (
                <tr key={request.id}>
                  <td><strong>{request.reference}</strong></td>
                  <td><strong>{request.title}</strong><p>{request.category} — {request.location}</p></td>
                  <td>{statusLabel(request.status)}</td>
                  <td>{request.priority}<p>Due: {new Date(request.dueAt).toLocaleString("en-ZA")}</p></td>
                  <td>
                    {canSelfAssign && (
                      <button type="button" className="staff-button staff-button--secondary" disabled={!!busyId}
                        onClick={() => assign(request)} aria-label={`Assign ${request.reference} to me`}>
                        Assign to me
                      </button>
                    )}
                    {allowed.length > 0 && (
                      <div>
                        <label htmlFor={`staff-next-${request.id}`}>Next status for {request.reference}</label>
                        <select
                          id={`staff-next-${request.id}`}
                          value={choices[request.id] ?? ""}
                          onChange={(e) => setChoices((previous) => ({ ...previous, [request.id]: e.target.value as BackendStatus | "" }))}
                        >
                          <option value="">Choose status</option>
                          {allowed.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                        </select>
                        <label htmlFor={`staff-note-${request.id}`}>Action note (required for hold, resolve, reject)</label>
                        <input
                          id={`staff-note-${request.id}`}
                          value={notes[request.id] ?? ""}
                          onChange={(e) => setNotes((previous) => ({ ...previous, [request.id]: e.target.value }))}
                        />
                        <button type="button" className="staff-button staff-button--primary"
                          disabled={!!busyId || !choices[request.id]}
                          onClick={() => changeStatus(request)} aria-label={`Update status for ${request.reference}`}>
                          Update status
                        </button>
                      </div>
                    )}
                    <button type="button" className="staff-button staff-button--secondary" disabled={!!busyId}
                      onClick={() => viewAudit(request)} aria-label={`View history for ${request.reference}`}>
                      View history
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && <tr><td colSpan={5}>No matching backend requests.</td></tr>}
          </tbody>
        </table>
      </div>

      {audit && (
        <section aria-label={`Audit trail for ${audit.request.reference}`}>
          <h3>Backend audit trail — {audit.request.reference}</h3>
          <ol>
            {audit.history.map((entry) => (
              <li key={entry.id}>
                {entry.fromStatus ?? "CREATED"} → {entry.toStatus} by {entry.changedByName}
                {entry.note ? ` — ${entry.note}` : ""}
              </li>
            ))}
          </ol>
          {audit.actions.length > 0 && (
            <ul>{audit.actions.map((action) => <li key={action.id}>{action.authorName}: {action.body}</li>)}</ul>
          )}
        </section>
      )}
    </section>
  );
}
