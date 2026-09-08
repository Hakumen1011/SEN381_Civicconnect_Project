# CivicConnect — Requirements & Analysis Lead
## Milestone 1 (M1) Working Document

> **Document status:** Draft  
> **Version:** 0.1  
> **Owner:** Jason Crous-Requirements & Analysis Lead  
> **Project:** CivicConnect  
> **Milestone:** M1 — Engineering Foundation & Requirements Baseline

---

## 1. Document Purpose

This document describes my role as Requirements & Analysis Lead for the CivicConnect project. It is intended to provide a controlled, traceable basis for the team's Milestone 1 Project Engineering Document (PED).

The document will be reviewed by all team members before requirements are formally baselined.

---

# 2. Problem & Business Need

## 2.1 Current Problem

CivicConnect currently manages service requests through multiple uncontrolled communication channels, including email, telephone, WhatsApp, spreadsheets and paper records. This fragmented process prevents the organisation from maintaining a reliable, central record of each service request and its lifecycle.

The main operational problem is therefore not simply the use of multiple communication methods, but the lack of a controlled process for recording, assigning, tracking and closing requests.

### Key Problems

| Problem | Business Consequence |
|---|---|
| Requests are spread across multiple channels | Requests may be duplicated, overlooked or lost |
| No central request record | Staff cannot reliably determine the current state of a request |
| Unclear ownership | Requests may remain unassigned or be delayed |
| Limited requester visibility | Requesters do not know whether a request was received or resolved |
| Weak status accountability | It is difficult to establish who changed what and what action was taken |
| Manual reporting | Management information is inconsistent and difficult to audit |
| Informal handling of sensitive information | Request information may not receive consistent protection |

## 2.2 Business Impact

The fragmented request process creates operational inefficiencies and prevents CivicConnect from consistently managing service demand.

At an operational level, staff may spend additional time locating requests, determining ownership, requesting updates and manually compiling information for management. Requesters experience uncertainty because they have limited visibility into whether a request has been received, assigned, delayed, resolved or closed.

At a management level, the absence of a controlled request lifecycle reduces the reliability of information about outstanding, overdue and resolved work. This limits the organisation's ability to identify service bottlenecks, monitor performance and demonstrate accountability.

## 2.3 Intended Business Value

CivicConnect requires a controlled digital service-request platform that establishes a single, traceable record for each request.

The intended business value is to:

- Improve visibility of request status and ownership.
- Reduce the likelihood of requests being lost, duplicated or overlooked.
- Provide staff with a structured way to manage and prioritise work.
- Improve accountability through controlled status and action recording.
- Provide management with more reliable information about service activity.
- Reduce dependence on fragmented manual reporting.
- Improve the consistency with which sensitive request information is handled.

---

# 3. Stakeholder Analysis

## 3.1 Stakeholder Register

| ID | Stakeholder | Role / Relationship | Influence | Interest | Key Needs / Expectations | Potential Concern | Engagement |
|---|---|---|---|---|---|---|---|
| STK-001 | Requesters | People who submit service requests | Medium | High | Simple submission, confirmation, status visibility, request history, meaningful feedback | Convenience may conflict with security controls | Consult & validate |
| STK-002 | Service Staff | Receive, manage, assign and resolve requests | High | High | Central work queue, search/filter, clear ownership, prioritisation, status updates, action history | Efficiency must be balanced with controlled access and workflow | Manage closely |
| STK-003 | Management / Supervisors | Oversee service activity and performance | High | High | Open/overdue/resolved visibility, reporting, accountability, performance information | Additional reporting requests may increase scope | Manage closely |
| STK-004 | System Administrator | Manages users, permissions and configuration | High | Medium | Secure access control, role management, maintainable administration | Stronger controls can add process steps | Keep satisfied |
| STK-005 | IT / Technical Support | Supports technical operation and maintenance | Medium | Medium | Reliability, maintainability, diagnosability, controlled changes | Technical complexity can increase support burden | Consult |
| STK-006 | Organisational Leadership | Strategic/business oversight | High | Medium | Business value, sustainable cost, acceptable quality, controlled scope | Desired functionality may exceed available resources | Keep satisfied |
| STK-007 | Security / Information Responsibility | Concerned with handling sensitive request information | High | Medium | Controlled access, secure information handling, accountability | Security requirements may constrain convenience | Consult closely |
| STK-008 | Project Team | Designs, develops, tests and documents CivicConnect | High | High | Clear requirements, stable scope, achievable schedule and measurable quality | Scope changes increase workload and project risk | Manage closely |

## 3.2 Stakeholder Needs Register

