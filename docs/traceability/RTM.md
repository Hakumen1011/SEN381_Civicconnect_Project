# Requirements Traceability Matrix

## Overview

The RTM provides traceability between stakeholders, stakeholder needs, requirements and acceptance criteria for the CivicConnect project.

The objective of this RTM is to help determine the traceability of each requirement to a validated stakeholder need and the verifiability of each requirement through measurable acceptance criteria.

---

## Requirements Traceability Matrix

| Stakeholder | Stakeholder Need | Requirement | Acceptance Criteria |
|------------|-----------------|-------------|-------------------|
| STK-001 Requester | STK-NEED-001 Ability to submit a complete service request through a controlled process | FR-REQ-001 Submit a new service request containing all mandatory information | AC-REQ-001-A, AC-REQ-001-B, AC-REQ-001-C|
| STK-001 Requester | STK-NEED-001 Ability to submit a complete service request through a controlled process | FR-REQ-001 Categorise service requests using a controlled category list | AC-REQ-002-A, AC-REQ-002-B |
| STK-001 Requester | STK-NEED-001 Ability to submit a complete service request through a controlled process | FR-REQ-001 Generate a unique service request reference | AC-REQ-003-A, AC-REQ-003-B, AC-REQ-003-C |
| STK-001 Requester | STK-NEED-002 Confirmation that a request was recorded | FR-REQ-004 Provide confirmation after successful submission | AC-REQ-001-C |
| STK-001 Requester | STK-NEED-003 Visibility of current request status | FR-REQ-005 Allow requester to view current request status | AC-REQ-005-A, AC-REQ-005-B, AC-REQ-005-C |
| STK-001 Requester| STK-NEED-004 Access to previously submitted requests | FR-REQ-006 Allow requester to view previous requests | To be defined during detailed testing |
| STK-001 Requester | STK-NEED-003 Visibility of current request status | FR-REQ-007 Provide progress and completion feedback | To be defined during detailed testing |
| STK-002 Service Staff| STK-NEED-005 Confidential access to requests | FR-STF-001 Allow authorised staff to view relevant requests | To be defined during detailed testing |
| STK-002 Service Staff| STK-NEED-006 Ability to find and prioritise requests | FT-STF-002 Search requests using defined criteria | To be defined during detailed testing |
| STK-002 Service Staff| STK-NEED-006 Ability to find and prioritise requests | FR-STF-003 Filter requests by relevant criteria|To be defined during detailed testing  |
| STK-002 Service Staff| STK-NEED-006 Ability to find and prioritise requests | FR-STF-004 Sort requests using supported criteria | To be defined during detailed testing |
| STK-002 Service Staff| STK-NEED-005 Centralised access to requests | FR-STF-005 View complete authorised request details | To be defined during detailed testing |
| STK-002 Service Staff| STK-NEED-007 Clear ownership and assignment of requests | FR-STF-006 Assign or accept responsibility for requests | AC-STF-006-A, AC-STF-006-B, AC-STF-006-C |
| STK-002 Service Staff| STK-NEED-008 Record actions and resolution information | FR-STF-007 Restrict request status changes to approved workflow transitions | AC-STF-007-A, Ac-STF-007-B, AC-STF-007-C |
| STK-002 Service Staff| STK-NEED-008 Record actions and resolution information | FR-STF-008 Record actions and comments against requests | To be defined during detailed testing |
| STK-002 Service Staff| STK-NEED-008 Record actions and resolution information| FR-STF-009 Record resolution information | To be defined during detailed testing |
| STK-002 Service Staff| STK-NEED-007 Clear ownership and assignment of requests | FR-STF-010 Resolve or close authorised requests | To be defined during detailed testing |
| STK-003 Management | STK-NEED-009 Visibility of open, overdue, resolved and closed work | FR-MGT-001 View currently open service requests | To be defined during detailed testing |
| STK-003 Management | STK-NEED-009 Visibility of open, overdue, resolved and closed work | FR-MGT-002 Identify overdue service requests | To be defined during detailed testing |
| STK-003 Management | STK-NEED-009 Visibility of open, overdue, resolved and closed work | FR-MGT-003 Identify resolved and closed requests | To be defined during detailed testing |
| STK-003 Management | STK-NEED-010 Service performance analysis | FR-MGT-004 View service information by category and status | To be defined during detailed testing |
| STK-004 Administrator | STK-NEED-011 Role-Based access and secure administration | FR-SEC-001 Authenticate users before granting access | To be verified through security testing |
| STK-004 Administrator / STK-007 Security Responsibility | STK-NEED-011 / STK-NEED-014 | FR-SEC-002 Role based authorisation and access control | AC-SEC-002-A, AC-SEC-002-B, AC-SEC-002-C |

---

## Non-functional Requirements Traceability

| Stakeholder Need | Non-Functional Requirement | Verification Method |
|-----------------|---------------------------|--------------------|
| STK-NEED-011, STK-NEED-014 | NFR-SEC-001 Role-based access control | Security test |
| STK-NEED-011, STK-NEED-014 | NFR-SEC-002 Secure password storage | Database / Security inspection |
| STK-NEED-012 | NFR-PERF-001 Performance requirements | Performance test |
| STK-NEED-001, STK-NEED-002 | NFR-USAV-001 Usability requirements | Usability test |
| STK-NEED-001, STK-NEED-003 | NFR-REL-001 Request retrievability | Reliability test |
| STK-NEED-014 | NFR-AUD-001 Auditability | Auditability test |
| STK-NEED-015  | NFR-MAIN-001 Process control and traceability | Artefact view |

---

## Traceability model

