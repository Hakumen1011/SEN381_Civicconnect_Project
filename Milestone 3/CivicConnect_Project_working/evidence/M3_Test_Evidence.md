### TC-UT-001 — Valid lifecycle transition

Test Basis:
FR-STF-007 / AC-STF-007-A

Purpose:
Verify that a permitted lifecycle transition is accepted.

Level / Technique:
Unit test + State Transition technique

Precondition:
Request lifecycle state = Submitted

Input:
Requested next state = Triaged

Expected Result:
Transition is permitted.

Automated Test:
requestManagementTypes.test.ts

Actual Result:
To be recorded after execution.

Status:
Pending execution evidence

Interpretation:
Demonstrates that the frontend domain rule recognises the approved
Submitted → Triaged transition. Does not prove that the backend API
enforces the same rule.

### TC-RM-001 - Full Request Details
Field	Evidence
Test ID	TC-RM-001
Requirement	FR-STF-005 — View full request details
Initial result	Failed — ambiguous text query
Cause	Two legitimate elements contained the same subcategory text
Correction	Changed the test to use an exact text match
Final result	Pending rerun
Application defect?	No — test selector issue

### Tests So far:
Test area	Tests	Last reported result
Navigation	3	Passed
Lifecycle transition rules	5	Passed
Request Management page	3	2 passed, 1 failed
Total	11	10 passed, 1 failed


# CivicConnect — Milestone 3 Test Evidence

**Project:** CivicConnect  
**Module:** SEN381 — Software Engineering 381  
**Milestone:** M3 — Controlled Construction, Integration, Quality & Release Readiness  
**Evidence status:** In Progress  
**Latest execution date:** 2026-10-12  
**Environment:** Local development/test environment — Windows, React 19, TypeScript 7, Vite 8.3.3, Vitest 5.0.4  
**Evidence owner:** Frontend Development  
**Repository branch:** Milestone_3_start (verify branch before linking evidence)  
**Release candidate identifier:** Pending team release baseline

---

## 1. Purpose

This document records verification activities, test results, limitations, and supporting evidence for the CivicConnect M3 implementation.

The objective is to demonstrate that implemented requirements are verified through meaningful, reproducible tests.

This document supplements the existing Requirements Traceability Matrix (RTM), PED, and project registers. It does not replace them.

Test results will be updated throughout development rather than reconstructed at submission time.

---

## 2. M3 Verification Requirements

The milestone requires the following minimum evidence:

| Verification Area | M3 Minimum | Current Evidence | Status |
|---|---:|---|---|
| Unit/component tests | 5 | 16 frontend tests executed across four files | Partially evidenced; meaningful cases must be selected and traced |
| Black-box functional tests | 5 | Frontend behavioural and business-rule cases available | Formal technique/evidence mapping in progress |
| API/integration tests | 3 | 0 executed | Pending backend integration |
| E2E/system tests | 2 | 0 executed | Pending integrated application |
| Negative/failure/unauthorised cases | 3 | Frontend negative cases implemented | Backend negative verification pending |
| High-priority requirement/risk cases | 5 | Lifecycle, assignment, details and information-separation cases available | RTM mapping in progress |
| Black-box design techniques | 2 | State Transition and Equivalence Partitioning | Implemented in frontend tests; evidence interpretation ongoing |
| Performance/load scenario | 1 | 0 executed | Pending |
| Static/code-quality check | 1 | TypeScript build checks implemented | Additional static analysis to be evaluated |
| Security/dependency/secrets check | 1 | Not yet evidenced | Pending |
| CI quality gate | 1 functioning workflow | Not yet evidenced | Pending |
| Staging/test environment | 1 real or simulated | Local development environment exists | Separate staging configuration pending |

Important: Automated test quantity alone does not establish M3 compliance.

A meaningful test must have a requirement, acceptance criterion, business rule, risk or defect basis, a deliberately chosen input, a defined expected result, meaningful assertions, execution evidence and interpretation.

---

## 3. Latest Automated Test Execution

### 3.1 Execution Information

**Execution ID:** EXEC-M3-FE-20261012-001  
**Date:** 2026-10-12  
**Reported start time:** 17:57:23  
**Execution environment:** GitHub-tracked CivicConnect frontend folder  
**Command:** `npm run test:run`  
**Test runner:** Vitest 5.0.4

### 3.2 Observed Results

| Test File | Tests Executed | Passed | Failed | Result |
|---|---:|---:|---:|---|
| `src/features/request-management/requestManagementTypes.test.ts` | 5 | 5 | 0 | PASS |
| `src/features/request-management/components/requestAssignment.test.ts` | 5 | 5 | 0 | PASS |
| `src/components/navigation/TopNavigation.test.tsx` | 3 | 3 | 0 | PASS |
| `src/features/request-management/pages/RequestManagementLifecyclePage.test.tsx` | 3 | 3 | 0 | PASS |
| **TOTAL** | **16** | **16** | **0** | **PASS** |

**Execution duration:** 1.44 seconds

### 3.3 Interpretation

The frontend test suite completed successfully.

The results demonstrate that the tested navigation, lifecycle-validation, assignment-validation and Request Management presentation behaviours satisfy their implemented test assertions under the supplied demonstration data.

The results do not demonstrate:

- Successful backend API integration.
- Database persistence of assignment or lifecycle changes.
- Server-side authorisation.
- Persistence or integrity of audit records.
- Full requester-to-staff E2E journeys.
- Production-scale performance.
- Overall release readiness.

---

## 4. Production Build Verification

**Execution ID:** BUILD-M3-FE-20261012-001  
**Date:** 2026-10-12  
**Command:** `npm run build`

The frontend build command invokes:

1. `tsc -b` — TypeScript project build/type checking.
2. `vite build` — Production frontend asset generation.

### Observed Build Output

| Measure | Observed Result |
|---|---|
| Vite version | 8.3.3 |
| Modules transformed | 33 |
| TypeScript compilation | PASS |
| Production asset build | PASS |
| Build duration | 136 ms |
| Build status | PASS |

The successful build demonstrates that the current frontend compiles and produces production assets.

It does not establish that the application is defect-free or ready for deployment.

---

## 5. Test Case Records

### TC-FE-001 — Navigation Links Render

**Test file:** `TopNavigation.test.tsx`  
**Level:** Component  
**Basis:** Shared navigation usability and UI regression  
**Precondition:** TopNavigation component is rendered.  
**Input:** Active navigation set to Staff Triage.  
**Expected:** CivicConnect brand and primary navigation links are present.  
**Actual:** Assertions passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms basic navigation rendering. This is useful regression coverage but is not a strong standalone Must-Have business-rule test.

### TC-FE-002 — Active Navigation Identification

**Test file:** `TopNavigation.test.tsx`  
**Level:** Component  
**Basis:** Navigation-state clarity and accessibility  
**Precondition:** Staff Triage is the active navigation destination.  
**Input:** `activeNavigation="staff-triage"`  
**Expected:** Staff Triage link has `aria-current="page"`.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Demonstrates that the active page is communicated through an accessible attribute.

### TC-FE-003 — Responsive Navigation Toggle

**Test file:** `TopNavigation.test.tsx`  
**Level:** Component  
**Basis:** Responsive navigation behaviour  
**Precondition:** TopNavigation renders with menu initially closed.  
**Input:** User opens and closes the menu.  
**Expected:** Expanded state and open-menu CSS class update correctly.  
**Actual:** Assertions passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms menu state changes. It does not independently prove visual responsiveness at real browser viewport sizes.

---

### TC-LC-001 — Valid Submitted-to-Triaged Transition

**Requirement:** FR-STF-007  
**Acceptance criterion:** AC-STF-007-A  
**Test file:** `requestManagementTypes.test.ts`  
**Level:** Unit/business rule  
**Technique:** State Transition  
**Risk:** Valid requests could become stuck in the lifecycle.

**Precondition:** Current stage = Submitted  
**Input:** Next stage = Triaged  
**Expected:** Transition is permitted (`true`).  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms the frontend transition rule permits the expected stage progression.

### TC-LC-002 — Invalid Submitted-to-Resolved Transition

**Requirement:** FR-STF-007  
**Acceptance criterion:** AC-STF-007-B  
**Test file:** `requestManagementTypes.test.ts`  
**Level:** Unit/business rule  
**Technique:** State Transition / Negative Testing  
**Risk:** A request could bypass mandatory workflow stages.

**Precondition:** Current stage = Submitted  
**Input:** Next stage = Resolved  
**Expected:** Transition is rejected (`false`).  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms the frontend business rule rejects the prohibited shortcut. Server-side enforcement remains unverified.

### TC-LC-003 — Closed Request Terminal State

**Requirement:** FR-STF-007  
**Acceptance criterion:** AC-STF-007-B  
**Test file:** `requestManagementTypes.test.ts`  
**Level:** Unit/business rule  
**Technique:** State Transition / Negative Testing

**Precondition:** Current stage = Closed  
**Input:** Retrieve permitted next stages.  
**Expected:** Empty list of permitted transitions.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms the frontend state model treats Closed as terminal.

### TC-LC-004 — Verification Returns to In Progress

**Requirement:** FR-STF-007  
**Acceptance criterion:** AC-STF-007-A  
**Test file:** `requestManagementTypes.test.ts`  
**Level:** Unit/business rule  
**Technique:** State Transition

**Precondition:** Current stage = Pending Verification  
**Input:** Next stage = In Progress  
**Expected:** Transition is permitted.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms the implemented lifecycle permits additional work after verification. This rule must be checked against the team's approved workflow baseline.

### TC-LC-005 — Verification Progresses to Resolved

**Requirement:** FR-STF-007  
**Acceptance criterion:** AC-STF-007-A  
**Test file:** `requestManagementTypes.test.ts`  
**Level:** Unit/business rule  
**Technique:** State Transition

**Precondition:** Current stage = Pending Verification  
**Input:** Next stage = Resolved  
**Expected:** Transition is permitted.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms this progression is permitted by the current frontend transition model.

---

### TC-ASG-001 — Authorised Staff Assignment

**Requirement:** FR-STF-006  
**Acceptance criterion:** AC-STF-006-A  
**Test file:** `requestAssignment.test.ts`  
**Level:** Unit/business rule  
**Technique:** Equivalence Partitioning — valid input

**Precondition:** Request is In Progress; simulated actor role is staff.  
**Input:** Officer ID = OFF-002  
**Expected:** Assignment validation is accepted and selected officer is Dave Fletcher.  
**Actual:** Assertions passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms the frontend validation logic accepts this authorised-role demonstration input. It does not verify a real authenticated user or saved assignment.

### TC-ASG-002 — Unauthorised Requester Assignment

**Requirement:** FR-STF-006  
**Acceptance criterion:** AC-STF-006-B  
**Test file:** `requestAssignment.test.ts`  
**Level:** Unit/business rule  
**Technique:** Equivalence Partitioning — invalid role / Negative Testing

**Precondition:** Request is In Progress.  
**Input:** Actor role = requester; Officer ID = OFF-002  
**Expected:** Assignment is rejected with a permission error.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms simulated requester-role input is rejected by the frontend helper. It is not evidence of backend access-control enforcement.

### TC-ASG-003 — Unknown Officer Identifier