| Need ID | Stakeholder | Need |
|---|---|---|
| STK-NEED-001 | STK-001 Requester | Ability to submit a complete service request through a controlled process |
| STK-NEED-002 | STK-001 Requester | Confirmation that a request has been successfully recorded |
| STK-NEED-003 | STK-001 Requester | Visibility of the current request status |
| STK-NEED-004 | STK-001 Requester | Access to previously submitted requests |
| STK-NEED-005 | STK-002 Service Staff | Centralised access to requests relevant to their responsibilities |
| STK-NEED-006 | STK-002 Service Staff | Ability to find and prioritise relevant requests |
| STK-NEED-007 | STK-002 Service Staff | Clear ownership and assignment of requests |
| STK-NEED-008 | STK-002 Service Staff | Ability to record actions and resolution information |
| STK-NEED-009 | STK-003 Management | Visibility of open, overdue, resolved and closed work |
| STK-NEED-010 | STK-003 Management | Information that supports service-performance analysis |
| STK-NEED-011 | STK-004 Administrator | Role-based access and secure administration |
| STK-NEED-012 | STK-005 IT Support | Reliable and maintainable system behaviour |
| STK-NEED-013 | STK-006 Leadership | Controlled scope and sustainable project cost |
| STK-NEED-014 | STK-007 Security Responsibility | Appropriate protection and accountability for sensitive information |
| STK-NEED-015 | STK-008 Project Team | Clear, testable and stable requirements |

## 3.3 Influence / Interest Summary

| Stakeholder | Influence | Interest | Engagement |
|---|---|---|---|
| Management | High | High | Manage closely |
| Service Staff | High | High | Manage closely |
| Requesters | Medium | High | Consult & validate |
| System Administrator | High | Medium | Keep satisfied |
| Leadership | High | Medium | Keep satisfied |
| Security / Information Responsibility | High | Medium | Consult closely |
| IT Support | Medium | Medium | Consult |
| Project Team | High | High | Manage closely |

## 3.4 Stakeholder Conflicts and Trade-offs

| Conflict ID | Stakeholders | Competing Expectations | Engineering Implication |
|---|---|---|---|
| CONFLICT-001 | Requesters vs Security Responsibility | Simple access vs controlled access | Authentication and authorisation must be applied without unnecessarily harming usability |
| CONFLICT-002 | Management vs Project Team | More features/reports vs fixed schedule and resources | Additional functionality must be evaluated against scope, schedule, cost, quality and risk |
| CONFLICT-003 | Staff vs Security Responsibility | Broad access vs restricted sensitive information | Access should be based on role and responsibility |
| CONFLICT-004 | Leadership vs Stakeholders | More functionality vs sustainable project cost | Scope must be baselined and changes controlled |

---

# 4. Scope Baseline

## 4.1 In Scope

### Requester
- User authentication.
- Submission of new service requests.
- Capture of required request information.
- Controlled request categorisation.
- Confirmation that a request has been recorded.
- Viewing current request status.
- Viewing previously submitted requests.
- Receiving meaningful feedback about request progress or completion.

### Staff
- Viewing authorised/relevant service requests.
- Searching requests.
- Filtering requests.
- Sorting requests.
- Viewing complete request details.
- Assigning or accepting responsibility.
- Updating request status through controlled transitions.
- Recording actions/comments.
- Recording resolution information.
- Resolving/closing requests where authorised.

### Management
- Viewing service activity information.
- Identifying open requests.
- Identifying overdue requests.
- Identifying resolved and closed requests.
- Analysing requests by category and status.
- Accessing information supporting accountability and performance analysis.

### Security and Control
- Authentication.
- Role-based authorisation.
- Controlled status transitions.
- Recording important request actions/status changes.

## 4.2 Out of Scope

The following are proposed as out of scope for the initial baseline:

- Native mobile applications.
- Replacement of every existing communication channel.
- Complex integration with external enterprise systems.
- Advanced artificial-intelligence functionality.
- Predictive analytics.
- Full automation of service dispatching.

## 4.3 Deferred / Future Scope

Potential future enhancements may include:

- WhatsApp integration.
- Automated SMS notifications.
- Advanced dashboards.
- AI-assisted categorisation.
- Predictive service-demand analysis.
- Integration with external organisational systems.
- Dedicated mobile applications.

## 4.4 Deliberate Scope Deferment

### Decision: Defer WhatsApp Integration

WhatsApp integration could provide convenience because CivicConnect currently receives requests through WhatsApp. However, integrating WhatsApp into the initial solution would introduce additional integration dependencies, security considerations, testing obligations and maintenance requirements.

The immediate business need is to establish a reliable, controlled service-request lifecycle rather than reproduce every existing communication channel within the first release.

