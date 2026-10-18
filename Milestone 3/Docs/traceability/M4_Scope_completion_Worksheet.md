# M4 Scope Completion Worksheet

Project: CivicConnect (SEN381) | Final baseline: commit `863fcbb18061113ba8a1e30587bfd0ab30c17b1e` | Date: 18 October 2026

Method (from the M4 brief): Met = 1.0, Partially Met = 0.5, Not Met = 0.
Scope Completion % = sum of completion values / number of applicable approved acceptance criteria x 100.

Baseline: 20 coded acceptance criteria from the M1 PED. Ten are worded in M1 (AC-REQ-001-A/B/C, AC-REQ-002-A/B, AC-STF-006-A/B, AC-STF-007-A/B/C). Ten are coded in the RTM but not worded in M1 (marked *); each was assessed against its requirement title.

| AC | Requirement | Status | Value | Evidence / reason |
|---|---|---|---|---|
| AC-REQ-001-A | FR-REQ-001 submit request | Met | 1 | Authenticated POST creates a request (backend tests, E2E) |
| AC-REQ-001-B | FR-REQ-001 mandatory fields | Met | 1 | Validation rejects empty or short title/description; form blocks submit |
| AC-REQ-001-C | FR-REQ-001 confirmation | Met | 1 | Confirmation and reference shown after submit |
| AC-REQ-002-A | FR-REQ-002 category list | Met | 1 | 13 categories enforced by validation and database CHECK |
| AC-REQ-002-B | FR-REQ-002 no category | Met | 1 | Missing or invalid category rejected |
| AC-REQ-003-A * | FR-REQ-003 reference generated | Met | 1 | Reference returned on create |
| AC-REQ-003-B * | FR-REQ-003 reference unique | Met | 1 | Unique per request in the database |
| AC-REQ-003-C * | FR-REQ-003 reference shown | Met | 1 | Shown on confirmation and tracker |
| AC-REQ-005-A * | FR-REQ-005 view status | Met | 1 | Requester views live status |
| AC-REQ-005-B * | FR-REQ-005 own requests only | Met | 1 | Requester sees only own requests |
| AC-REQ-005-C * | FR-REQ-005 status history | Partially met | 0.5 | History is live in the backend; tracker timeline is live for one verified record, demo data elsewhere |
| AC-STF-006-A | FR-STF-006 assign owner | Met | 1 | Assigned owner recorded |
| AC-STF-006-B | FR-STF-006 unauthorised denied | Met | 1 | Unauthorised role receives 403 |
| AC-STF-006-C * | FR-STF-006 (unworded) | Partially met | 0.5 | Assignment recorded and visible; intent of criterion C not defined in M1 |
| AC-STF-007-A | FR-STF-007 permitted transition | Met | 1 | Transition rules tested |
| AC-STF-007-B | FR-STF-007 invalid transition | Met | 1 | Invalid transition rejected |
| AC-STF-007-C | FR-STF-007 user and timestamp | Met | 1 | status_history row with user and time; append-only trigger |
| AC-SEC-002-A * | FR-SEC-002 role-based access | Met | 1 | Backend role checks tested |
| AC-SEC-002-B * | FR-SEC-002 requester blocked from staff routes | Met | 1 | 403 tests |
| AC-SEC-002-C * | FR-SEC-002 interface honours roles | Partially met | 0.5 | Server enforces roles; some header/sidebar items are static |
| **Total** | | | **18.5 / 20** | **92.5 %** |

Sensitivity: if all ten unworded criteria were scored Not Met, the result would be 10 / 20 = 50 %.
Controlled change: the municipal category extension (13 categories) widened AC-REQ-002; no criterion was removed.
Out of M1 scope (not counted): live SMS/WhatsApp delivery (simulated, Decision 17).