**Requirement:** FR-STF-006  
**Acceptance criterion:** AC-STF-006-A (valid assignment data)  
**Test file:** `requestAssignment.test.ts`  
**Level:** Unit/business rule  
**Technique:** Equivalence Partitioning — invalid identifier / Negative Testing

**Precondition:** Request is In Progress; actor role = staff.  
**Input:** Officer ID = OFF-UNKNOWN  
**Expected:** Assignment rejected; user prompted to select a valid staff member.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms unknown officer identifiers are rejected by frontend validation.

### TC-ASG-004 — Closed Request Cannot Be Reassigned

**Requirement:** FR-STF-006 / controlled workflow business rule  
**Test file:** `requestAssignment.test.ts`  
**Level:** Unit/business rule  
**Technique:** State-based Negative Testing

**Precondition:** Request stage = Closed; actor role = manager.  
**Input:** Officer ID = OFF-001  
**Expected:** Assignment is rejected.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms the implemented frontend restriction. The specific rule must be checked against the approved workflow and independently enforced by the API.

### TC-ASG-005 — Assignment Resolves Correct Field Unit

**Requirement:** FR-STF-006  
**Test file:** `requestAssignment.test.ts`  
**Level:** Unit/business rule  
**Technique:** Functional data mapping

**Precondition:** Request is Triaged; actor role = manager.  
**Input:** Officer ID = OFF-003  
**Expected:** Valid assignment points to Crew Unit #21.  
**Actual:** Assertion passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms the demo officer mapping returns the expected field-unit information.

---

### TC-RM-001 — Request Details Display

**Requirement:** FR-STF-005  
**Test file:** `RequestManagementLifecyclePage.test.tsx`  
**Level:** Component/functional presentation  
**Basis:** Staff need to view full request details.

**Precondition:** Request Management page renders using the controlled demonstration case.  
**Input:** Case reference CC-2026-08477  
**Expected:** Request heading, incident specifications, subcategory and Case Ownership section appear.  
**Actual:** Assertions passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms selected details are displayed by the frontend. It does not prove backend retrieval or staff authorisation.

### TC-RM-002 — Staff/Public Message Separation

**Requirement:** FR-STF-008 / information disclosure risk  
**Test file:** `RequestManagementLifecyclePage.test.tsx`  
**Level:** Component/black-box functional  
**Technique:** Input-action/output verification

**Precondition:** The page initially displays Internal Staff Notes.  
**Input:** Select Public Citizen Messages tab.  
**Expected:** The public message is displayed; internal staff-note text is absent from the active panel.  
**Actual:** Assertions passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms UI-level separation of message categories. It does not establish secure server-side filtering or access control.

### TC-RM-003 — Audit History Presentation

**Requirement:** FR-SEC-004 / NFR-AUD-001 (presentation only)  
**Test file:** `RequestManagementLifecyclePage.test.tsx`  
**Level:** Component/functional presentation  
**Basis:** Staff and management need visibility into recorded actions.

**Precondition:** Demonstration audit events are available.  
**Input:** Select System Audit Trail tab.  
**Expected:** Recorded event information is displayed and the audit tab is selected.  
**Actual:** Assertions passed.  
**Status:** PASS  
**Evidence:** EXEC-M3-FE-20261012-001

**Interpretation:** Confirms existing audit-event data is displayed. It does not prove creation, persistence, integrity or attribution of audit events.

---

## 6. Black-Box Testing Techniques

### 6.1 State Transition Testing

**Applied to:** TC-LC-001 through TC-LC-005; TC-ASG-004

Justification:

CivicConnect requests move through defined lifecycle stages. Some movements are permitted, while others are prohibited.

State Transition testing is appropriate because the result depends on the request's current state and the attempted next state.

### 6.2 Equivalence Partitioning

**Applied to:** TC-ASG-001 through TC-ASG-003

Justification:

Assignment inputs can be grouped into meaningful classes:

- Authorised role with a valid staff identifier.
- Unauthorised role.
- Valid role with an unknown staff identifier.

Each class is expected to produce a different relevant outcome.

### Black-Box Limitation

The current tests exercise observable outputs of frontend functions and components.

Complete black-box validation of CivicConnect's integrated behaviour will require controlled application/API inputs, expected results derived from approved acceptance criteria and evidence from the integrated release candidate.

---

## 7. Negative Test Evidence

| Test ID | Negative Scenario | Observed Result |
|---|---|---|
| TC-LC-002 | Prohibited lifecycle shortcut | PASS |
| TC-LC-003 | Transition from Closed | PASS |
| TC-ASG-002 | Simulated unauthorised assignment | PASS |
| TC-ASG-003 | Invalid officer identifier | PASS |
| TC-ASG-004 | Assignment of Closed request | PASS |

These are frontend negative cases.

A real unauthorised API request must still be tested before claiming server-side security compliance.

---

## 8. Defects and Corrections

### DEF-FE-001 — Ambiguous Request Details Test Selector

**Area:** RequestManagementLifecyclePage test  
**Severity:** Low — test implementation defect  
**Initial observation:** Test query matched two occurrences of the same subcategory.  
**Cause:** `getByText(/Pressurised Main Rupture/)` matched both the header description and the case-details value.

**Correction:** Changed the assertion to use an exact text match.

**Regression evidence:** EXEC-M3-FE-20261012-001  
**Final status:** Resolved — regression test passed

**Interpretation:** The initial failure resulted from an ambiguous test selector, not an identified application behaviour defect.

### DEF-FE-002 — Test DOM Cleanup Between Runs

