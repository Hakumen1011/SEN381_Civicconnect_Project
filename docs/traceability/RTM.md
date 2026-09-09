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