```text
Stakeholder
    ↓
Stakeholder Need
    ↓
Requirement
    ↓
Acceptance Criteria
    ↓
Test Case
    ↓
Evidence
```

This structure gives traceability to each CivicConnect requirement to a validated stakeholder need and forward to verification activities and supporting evidence.

## M3 verification extension (16 October 2026; controlled review pending)

This table **extends** rather than replaces the M1/M2 stakeholder and acceptance-criteria mapping above. Backend test IDs are shown by their named test files because the original planned `TEST-*` identifiers have not all been reconciled to the executed suite. `PASS` below means the cited local automated test(s) or tester-confirmed browser scenario passed—not database durability or production acceptance. The implementation paths refer to `Milestone 3/CivicConnect_Project_working/`.

| Requirement / acceptance criteria | Implemented component(s) | Executed test(s) and result | Evidence / residual status |
|---|---|---|---|
| FR-REQ-001 / AC-REQ-001-A–C: mandatory fields, successful submission | `frontend/src/features/requester/RequesterPortal.tsx`, `backend/src/modules/requests/` | `backend/tests/requests.test.ts` submission cases; `TC-E2E-001` → PASS | `evidence/M3_Test_Evidence.md`; data persists only while backend runs |
| FR-REQ-002 / AC-REQ-002-A–B: controlled category | `frontend/src/features/requester/`, `backend/src/modules/requests/` | `backend/tests/municipalCategories.test.ts` valid/invalid categories → PASS | Municipal category test table and API backend outputs; historically duplicated requirement IDs in original RTM need team correction |
| FR-REQ-003/004 / AC-REQ-003-A–C and AC-REQ-001-C: reference and confirmation | Requester Portal and request service | `backend/tests/requests.test.ts` unique references; `TC-E2E-001` → PASS | Same-process confirmation; restart durability absent |
| FR-REQ-005/006 / AC-REQ-005-A–C: tracking, owner isolation | Requester Portal and protected request retrieval API | `backend/tests/requests.test.ts` ownership tests; `TC-E2E-001`, `TC-E2E-002` → PASS | Sign-out/re-login and cross-account browser isolation PASS within process |
| FR-STF-001 / staff visibility; FR-STF-002–004 search/filter/sort | `frontend/src/features/staff/live/StaffLiveWorkbench.tsx`, request query API | `backend/tests/requests.test.ts` staff search/filter/sort; frontend `staffApi.test.ts` → PASS | Current backend supports staff filters; front-end loaded-page scope must not be mislabelled as global |
| FR-STF-006 / AC-STF-006-A–B: self-assignment and forbidden requester assignment | Staff Live Workbench and request assignment API | `backend/tests/requests.test.ts` assignment and rejection cases; `TC-E2E-003` → PASS | Requested work assigned only by eligible staff; reassign restrictions tested |
| FR-STF-007/009/010 / AC-STF-007-A–C: controlled status changes | Staff Live Workbench, status service and history | Backend transition/rejection/version tests; `TC-E2E-003` → PASS | Auditable changes shown; `RESOLVED` note/manager closure enforced at API level |
| FR-MGT-001–004: open, overdue, resolved/closed, category/status analytics | `frontend/src/features/management/pages/ManagementPerformancePage.tsx`; `/api/management/summary`, `/api/management/requests` | `backend/tests/management.test.ts`; frontend `managementApi.test.ts`, dashboard tests; browser 8-step check → PASS | Live numbers from Express; analytics do not establish production SLA compliance |
| FR-SEC-001: user authentication | `frontend/src/auth/AuthContext.tsx`, `LoginPage.tsx`; backend auth module | `backend/tests/auth.test.ts`, frontend `AuthContext.test.tsx`; 8 browser checks → PASS | Development/demo accounts only for simulated staging |
| FR-SEC-002 / AC-SEC-002-A–C; NFR-SEC-001: RBAC | `frontend/src/auth/roles.ts`, `routes/AppRoutes.tsx`, backend authorization middleware | `backend/tests/auth.test.ts`, `management.test.ts`, `requests.test.ts`; frontend `roleNavigation.test.tsx`, `AppRoutes.test.tsx` → PASS | Role-based tab hiding AND route/API permissions tested; production pen-test not claimed |
| NFR-AUD-001 / FR-MGT-005: audit trail | backend history and live staff/request register screens | Backend request-history tests; `TC-E2E-003`, `TC-SYS-004` → PASS | Single-process persistence only |
| NFR-PERF-001: target 90% standard actions within 4 s | authenticated GET `/api/requests` performance smoke | `TC-PERF-001`: 100/100 local requests; p90 3.34 ms → **LIMITED PASS only for smoke** | Not representative of sustained 25-user ten-minute workload or all standard actions |
| NFR-REL-001: durable retrievability | Backend in-memory request repository | `TC-E2E-002` verifies across sessions, **not** restart | **OPEN DEVIATION:** requests disappear on server restart; M2 relational persistence unimplemented |
| NFR-MAIN-001: change and configuration traceability | Git feature branch, approved/merged PR #29 and root Actions | Local 99 frontend + 63 backend tests; one successful frontend PR check observed | **PARTIAL:** final SHA, full integrated CI evidence and documentation/team review pending |

**Verification evidence:** `Milestone 3/CivicConnect_Project_working/evidence/M3_Test_Evidence.md`. **Review follow-up:** original table contains historical ID inconsistencies (FR-REQ-001 repeated for categorisation/reference, `FT-STF-002` typo) and planned acceptance criteria; do not silently rewrite stakeholder-approved IDs. Team to reconcile mappings and confirm acceptance-criteria specifics in the existing RTM.
