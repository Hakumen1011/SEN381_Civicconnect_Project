import { useEffect, useState } from "react";
import { useOptionalAuth } from "../../../auth/AuthContext";
import OperationsShell from "../../../layouts/OperationsShell";
import {
  describeServiceLevel, getManagementRequests, getManagementSummary,
  MANAGEMENT_STATUSES, STATUS_LABELS,
  type ManagementSummaryResponse,
} from "../managementApi";
import type { BackendStatus, RequestPage } from "../../staff/live/staffApi";
import "./ManagementPerformancePage.css";

/** Live reporting based solely on authenticated Express management endpoints. */
export default function ManagementPerformancePage() {
  const auth = useOptionalAuth();
  const session = auth?.session;
  const authorised = session?.user.role === "MANAGER" || session?.user.role === "ADMIN";
  const token = authorised ? session?.token : undefined;
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [summary, setSummary] = useState<ManagementSummaryResponse | null>(null);
  const [register, setRegister] = useState<RequestPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSummary(null);
    setRegister(null);
    Promise.all([
      getManagementSummary(token, controller.signal),
      getManagementRequests(token, { category, status, page }, controller.signal),
    ]).then(([freshSummary, freshRegister]) => {
      if (controller.signal.aborted) return;
      setSummary(freshSummary);
      setRegister(freshRegister);
    }).catch((reason: unknown) => {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : "Unable to load management reports.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [token, category, status, page, reload]);

  if (!authorised) {
    return <main className="management-page" role="alert"><h1>Access denied</h1><p>Sign in with an authorised manager or administrator account to view management reporting.</p></main>;
  }

  const categories = summary?.byCategory ?? [];
  const populatedCategories = categories.filter((entry) => entry.total > 0);
  const maxCategoryVolume = Math.max(1, ...populatedCategories.map((entry) => entry.total));
  const fullTotal = summary?.totals.all ?? 0;
  const showResults = Boolean(summary && register && !loading && !error);
  const totalPages = register ? Math.max(1, Math.ceil(register.total / register.pageSize)) : 1;

  return (
    <OperationsShell activeNavigation="management-analytics">
      <main className="management-page">
        <header className="management-page__header">
          <div>
            <span className="management-page__eyebrow">CIVICCONNECT / MANAGEMENT OVERSIGHT</span>
            <h1>Management &amp; Analytics</h1>
            <p>Live municipal service requests, lifecycle status and category-level workload.</p>
          </div>
          <span className="management-page__demo-label">Live backend reporting</span>
        </header>

        <div className="management-page__notice" role="note">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          <span>
            Summary and charts cover all requests in the current backend. Filters apply only to the request register below.
            {summary ? ` Report generated: ${new Date(summary.generatedAt).toLocaleString()}.` : ""}
            {" "}Records are held in memory until persistent storage is implemented.
          </span>
        </div>

        <section className="management-panel management-filters" aria-label="Dashboard filters">
          <div>
            <label htmlFor="management-category">Service category</label>
            <select id="management-category" value={category} disabled={!showResults}
              onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
              <option value="all">All service categories</option>
              {categories.map((item) => <option key={item.category} value={item.category}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="management-status">Request status</label>
            <select id="management-status" value={status} disabled={!showResults}
              onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              {MANAGEMENT_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
            </select>
          </div>
          <button type="button" disabled={!showResults}
            onClick={() => { setCategory("all"); setStatus("all"); setPage(1); }}>
            Clear filters
          </button>
          <button type="button" onClick={() => setReload((value) => value + 1)}>
            Refresh live data
          </button>
        </section>

        {loading && <p role="status" className="management-page__notice">Loading management data…</p>}
        {error && <div role="alert" className="management-page__error">
          <strong>Management reporting unavailable.</strong> {error}
          <button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button>
        </div>}
        {showResults && summary && register && <>
          <section className="management-stats" aria-label="Management summary statistics">
            <article className="management-stat"><span>Total Requests</span><strong>{summary.totals.all}</strong><small>All backend records</small></article>
            <article className="management-stat"><span>Open Requests</span><strong>{summary.totals.open}</strong><small>Submitted, assigned, in progress or on hold</small></article>
            <article className="management-stat"><span>Resolved / Closed</span><strong>{summary.totals.resolved + summary.totals.closed}</strong><small>Excludes rejected requests ({summary.totals.rejected})</small></article>
            <article className="management-stat management-stat--warning"><span>Overdue Requests</span><strong>{summary.totals.overdue}</strong><small>Open requests past their priority-based due date</small></article>
            <article className="management-stat"><span>Average Resolution</span><strong>{summary.averageResolutionHours === null ? "N/A" : `${summary.averageResolutionHours} h`}</strong><small>Submission to first resolution; N/A if none resolved</small></article>
          </section>

          <div className="management-page__insights">
            <section className="management-panel">
              <div className="management-panel__heading"><div><h2>Request Status Breakdown</h2><p>Counts for all backend records.</p></div></div>
              <div className="management-status-list">
                {MANAGEMENT_STATUSES.map((value: BackendStatus) => {
                  const count = summary.byStatus[value] ?? 0;
                  const percent = fullTotal ? (count / fullTotal) * 100 : 0;
                  return <div className="management-status-row" key={value}>
                    <div className="management-status-row__label"><span>{STATUS_LABELS[value]}</span><strong>{count}</strong></div>
                    <div className="management-bar"><div className="management-bar__fill" style={{ width: `${percent}%` }} /></div>
                  </div>;
                })}
              </div>
            </section>
            <section className="management-panel">
              <div className="management-panel__heading"><div><h2>Service Category Workload</h2><p>Backend categories; not inferred departmental assignments.</p></div></div>
              {populatedCategories.length === 0 ? <p className="management-empty">No service requests yet.</p> :
                <div className="management-departments">{populatedCategories.map((item) =>
                  <div className="management-department-row" key={item.category}>
                    <div className="management-status-row__label"><span>{item.label}</span><strong>{item.total}</strong></div>
                    <div className="management-bar"><div className="management-bar__fill" style={{ width: `${(item.total / maxCategoryVolume) * 100}%` }} /></div>
                    <small>{item.open} open · {item.overdue} overdue</small>
                  </div>,
                )}</div>}
            </section>
          </div>

          <section className="management-panel">
            <div className="management-panel__heading">
              <div><h2>Operational Request Register</h2><p>Filtered and paginated by the management API.</p></div>
              <span className="management-page__count">{register.total} matching records · page {register.page} of {totalPages}</span>
            </div>
            <div className="management-table-wrap"><table className="management-table">
              <thead><tr><th scope="col">Case Reference</th><th scope="col">Service Category</th><th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Due date status</th></tr></thead>
              <tbody>{register.items.length ? register.items.map((request) =>
                <tr key={request.id}><td><strong>{request.reference}</strong></td>
                  <td>{categories.find((item) => item.category === request.category)?.label ?? request.category}</td>
                  <td>{request.priority}</td><td>{STATUS_LABELS[request.status]}</td><td>{describeServiceLevel(request)}</td></tr>,
              ) : <tr><td colSpan={5} className="management-table__empty">No matching requests.</td></tr>}</tbody>
            </table></div>
            <div className="management-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous page</button>
              <span>Showing {register.items.length} on this page of {register.total} matching records</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next page</button>
            </div>
          </section>
        </>}
      </main>
    </OperationsShell>
  );
}