**Area:** Frontend test environment  
**Severity:** Low — test isolation defect  
**Observation:** Earlier navigation tests encountered duplicate rendered elements.  
**Correction:** Added React Testing Library cleanup in `src/tests/setup.ts`.  
**Regression evidence:** EXEC-M3-FE-20261012-001  
**Final status:** Resolved — navigation tests passed

---

## 9. Outstanding Integration and Verification Work

### API/Integration

Required minimum: 3 meaningful cases.

Planned scenarios:

- API-001: Retrieve request details from the backend.
- API-002: Persist an authorised assignment and retrieve the updated owner.
- API-003: Reject invalid or unauthorised assignment/status changes.

**Current status:** Not executed.

### End-to-End/System

Required minimum: 2 critical journeys.

Planned scenarios:

- E2E-001: Requester submits a request and staff can retrieve it.
- E2E-002: Authorised staff assigns a request, updates its status and the resulting action is recorded in audit history.

**Current status:** Not executed.

### Static and Security

Pending:

- An appropriate static/code-quality analysis.
- Dependency/security review.
- Repository secrets check.
- CI automation and configured failure gate.

### Performance

Pending one manageable, justified workload test.

Candidate operation: request-list or request-detail retrieval.

If using NFR-PERF-001 as the target, measure the specified 95th-percentile response time against the 2-second requirement under a clearly defined workload and environment.

### Staging

A separate test/staging configuration has not yet been verified.

---

## 10. Current Quality Assessment

### Confirmed

- Sixteen frontend automated tests executed successfully.
- No failed tests in the latest run.
- TypeScript compilation succeeded.
- Vite production build succeeded.
- Lifecycle and assignment validation helpers are covered by tests.
- Request Management page presentation and activity tabs have passing component tests.

### Not Yet Confirmed

- Backend enforcement of assignment and lifecycle rules.
- Authentication and role-based access control.
- Database persistence and retrieval.
- Audit-event integrity and persistence.
- Real API/integration behaviour.
- Critical end-to-end journeys.
- CI quality gates.
- Staging deployment.
- Performance target compliance.

### Interim Conclusion

The frontend verification increment is suitable for continued integration and development.

It is not yet sufficient to classify the overall CivicConnect system as release-ready.

---

## 11. Traceability and Evidence References

| Artefact | Location / Reference |
|---|---|
| Automated frontend tests | `frontend/src/**/*.test.ts` and `frontend/src/**/*.test.tsx` |
| Shared test setup | `frontend/src/tests/setup.ts` |
| Lifecycle transition implementation | `frontend/src/features/request-management/components/requestManagementTypes.ts` |
| Assignment rules | `frontend/src/features/request-management/components/requestAssignment.ts` |
| Request Management page | `frontend/src/features/request-management/pages/RequestManagementLifecyclePage.tsx` |
| Local execution evidence | EXEC-M3-FE-20261012-001 |
| Local build evidence | BUILD-M3-FE-20261012-001 |
| GitHub commit evidence | Add actual commit hash after committing |
| CI workflow run | Pending |
| Existing RTM | Update the team's existing RTM with implementation, test IDs, results and evidence references |
| PED | Continue PED v2.0 into PED v3.0 |
| AI Usage Register | Record the AI-assisted code/test drafting and human verification |

---

## 12. Next Evidence Update

The next update should include:

1. Case assignment component behaviour and integration with the backend.
2. API-level verification of authorised and unauthorised actions.
3. Continued RTM updates.
4. CI execution evidence when available.
5. Any new defects, regression tests and resolutions.

**Document status:** Active — continue updating throughout M3.


---

## Continuous Integration Evidence — CI-M3-001

**Feature:** GitHub Actions Frontend CI
**Milestone:** SEN381 M3
**Status:** PENDING — awaiting first GitHub Actions execution

### Purpose

To verify that CivicConnect frontend changes can be installed,
tested and built in an automated, clean environment.

### Workflow Configuration

- Workflow: `.github/workflows/frontend-ci.yml`
- Working directory: `Milestone 3/CivicConnect_Project_working/frontend`
- Runtime: Node.js 22
- Runner: GitHub-hosted Ubuntu
- Dependency installation: `npm ci`
- Test command: `npm run test:run`
- Build command: `npm run build`

### Acceptance Criteria

1. GitHub automatically executes the workflow on a push.
2. GitHub executes the workflow for a pull request.
3. Failed automated tests cause the job to fail.
4. TypeScript compilation or Vite build failures cause the job to fail.
5. The workflow result is visible on the pull request.
6. The required check is enforced before merging, if branch
   protection has been configured.

### Execution Record

| Field | Actual Result |
|---|---|
| Date/time | Pending |
| Branch | feature/m3-frontend-ci |
| Commit hash | Pending |
| GitHub Actions run ID | Pending |
| GitHub Actions run URL | Pending |
| Dependency installation | Pending |
| Automated tests | Pending |
| Build | Pending |
| Overall CI result | Pending |
| Reviewer approval evidence | Pending |
| Required-check enforcement | Pending |

### Evidence Interpretation

A successful run will confirm that the frontend passes its
automated tests and build in a clean CI environment.

It will not, by itself, establish backend integration,
production deployment readiness or full system compliance.


---

# Audit Trail Feature — M3 Test Evidence

**Project:** CivicConnect  
**Milestone:** SEN381 Milestone 3  
**Feature:** Audit Trail — Search, Filtering and Chronological Ordering  
**Feature branch:** `feature/m3-audit-trail`  
**Requirement area:** Audit visibility, traceability and request activity history  
**Verification status:** PASS — Frontend automated tests  
**Execution date:** 2026-10-12  
**Test framework:** Vitest 5.0.4, React Testing Library  
**Evidence owner:** Frontend Development Lead

---

## 1. Feature Overview

The CivicConnect Audit Trail feature allows staff to inspect the recorded history of a service request.

