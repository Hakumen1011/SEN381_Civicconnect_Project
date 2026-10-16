
import { useMemo, useState } from "react";

import OperationsShell from "../../../layouts/OperationsShell";

import { mockManagementRequests } from "../managementData";

import {
  calculateSummary,
  filterManagementRequests,
  getDepartmentPerformance,
  getStatusCounts,
  isOverdue,
  type ManagementRequestStatus,
} from "../managementMetrics";

import "./ManagementPerformancePage.css";

const statuses: ManagementRequestStatus[] = [
  "Submitted",
  "In Triage",
  "In Progress",
  "Pending Verification",
  "Resolved",
  "Closed",
];

/**
 * Management & Analytics dashboard.
 *
 * All metrics derive from the currently filtered dataset.
 * Real reporting data will come from backend services.
 */
export default function ManagementPerformancePage() {
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");

  const departments = useMemo(
    () =>
      [...new Set(
        mockManagementRequests.map(
          (request) => request.department,
        ),
      )].sort(),
    [],
  );

  const filteredRequests = useMemo(
    () =>
      filterManagementRequests(
        mockManagementRequests,
        department,
        status,
      ),
    [department, status],
  );

  const summary = useMemo(
    () => calculateSummary(filteredRequests),
    [filteredRequests],
  );

  const statusCounts = useMemo(
    () => getStatusCounts(filteredRequests),
    [filteredRequests],
  );

  const departmentPerformance = useMemo(
    () => getDepartmentPerformance(filteredRequests),
    [filteredRequests],
  );

  const maximumDepartmentVolume = Math.max(
    1,
    ...departmentPerformance.map((item) => item.total),
  );

  return (
    
    <OperationsShell activeNavigation="management-analytics">
      <main className="management-page">
        <header className="management-page__header">
          <div>
            <span className="management-page__eyebrow">
              CIVICCONNECT / MANAGEMENT OVERSIGHT
            </span>

            <h1>Management &amp; Analytics</h1>

            <p>
              Review request volumes, SLA performance and
              operational workload across departments.
            </p>
          </div>

          <span className="management-page__demo-label">
            Demonstration data
          </span>
        </header>

        <section
          className="management-panel management-filters"
          aria-label="Dashboard filters"
        >
          <div>
            <label htmlFor="management-department">
              Department
            </label>

            <select
              id="management-department"
              value={department}
              onChange={(event) =>
                setDepartment(event.target.value)
              }
            >
              <option value="all">All departments</option>

              {departments.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="management-status">
              Request status
            </label>

            <select
              id="management-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="all">All statuses</option>

              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setDepartment("all");
              setStatus("all");
            }}
          >
            Clear filters
          </button>
        </section>

        <div className="management-page__notice" role="note">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            info
          </span>

          These figures are calculated from fictional sample
          requests. They are not live municipal performance
          statistics. SLA values use a provisional calculation
          until the approved backend reporting rules are
          implemented.
        </div>

        <section
          className="management-stats"
          aria-label="Management summary statistics"
        >
          <article className="management-stat">
            <span>Total Requests</span>
            <strong>{summary.total}</strong>
            <small>Matching current filters</small>
          </article>

          <article className="management-stat">
            <span>Open Requests</span>
            <strong>{summary.open}</strong>
            <small>Not resolved or closed</small>
          </article>

          <article className="management-stat">
            <span>Completed Requests</span>
            <strong>{summary.completed}</strong>
            <small>Resolved or closed</small>
          </article>

          <article className="management-stat management-stat--warning">
            <span>Overdue Requests</span>
            <strong>{summary.overdue}</strong>
            <small>Open requests beyond SLA target</small>
          </article>

          <article className="management-stat">
            <span>SLA Compliance</span>
            <strong>
              {summary.slaCompliancePercent === null
                ? "N/A"
                : `${summary.slaCompliancePercent}%`}
            </strong>
            <small>Demo calculation · valid SLA records</small>
          </article>
        </section>

        <div className="management-page__insights">
          <section className="management-panel">
            <div className="management-panel__heading">
              <div>
                <h2>Request Status Breakdown</h2>
                <p>
                  Distribution of requests by lifecycle status.
                </p>
              </div>
            </div>

            <div className="management-status-list">
              {statuses.map((item) => {
                const count = statusCounts[item];
                const percentage =
                  summary.total === 0
                    ? 0
                    : (count / summary.total) * 100;

                return (
                  <div
                    className="management-status-row"
                    key={item}
                  >
                    <div className="management-status-row__label">
                      <span>{item}</span>
                      <strong>{count}</strong>
                    </div>

                    <div className="management-bar">
                      <div
                        className="management-bar__fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="management-panel">
            <div className="management-panel__heading">
              <div>
                <h2>Department Workload</h2>
                <p>
                  Request volumes by operational department.
                </p>
              </div>
            </div>

            {departmentPerformance.length === 0 ? (
              <p className="management-empty">
                No requests match the current filters.
              </p>
            ) : (
              <div className="management-departments">
                {departmentPerformance.map((item) => (
                  <div
                    className="management-department-row"
                    key={item.department}
                  >
                    <div className="management-status-row__label">
                      <span>{item.department}</span>
                      <strong>{item.total}</strong>
                    </div>

                    <div className="management-bar">
                      <div
                        className="management-bar__fill"
                        style={{
                          width: `${
                            (item.total /
                              maximumDepartmentVolume) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <small>
                      {item.open} open · {item.completed} completed
                      · {item.overdue} overdue
                    </small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="management-panel">
          <div className="management-panel__heading">
            <div>
              <h2>Operational Request Register</h2>
              <p>
                Inspect the individual cases behind the
                dashboard calculations.
              </p>
            </div>

            <span className="management-page__count">
              {filteredRequests.length} records
            </span>
          </div>

          <div className="management-table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  <th scope="col">Case Reference</th>
                  <th scope="col">Department</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Status</th>
                  <th scope="col">SLA</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="management-table__empty"
                    >
                      No matching requests.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.id}</strong>
                      </td>
                      <td>{request.department}</td>
                      <td>{request.priority}</td>
                      <td>{request.status}</td>
                      <td>
                        {isOverdue(request)
                          ? "Overdue"
                          : "Within target"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </OperationsShell>
  );
}