Therefore, WhatsApp integration is deliberately deferred so the team can prioritise the central request record and core requester, staff and management capabilities within the available schedule and resources.

---

# 5. Requirements

## 5.1 Source Codes

| Source ID | Source |
|---|---|
| BN-001 | CivicConnect Business Need |
| CAP-REQ | Requester Minimum Business Capabilities |
| CAP-STF | Staff Minimum Business Capabilities |
| CAP-MGT | Management/Oversight Minimum Business Capabilities |
| CON-SEC | Security Constraint |
| CON-SCP | Scope Constraint |
| CON-SCH | Schedule Constraint |
| CON-COST | Cost Constraint |
| STK-NEED | Stakeholder Need Register |

---

## 5.2 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-REQ-001 | The system shall allow an authenticated requester to submit a new service request containing all mandatory request information. | Must | CAP-REQ / STK-NEED-001 |
| FR-REQ-002 | The system shall require each service request to be assigned a category from a controlled set of categories. | Must | CAP-REQ / STK-NEED-001 |
| FR-REQ-003 | The system shall assign a unique reference to every successfully created service request. | Must | BN-001 |
| FR-REQ-004 | The system shall provide confirmation to the requester after a service request has been successfully recorded. | Must | STK-NEED-002 |
| FR-REQ-005 | The system shall allow a requester to view the current status of service requests they have submitted. | Must | CAP-REQ / STK-NEED-003 |
| FR-REQ-006 | The system shall allow a requester to view previously submitted service requests. | Must | CAP-REQ / STK-NEED-004 |
| FR-REQ-007 | The system shall provide meaningful feedback when a request is accepted, updated, resolved or closed. | Must | CAP-REQ / STK-NEED-003 |
| FR-STF-001 | The system shall allow authorised staff to view service requests relevant to their responsibilities. | Must | CAP-STF / STK-NEED-005 |
| FR-STF-002 | The system shall allow authorised staff to search service requests using defined search criteria. | Must | CAP-STF / STK-NEED-006 |
| FR-STF-003 | The system shall allow authorised staff to filter service requests using useful criteria such as status and category. | Must | CAP-STF / STK-NEED-006 |
| FR-STF-004 | The system shall allow authorised staff to sort service requests using supported criteria. | Must | CAP-STF / STK-NEED-006 |
| FR-STF-005 | The system shall allow authorised staff to view the complete details of an authorised service request. | Must | CAP-STF / STK-NEED-005 |
| FR-STF-006 | The system shall allow authorised staff to assign or accept responsibility for a service request. | Must | CAP-STF / STK-NEED-007 |
| FR-STF-007 | The system shall restrict service-request status changes to defined workflow transitions. | Must | BN-001 / STK-NEED-008 |
| FR-STF-008 | The system shall allow authorised staff to record relevant actions and comments against a service request. | Must | CAP-STF / STK-NEED-008 |
| FR-STF-009 | The system shall allow authorised staff to record resolution information for a service request. | Must | CAP-STF / STK-NEED-008 |
| FR-STF-010 | The system shall allow authorised staff with appropriate permissions to resolve or close a service request. | Must | CAP-STF / STK-NEED-007 |
| FR-MGT-001 | The system shall provide authorised management users with visibility of currently open service requests. | Must | CAP-MGT / STK-NEED-009 |
| FR-MGT-002 | The system shall identify service requests that are overdue according to defined service criteria. | Must | CAP-MGT / STK-NEED-009 |
| FR-MGT-003 | The system shall allow authorised management users to identify resolved and closed requests. | Must | CAP-MGT / STK-NEED-009 |
| FR-MGT-004 | The system shall allow authorised management users to view service-request information by category and status. | Must | CAP-MGT / STK-NEED-010 |
| FR-SEC-001 | The system shall authenticate users before allowing access to protected CivicConnect functions. | Must | CON-SEC / STK-NEED-011 |
| FR-SEC-002 | The system shall restrict functions and service-request information according to the authenticated user's assigned role. | Must | CON-SEC / STK-NEED-011 / STK-NEED-014 |

---

# 6. Non-Functional Requirements