The frontend implementation provides:

- Read-only presentation of audit records.
- Search functionality across event actors, actions and descriptions.
- Chronological ordering of audit records.
- Newest-first and oldest-first sorting options.
- A count of matching events.
- Clear feedback when no audit records match a search.
- Responsive presentation on desktop, tablet and mobile.
- Integration with the existing Request Management Lifecycle & Audit page.

### Implemented Files

| File | Responsibility |
|---|---|
| `frontend/src/features/audit/audit.ts` | Audit filtering and chronological sorting logic |
| `frontend/src/features/audit/audit.test.ts` | Unit tests for filtering and sorting |
| `frontend/src/features/audit/components/AuditTrailPanel.tsx` | Interactive audit-history component |
| `frontend/src/features/audit/components/AuditTrailPanel.css` | Responsive audit-history styling |
| `frontend/src/features/audit/components/AuditTrailPanel.test.tsx` | Component interaction tests |
| `frontend/src/features/request-management/pages/RequestManagementLifecyclePage.tsx` | Integration of AuditTrailPanel into the Request Management page |

The audit interface currently uses demonstration records supplied by the application.

The implementation does not yet create or persist authenticated audit records on the backend.

---

## 2. Test Execution Summary

**Execution ID:** EXEC-M3-AUD-001  
**Command:** `npm run test:run`  
**Execution environment:** GitHub-tracked CivicConnect frontend project  
**Overall result:** PASS — Reported by developer

### Audit Feature Test Results

| Test File | Executed | Passed | Failed | Result |
|---|---:|---:|---:|---|
| `src/features/audit/audit.test.ts` | 6 | 6 | 0 | PASS |
| `src/features/audit/components/AuditTrailPanel.test.tsx` | 3 | 3 | 0 | PASS |
| **Audit feature total** | **9** | **9** | **0** | **PASS** |

### Cumulative Frontend Test Coverage

| Feature | Tests | Passed | Failed |
|---|---:|---:|---:|
| Shared Navigation | 3 | 3 | 0 |
| Request Lifecycle Validation | 5 | 5 | 0 |
| Request Assignment Validation | 5 | 5 | 0 |
| Request Management Page | 3 | 3 | 0 |
| Audit Filtering and Sorting | 6 | 6 | 0 |
| Audit Trail Component | 3 | 3 | 0 |
| **TOTAL** | **25** | **25** | **0** |

**Cumulative status:** PASS — 25/25 automated frontend tests, based on the reported successful execution.

**Note:** The cumulative total should be checked against the latest saved Vitest output before final M3 submission.

---

## 3. Unit Test Evidence — Audit Filtering and Sorting

### TC-AUD-001 — Search Audit Events by Actor

**Requirement basis:** Audit activity visibility  
**Test file:** `audit.test.ts`  
**Test level:** Unit  
**Technique:** Equivalence Partitioning — valid search input

**Preconditions:**
- Three controlled audit events exist.
- One event has actor `Eleanor Vance`.

**Test input:**
- Search text: `Eleanor`
- Sort order: `newest`

**Expected result:**
- Only the event associated with Eleanor Vance is returned.
- The returned event ID is `AUD-002`.

**Actual result:**
- The expected event was returned.
- The assertion passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

### TC-AUD-002 — Case-Insensitive Search by Event Action

**Requirement basis:** Audit activity search  
**Test file:** `audit.test.ts`  
**Test level:** Unit  
**Technique:** Equivalence Partitioning

**Preconditions:**
- An audit event exists with action `Status changed`.

**Test input:**
- Search text: `STATUS CHANGED`
- Sort order: `newest`

**Expected result:**
- The action is matched regardless of letter case.
- The returned event ID is `AUD-003`.

**Actual result:**
- The expected event was returned.
- The assertion passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

### TC-AUD-003 — Search Audit Event Descriptions

**Requirement basis:** Audit history search  
**Test file:** `audit.test.ts`  
**Test level:** Unit  
**Technique:** Equivalence Partitioning

**Preconditions:**
- An audit event contains the description `Water leak reported.`

**Test input:**
- Search text: `water leak`

**Expected result:**
- The event is found through its description.
- The returned event ID is `AUD-001`.

**Actual result:**
- The expected event was returned.
- The assertion passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

### TC-AUD-004 — Newest-First Chronological Sorting

**Requirement basis:** Accurate chronological presentation  
**Test file:** `audit.test.ts`  
**Test level:** Unit  
**Technique:** Ordering and chronological comparison

**Preconditions:**
- Three events have distinct recorded timestamps.

**Test input:**
- Search text: empty
- Sort order: `newest`

**Expected result:**

The events are returned in this order:

1. `AUD-003`
2. `AUD-002`
3. `AUD-001`

**Actual result:**
- Events were returned in descending timestamp order.
- The assertion passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

### TC-AUD-005 — Oldest-First Sorting Without Source Modification

**Requirement basis:** Accurate chronological presentation and preservation of source records  
**Test file:** `audit.test.ts`  
**Test level:** Unit  
**Technique:** Ordering and data-integrity check

**Preconditions:**
- Three audit events exist.
- Their original sequence is recorded before sorting.

**Test input:**
- Search text: empty
- Sort order: `oldest`

**Expected result:**

The events are returned in this order:

1. `AUD-001`
2. `AUD-002`
3. `AUD-003`

The input array remains unchanged.

**Actual result:**
- Events were returned in ascending timestamp order.
- The source array retained its original sequence.
- Both assertions passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

**Interpretation:**
- This confirms that frontend sorting does not mutate the supplied event collection.
- It does not prove backend audit-log immutability or tamper resistance.

---

### TC-AUD-006 — Search With No Matching Audit Events

