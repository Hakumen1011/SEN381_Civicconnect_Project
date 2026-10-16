import { useEffect, useState } from "react";
import { useOptionalAuth } from "../../../auth/AuthContext";
import OperationsShell from "../../../layouts/OperationsShell";
import { apiRequest } from "../../../services/apiClient";
import { getStaffAuditTrail, type BackendStatus, type LiveRequest, type RequestPage, type StaffAuditTrail } from "../../staff/live/staffApi";
import "./LiveRequestRegisterPage.css";

const PAGE_SIZE = 20;
const STATUS_OPTIONS: ReadonlyArray<BackendStatus> = [
  "SUBMITTED", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED", "REJECTED",
];
function label(status: string): string { return status.replaceAll("_", " "); }
function problem(reason: unknown): string { return reason instanceof Error ? reason.message : "Request could not be completed."; }

/** Live, read-only request register. Staff make changes through Staff Triage, not mock local actions. */
export default function LiveRequestRegisterPage() {
  const auth = useOptionalAuth();
  const session = auth?.session;
  const token = session?.user.role === "REQUESTER" ? undefined : session?.token;
  const [status, setStatus] = useState<BackendStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [records, setRecords] = useState<RequestPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audit, setAudit] = useState<StaffAuditTrail | null>(null);
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditError, setAuditError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setError("");
    setRecords(null);
    setAudit(null);
    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (status !== "all") query.set("status", status);
    apiRequest<RequestPage>(`/api/requests?${query.toString()}`, { token })
      .then(response => {
        if (!active) return;
        if (!response || !Array.isArray(response.items) || typeof response.total !== "number" ||
            typeof response.page !== "number" || typeof response.pageSize !== "number") {
          throw new Error("The backend returned an incomplete request register.");
        }
        setRecords(response);
      })
      .catch(reason => { if (active) setError(problem(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, status, page, refreshIndex]);

  async function showHistory(request: LiveRequest) {
    if (!token || auditBusy) return;
    setAudit(null);
    setAuditError("");
    setAuditBusy(true);
    try { setAudit(await getStaffAuditTrail(request.id, token)); }
    catch (reason) { setAuditError(problem(reason)); }
    finally { setAuditBusy(false); }
  }

  if (!token) return <main role="alert"><h1>Access denied</h1><p>Sign in as staff or management to view the request register.</p></main>;

  const visible = (records?.items ?? []).filter(item =>
    [item.reference, item.title, item.location, item.category, item.status]
      .some(value => value.toLowerCase().includes(search.trim().toLowerCase())),
  );
  const totalPages = records ? Math.max(1, Math.ceil(records.total / records.pageSize)) : 1;
  return (
    <OperationsShell activeNavigation="request-management">
      <div className="live-register">
        <header className="live-register__header">
          <div><span className="live-register__eyebrow">CIVICCONNECT / LIVE RECORDS</span>
            <h1>Request Management</h1><p>Browse backend requests and verify their recorded lifecycle history.</p></div>
          <button type="button" onClick={() => setRefreshIndex(value => value + 1)}>Refresh backend data</button>
        </header>
        <p className="live-register__note">This is a read-only live register. To assign or change a request, use Staff Triage. Search matches the currently loaded page only. Data is not durable across backend restarts.</p>
        <div className="live-register__filters">
          <label htmlFor="register-status">Lifecycle status</label>
          <select id="register-status" value={status} onChange={event => { setPage(1); setStatus(event.target.value as BackendStatus | "all"); }}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map(value => <option key={value} value={value}>{label(value)}</option>)}
          </select>
          <label htmlFor="register-search">Search this page</label>
          <input id="register-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Reference, title, category or location" />
        </div>
        {loading && <p role="status">Loading backend request register…</p>}
        {error && <p role="alert" className="live-register__error">Request register unavailable: {error}</p>}
        {records && !loading && !error && <>
          <section className="live-register__summary" aria-label="Live register statistics">
            <article><span>Matching backend requests</span><strong>{records.total}</strong><small>For the selected lifecycle status</small></article>
            <article><span>Records on this page</span><strong>{records.items.length}</strong><small>Server pagination: {records.page} / {totalPages}</small></article>
            <article><span>Overdue on this page</span><strong>{records.items.filter(item => item.overdue).length}</strong><small>Not a system-wide overdue count</small></article>
            <article><span>Unassigned on this page</span><strong>{records.items.filter(item => !item.assigneeId).length}</strong><small>Not a system-wide unassigned count</small></article>
          </section>
          <div className="live-register__table-wrap"><table>
            <thead><tr><th scope="col">Reference</th><th scope="col">Request</th><th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Due</th><th scope="col">History</th></tr></thead>
            <tbody>{visible.map(item => <tr key={item.id}>
              <td><strong>{item.reference}</strong></td><td>{item.title}<small>{item.category} · {item.location}</small></td>
              <td>{item.priority}</td><td>{label(item.status)}</td><td>{new Date(item.dueAt).toLocaleString("en-ZA")}{item.overdue ? <small className="live-register__overdue">Overdue</small> : null}</td>
              <td><button type="button" disabled={auditBusy} onClick={() => void showHistory(item)}>View history</button></td>
            </tr>)}
              {!visible.length && <tr><td colSpan={6}>No matching requests on this page.</td></tr>}
            </tbody>
          </table></div>
          <div className="live-register__pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
            <span>Page {records.page} of {totalPages} · {visible.length} visible here · {records.total} on server</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>Next</button>
          </div>
        </>}
        {auditBusy && <p role="status">Loading request history…</p>}
        {auditError && <p role="alert">Request history unavailable: {auditError}</p>}
        {audit && <section className="live-register__history" aria-label={`Request history ${audit.request.reference}`}>
          <h2>History for {audit.request.reference}</h2>
          {!audit.history.length ? <p>No history entries returned.</p> : <ol>{audit.history.map(event =>
            <li key={event.id}>{event.fromStatus ?? "CREATED"} → {event.toStatus} by {event.changedByName} ({new Date(event.changedAt).toLocaleString("en-ZA")}){event.note ? ` — ${event.note}` : ""}</li>,
          )}</ol>}
        </section>}
      </div>
    </OperationsShell>
  );
}