| ID | Category | Requirement | Priority | Measure / Target | Acceptance Method |
|---|---|---|---|---|---|
| NFR-SEC-001 | Security | CivicConnect shall enforce role-based access control for all protected service-request functions and information. | Must | 100% of defined protected functions covered by authorisation testing | Security test |
| NFR-SEC-002 | Security | User passwords shall not be stored in plaintext. | Must | 100% of stored passwords use approved secure protection | Database/security inspection |
| NFR-PERF-001 | Performance | Under normal expected operating conditions, 95% of standard request-list and request-detail operations shall return a result within 2 seconds. | Should | 95% ≤ 2 seconds | Performance test |
| NFR-USAB-001 | Usability | The requester submission process shall be understandable without requiring assistance from CivicConnect staff. | Must | At least 4 of 5 representative users complete the process without assistance | Usability test |
| NFR-REL-001 | Reliability | Once CivicConnect confirms successful submission of a service request, the request shall remain retrievable from the system. | Must | 100% of successfully confirmed test submissions remain retrievable | Functional/reliability test |
| NFR-AUD-001 | Auditability | Defined service-request status changes shall record the responsible user and timestamp. | Must | 100% of tested defined status changes contain the required information | Auditability test |
| NFR-MAIN-001 | Maintainability / Process Control | All baselined requirements, risks, decisions, changes, tests and defects shall use unique identifiers and controlled versioned artefacts. | Must | 100% of baselined M1 requirements have unique IDs and traceability entries | Artefact review |

---

# 7. Acceptance Criteria Register

## AC-REQ-001 — Submit Service Request

- **AC-REQ-001-A:** Given an authenticated requester has completed all mandatory fields, when the requester submits the request, then a new service-request record is created.
- **AC-REQ-001-B:** Given one or more mandatory fields are empty, when the requester attempts submission, then submission is prevented and the missing information is identified.
- **AC-REQ-001-C:** Given a request is successfully created, then the system provides confirmation and a request reference.

## AC-REQ-002 — Controlled Category

- **AC-REQ-002-A:** Given a requester is creating a request, when a category is selected, then the selected value must come from the controlled category list.
- **AC-REQ-002-B:** Given no valid category is selected, when the requester submits the request, then submission is prevented.

## AC-REQ-003 — Unique Reference

- **AC-REQ-003-A:** Every successfully created request receives a request reference.
- **AC-REQ-003-B:** Two service requests cannot have the same reference.
- **AC-REQ-003-C:** The request reference is visible after successful submission.

## AC-REQ-005 — Current Status

- **AC-REQ-005-A:** An authenticated requester can view their submitted requests.
- **AC-REQ-005-B:** Each displayed request shows its current status.
- **AC-REQ-005-C:** A requester cannot view another requester's protected request status.

## AC-STF-006 — Assignment

- **AC-STF-006-A:** An authorised staff member can assign responsibility for a request.
- **AC-STF-006-B:** The assigned responsible party is stored against the request.
- **AC-STF-006-C:** The current responsible party can be identified from the request record.

## AC-STF-007 — Status Transitions

- **AC-STF-007-A:** Valid status transitions can be performed by authorised users.
- **AC-STF-007-B:** Invalid status transitions cannot be saved.
- **AC-STF-007-C:** A successful status transition records the resulting status.

## AC-SEC-002 — Role-Based Authorisation

- **AC-SEC-002-A:** Users can access functions permitted to their role.
- **AC-SEC-002-B:** Users cannot access functions outside their role permissions.
- **AC-SEC-002-C:** Protected request information is inaccessible to unauthorised users.

---

# 8. Proposed Traceability Structure

The Requirements & Analysis Lead will provide the following information to the RTM owner:

**Stakeholder → Stakeholder Need → Requirement → Acceptance Criterion → Test → Evidence**

Example:

> STK-001 Requester  
> ↓  
> STK-NEED-003 Status visibility  
> ↓  
> FR-REQ-005 View current status  
> ↓  
> AC-REQ-005-A/B/C  
> ↓  
> TEST-REQ-005  
> ↓  
> Test evidence

---

# 9. M1 Evidence Checklist

- [ ] Problem and Business Need analysis
- [ ] Stakeholder Register
- [ ] Stakeholder Needs Register
- [ ] Influence/Interest analysis
- [ ] Stakeholder conflict/trade-off register
- [ ] Scope Baseline
- [ ] Scope exclusion/deferment decision
- [ ] Functional Requirements Catalogue
- [ ] Non-Functional Requirements Register
- [ ] Acceptance Criteria Register
- [ ] Team review record
- [ ] Requirements linked to RTM
- [ ] Baselined version approved by all team members

---

# 10. Review and Baseline

Before the requirements become part of the formal M1 baseline:

1. Member 1 reviews the requirements for completeness and clarity.
2. Member 2 reviews scope, constraints, cost, schedule and governance implications.
3. Member 3 reviews traceability and testability.
4. All three members approve the final baseline.
5. The final PED is updated to **Version 1.0**.
6. The approved version is committed to GitHub and its history is preserved.

**Status:** Draft / Awaiting Team Review