**Requirement basis:** Predictable search behaviour and usability  
**Test file:** `audit.test.ts`  
**Test level:** Unit  
**Technique:** Negative Testing / Invalid Equivalence Class

**Preconditions:**
- The controlled audit records contain no event matching the search term.

**Test input:**
- Search text: `unknown event`

**Expected result:**
- The filtering function returns an empty array.

**Actual result:**
- An empty array was returned.
- The assertion passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

## 4. Component Test Evidence — AuditTrailPanel

### TC-AUD-007 — Display Provided Audit Records

**Requirement basis:** Request activity and audit visibility  
**Test file:** `AuditTrailPanel.test.tsx`  
**Test level:** React Component  
**Technique:** Functional input/output testing

**Preconditions:**
- AuditTrailPanel receives two valid demonstration events.
- Case reference is `CC-TEST-001`.

**Test input:**
- Render the AuditTrailPanel component with the supplied events.

**Expected result:**
- `Request submitted` is displayed.
- `Case assigned` is displayed.
- Event count displays `2 of 2 events`.

**Actual result:**
- Both event descriptions were displayed.
- The correct event count was displayed.
- All assertions passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

### TC-AUD-008 — Interactive Search Filters Displayed Events

**Requirement basis:** Audit activity search  
**Test file:** `AuditTrailPanel.test.tsx`  
**Test level:** React Component  
**Technique:** Black-box functional testing

**Preconditions:**
- The audit component contains two events.
- One event is associated with Eleanor Vance.

**Test input:**
- Enter `Eleanor` into the audit search field.

**Expected result:**
- The `Case assigned` event remains visible.
- The `Request submitted` event is excluded.
- The event count displays `1 of 2 events`.

**Actual result:**
- The matching event remained visible.
- The nonmatching event was excluded.
- The count updated correctly.
- All assertions passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

### TC-AUD-009 — No-Match Search Displays Empty-State Feedback

**Requirement basis:** Search usability and error feedback  
**Test file:** `AuditTrailPanel.test.tsx`  
**Test level:** React Component  
**Technique:** Negative Testing / Black-box functional testing

**Preconditions:**
- AuditTrailPanel contains two events.

**Test input:**
- Enter `unmatched search term` into the search field.

**Expected result:**
- A message states `No matching audit events`.
- The event count displays `0 of 2 events`.

**Actual result:**
- The expected empty-state message appeared.
- The event count updated correctly.
- All assertions passed.

**Status:** PASS

**Evidence reference:** EXEC-M3-AUD-001

---

## 5. Black-Box Test Design Techniques

### 5.1 Equivalence Partitioning

**Applied to:** TC-AUD-001, TC-AUD-002, TC-AUD-003 and TC-AUD-006

Audit search inputs were divided into meaningful classes:

- Valid actor-name searches.
- Valid action-name searches.
- Valid description searches.
- Searches with no matching records.

**Purpose:**
Verify that the search operation behaves correctly for representative classes of input rather than testing only a single successful search.

### 5.2 Ordering and Chronological Comparison

**Applied to:** TC-AUD-004 and TC-AUD-005

**Purpose:**
Verify that the interface can order recorded events in both ascending and descending chronological order without modifying the source collection.

### 5.3 Input/Output Functional Testing

**Applied to:** TC-AUD-007, TC-AUD-008 and TC-AUD-009

**Purpose:**
Verify that user-visible output changes correctly when events are supplied or a search is performed.

**Limitation:**
These frontend checks do not replace integrated API or E2E verification.

---

## 6. Negative Testing Evidence

| Test ID | Negative Scenario | Expected Outcome | Result |
|---|---|---|---|
| TC-AUD-006 | Search term has no matching events | Empty result array | PASS |
| TC-AUD-009 | User searches for a nonexistent event | Empty-state feedback appears | PASS |

These cases contribute to frontend negative-test coverage.

They do not establish that the application rejects unauthorised access to audit records.

---

## 7. Requirement and Risk Traceability

| Requirement / Risk Area | Implementation | Test Cases | Status |
|---|---|---|---|
| Request activity visibility | `AuditTrailPanel.tsx` | TC-AUD-007 | Frontend PASS |
| Search and filter activity records | `audit.ts`, `AuditTrailPanel.tsx` | TC-AUD-001, TC-AUD-002, TC-AUD-003, TC-AUD-008 | Frontend PASS |
| Chronological audit presentation | `audit.ts` | TC-AUD-004, TC-AUD-005 | Frontend PASS |
| Predictable no-match behaviour | `audit.ts`, `AuditTrailPanel.tsx` | TC-AUD-006, TC-AUD-009 | Frontend PASS |
| Preservation of original event collection during sorting | `audit.ts` | TC-AUD-005 | Frontend PASS |
| Authenticated actor attribution | Backend audit service | Not yet implemented | PENDING |
| Persistent audit-event recording | Backend and database | Not yet implemented | PENDING |
| Server-side audit authorisation | Backend API | Not yet verified | PENDING |
| Tamper-resistant audit storage | Backend/database controls | Not yet verified | PENDING |

**RTM action:** Update the team's existing RTM with the relevant approved requirement IDs, implementation locations, test IDs, execution results and evidence references.

---

## 8. Integration With Request Management

The AuditTrailPanel component is integrated into:

`frontend/src/features/request-management/pages/RequestManagementLifecyclePage.tsx`

### Verified Behaviour

The frontend implementation allows the System Audit Trail tab to display the reusable AuditTrailPanel component.

The panel receives audit records from the selected demonstration request and displays the supplied event history.

### Limitations

- Events are supplied from demonstration data.
- Filtering and sorting occur in frontend memory.
- Audit events are not retrieved from a live backend service.
- Case assignment and lifecycle operations do not yet produce persistent audit events.
- Authentication, access control, event integrity and tamper resistance require backend implementation and verification.

