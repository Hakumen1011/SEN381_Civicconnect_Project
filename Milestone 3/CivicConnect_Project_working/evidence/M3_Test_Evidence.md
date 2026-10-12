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
