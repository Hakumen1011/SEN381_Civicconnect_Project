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