---

## 9. Quality Assessment

### Passed Frontend Verification

- Audit actor-name searching.
- Case-insensitive action searching.
- Description-based searching.
- Newest-first ordering.
- Oldest-first ordering.
- Non-mutation of the source array during sorting.
- Empty results for unsuccessful searches.
- Rendering of audit history and event counts.
- Interactive filtering and empty-state feedback.

### Outstanding Work

- Backend audit-event API integration.
- Database persistence and retrieval.
- Authenticated user attribution.
- Role-based access control for audit records.
- Integrity and tamper-resistance verification.
- API/integration test execution.
- End-to-end system test execution.
- Performance testing of audit retrieval with realistic record volumes.
- Security and quality-gate evidence for the integrated release candidate.

### Interim Conclusion

The Audit Trail frontend implementation passed all nine reported automated tests.

The current implementation provides verified frontend search, sorting and read-only event presentation.

It does not yet constitute a complete, production-ready audit subsystem.

---

## 10. Evidence References

| Evidence Artefact | Reference |
|---|---|
| Audit filtering implementation | `frontend/src/features/audit/audit.ts` |
| Audit filtering tests | `frontend/src/features/audit/audit.test.ts` |
| Audit Trail component | `frontend/src/features/audit/components/AuditTrailPanel.tsx` |
| Audit Trail component tests | `frontend/src/features/audit/components/AuditTrailPanel.test.tsx` |
| Audit Trail styling | `frontend/src/features/audit/components/AuditTrailPanel.css` |
| Request Management integration | `frontend/src/features/request-management/pages/RequestManagementLifecyclePage.tsx` |
| Local automated test run | EXEC-M3-AUD-001 |
| GitHub Actions run URL | Add actual URL after successful CI execution |
| Pull request URL | Add actual URL |
| Git commit hash | Add actual commit hash |
| Existing RTM | Update relevant approved requirement-to-test links |
| PED | Carry forward evidence into PED v3.0 |

---

## 11. Next Development Increment

**Next feature:** Management & Analytics

Planned verification areas:

- Request-volume calculations.
- Request-status breakdowns.
- Overdue request identification.
- SLA compliance calculations.
- Department-level service performance.
- Dashboard filtering and presentation.
- Negative tests for empty datasets and invalid values.
- Subsequent backend API and E2E verification.

**Audit Trail frontend status: PASS**  
**Overall CivicConnect M3 verification status: IN PROGRESS**


---

## CI Failure Investigation — CI-DEF-001

**Feature:** Frontend CI  
**Pull request:** #17 — Enhance Frontend CI with Vitest and branch checks  
**Initial status:** FAILED  
**Resolution status:** Investigation in progress

### Observed Failure

The GitHub Actions workflow completed repository checkout,
Node.js setup and dependency installation successfully.

The automated test step failed with:

`npm error Missing script: "test:run"`

The production build step was not executed because the
preceding test step failed.

### Investigation

The workflow invoked `npm run test:run`, but npm did not
find the corresponding script in the checked-out frontend
package configuration.

Investigate whether the PR branch contains the expected
package.json changes and testing dependencies.

### Expected Correction

Ensure the committed frontend package.json contains
the required test script and necessary test dependencies.

Push the correction to the existing feature branch
and rerun the CI checks.

### Final Verification

- Corrective commit: Completed
- Follow-up GitHub Actions run: Successful
- Tests: Passed
- Build: Built Successfully
- Final CI status: Resolved


---

## Management & Analytics — Frontend Verification

**Feature:** Management Performance Dashboard  
**Status:** Pending execution and CI verification  
**Branch:** feature/m3-management-analytics

### Test Basis

Management requires meaningful oversight information
to identify operational workload and service performance.

Primary risks include:
- Incorrect request totals.
- Misclassification of open and completed requests.
- Incorrect identification of overdue requests.
- Incorrect SLA compliance percentages.
- Inconsistent department-level figures.
- Misleading values for empty or invalid datasets.

### Automated Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-MGT-001 | Request summary totals | Correct total/open/completed counts | Pending |
| TC-MGT-002 | Overdue detection | Only eligible overdue open requests counted | Pending |
| TC-MGT-003 | SLA compliance | Correct percentage from valid records | Pending |
| TC-MGT-004 | Empty dataset | Zero counts and unavailable SLA percentage | Pending |
| TC-MGT-005 | Status distribution | Correct counts by lifecycle state | Pending |
| TC-MGT-006 | Department performance | Correct department counts and overdue totals | Pending |
| TC-MGT-007 | Department/status filtering | Only matching records returned | Pending |
| TC-MGT-008 | Invalid SLA target | Excluded from compliance calculation | Pending |

### Files

- `frontend/src/features/management/managementMetrics.ts`
- `frontend/src/features/management/managementMetrics.test.ts`
- `frontend/src/features/management/managementData.ts`
- `frontend/src/features/management/pages/ManagementPerformancePage.tsx`
- `frontend/src/features/management/pages/ManagementPerformancePage.css`

### Execution Evidence

- Date/time: Pending
- Local test outcome: Pending
- Production build: Pending
- GitHub Actions run: Pending
- Pull request: Pending
- Commit hash: Pending

### Verification Limitations

The current dashboard uses fictional demonstration records.

The metrics follow provisional frontend definitions
and must be reconciled with the approved SLA and
reporting rules before backend integration.

The tests do not verify backend aggregation, database
accuracy, manager authorisation, real-time updates,
API integration or production performance.

### Next Verification Work

- Add dashboard component interaction tests.
- Verify management access permissions in the backend.
- Connect reporting API endpoints.
- Validate aggregation against database fixtures.
- Verify the approved SLA calculation policy.
- Add integrated and end-to-end tests.
- Record CI and pull-request review evidence.


### DEF-MGT-001 — Ambiguous Management KPI Test Selector

**Component:** ManagementPerformancePage  
**Test file:** ManagementPerformancePage.test.tsx  
**Issue type:** Automated test selector defect  
**Severity:** Low

**Initial result:** 37 passed, 2 failed (39 tests)

**Cause:** The `getByText("SLA Compliance")` query
matched more than one element in the rendered page.

**Correction:** Scoped the KPI label query to the
Management summary statistics region using React
Testing Library's `within()` function.

**Application behaviour changed:** No

**Expected regression result:** 39 passing tests

**Final status:** Resolved
**Regression evidence:**  ✓ src/features/request-management/requestManagementTypes.test.ts (5 tests) 4ms
 ✓ src/features/audit/audit.test.ts (6 tests) 5ms
 ✓ src/features/management/managementMetrics.test.ts (8 tests) 5ms
 ✓ src/features/request-management/components/requestAssignment.test.ts (5 tests) 4ms
 ✓ src/components/navigation/TopNavigation.test.tsx (3 tests) 222ms
 ✓ src/features/request-management/pages/RequestManagementLifecyclePage.test.tsx (3 tests) 332ms
 ✓ src/features/audit/components/AuditTrailPanel.test.tsx (4 tests) 635ms
   ✓ AuditTrailPanel (3)
     ✓ displays a useful message when no events match 373ms
 ✓ src/features/management/pages/ManagementPerformancePage.test.tsx (5 tests) 706ms

 Test Files  8 passed (8)
      Tests  39 passed (39)
   Start at  19:22:21
   Duration  1.94s (environment 62%, tests 19%, setup 13%, import 3%, transform 3%)

 
### Requester Form Validation and Attachment Boundaries

**Test file:** `src/features/requester/components/RequestForm.test.tsx`

**Execution:** 14 October 2026
**Framework:** Vitest 5.0.4
**Techniques:** Equivalence Partitioning, Boundary Value Analysis,
Negative Testing

| ID | Test condition | Actual result | Status |
|---|---|---|---|
| TC-REQ-007 | Whitespace-only required fields | Validation rejects submission | PASS |
| TC-REQ-008 | Unsupported file MIME type | Attachment rejected | PASS |
| TC-REQ-009 | PNG size 15 MB + 1 byte | Attachment rejected | PASS |
| TC-REQ-010 | PNG size exactly 15 MB | Attachment accepted | PASS |
| TC-REQ-011 | Reset invalid form | Fields and errors cleared | PASS |

**Focused test run:** 5 passed / 5
**Full frontend regression:** 59 passed / 59
**Test files:** 13 passed / 13
**Production build:** PASS

**Limitations:**
- Attachment size is simulated in automated tests.
- No image content inspection or server-side upload validation.
- No backend file storage verification.
- CI run and reviewer approval evidence must be recorded separately.
```

Also our team needs to extend the existing RTM with these test IDs against the approved requester requirements. 
---

## 4. Next major responsibility: Frontend–Backend API integration

Rather than adding more isolated frontend tests, our team should now check whether our backend can support the workflows we've implemented.


### Municipal Service Category API Integration

**Execution date:** 14 October 2026  
**Branch:** feature/m3-municipal-categories  
**Test file:** backend/tests/municipalCategories.test.ts  
**Framework:** Vitest 5.0.3 + Supertest  
**Test techniques:** Equivalence Partitioning, Negative Testing,
API Integration Testing, Regression Testing

| Test IDs | Test condition | Actual result | Status |
|---|---|---|---|
| TC-MUN-001 | Municipal category metadata | Six categories returned | PASS |
| TC-MUN-002–007 | Valid request for each municipal category | HTTP 201; SUBMITTED; MEDIUM priority | PASS |
| TC-MUN-008–013 | Municipal request without location | HTTP 400; location validation error | PASS |
| TC-MUN-014 | Unsupported category | HTTP 400 | PASS |
| TC-MUN-015 | Existing IT_SUPPORT compatibility | HTTP 201 | PASS |

**Focused municipal test execution:** 15/15 passed

**Initial full-suite execution:** Incomplete.
Vitest worker exited unexpectedly during requests.test.ts.
55 tests completed; 1 unhandled worker error was reported.

**Controlled full-suite execution:**
Command:
npx vitest run --pool=threads --maxWorkers=1 --no-file-parallelism

Result: 63/63 passed across 6 test files.

**Production build:** PASS
Command: npm run build

**Known limitations:**
- Backend repositories currently use in-memory storage.
- Municipal category priority defaults are provisional.
- React-to-backend request submission is not yet integrated.
- CI verification and teammate approvals are pending.
```

The initial worker crash should remain documented because reproducibility is important to M3. 

## TC-E2E-001 — Requester Registration, Submission and Tracking

- **Execution date:** 14 October 2026
- **Execution method:** Manual browser-based end-to-end test
- **Environment:** Local frontend and Express backend
- **Result:** PASS — verified by tester

|Field| Evidence|
|---|---|
|Test ID|	TC-E2E-001|
|Requirements|	FR-REQ-001, FR-REQ-002, FR-REQ-003, FR-REQ-004, FR-REQ-005|
|Test type|	End-to-end / system|
|Environment|	React + Vite → Express backend, local staging|
|Steps|	Register → submit municipal request → track request|
|Expected result|	Request created with backend-generated reference and correct status|
|Actual result|	Registration, submission and tracking successful|
|Status|	PASS — user-verified|
|Limitation|	In-memory backend persistence; results not guaranteed after server restart|