# CivicConnect – Project Engineering Document (PED) v3.0

## Document Control Table

| Document | CivicConnect Project Engineering Document |
|---|---|
| Version | 3.0 |
| Status | Draft – M3 team review and final sign-off pending |
| Project | CivicConnect |
| Milestone | M3 (continuation of approved M1/M2 history) |
| Owner | CivicConnect Team |
| Created | 2026/09/07 |
| Last Reviewed | 2026/10/16 (proposed M3 evidence update) |

## Version History Table

| Version | Date | Author | Description | Approval |
|---|---|---|---|---|
| 0.1 | 2026/09/07 | Jason Crous | Initial Requirements Analysis | Approved |
| 0.2 | 2026/09/07 | Zander De Groote | Risks, RTM, traceability and future dev considerations | Approved |
| 1.0 | 2026/09/07 |  | Final | Approved |
| 1.1 | 2026/09/28 | Herman Bantjes | NFR-PERF-001 revised: simulated SMS/WhatsApp notifications added | Approved |
| 1.2 | 2026/09/30 | Herman Bantjes | Constraints and trade-off, Engineering Decision Log, GitHub and team governance, AI Usage Register and PED integration and the baseline sign-off continuation | Approved |
| 2.0 | 2026/09/30 | CivicConnect Team | M2 integration: all member sections merged, RTM and risk register updated, references combined (Harvard), M2 baseline sign-off and initial design decisions added | Approved |
| 2.1 | 2026/10/14 | Herman Bantjes | Zander De Groote's RTM, risk register and forward engineering updates merged: End-to-End RTM, RISK-016 to RISK-019, risk traceability, end-to-end traceability example and AI register entry | Approved |
| 2.2 | 2026/10/14 | Herman Bantjes | Tech stack updated to the one in use (Decision 14); .NET stack (Decision 6) deferred | Approved |
| 3.0 | 2026/10/16 | CivicConnect team (proposed evidence consolidation) | Continues v2.2 with M3 verification results, live integration scope, traceability, CI evidence and unresolved release risks | **Approved team review** |

## Baseline sign-off Table

| Role | Name | Approval | Date |
|---|---|---|---|
| Requirements & Analysis Lead | Jason Crous | Approved | 2026/09/07 |
| Risk, Traceability & Future Planning Lead | Zander De Groote | Approved | 2026/09/09 |
| Constraints & Governance | Herman Bantjes | Approved | 2026/09/09 |

> **M3 evidence locator:** The [Milestone 3 verification and release-readiness continuation](#milestone-3-verification-and-release-readiness-continuation-16-october-2026) appears after the historical M2 material. Earlier content is retained as the dated baseline and does not establish current implementation status by itself.

## M2 Architecture, Technology & Initial Design Baseline

This baseline records the main M2 decisions the team has agreed on, so development can continue without re-deciding them. It is part of PED v2.0 (30 September 2026). Any change to it must go through the team's change-control process (Engineering Decision Log, Decision 3).

| **Baseline item** | **What was decided** | **Where to find it** |
|---|---|---|
| Architecture | Layered modular monolith: one Node.js + Express (TypeScript) application with Requests, Users/Roles, Notifications and Reporting modules | Engineering Decision Log, Decision 5 |
| Technology stack | TypeScript; Node.js + Express back end; React + Vite front end; PostgreSQL; JWT + bcrypt; Vitest + Supertest; GitHub Actions | Engineering Decision Log, Decision 14 (replaces Decision 6) |
| Data and persistence | Relational database; business rules in the application and constraints in the database; request changes saved in one transaction | Engineering Decision Log, Decision 7; Data and Persistence Baseline |
| Design decisions | Status changes handled with an Observer-style event; category rules kept simple now, Strategy pattern later if needed | Engineering Decision Log, Decisions 8–9; Initial Design Decisions (M2) |
| Interfaces | The React front end calls the back end through a REST API; modules use service interfaces inside the back end; SMS and WhatsApp are simulated | Engineering Decision Log, Decisions 10–11; Notification Integration section |
| Performance target | 90% of standard requests within 4 seconds | NFR-PERF-001 |

**Not part of this baseline (still open):** live SMS and WhatsApp services (Decision 12) and the quality-gate, threat-model, rollback and backup decisions planned for M3 (Decision 13).

**M2 baseline approval:**

| **Role** | **Name** | **Approval** | **Date** |
|---|---|---|---|
| Requirements & Analysis Lead | Jason Crous | Approved |  |
| Risk, Traceability & Future Planning Lead | Zander De Groote | Approved |  |
| Constraints & Governance | Herman Bantjes | Approved |  |

## Problem & Business Need

### Current Operational Problem

CivicConnect currently manages service requests through multiple uncontrolled communication channels, including email, telephone, WhatsApp, spreadsheets, and paper records. This fragmented process thus prevents the organisation from maintaining a reliable, central record of each service request and its lifecycle.

The main operational problem is therefore not simply the use of multiple communication methods, but the lack of a **controlled process for recording, assigning, tracking and closing requests**.

This scenario creates several consequences:

| Problem: | Impact on CivicConnect: |
|---|---|
| Requests are widely spread across multiple channels. | Requests could be duplicated, lost and even overlooked. |
| No central request records. | Staff cannot reliably determine the current state of a request. |
| Uncertainty of Ownership. | Requests may remain unassigned or be delayed. |
| Limited requester visibility. | Requesters are unaware whether a request has been received or resolved. |
| Poor status accountability. | It is currently difficult to establish who changed a request and what action was taken. |
| Manual reporting procedures. | Management information is inconsistent and difficult to audit. |
| Informal handling of sensitive information. | Request information may not receive consistent access protection. |

## Supporting Evidence: Process Diagram

### Current state of operations

## Business Impact

The fragmented request process creates operational problems and prevents CivicConnect from consistently managing service demand.

**Operationally**, staff might spend **extra time** searching for requests, identifying ownership, requesting updates, and **manually gathering** information for management. **Requesters** often feel **uncertain** because they have **limited visibility** into **whether** their **requests** have been **received, assigned, delayed, resolved, or closed**.

**At** the **management level**, the absence of a controlled request lifecycle **reduces** the **reliability of information** on outstanding, overdue and resolved work. This **limits** the **organisation's ability** to **identify** service **bottlenecks**, **monitor performance** and **demonstrate** **accountability**.

The current process also creates an **information-management** and **security concern** because **sensitive request information** may be **distributed through** informal channels **without consistent access controls**.

### Business Impact Matrix

| Impact Area: | Current Effect: | Business Consequence: |
|---|---|---|
| Efficiency | Manual coordination and reporting. | The staff’s time is wasted. |
| Visibility | Requests cannot be reliably tracked by requesters. | Increased uncertainty and follow-up requests. |
| Accountability | Changes may not be consistently recorded. | Difficult to audit responsibility. |
| Service Management | Ownership and prioritisation are unclear. | Delays and inconsistent handling. |
| Reporting | Information is manually consolidated. | Management information is less reliable. |
| Information security | Sensitive information can move through informal channels. | Greater risk of security exposure. |

### Intended Business Value

CivicConnect requires a controlled digital service-request platform that establishes a **single, traceable record for each request**.

The intended business value is to:

1. Improve visibility of request status and ownership.
2. Reduce the likelihood of requests being lost, duplicated or overlooked.
3. Provide staff with a structured way to manage and prioritise work.
4. Improve accountability through controlled status and action recording.
5. Provide management with more reliable information about service activity.
6. Reduce dependence on fragmented manual reporting.
7. Improve the consistency with which sensitive request information is handled.

The solution should achieve these benefits without introducing an unsustainable technical, financial or operational burden.

### From Business Value to Requirements mapping

![image2](media/image2.png)

## Stakeholder Analysis

### Stakeholder Identification

| ID | Stakeholder | Role in System | Primary Interest |
|---|---|---|---|
| STK-001 | Requesters | Submitting and Monitoring requests | Ease of use and visibility |
| STK-002 | Service Staff | Managing and resolving requests. | Efficient request processing. |
| STK-003 | Management | Monitoring service activities. | Reporting and accountability. |
| STK-004 | System Administrator | Manage users and system access. | Security and access control. |
| STK-005 | IT/Technical Support | Support during tech operations. | System reliability and maintainability. |
| STK-006 | Organisational leadership personnel | Oversight of business processes. | Cost, quality and operational value. |

### Stakeholder Needs

| Stakeholder | Need | Why it Matters |
|---|---|---|
| Requester | Submit a request with required information | Ensures the organisation receives sufficient information |
| Requester | Receive confirmation | Provides evidence that the request was recorded |
| Requester | See status of submitted requests | Reduces Uncertainty during decision-making |
| Requester | View previous requests. | Supports history and follow-up management. |
| Staff | See relevant requests. | Creates a manageable work queue. |
| Staff | Search/filter/sort requests. | Helps prioritise and locate work. |
| Staff | Assign responsibility. | Establishes ownership. |
| Staff | Records actions and resolutions. | Supports continuity and accountability. |
| Management | Views requests that are open or overdue. | Supports service oversight. |
| Management | Analyse activity by status/category | Supports performance analysis |
| Administrator | Controls access according to roles. | Protects request information. |
| IT Support | Maintains a reliable system | Reduces operational disruption |
| Leadership | Maintains sustainable cost and scope decisions. | Prevents an unnecessarily complex solution. |

### Influence/Interest Analysis

| Stakeholder | Influence | Interest | Engagement Approach |
|---|---|---|---|
| Management | High | High | Keep management closely involved in the requirements validation process. |
| Service Staff | High | High | Encourage regular feedback on workflow requirements. |
| Requesters | Medium | High | Validate usability and submission needs. |
| System Admin | High | Medium | Validate security and access requirements. |
| IT Support | Medium | Medium | Consult on maintainability and technical constraints. |
| Leadership | High | Medium | Review scope, cost and business value. |

### Stakeholder Conflicts and Trade-offs

**Conflict 1: Usability vs Security**

**Requesters** benefit from a **quick and simple submission process**, while the **organisation** requires **controlled access** to potentially sensitive **request information**.

The engineering **implication** is that CivicConnect **must provide an accessible submission process** while still **enforcing appropriate authentication** and **authorisation**. **Security** should therefore be **incorporated** into the **requirements rather than added after** functionality is implemented.

**Conflict 2: Additional Functionality vs Scope/Schedule**

**Management** may **benefit** from **advanced functionality** such as extensive analytics, integrations or automated notifications. **However**, every additional feature **increases** specification, development, testing, security, documentation and maintenance **obligations**.

The engineering **implication** is that **additional functionality** should **only be included** where **stakeholder value** **justifies** its **effect** on scope, schedule, cost, quality and risk.

## Scope Baseline

Establishing the boundaries of the project.

### In Scope

![image3](media/image3.png)

### Out of Scope

The following are considered out of Scope for the initial baseline:

- Native mobile applications.
- Replacement of existing communication channels.
- Complex integration with external enterprise systems.
- Advanced AI functionality.
- Predictive analytics functionality.
- Full automation of service dispatching.

These exclusions **prevent the initial solution** from **becoming unnecessarily large** and **protect** the project's **schedule and quality objectives**.

### Deferred/Future Scope

Potential future enhancements/features may include:

- Live WhatsApp Business Platform integration (simulated in the current baseline; see Notification Integration section).
- Live SMS gateway notifications (simulated in the current baseline; see Notification Integration section).
- Overly engineered dashboards.
- AI-assisted categorisation.
- Predictive service-demand analysis procedures.
- Integration with external organisational systems.
- Dedicated mobile applications.

These features are not rejected permanently. They are deliberately **deferred** until their business value, technical feasibility, security implications, cost and schedule impact are evaluated.

### Scope Exclusion Justification

Decision: Defer live WhatsApp integration; simulate it in the current baseline.

Based on the information presented in the scenario, our team has deduced that CivicConnect currently receives requests through WhatsApp, making integration appear attractive. **However**, integrating WhatsApp into the initial solution would introduce additional API/integration dependencies, security considerations, testing obligations and maintenance requirements.

The **immediate business need** is to **establish a reliable, controlled service-request lifecycle** rather than reproduce every existing communication channel within the first release.

Therefore, WhatsApp integration is deliberately deferred so that the team can prioritise the controlled central request record and core requester, staff and management capabilities **within** the **available schedule and resources**.

Update (v1.1): Simulated SMS and WhatsApp notifications

Following milestone feedback, SMS and WhatsApp notifications are now part of the baseline as a simulation (FR-NOT-001 – FR-NOT-007). Only the connection to the real WhatsApp and SMS services is still deferred. Real services would add a cost for every message sent a sign-up and approval process (Meta, 2026a) and extra legal duties for handling phone numbers under POPIA (Republic of South Africa, 2013). The simulation shows how the channels will work without taking on that cost and risk. Full details are in the Notification Integration section.

## Functional Requirements

### Requester Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-REQ-001 | The system shall allow an authenticated requester to submit a new service request containing all mandatory request information. | Must | CAP-REQ-001 / STK-NEED-001 |
| FR-REQ-002 | The system will require each service request to be assigned a category from a controlled set of categories. | Must | CAP-REQ-002 |
| FR-REQ-003 | The system will generate a unique reference for each successfully submitted service request. | Must | Business Need |
| FR-REQ-004 | The system shall confirm the recording of submitted requests. | Must | STK-NEED-002 |
| FR-REQ-005 | The system shall allow a requester to view the status of their submitted requests. | Must | STK-NEED-003 |
| FR-REQ-006 | The system shall allow a requester to view a history of previously submitted requests. | Must | CAP-REQ-003 |
| FR-REQ-007 | The system shall display meaningful feedback when a request is updated, resolved or closed. | Must | Business Capability |

### Staff Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-STF-001 | The system shall allow authorised staff to view service requests relevant to their responsibilities. | Must | CAP-STF-001 |
| FR-STF-002 | The system shall allow authorised staff to search service requests using defined search criteria. | Must | CAP-STF-002 |
| FR-STF-003 | The system shall allow authorised staff to filter service requests by useful criteria such as status and category. | Must | CAP-STF-002 |
| FR-STF-004 | The system shall allow authorised staff to sort service requests using supported criteria. | Must | CAP-STF-002 |
| FR-STF-005 | The system shall allow authorised staff to view the full details of an individual service request. | Must | CAP-STF-003 |
| FR-STF-006 | The system shall allow authorised staff to assign or accept responsibility for a service request. | Must | CAP-STF-004 |
| FR-STF-007 | The system shall restrict status changes to defined request workflow transitions. | Must | Business Need |
| FR-STF-008 | The system shall allow authorised staff to record actions and comments against a service request. | Must | CAP-STF-005 |
| FR-STF-009 | The system shall allow authorised staff to record resolution information. | Must | CAP-STF-005 |
| FR-STF-010 | The system shall allow authorised staff with appropriate permissions to resolve or close a service request. | Must | CAP-STF-006 |

### Management Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-MGT-001 | The system shall provide management users with visibility of open service requests. | Must | CAP-MGT-001 |
| FR-MGT-002 | The system shall identify service requests that have become overdue according to the defined service criteria. | Must | CAP-MGT-002 |
| FR-MGT-003 | The system shall provide visibility of resolved and closed requests. | Must | CAP-MGT-003 |
| FR-MGT-004 | The system shall allow management users to view request information by category and status. | Must | CAP-MGT-004 |
| FR-MGT-005 | The system shall provide information that supports accountability for request status and recorded actions. | Must | Business Need |

### Security and Control Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-SEC-001 | The system shall authenticate users before providing access to protected functions. | Must | CON-SEC-001 |
| FR-SEC-002 | The system shall restrict system functions and request information according to the user's authorised role. | Must | CON-SEC-002 |
| FR-SEC-003 | The system shall prevent unauthorised users from accessing protected service-request information. | Must | Business Need |
| FR-SEC-004 | The system shall record the user responsible for important service-request status changes. | Must | Business Need |

## Notification Integration: SMS and WhatsApp (Simulated)

This section responds to the milestone feedback on SMS and WhatsApp notifications. It explains what CivicConnect will build now (a simulation of both channels), how the simulation works, and what would be needed to connect to the real services later.

### Why notifications are needed

Requesters need to know that their request was received and how it is progressing (STK-NEED-002, STK-NEED-003; FR-REQ-004, FR-REQ-007). At the moment they can only find this out by logging in. South African municipalities already use these channels. The City of Cape Town lets residents report water and sanitation problems on WhatsApp, including a description, the location and photos (City of Cape Town, 2023). The City of Tshwane’s WhatsApp service handled about 29 700 interactions in a single month (Mzekandaba, 2020).

Similar 311 service-request systems overseas also expect residents to receive status updates. Ogden City requires real-time status updates by email, with in-app notifications as an option (Ogden City Corporation, 2024). Commercial 311 products such as SeeClickFix also advertise “automated status updates, two-way interactions, and effortless tracking” for residents (CivicPlus, 2026).

### Decision: Simulate SMS and WhatsApp in the current baseline

CivicConnect will build the complete notification process: detecting the event, choosing the message, checking consent, queueing, tracking delivery and logging. Only the final “send” step is simulated instead of going to a real SMS or WhatsApp service. The table below explains why.

| **Factor** | **What real integration would involve** | **Source** |
|---|---|---|
| Cost | Since 1 July 2025, Meta charges for each delivered WhatsApp template message, based on the message type and the recipient’s country (Meta, 2026b). SMS services also charge per message. This conflicts with the project’s no-cost or low-cost constraint. | Meta (2026b); Constraint 3: Cost |
| Sign-up and approval | A Meta Business Account and a registered business phone number are needed, and the business must be verified before messaging real customers (Meta, 2026a). Each message template must be approved first, which can take up to 24 hours (Meta, 2026c). | Meta (2026a); Meta (2026c) |
| Test limits | The free WhatsApp test number can only send to 5 phone numbers, so even a “real” demonstration would be limited (Meta, 2026a). | Meta (2026a) |
| Data protection | The SMS or WhatsApp company would handle requesters’ phone numbers on CivicConnect’s behalf. POPIA section 21 requires a written contract that makes that company keep the information secure, and section 72 limits sending personal information outside South Africa (Republic of South Africa, 2013). | Republic of South Africa (2013) |
| Schedule and scope | Real integration adds outside dependencies, testing and maintenance, which the team has already listed as scope and cost risks. | RISK-001, RISK-010, RISK-015 |

A simulation lets the team demonstrate and test the full process at no cost, with no personal data leaving the system. The design also means the real services can later be switched on through configuration. Messaging companies support this way of working themselves: Twilio’s test credentials let developers use its service without being charged and without sending messages to real phones (Twilio, 2026a).

### Notification requirements

| **ID** | **Requirement** | **Priority** | **Source** |
|---|---|---|---|
| FR-NOT-001 | The system shall create a notification when a service request is submitted, assigned, changes status, is resolved or is closed. | Should | STK-NEED-002, STK-NEED-003 |
| FR-NOT-002 | The system shall let a requester choose how to be notified (in-app, SMS, WhatsApp) and shall record their permission (opt-in), with the date and time, before any SMS or WhatsApp message is sent to them. | Should | Meta (2026d); Republic of South Africa (2013) |
| FR-NOT-003 | The system shall send all notifications through one shared notification interface, so that the simulated services can be replaced by real ones through configuration, without changing the rest of the code. | Should | Freeman and Robson (2020); Cockburn and Garrido de Paz (2024); NFR-MAIN-001 |
| FR-NOT-004 | The system shall record every notification (request reference, channel, recipient, message, times and delivery status) in a notification log that authorised administrators can view. | Should | FR-MGT-005; NFR-AUD-001 |
| FR-NOT-005 | The system shall provide a simulated inbox that shows each SMS and WhatsApp message as the requester would receive it. | Could | Winters et al. (2020) |
| FR-NOT-006 | The simulated services shall return realistic delivery results (queued, sent, delivered, undelivered, failed), including test failures, and the system shall retry a failed message up to three times. | Could | Twilio (2026a); Twilio (2026b) |
| FR-NOT-007 | Sending a notification shall not slow down the action that caused it; notifications shall be sent in the background. | Should | Richardson (2018); NFR-PERF-001 |

### How the simulation works

**Request event**

**↓**

**Notification service (checks preferences and opt-in, chooses the message template)**

**↓**

**Notification log (status: Queued)**

**↓**

**Background sender**

**↓**

**Simulated SMS or WhatsApp service**

**↓**

**Simulated delivery result (Sent → Delivered, Undelivered or Failed)**

**↓**

**Notification log updated and message shown in the simulated inbox**

**Step 1 – Event.**

When a request is submitted or a staff member changes it (FR-STF-006 – FR-STF-010), the system saves the change and the notification record together, in one database transaction, with the status Queued. This is known as the transactional outbox pattern. Because both are saved together, a status change can never be saved without its notification, or the other way round (Richardson, 2018).

**Step 2 – Consent check.**

SMS and WhatsApp messages are only created if the requester has opted in to that channel (FR-NOT-002). WhatsApp requires businesses to get this permission clearly and to name the business when asking (Meta, 2026d). In-app notifications are always created.

**Step 3 – Message template.**

Messages are built from fixed templates, for example: “CivicConnect: Request {reference} is now {status}. Log in to view the details.” This copies WhatsApp’s rule that businesses may only start a conversation with a pre-approved template (Meta, 2026c). Messages contain only the reference number and status not personal details which keeps personal information safer as required by POPIA section 19 (Republic of South Africa, 2013).

**Step 4 – Background sending.**

A separate background process picks up Queued messages and passes them to the simulated SMS or WhatsApp service, chosen by a configuration setting .Because this happens separately from the user’s action, a slow or failed message cannot slow the system down or affect NFR-PERF-001 (Richardson, 2018).

**Step 5 – Simulated service.** The simulated SMS and WhatsApp services follow the same interface that a real service would use. This is the Adapter design pattern (Freeman and Robson, 2020): the rest of the system talks to one interface, and the service behind it can be swapped. Cockburn and Garrido de Paz (2024) describe the same idea for connecting applications to outside services. In testing terms, the simulators are “fakes”: lightweight versions of a service that behave like the real one but are not suitable for production (Winters et al., 2020). They check that the phone number is in international format create a message ID and accept the message.

**Step 6 – Delivery result.** After a short random delay, the simulator changes the status to Sent and then Delivered, following the same statuses that real SMS services report: queued, sent, delivered, undelivered and failed (Twilio, 2026b). Special test numbers force errors, in the same way as Twilio’s test phone numbers (Twilio, 2026a): a number ending in 0001 fails as invalid, and one ending in 0009 is undelivered. Failed messages are retried up to three times and then flagged in the log (FR-NOT-006).

**Step 7 – Viewing the results.**
The simulated inbox shows the messages each test phone number would have received, with the channel and delivery status (FR-NOT-005). Administrators can view the full notification log (FR-NOT-004). This provides evidence for demonstrations and testing.

#### Notification acceptance criteria

| **ID** | **Given** | **When** | **Then** |
|---|---|---|---|
| AC-NOT-001-A | Requester has opted in to SMS | Staff change the request status | One SMS with the reference and new status appears in the notification log and the simulated inbox |
| AC-NOT-002-A | Requester has not opted in to WhatsApp | The request status changes | No WhatsApp message is created; the in-app notification is still shown |
| AC-NOT-006-A | Requester’s test number is set to fail | The notification is sent | Status is recorded as Failed, the message is retried three times and then flagged in the log |
| AC-NOT-007-A | Simulated delivery delay is set to 10 seconds | Staff save a status change | The status change finishes within the NFR-PERF-001 limit and the notification arrives afterwards |

### What would be needed for the real services

The table below compares what would be needed to connect CivicConnect to a real SMS service and to the WhatsApp Business Platform.

| **Area** | **SMS service** | **WhatsApp Business Platform (Meta)** |
|---|---|---|
| Accounts | An account with the provider, prepaid credit and a sender number or name. | Meta developer account, Meta Business Account, WhatsApp Business Account and a registered business phone number. The business must be verified before messaging real customers (Meta, 2026a). |
| Message rules | Plain-text messages, kept short to keep costs down. | Pre-approved templates are needed (the “utility” type for status updates); approval can take up to 24 hours (Meta, 2026c). |
| Consent | Recorded opt-in, and requests to stop (e.g. replying “STOP”) honoured. | Opt-in must clearly say messages will come on WhatsApp and name the business (Meta, 2026d). |
| Cost | Charged per message by the provider. | Charged per delivered template message, by type and country (Meta, 2026b). |
| Connection | Web API secured with an API key. For example, Clickatell’s API replies “202 Accepted” with a message ID for tracking (Clickatell, 2026). | Web API secured with an access token (Meta, 2026a). |
| Delivery updates | The provider calls back a public web address with status updates, which may arrive out of order (Twilio, 2026b). | Status updates are also sent to a public web address. |
| Security | API keys stored in environment settings, never in the GitHub repository; incoming status updates checked to confirm they come from the provider. | Same as SMS; access tokens changed regularly. |
| Data protection | Written contract with the provider (POPIA s. 21), rules for sending data outside South Africa met (s. 72) and the privacy notice updated (Republic of South Africa, 2013). | Same as SMS. |
| Change to CivicConnect | Add a real SMS service behind the same interface and set NOTIFICATION_MODE = live. | Add a real WhatsApp service behind the same interface and link each template to its approved name. |

**Steps to move from the simulation to the real services**

1. Get the change approved through the team’s change-control process (Engineering Decision 3), because it changes the scope baseline (Project Management Institute, 2021).
2. Create the provider accounts, complete Meta’s business verification and submit the message templates for approval (Meta, 2026a; Meta, 2026c).
3. Sign a written contract with each provider and update the privacy notice (Republic of South Africa, 2013).
4. Build the real SMS and WhatsApp services behind the existing notification interface and store the keys securely.
5. Set up the web address that receives delivery updates and match the provider’s statuses to CivicConnect’s statuses (Twilio, 2026b).
6. Run the same FR-NOT acceptance tests using the providers’ test tools before switching NOTIFICATION_MODE to live (Twilio, 2026a; Meta, 2026a).
7. Monitor message costs and delivery rates after going live.
### Notification traceability and risk

| **Requirement** | **Stakeholders need** | **Related risk** |
|---|---|---|
| FR-NOT-001, FR-NOT-004, FR-NOT-005 | STK-NEED-002, STK-NEED-003 | RISK-015 |
| FR-NOT-002 | STK-NEED-011, STK-NEED-014 | RISK-007 |
| FR-NOT-003, FR-NOT-006 | STK-NEED-015 | RISK-010, RISK-015 |
| FR-NOT-007 | STK-NEED-012 | None identified |

**Remaining risk:** a simulation cannot copy every behaviour of the real services, such as a template being rejected. To reduce this risk, the simulated statuses and rules are based on the providers’ own documentation (Meta, 2026c; Twilio, 2026b), and the providers’ test tools will be used before going live.

## Non-Functional Requirements

The following NFRs are attributed to being measurable, testable and aligned with business goals. (ISO/IEC/IEEE, 2018; ISO/IEC, 2011).

### Security

**NFR-SEC-001**

The system shall enforce role-based access control so that users can only access functions and service-request information permitted by their assigned role. (Sandhu et al., 1996).

**Acceptance target:**

100% of defined protected functions shall require appropriate authorisation during security testing.

**NFR-SEC-002**

The system shall not store user passwords in plaintext. (OWASP, 2024).

**Acceptance target:**

Password storage shall be verified during security review and source/database inspection.

### Performance

**NFR-PERF-001**

Under normal operating conditions, at least 90% of standard user requests shall be completed within 4 seconds. In other words, if all response times are sorted from fastest to slowest, the request at the 90% mark (the 90th percentile, or p90) must take 4 seconds or less (Beyer et al., 2018).

**What counts as a standard request:**

Standard requests are the everyday actions users perform: signing in, submitting a new service request and receiving its reference number (FR-REQ-001, FR-REQ-003, FR-REQ-004), loading a list of requests with search, filter or sort (FR-REQ-005, FR-REQ-006, FR-STF-001 – FR-STF-004, FR-MGT-001), and opening or updating a single request (FR-STF-005 – FR-STF-010). Report exports, file uploads and the sending of SMS and WhatsApp messages are not included. Messages are sent in the background, so the user never waits for them (FR-NOT-007).

**How it will be measured:**

Response time is the time from when the user’s browser sends a request until the full response comes back. It will be measured with the k6 load-testing tool, which records as http_req_duration (Grafana Labs, 2026). The 90th percentile is worked out separately for each type of request, so one slow action cannot be hidden by many fast ones (Beyer et al., 2018). Expected user numbers are not yet known (see Forward Engineering Considerations – Scalability), so the team will test with an assumed load of 25 users at the same time for 10 minutes. This assumption will be confirmed in Milestone 2.

**Acceptance target:**

The test passes if the k6 threshold p(90) < 4000 ms is met for every type of standard request. k6 automatically marks a test as failed when a threshold is broken (Grafana Labs, 2026). The test report is kept as verification evidence.

**Design goal (not a pass/fail rule):**

Half of all requests (the median) should finish in 2 seconds or less. Google’s RAIL performance model sets a target of under 2 seconds for pages loaded after the first visit (web.dev, 2020), and 2 seconds is also inside the 2.5-second limit that Core Web Vitals rate as “good” (McQuade, 2020).

#### Why 90% of requests within 4 seconds is a reasonable target

The target is based on published research and industry standards rather than a guess. ISO/IEC 25010 lists time behaviour as part of performance efficiency, which means it must be stated in a way that can be measured and tested (ISO/IEC, 2023). The reasons for each part of the target are explained below and summarised in the table at the end of this section.

**Why use a percentage of requests instead of an average**

Google’s Site Reliability Workbook advises setting speed targets as percentiles, for example “90% of requests < 450 ms”, because an average can look good even when some users wait much longer (Beyer et al., 2018). A 90% target makes sure that nine out of every ten requests are fast, instead of relying on an average that a few very fast responses could improve.

**Why 4 seconds**

Three separate sources point to about 4 seconds as the point where waiting stops being acceptable. Firstly, Google’s RAIL performance model explains that users start to lose focus on a task after about 1 second, and become frustrated and likely to give up after about 10 seconds (web.dev, 2020). A 4-second limit keeps users well inside that 10-second limit. Secondly, the Apdex standard rates a response as “satisfied” up to a target time T, “tolerating” up to four times T, and “frustrated” beyond that (New Relic, 2026). If T is set to 1 second, the point at which RAIL says users start to lose focus, 4 seconds is exactly the point where users become frustrated. Thirdly, Google’s Core Web Vitals rate a page that takes more than 4 seconds to show its main content as “poor” (McQuade, 2020).

**Why 90% and not 95% or 100%**

Google checks its Core Web Vitals at the 75th percentile, meaning that 75% of page loads must meet the limit (McQuade, 2020). Requiring 90% is therefore stricter than Google’s own test. The Site Reliability Workbook also explains that 100% is the wrong target, because it cannot be reached in practice and leaves no room to update and improve the system (Beyer et al., 2018). Finally, the project must use free or low-cost hosting (Constraint 3: Cost). Free hosting services pause when they are not in use: Render’s free services shut down after 15 minutes without traffic and take about one minute to start again (Render, 2026a). The remaining 10% allows for these slow starts and for weaker mobile connections.

**Why the earlier 2-second target was changed**

The previous version of this requirement asked for 95% of requests within 2 seconds. Two seconds is still a good target for a typical request (web.dev, 2020), so it remains the goal for the median. As a strict pass/fail limit, however, it is harder than most real websites manage on mobile. In 2025, only 62% of mobile websites showed their main content within 2.5 seconds, while 13% took longer than 4 seconds (Jariyal et al., 2025). A 4-second limit is realistic for a student project on free hosting, while still ruling out a poor experience. These website figures measure the full page load and not only the server’s reply, so they are a rough comparison rather than an exact one (McQuade, 2020).

**South African mobile users**

Many requesters are likely to use CivicConnect on mobile data. In 2025, average mobile download speeds in South Africa ranged from 17.5 Mbps on Rain and 18.3 Mbps on Telkom to 60.1 Mbps on MTN (Opensignal, 2025). The target must also work for users on the slower networks, which is another reason for choosing 4 seconds instead of 2. CivicConnect’s pages are mainly forms and lists, so the target should be achievable; the load test will confirm this.

**What similar systems do**

Similar city service-request (311) systems also treat performance as a measurable service level. Ogden City’s 2024 tender for a 311 system asks for 99.9% availability for cloud-hosted systems (Ogden City Corporation, 2024). The tender does not set a single response-time number, so CivicConnect bases its figure on the published standards and research above.

**Summary of evidence for NFR-PERF-001**

| **Source** | **What the source says** | **How it supports NFR-PERF-001** |
|---|---|---|
| web.dev (2020) – RAIL model | Users start to lose focus after about 1 s and are likely to give up after about 10 s; repeat page loads should take under 2 s | 4 s is well within the 10 s limit; 2 s kept as the goal for the median |
| New Relic (2026) – Apdex | Satisfied up to T; tolerating up to 4T; frustrated above 4T | With T = 1 s, 90% of requests stay out of the “frustrated” zone |
| McQuade (2020) | Page content shown in 2.5 s or less is “good”; more than 4 s is “poor”; checked at the 75th percentile | Same 4 s limit, checked at a stricter 90th percentile |
| Beyer et al. (2018) | Speed targets should be percentiles, e.g. “90% of requests < 450 ms” | Same percentile format |
| Jariyal et al. (2025) | 62% of mobile websites are “good”; 13% are “poor” | 4 s at 90% is realistic; 2 s at 95% is too strict for free hosting |
| Opensignal (2025) | South African mobile download speeds of 17.5–60.1 Mbps | Target must work on slower networks |
| Render (2026a) | Free services stop after 15 minutes idle and take about 1 minute to restart | The 10% margin covers these slow starts |

### Usability

**NFR-USAB-001**

A requester shall be able to submit a standard service request using the provided interface without assistance from a staff member.

**Acceptance target**:

At least 4 out of 5 representative test users shall complete the standard submission process without assistance.

### Reliability

**NFR-REL-001**

Once the system verifies that a request has been successfully submitted, it will remain accessible for retrieval.

**Acceptance target:**

100% of successfully confirmed test submissions remain retrievable after submission.

### Auditability

**NFR-AUD-001**

The system shall record the responsible user and timestamp for defined request status changes.

**Acceptance target:**

100% of tested status changes shall contain the required user and timestamp information.

### Maintainability

**NFR-MAIN-001**

Project requirements, risks, decisions, changes, tests and defects shall use controlled identifiers and version-controlled artefacts.

**Acceptance target:**

All baselined M1 requirements shall have unique IDs and corresponding entries in the RTM.

## Acceptance Criteria

**FR-REQ-001 – Submit Request**

The system shall allow an authenticated requester to submit a new service request containing all mandatory request information.

| ID | Given | When | Then |
|---|---|---|---|
| AC-REQ-001-A | User is authenticated, and all mandatory fields are completed. | User submits request. | A new request is created. |
| AC-REQ-001-B | One or more mandatory fields are empty. | User submits request. | Submission is prevented, and missing information is indicated. |
| AC-REQ-001-C | Request is successfully created. | Submission completes. | System provides confirmation and request reference. |

**FR-REQ-002 – Controlled Category**

The system will require each service request to be assigned a category from a controlled set of categories.

| ID | Given | When | Then |
|---|---|---|---|
| AC-REQ-002-A | Requester is creating a request | Category is selected | Category must come from the controlled list |
| AC-REQ-002-B | No category is selected | Requester submits | Submission is prevented |

**FR-STF-006 – Assignment**

The system shall allow authorised staff to assign or accept responsibility for a service request.

| ID | Given | When | Then |
|---|---|---|---|
| AC-STF-006-A | Authorised staff member views an unassigned request | Staff assigns responsibility | Assigned owner is recorded |
| AC-STF-006-B | Unauthorised user attempts assignment | Assignment is attempted | Operation is denied |

**FR-STF-007 – Status Transition**

The system shall restrict status changes to defined request workflow transitions.

| ID | Given | When | Then |
|---|---|---|---|
| AC-STF-007-A | Request is in a valid status | Staff selects a permitted next status | Status change is accepted |
| AC-STF-007-B | Requested transition is invalid | Staff attempts to save | System rejects the transition |
| AC-STF-007-C | Valid transition succeeds | Status changes | User and timestamp are recorded |

## M1 Constraint & Scope Evidence Review + Milestone 2 Evolution Contribution

### Evidence from comparable projects

**Haverhill 311 Case study**

The **Haverhill 311 case study**, published by the Massachusetts government, is particularly useful for our team’s project because it documents staffing, costs, integration difficulty, training, phasing and implementation challenges.

Haverhill started from a severely under-resourced environment and wanted to establish comprehensive constituent services quickly and cheaply. The Mayor's office had only three staff initially (Stepasiuk, 2017).

However, once the 311 project was planned, the city ultimately used:

- a 311 Director;
- 1.5 new full-time staff;
- two DPW clerks as backups;
- another replacement staff member trained to assist.

That resulted in **2.5 dedicated full-time 311 staff plus three additional people available when needed** (Stepasiuk, 2017).

### What it means for CivicConnect

Haverhill demonstrates that even a comparatively constrained municipal 311 implementation required dedicated operational staffing and backup capacity. Our three-person student team is developing the CivicConnect project within an academic delivery period; therefore, the project scope must remain focused on the core digital request-management problem rather than attempting to reproduce a complete municipal 311 operation.

### Cost Evidence derived from Haverhill

The case study records the following:

| **Cost Area:** | **Haverhill Evidence:** |
|---|---|
| 311 Director | $69,699 as of 2017 |
| 1.5 FTE | $59,000 as of 2017 |
| QAlert | $8,400 as of 2017 |
| Maintstar integration | $13,000 as of 2017 |
| Total operating cost | $144,898 as of 2017 |
| Total one-time cost | $61,450 as of 2017 |

The **one-time figure** included implementation, training, integration, equipment, office setup and consultancy-related costs.

Even more importantly, Haverhill explicitly documented its cost-saving decisions:

- low-cost phone system;
- minimal office buildout;
- less-expensive software option;
- soft launch limited to three departments;
- only one day of software training initially;
- conservation of consulting hours.

(Stepasiuk, 2017)

### How can we use it?

The Haverhill 311 implementation demonstrates that even a deliberately **cost-conscious service-request system** involved substantial one-time and ongoing costs. Haverhill reported approximately $61,450 in one-time costs and $144,898 in operating costs, while explicitly identifying low-cost software, minimal infrastructure, limited initial rollout and reduced training as cost-saving measures (Stepasiuk, 2017).

**CivicConnect therefore** treats cost as a project constraint and prioritises free or low-cost development services where they satisfy requirements, while avoiding unnecessary paid integrations and infrastructure.

### Additional Evidence

**Evidence for excluding complicated customisation**

The Los Angeles City Controller's audit of its 311 CRM system identified:

- significant slowdowns and downtime;
- limited reporting;
- complex customisations associated with high development costs;
- high ongoing maintenance/support costs. (Galperin, 2021)

This is particularly useful for justifying why CivicConnect should **avoid extensive customisation during the initial release**.

### Strengthened Reason for WhatsApp / External integration

Haverhill provides particularly good evidence here.

Its Maintstar system had a **closed API**, and the integration took additional work and cost. During the transition, staff had to manually transfer work-order information between systems (Stepasiuk, 2017).

**Therefore:**

**Scope decision:** WhatsApp and complex external-system integrations remain deferred from the initial CivicConnect baseline because external integrations introduce additional dependencies, interface compatibility, testing and maintenance effort. Evidence from comparable 311 implementations demonstrates that integration with existing systems can require dedicated vendor involvement, additional expenditure and transitional manual processes.

Predictive Analytics defence:

A published 311 prediction study called SWIFT used **three and a half years of 311 data from New York City, Kansas City and Baltimore** to build and evaluate response-time prediction models (Raj et al., 2021).

That doesn't mean CivicConnect can never do predictive analytics.

It means that predictive capabilities depend on having enough historical data and a separate modelling problem to solve.

**Therefore:**

Predictive service-demand/response analytics is deferred because meaningful predictive modelling depends on sufficiently mature historical service-request data and additional modelling, validation and maintenance effort. Comparable 311 research has used several years of historical service-request data across multiple agencies and complaint types.

### Performance Requirement Evidence

Performance rationale:

The CivicConnect target of 95% of standard request-list and request-detail operations completing within two seconds was selected as a measurable and achievable initial application-performance expectation. Comparable government service specifications use two-second-class response targets and percentage-based performance measures. These benchmarks support using a two-second/95th-percentile target as an initial engineering requirement, while final performance verification will depend on CivicConnect's defined workload and test environment (New Mexico Public Regulation Commission, 2024).

**M2 update:** The 95% / 2-second figure above was the original M1 target and is kept here to show how the requirement changed. It has been replaced by the current NFR-PERF-001 target: at least 90% of standard requests must complete within 4 seconds, with 2 seconds kept as the goal for a typical request. The reasons and sources for this change are given in the NFR-PERF-001 justification in the Non-Functional Requirements section.

### ASRs and Quality drivers

| **ASR** | **Why CivicConnect needs it** | **Architectural consequence** |
|---|---|---|
| **ASR-SEC-001 Security / Access Control** | Different users must only see/use authorised functions and request information | Central authentication + server-side authorisation |
| **ASR-REL-001 Data reliability/integrity** | A successfully submitted request must remain retrievable | Transactional persistence + DB constraints |
| **ASR-PERF-001 Performance** | Request lists/details must respond within the defined target | Efficient queries, sensible schema/indexing, avoid unnecessary network calls |
| **ASR-AUD-001 Auditability** | Important status changes must identify user/time | Dedicated history/audit data |
| **ASR-MAIN-001 Maintainability** | Three-person team needs a system that can be changed without excessive coupling | Layered/modular responsibilities |

ISO/IEC 25010:2023 explicitly provides a product-quality model that can be used for requirements specification, architecture/design objectives, testing objectives and acceptance criteria (ISO/IEC, 2023).

NASA's software engineering guidance similarly discusses attributes such as availability, modifiability, performance, security, testability and usability as architectural concerns, and stresses that the important attributes are project-dependent (NASA, 2022).

**Reasoning:**

CivicConnect contains service-request information that may be restricted according to user role. Therefore, security, specifically authorisation, is an architecture-driving quality requirement. The architecture must prevent access to protected information at the application/server boundary rather than relying only on the user interface.

### Architecture baseline

Proportionate Candidate:

Based on the requirements and the three-person team, a **layered/modular monolithic architecture** is a strong candidate for our team to consider.

Something like:

![merge_image4](media/merge_image4.png)

Microsoft's architecture guidance describes layered/N-tier architectures as separating responsibilities such as presentation, business logic and data access. Its guidance also describes monolithic applications as a simple deployment model that suits many internal and smaller public applications (Microsoft, 2026a).

### Alternative Option

**Microservices/distributed architecture**

A distributed architecture could provide independent deployment and scaling, but introduces additional service boundaries, network communication, deployment infrastructure and failure scenarios. Given CivicConnect's three-person team, limited project schedule and currently modest functional scope, these costs require justification. Our team therefore evaluates a modular monolithic architecture as a proportionate alternative.

### Architectural Design Record

### ADR-001- CivicConnect Architecture

**Status**

Accepted

Date: 2026-09-30

Author: Requirements & Analysis Lead

**Context**

CivicConnect requires controlled request processing, authentication, authorisation, reporting, auditability and relational persistence.

**Alternatives**

1. Layered modular monolith

2. Microservices/distributed architecture

**Decision**

CivicConnect will use a **layered modular-monolith architecture**, with clearly separated application responsibilities and module boundaries.

**WHY?**

The core CivicConnect domain is currently a single coherent service-request lifecycle. No requirement has been demonstrated to independently scale or deploy multiple services.

The layered approach gives the team separation of responsibilities without introducing unnecessary distributed-system infrastructure.

**Consequences**

**Positive:**

**1. Lower implementation complexity**

The team can build and run the system as one application instead of managing several independently deployed services.

**2. Simpler development for a three-person team**

The architecture requires fewer operational components and fewer distributed-system concepts.

**3. Easier data consistency**

The core request lifecycle can interact with one relational persistence boundary. This is useful when a single business operation involves multiple related records.

**4. Easier testing and debugging**

A developer can follow:

Controller → Service → Repository → Database

without tracing multiple network calls.

**5. Lower infrastructure and deployment cost**

A single application reduces the number of deployment units and infrastructure services that must be configured and maintained.

**6. Clear separation of responsibility**

Presentation, business logic and persistence can be kept separate, reducing the likelihood that one class becomes responsible for unrelated behaviour.

**Negative:**

**1. Scaling is less granular**

If one part of the application later becomes very resource-intensive, the entire application may need to scale rather than only that component.

**2. Shared deployment boundary**

A deployment problem in the application can potentially affect the whole system.

**3. Risk of monolithic coupling**

A monolith does not automatically become well designed. Poor module boundaries could still create a tightly coupled codebase.

**4. Some changes may cross several layers**

A change to a business operation may require changes to controller, service, repository and database elements.

**5. Future decomposition may require effort**

If CivicConnect eventually grows into a much larger platform, some modules may need to be separated into services later.

**6. Large-scale independent deployment is not available**

Teams cannot independently deploy parts of the system in the way a true microservices architecture allows.

Microsoft explicitly identifies these distributed-architecture trade-offs, including increased complexity, interservice communication, consistency challenges and operational requirements (Microsoft, 2026b).

### ADR consequence summary

| **Positive Consequence** | **Negative Consequence** |
|---|---|
| Lower implementation complexity | Less granular scaling |
| Easier development for 3 people | Shared deployment boundary |
| Simpler transactions/data consistency | Risk of internal coupling |
| Easier debugging/testing | Changes may cross layers |
| Lower infrastructure burden | Future decomposition could require effort |
| Clear responsibility boundaries | No independent service deployment |

Data and Persistence Baseline

CivicConnect has structured relationships between:

- users;
- roles;
- service requests;
- categories;
- statuses;
- assignments;
- actions/comments;
- status history.

PostgreSQL's official documentation explains that foreign keys enforce referential integrity between related records, while transactions allow multiple updates to be treated as one all-or-nothing operation (PostgreSQL, 2026b; 2026d).

### Proposed Data Model

![merge_image5](media/merge_image5.png)

**Core Entities:**

![merge_image6](media/merge_image6.png)

### Data decision

CivicConnect will use a relational persistence model with explicit relationships, primary keys and foreign keys. Database constraints will be used alongside application validation to protect business data integrity.

**Why?**

CivicConnect's data is highly structured and relational. A relational design matches that structure directly.

### The key A2 persistence decision: status change

Our M1 requirement already says a valid status transition must record the user and timestamp.

Therefore, the **operation should conceptually be**:

BEGIN TRANSACTION

1. Validate current status

2. Validate requested new status

3. Update SERVICE_REQUEST

4. Insert STATUS_HISTORY

5. Commit

**If anything fails:**

ROLLBACK

This is important because **we do not want:**

Request status = RESOLVED + no history record

PostgreSQL's transaction documentation describes transactions as all-or-nothing operations, while its documentation on concurrency explains how transaction isolation controls what concurrently executing operations can observe (PostgreSQL, 2026c; 2026d).

### Database Integrity Controls

| **Data Issue:** | **Control:** |
|---|---|
| Duplicate request ID | Primary key |
| Duplicate request reference | Unique constraint |
| Invalid requester | Foreign key |
| Invalid category | Foreign key |
| Invalid status | Foreign key |
| Missing mandatory request information | NOT NULL / application validation |
| Invalid status transition | Application business rule |
| Missing status-history record | Transactional operation |

PostgreSQL explicitly documents primary keys and foreign keys as mechanisms supporting unique identification and referential integrity (PostgreSQL, 2026a).

### Data/persistence ADR consequences

#### Positive

- Strong referential integrity.
- Clear data ownership.
- Easier reporting through structured relationships.
- Good fit for request/history relationships.
- Transaction support for important lifecycle operations.
- Easier traceability between requirements and stored records.
#### Negative

- Schema changes require controlled migration.
- Poorly indexed queries could cause performance degradation.
- A single database may become a bottleneck as usage grows.
- A single database instance can represent a single point of failure.
- Strong consistency can sometimes require more careful transaction design.
### Technology Stack Decision

#### Technology ADR structure

**ADR-004 — CivicConnect Technology Stack**

**Context**

The project requires a web-based request-management system supporting authentication, request submission, request management, reporting, auditability and relational persistence.

**Selection criteria**

The technologies must be evaluated against:

- requirements;
- ASRs;
- team capability;
- schedule;
- cost/licensing;
- security;
- maintainability;
- ecosystem/dependency risk;
- deployment compatibility.
#### Comparison Table

| **Layer** | **Candidate** | **Alternative** | **Evidence/consideration** | **Proposed final decision** |
|---|---|---|---|---|
| **Frontend** | React + TypeScript + Vite | Vue + TypeScript + Vite | React supports TypeScript directly; Vite provides a modern development server and production build tooling, with a React TypeScript template. The team is building a web application, so component-based UI supports separation of responsibilities and maintainability (React, 2026) (Vite, 2026). | React + TypeScript + Vite |
| **Backend/runtime** | Node.js + Express | ASP.NET Core | Node.js provides an established JavaScript/TypeScript server runtime; Node 24 is currently an LTS release. Express 5 provides routing and middleware for HTTP applications and is MIT-licensed (NodeJS, 2026) (NPM, 2026). | Node.js + Express |
| **Database** | PostgreSQL | MySQL | CivicConnect has strongly relational data: users, roles, requests, categories, statuses, assignments and histories. PostgreSQL supports relational constraints, foreign keys, transactions and concurrency features and is open source (PostgreSQL, 2026a; 2026d; 2026e). | PostgreSQL |
| **API** | HTTP/REST API | In-process interfaces / GraphQL | A browser-to-backend boundary is a reasonable fit for a web application. A2 specifically requires our team to consider the cost of distribution and not introduce network boundaries unnecessarily. | REST for frontend ↔ backend; in-process interfaces internally |
| **Testing** | Vitest + React Testing Library | Jest | Vitest is designed to work with Vite and can be used for unit/component testing. It currently requires Vite ≥6.4 and Node ≥22.12, which is compatible with the proposed Node 24 baseline (Vitest, 2026). | Vitest + React Testing Library |
| **Build/dependencies** | npm + Vite | pnpm | npm integrates directly with Node.js and is already appropriate for a JavaScript/TypeScript project. Vite provides development/build tooling and supports React TypeScript projects (NodeJS, 2026) (Vite, 2026). | npm + Vite |
| **CI** | GitHub Actions | GitLab CI | Our project is already governed through GitHub. GitHub provides a documented Node.js build/test workflow and supports automated CI checks on the repository (GitHub, 2026) | GitHub Actions |
| **Hosting** | Render | Supabase-based deployment / another cloud provider | Render currently supports free static sites, web services and PostgreSQL, which can be useful for a student prototype. However, its free PostgreSQL databases currently expire after 30 days and have no backups, so the free database option should **not** be treated as a durable production solution (Render, 2026b). | Deployment direction: Render candidate; final hosting/database decision deferred |

### The resulting Architecture

![merge_image7](media/merge_image7.png)

## Requirement Prioritisation

During the prioritisation process, our team uses the tried-and-true MoSCoW method (Clegg and Barker, 1994):

**Must Have**

The core functionality necessary to satisfy the business need:

- Submit requests
- Categorise requests
- View status
- View request history
- View/manage requests
- Assignment
- Status transitions
- Actions/comments
- Resolution/closure
- Management visibility
- Authentication
- Authorisation
- Accountability/audit information

**Should Have**

Useful functionality that improves the system but isn't fundamental to the first baseline:

- Automated email notifications
- Additional reporting filters
- More advanced dashboard functionality
- Simulated SMS and WhatsApp notifications (FR-NOT-001 – FR-NOT-007)

**Could Have**

Potential future enhancements:

- AI-assisted categorisation
- Live WhatsApp integration (the simulated version is a Should Have)
- Live SMS notifications (the simulated version is a Should Have)
- Advanced predictive analytics
- Mobile application

**Won't Have in Current Baseline**

Features intentionally excluded from the current release:

- Full enterprise-system integration
- Native mobile application
- Advanced predictive service management
### Requirements Traceability Matrix

The RTM provides traceability between stakeholders, stakeholder needs, requirements and acceptance criteria for the CivicConnect project.

The objective of this RTM is to help determine the traceability of each requirement to a validated stakeholder need and the verifiability of each requirement through measurable acceptance criteria (Atlassian, 2026) (Sommerville, 2016).

| **Stakeholder** | **Stakeholder Need** | **Requirement** | **Acceptance Criteria** | **Related Risks** | **Future Test ID** | **Future Evidence** |
|---|---|---|---|---|---|---|
| STK-001 Requester | STK-NEED-001 Ability to submit a complete service request through a controlled process | FR-REQ-001 Submit a new service request containing all mandatory information | AC-REQ-001-A, AC-REQ-001-B, AC-REQ-001-C | RISK-002, RISK-012 | TEST-REQ-001 | Test Execution Results |
| STK-001 Requester | STK-NEED-001 Ability to submit a complete service request through a controlled process | FR-REQ-001 Categorise service requests using a controlled category list | AC-REQ-002-A, AC-REQ-002-B | RISK-002 | TEST-REQ-002 | Test Execution Results |
| STK-001 Requester | STK-NEED-001 Ability to submit a complete service request through a controlled process | FR-REQ-001 Generate a unique service request reference | AC-REQ-003-A, AC-REQ-003-B, AC-REQ-003-C | RISK-011 | TEST-REQ-003 | System Record Verification |
| STK-001 Requester | STK-NEED-002 Confirmation that a request was recorded | FR-REQ-004 Provide confirmation after successful submission | AC-REQ-001-C | RISK-011 | TEST-REQ-004 | Submission Confirmation Evidence |
| STK-001 Requester | STK-NEED-003 Visibility of current request status | FR-REQ-005 Allow requester to view current request status | AC-REQ-005-A, AC-REQ-005-B, AC-REQ-005-C | RISK-013 | TEST-REQ-005 | Request Status Verification |
| STK-001 Requester | STK-NEED-004 Access to previously submitted requests | FR-REQ-006 Allow requester to view previous requests | To be defined during detailed testing | RISK-013 | TEST-REQ-006 | Retrieval Test Evidence |
| STK-001 Requester | STK-NEED-003 Visibility of current request status | FR-REQ-007 Provide progress and completion feedback | To be defined during detailed testing | RISK-013 | TEST-REQ-007 | Notification/ Feedback Evidence |
| STK-002 Service Staff | STK-NEED-005 Confidential access to requests | FR-STF-001 Allow authorised staff to view relevant requests | To be defined during detailed testing | RISK-007 | TEST-STF-001 | Access Control Test Results |
| STK-002 Service Staff | STK-NEED-006 Ability to find and prioritise requests | FT-STF-002 Search requests using defined criteria | To be defined during detailed testing | RISK-013 | TEST-STF-002 | Search Function Test Results |
| STK-002 Service Staff | STK-NEED-006 Ability to find and prioritise requests | FR-STF-003 Filter requests by relevant criteria | To be defined during detailed testing | RISK-013 | TEST-STF-003 | Filter Function Test Results |
| STK-002 Service Staff | STK-NEED-006 Ability to find and prioritise requests | FR-STF-004 Sort requests using supported criteria | To be defined during detailed testing | RISK-013 | TEST-STF-004 | Sort Function Test Results |
| STK-002 Service Staff | STK-NEED-005 Centralised access to requests | FR-STF-005 View complete authorised request details | To be defined during detailed testing | RISK-007 | TEST-STF-005 | Authorisation Test Results |
| STK-002 Service Staff | STK-NEED-007 Clear ownership and assignment of requests | FR-STF-006 Assign or accept responsibility for requests | AC-STF-006-A, AC-STF-006-B, AC-STF-006-C | RISK-013 | TEST-STF-006 | Assignment Verification |
| STK-002 Service Staff | STK-NEED-008 Record actions and resolution information | FR-STF-007 Restrict request status changes to approved workflow transitions | AC-STF-007-A, Ac-STF-007-B, AC-STF-007-C | RISK-013 | TEST-STF-007 | Workflow Validation Evidence |
| STK-002 Service Staff | STK-NEED-008 Record actions and resolution information | FR-STF-008 Record actions and comments against requests | To be defined during detailed testing | RISK-013 | TEST-STF-008 | Action Log Evidence |
| STK-002 Service Staff | STK-NEED-008 Record actions and resolution information | FR-STF-009 Record resolution information | To be defined during detailed testing | RISK-011 | TEST-STF-009 | Resolution Record Evidence |
| STK-002 Service Staff | STK-NEED-007 Clear ownership and assignment of requests | FR-STF-010 Resolve or close authorised requests | To be defined during detailed testing | RISK-013 | TEST-STF-010 | Closure Verification Evidence |
| STK-003 Management | STK-NEED-009 Visibility of open, overdue, resolved and closed work | FR-MGT-001 View currently open service requests | To be defined during detailed testing | RISK-013 | TEST-MGT-001 | Reporting Evidence |
| STK-003 Management | STK-NEED-009 Visibility of open, overdue, resolved and closed work | FR-MGT-002 Identify overdue service requests | To be defined during detailed testing | RISK-013 | TEST-MGT-002 | Overdue Request Evidence |
| STK-003 Management | STK-NEED-009 Visibility of open, overdue, resolved and closed work | FR-MGT-003 Identify resolved and closed requests | To be defined during detailed testing | RISK-013 | TEST-MGT-003 | Status Reporting Evidence |
| STK-003 Management | STK-NEED-010 Service performance analysis | FR-MGT-004 View service information by category and status | To be defined during detailed testing | RISK-013 | TEST-MGT-004 | Management Analytics Evidence |
| STK-004 Administrator | STK-NEED-011 Role-Based access and secure administration | FR-SEC-001 Authenticate users before granting access | To be defined during detailed testing | RISK-006, RISK-007 | TEST-SEC-001 | Authentication Evidence |
| STK-004 Administrator / STK-007 Security Responsibility | STK-NEED-011 / STK-NEED-014 | FR-SEC-002 Role based authorisation and access control | AC-SEC-002-A, AC-SEC-002-B, AC-SEC-002-C | RISK-006, RISK-007 | TEST-SEC-002 | Authorisation Evidence |

### End-to-End Requirements Traceability Matrix

| **Stakeholder Need** | **Requirement** | **Architecture Element** | **Technology** | **Design Decision** | **Related Risk** | **Verification** | **Evidence** |
|---|---|---|---|---|---|---|---|
| STK-NEED-001 | FR-REQ-001 | Modular Monolith | Node.js + Express | Service Layer | RISK-002 | TEST-REQ-001 | Test Results |
| STK-NEED-003 | FR-REQ-005 | Request Management Module | Node.js + Express | MVC Pattern | RISK-013 | TEST-REQ-005 | Status Verification |
| STK-NEED-007 | FR-STF-006 | Workflow Module | Node.js + Express | Service Layer | RISK-013 | TEST-STF-006 | Assignment Test |
| STK-NEED-008 | FR-STF-007 | Workflow Module | Node.js + Express | State-Control Logic | RISK-013 | TEST-STF-007 | Transition Test |
| STK-NEED-011 | FR-SEC-001 | Security Module | JWT + bcrypt | Authentication Pattern | RISK-006 | TEST-SEC-001 | Authentication Evidence |
| STK-NEED-011, STK-NEED-014 | FR-SEC-002 | Security Module | JWT + bcrypt | AC-SEC-002 | RISK-007 | TEST-SEC-002 | Authorisation Evidence |

### Non-functional Requirements Traceability

| **Stakeholder Need** | **Non-Functional Requirement** | **Verification Method** |
|---|---|---|
| STK-NEED-011, STK-NEED-014 | NFR-SEC-001 Role-based access control | Security test |
| STK-NEED-011, STK-NEED-014 | NFR-SEC-002 Secure password storage | Database / Security inspection |
| STK-NEED-012 | NFR-PERF-001 Performance requirements | Performance test |
| STK-NEED-001, STK-NEED-002 | NFR-USAV-001 Usability requirements | Usability test |
| STK-NEED-001, STK-NEED-003 | NFR-REL-001 Request retrievability | Reliability test |
| STK-NEED-014 | NFR-AUD-001 Auditability | Auditability test |
| STK-NEED-015 | NFR-MAIN-001 Process control and traceability | Artefact view |

### Traceability Model

**Stakeholder**

**↓**

**Stakeholder Need**

**↓**

**Requirement**

**↓**

**Acceptance Criteria**

**↓**

**Test Case**

**↓**

**Evidence**

This structure gives traceability to each CivicConnect requirement to a validated stakeholder need and forward to verification activities and supporting evidence.

## Risks

The Risk Register sets out and monitors project risks associated with CivicConnect. These risks have been obtained from the stakeholder analysis, project constraints, scope decisions, engineering decisions and the known project assumptions (Atlassian, 2026).

For each risk there is an evaluation of its probability, impact, priority, mitigation strategies, contingency actions, ownership and its current status. (ISO, 2018).

**Risk ratings use the following scale:**

- **Low**
- **Medium**
- **High**
- **Critical**
### Risk Register

| **Risk ID** | **Risk Description** | **Probability** | **Impact** | **Priority** | **Mitigation Strategy** | **Contingency Plan** | **Owner** | **Status** |
|---|---|---|---|---|---|---|---|---|
| RISK-001 | Scope creep resulting from requests for additional functionality outside the approved baseline | High | High | Critical | Enforce scope baseline and change control process and review all requested changes before approval | Re-evaluate project scope and prioritise mandatory requirements only | Team | Open |
| RISK-002 | Requirements may change post approval, requiring rework and affect project schedule commitments | High | High | Critical | Baseline requirements and maintain traceability, and obtain team approval before introducing changes | Replan project activities and update affected deliverables | Team | Open |

| RISK-003 | Milestone deadlines may not be met due to limited available time for analysis, development, testing and documentation | High | High | Critical | Monitor progress against milestones and complete high priority work first | Reduce lower priority deliverables and focus on mandatory project outcomes | Team | Open |
|---|---|---|---|---|---|---|---|---|
| RISK-004 | Team member unavailability may reduce project capacity and delay deliverables | Medium | High | High | Share knowledge, document work clearly and maintain repository visibility | Reassign work among remaining team members | Team | Open |
| RISK-005 | Limited team size may create workload imbalance during critical project phases | Medium | High | High | Distribute work according to responsibilities and monitor workload regularly | Reallocate tasks and prioritise essential deliverables | Team | Open |
| RISK-006 | Security vulnerabilities may be discovered during testing and require significant redesign efforts | Medium | High | High | Apply security requirements | Allocate time for remediation and security retesting | Development Team | Open |
| RISK-007 | Failure to satisfy role based access control requirements could expose sensitive information | Medium | High | High | Include security controls in requirements, design and testing activities | Restrict system functions until appropriate controls are implemented | Development Team | Open |
| RISK-008 | Technology stack selection may be delayed because the decision has been deferred until sufficient information is available | Medium | High | High | Complete requirements and architectural analysis before technology selection | Select a technology stack based on available project constraints and requirements | Team | Open |

| RISK-009 | Architectural decisions may be delayed, impacting future implementation planning | Medium | High | High | Complete research activities and requirements analysis before architectural decision | Schedule architecture definition as a priority activity | Team | Open |
|---|---|---|---|---|---|---|---|---|
| RISK-010 | Free or low cost technology may not provide all desired functionality | Medium | Medium | Medium | Evaluate technologies against project requirements and cost constraints | Reduce dependency on optional deatures or identift alternative solutions | Team | Open |
| RISK-011 | Data loss or corruption could affect service request information and auditability | Low | High | Medium | Implement backup and recovery considerations during design | Restore data from backups and investigate root cause |  | Open |
| RISK-012 | Insufficient testing time may result in undetected defects reaching later milestones | Medium | High | High | Allocate testing effort throughout development rather than just at the end | Prioritise testing of critical functional and security requirements | Team | Open |
| RISK-013 | Poor traceability between stakeholder needs, requirements and acceptance criteria may reduce project quality and auditability | Low | High | Medium | Maintain RTM and controlled project artefacts | Perform traceability reviews before milestone submission | Requirement & Analysis Lead | Open |
| RISK-014 | GitHub merge conflicts or incorrect repository practices may result in lost work or integration delays | Medium | Medium | Medium | Follow GitHub governance processes including branches, pull requests and approvals | Resolve conflicts through review and controlled integration | Team | Open |
| RISK-015 | Future integration requirements may introduce complexity not considered in current scope | Low | Medium | Low | Keep deferred features documented separately from the approved baseline | Evaluate integrations through formal change protocol processes | Team | Open |
| RISK-016 | Modular monolith architecture may become difficult to scale if future growth exceeds current expectations. | Medium | High | High | Maintain modular separation and regularly review architectural fitness. | Refactor components into independent services if required. | Architecture Team | Open |
| RISK-017 | Improper database constraints or transaction management may compromise data integrity. | Low | High | Medium | Use referential integrity, transactions, and validation controls. | Database recovery and corrective migration procedures. | Development Team | Open |
| RISK-018 | Simulated notification functionality may not perfectly represent real SMS or WhatsApp integrations | Medium | Medium | Medium | Clearly separate simulation logic and document assumptions. | Perform integration validation before production deployment. | Development Team | Open |
| RISK-019 | Observer pattern implementation may result in missed or duplicate notification events if incorrectly configured. | Medium | Medium | Medium | Thorough testing of notification triggers and event handling. | Manual notification verification during testing. | Development Team | Open |

### Risk Register: Risk Traceability IDs

| **Risk ID** | **Risk Description** | **Source Artefacts** |
|---|---|---|
| RISK-001 | Scope Creep | CON-SCP, EDL-003 |
| RISK-002 | Requirements Changes | STK-NEED, NFR-MAIN-001 |
| RISK-003 | Schedule Delays | CON-SCH |
| RISK-004 | Team Member Unavailability | Constraint 1 (Team Size) |
| RISK-005 | Workload Imbalance | Constraint 1 (Team Size), CON-SCH |
| RISK-006 | Security Vulnerabilities | CON-SEC, FR-SEC-001, FR-SEC-002, NFR-SEC-001, NFR-SEC-002 |
| RISK-007 | Unauthorised access to sensitive information | CON-SEC, FR-SEC-002, NFR-SEC-001, STK-NEED-014 |
| RISK-008 | Technology Stack selection delays | EDL-001 |
| RISK-009 | Architecture definition delays | EDL-002 |
| RISK-010 | Budget & Resource limitations | CON-COST, STK-NEED-013 |
| RISK-011 | Data Loss or Corruption | NFR-REL-001, NFR-AUD-001 |
| RISK-012 | Insufficient Testing Time | CON-SCH |
| RISK-013 | Poor requirement traceability | STK-NEED-015, NFR-MAIN-001 |
| RISK-014 | GitHub Merge Conflicts & Repository Issues | EDL-004 |
| RISK-015 | Future Integration Complexity | Scope Section 4.3 |
| RISK-016 | Scalability Concerns | EDL-005 |
| RISK-017 | Data Compromission | EDL-007, NFR-REL-001, NFR-AUD-001 |
| RISK-018 | Improper Simulation of SMS and WhatsApp integration | EDL-011 |
| RISK-019 | Missing or Duplicate events due to improper implementation | EDL-008 |

### Highest Priority Risks

The following are considered the most significant threats to project success.

#### RISK-001: Scope creep

The CivicConnect project is facing tight milestone deadlines and has a small team. Uncontrolled scope additions can negatively impact schedule, quality, testing effort and project stability (Atlassian, 2026).

Mitigation:

- Maintain approved scope baseline
- Apply formal change control
- Evaluate all requested changes before approval
#### RISK-002: Requirement changes

Changes to approved requirements may result in rework in requirements, traceability, design implementation and testing artefacts (Atlassian, 2026).

Mitigation:

- Baseline requirements
- Maintain traceability
- Require team review and approval for changes
#### RISK-003 Schedule delays

Milestones are due on certain days and future milestones are contingent upon the successful completion of current deliverables. Delays in one milestone may have a negative impact on subsequent activities (Atlassian, 2026).

Mitigation:

- Monitor progress regularly
- Prioritise mandatory requirements
- Address issues early
### Risk Traceability

The following shows how CivicConnect project risks are traced to project constraints and decisions.

#### Constraint to Risk traceability

| **Constraint** | **Related Risk** |
|---|---|
| Team Size | RISK-004, RISK-005 |
| Schedule | RISK-003, RISK-012 |
| Cost | RISK-010 |
| Scope control | RISK-001, RISK-002 |
| Security | RISK-006, RISK-007 |

#### Engineering to Risk traceability

| **Engineering decision** | **Related Risk** |
|---|---|
| Technology stack deferred | RISK-008 |
| Architecture deferred | RISK-009 |
| Scope baseline approved | RISK-001, RISK-002 |
| GitHub governance controls | RISK-014 |
| Architecture Selection | RISK-016 |
| Technology Stack Selection | RISK-017 |
| Data & Persistence Decision | RISK-011, RISK-017 |
| Observer Pattern Selection | RISK-019 |
| Notification Simulation Decision | RISK-018 |

#### Risk monitoring approach

Throughout the project lifecycle, the risks will be reviewed and updated when:

- New risks are discovered
- Risks already in play change in intensity
- Mitigation measures implemented
- Uncertainty is introduced by engineering choices
- Scope changes are approved
- New project restrictions emerge

All approved changes to risk status will be recorded in controlled project artefacts to ensure traceability throughout the CivicConnect project.

## Forward Engineering Considerations

Forward engineering considerations are used to identify factors that may influence the future design, implementation, testing, deployment and maintenance decisions of the project. These concerns may not require immediate technical solutions during the requirements phase, but they should be considered early to ensure that the current requirements do not restrict future developments options. (Sommerville, 2016).

The following considerations have been identified for the CivicConnect system.

#### Security and Privacy

**Why it matters now**

Stakeholder needs require that the sensitive user information to be protected as well as controlled access to system functionalities. CivicConnect requirements include user authentication, role-based access and secure handling of sensitive information and service request data. Therefore to support future system integrity and user trust, privacy and security must be considered to the start of the lifecycle. (ISO/IEC, 2023) (Republic of South Africa, 2013).

**Future decisions Influenced**

- User authentications mechanisms
- Role-based access control
- Password management strategies
- Data encryption methods
- API security measures

**Information still required**

- Detailed data classification requirements
- Applicable regulatory requirements
- Municipal security policies
- Additional authentication requirements

**Risk if ignored**

Loss of user trust, data breaches, unauthorized access to stored information and costly redesign efforts are all risks if the security and privacy of user information is not considered early on in the lifecycle.

#### Scalability

**Why it matters now**

CivicConnect must support service request submission, request tracking, reporting and management oversight. As system adoption increases through various areas and municipalities the number of users and requests will also increase significantly. Therefore, to ensure sustainable performance, scalability must be considered (Atlassian, 2026) (ISO/IEC, 2023).

**Future decisions influenced**

- Database architecture
- Hosting infrastructure
- Application architecture
- Performance optimisation strategies
- Load balancing solutions

**Information still required**

- Expected user numbers and growth
- Anticipated report submissions

**Risk if ignored**

Performance and response times are at risk if the system is not designed with scalability in mind and may lead to reduced user satisfaction as usage increases.

The selected modular monolith architecture provides a simple and maintainable starting point for CivicConnect. However, regular architectural reviews will be required to ensure the architecture continues to support future growth in users, requests, reporting activities, and stored records.

#### Maintainability

**Why it matters now**

The system will likely be enhanced in the future, requirements could change and operational improvements will likely be made throughout the lifecycle. Stakeholders expect CivicConnect to reliable and adaptable thus maintainability of the system is critical and must be considered (ISO/IEC, 2023).

**Future decisions impacted**

- Software architecture
- Code organisation standards
- Documentation practices
- Modular component design
- Maintenance processes

**Information still required**

- Expected maintenance responsibilities
- Future enhancement plans
- Long-term system ownership
- Support processes

**Risk if ignored**

If the system is not properly maintained it could lead to hefty development and maintenance costs, slower future enhancements and could introduce additional defects during system modifications.

#### Testability

**Why it matters now**

CivicConnect requirements have been defined according to measurable and verifiable standards. Future validation activities depend on the ability to verify that each requirement has been implemented correctly and consistently (ISO/IEC, 2023).

**Future decisions impacted**

- Test planning
- Acceptance testing strategies
- Automated testing opportunities
- Quality assurance processes
- Validation procedures

**Information still required**

- Detailed acceptance criteria
- Performance benchmarks
- Quality expectations

**Risk if ignored**

If requirements are not properly measurable and verifiable, it could result in requirements that are difficult or impossible to properly verify and can create uncertainty as to whether the system satisfies stakeholder needs.

#### Data Management and Recovery

**Why it matters now**

The information collected from citizens is valuable and must be protected from accidental loss or mismanagement (ISO/IEC, 2023).

**Future decisions impacted**

- Database management solutions
- Backup strategies
- Data retention policies
- Disaster recovery procedures
- Data archival methods

**Information still required**

- Data retention requirements
- Recovery objectives
- Backup frequency requirements

**Risk if ignored**

Data loss or prolonged service disruptions could negatively affect operations and could reduce public confidence in the system.

PostgreSQL has been selected as the project's persistence solution. Future engineering activities should therefore consider backup strategies, transaction consistency, auditability, and recovery procedures to maintain the integrity of service request information.

#### Deployment environment

**Why it matters now**

Architectural and technology decisions made during development may be influenced by future development requirements. Future releases may require additional development flexibility where current scope decisions exclude certain integrations and platform extensions.

**Future decisions impacted**

- Hosting platform decision
- Infrastructure configuration
- Network architecture
- Resource allocation
- Operational support requirements

**Information still required**

- Hosting constraints
- Infrastructure availability
- Budget limitations
- Future integration requirements

**Risk if ignored**

Costly, difficult or impractical deployment solutions could be a result of failure to consider the deployment constraints.

CivicConnect has selected Node.js (Express, TypeScript), React and PostgreSQL as its primary technology platform. Future deployment environments must therefore support these technologies while remaining aligned with the project's low cost operational constraint.

#### Monitoring and Reliability

**Why it matters now**

CivicConnect relies on dependable request submission, status tracking and auditable processing activities. And monitoring and reliability considerations are needed for operational visibility and accountability throughout the service lifecycle (ISO/IEC, 2023).

**Future decisions impacted**

- Logging strategies
- Monitoring tools
- Alerting mechanisms
- Incident management processes
- Availability targets

**Information still required**

- Uptime requirements
- Operational support procedures
- Incident response plans
- Monitoring metrics

**Risk if ignored**

System failures may go unnoticed, resulting in interruptions of service, delayed resolution of issues, less accountability and reduced trust from stakeholders.

The selected architecture and technology stack should support application logging, audit trails, and operational monitoring to assist with fault diagnosis and service continuity.

#### Auditability and Traceability

**Why it matters now**

CivicConnect's key features include accountability controlled status changes, historical tracking and transparent service delivery. The system should provide traceability of actions performed by citizens, staff and management users (ISO/IEC, 2023).

**Future decisions impacted**

- Audit log design
- Activity tracking mechanisms
- Reporting functionality
- Evidence generation
- Compliance monitoring

**Information still required**

- Audit retention requirements
- Reporting requirements
- Long term traceability
- Compliance obligations

**Risk if ignored**

The lack of auditability can lower accountability, impede investigations, restrict managements oversight and undermine confidence in reported service outcomes.

#### Conclusion

The identified forward engineering considerations will ensure the current CivicConnect requirements will support future design, implementation, testing, deployment and maintenance activities. Addressing concers proactively around security, scalability, maintainability, testability, data management, deployment, reliability and auditability will help mitigate future risks and ensure the long term success of the CivicConnect platform.

## Evidence and Traceability

Evidence and traceability are such that all artefacts of the project trace to the source, are justified by documented decisions, and are verified by all controlled processes (Atlassian, 2026). Traceability allows you to be accountable, to manage changes, to assure quality and to plan future project activities (ISO/IEC, 2023).

For CivicConnect traceability is maintained between stakeholders, stakeholder needs, requirements, acceptance criteria, risks, engineering decision and project artefacts.

#### Engineering decision traceability

Engineering decisions provide controlled justification for future project activities.

**Requirement / Constraint**

**↓**

**Engineering decision**

**↓**

**Impact**

**↓**

**Future activity**

##### Decision 1: Technology stack

**Requirement analysis**

**↓**

**Technology stack deferred**

**↓**

**Additional information required**

**↓**

**Technology selection during milestone 2**

**Rationale:**

The project team determined that not enough information was available at milestone 1 to make an informed technology decision

##### Decision 2: Architecture

**Requirements**

**Constraints**

**Research**

**↓**

**Architecture deferred**

**↓**

**Milestone 2 architecture design**

**Rationale:**

Architectural decisions require completed requirements analysis and constraint evaluation before selection

##### Decision 3: Scope baseline

**Business need**

**Stakeholder needs**

**↓**

**Approved scope baseline**

**↓**

**Formal change control process**

**Impact:**

Prevents uncontrolled growth of the project scope and supports the schedule and quality objectives

##### Decision 4: GitHub governance

**Project artefacts**

**↓**

**Feature branch**

**↓**

**Commit**

**↓**

**Pull request**

**↓**

**Approval**

**↓**

**Merge**

**Impact:**

It provides a traceable development history and prevents uncontrolled changes to the project artefacts

#### Scope Traceability

##### Scope Traceability Model

**Business need**

**↓**

**Stakeholder need**

**↓**

**Requirement**

**↓**

**Scope baseline**

##### Deferred scope traceability

The following items have been intentionally deferred:

- Live WhatsApp integration (simulated in the current baseline)
- Live SMS notifications (simulated in the current baseline)
- Advanced dashboards
- AI-assisted categorisation
- Predictive analytics
- External system integrations
- Dedicated mobile applications

Each deferred item is documented and can only be added through a controlled change process in the future

#### GitHub Traceability

GitHub provides configuration management and evidence of controlled project work (Driessen, 2010).

##### GitHub governance process

**Feature branch**

**↓**

**Development commit**

**↓**

**Pull request**

**↓**

**Review**

**↓**

**Approval**

**↓**

**Merge to main branch**

##### Governance principles

- Direct changes to the main branch are prohibited
- Work must be completed in dedicated branches
- Pull requests must be reviewed before merging
- Meaningful commit messages are required
- Repository history must remain intact
- All approved artefacts remain version controlled
#### End-to-End Traceability Example

**STK-001-Requester**

**↓**

**STK-NEED-003**

**Visibility of request status**

**↓**

**FR-REQ-005**

**View current request status**

**↓**

**FR-REQ-007**

**Meaningful Request Feedback**

**↓**

**Architecture:**

**Request management module**

**↓**

**Technology:**

**Node.js + Express**

**↓**

**Design Decision:
Observer Platform**

**↓**

**Notification Simulation Component**

**↓**

**TEST-NET-001**

**Notification Verification TEST**

**↓**

**Evidence**

**Notification Log and Test results**

#### Artefact Evidence Register

| **Artefact** | **Purpose** | **Evidence Source** |
|---|---|---|
| Problem and business need | Defines project purpose | Requirements analysis |
| Stakeholder register | Identifies stakeholders | Requirements analysis |
| Stakeholder needs register | Identifies stakeholder expectations | Requirements analysis |
| Scope baseline | Defines approved project scope | Requirements analysis |
| Functional requirements | Defines system functionality | Requirements analysis |
| Non-functional requirements | Defines quality expectations | Requirements analysis |
| Acceptance criteria register | Defines requirements verification | Requirements analysis |
| Risk register | Documents project risks | Risk Register.md |
| Requirements traceability matrix | Demonstrates requirements traceability | RTM.md |
| Constraints register | Documents project constraints | Constraints.md |
| Engineering decision log | Records engineering decisions | EDL.md / EDL.png |
| Forward engineering considerations | Records future engineering concerns | Forward Engineering Considerations.md |
| GitHub Repository | Provides version control evidence | https://github.com/Hakumen1011/SEN381_Civicconnect_Project.git |
| Pull requests and reviews | Demonstrates controlled changes | https://github.com/Hakumen1011/SEN381_Civicconnect_Project.git |

#### Traceability summary

The CivicConnect project provides traceability for all major engineering artefacts through controlled identifiers, documented stakeholder needs, requirements, acceptance criteria, risks, engineering decisions and version-controlled project artefacts.

The established traceability structure ensures that

- Every requirement can be traced to a stakeholder need
- Every requirement can be verified through acceptance criteria
- Risks can be traced to considerations and project decisions
- Engineering decisions are documented and justified
- Scope changes remain controlled
- Repository history provides evidence of team collaboration and change management

This traceability framework allows accountability, quality assurance, controlled change management and future lifecycle activities (Atlassian, 2026) (ISO/IEC, 2023).

**Constraints**

**1. Team size**

Three members, each with their own commits and individual milestone defence.

**2. Schedule / Deadline**

Multiple deadlines for separate milestones, with schedules for work decided by the team.

The project is split into multiple parts classified as milestones.

**Main deadlines:**

| **Milestone** | **Deadline** |
|---|---|
| Milestone 1 | 9 September 2026 (completed) |
| Milestone 2 | 30 September 2026 (completed) |
| Milestone 3 | 14 October 2026 |
| Final | 18 October 2026 |

**3. Cost**

No- to low-cost budget.

Free services preferred.

Technology, hosting, development and other tools need to consider cost, as choices for functionality may be affected by cost.

Live SMS and WhatsApp are paid services (Meta, 2026b), however because we are only simulating these serves they remain free of charge and do not affect our budget.

**4. Scope**

Committed scope must be baselined and controlled.

Scope creep is unacceptable.

Changes to the scope baseline need to follow the team's agreed change control process and be documented. (Project Management Institute, 2021).

Note deferred decision that have been resolved mainly the SMS and WhatsApp notifications that will be simulated, while the live server remains deferred

**5. Security**

The system must not contain severe security vulnerabilities at security testing. Evidence: security testing results.

No passwords, API keys or other sensitive data may be committed to GitHub repo. If we ever make use of outside sources to handle the SMS or WhatsApp notification we should ensure to remain in the correct legal standing and follow the laws of the region, in our case POPIA requires a written contract to obligate in keeping the data secure (Republic of South Africa, 2013).

**6. Quality:**

The system must meet our given quality standards, not just work (ISO/IEC, 2023). Our current quality constraints fall under 3 of our requirements, NFR-PERF-001, NFR-SEC- and NFR-AUD-001.

**Constraint Interactions / Trade-offs**

**Scope and Schedule**

Because our schedule is a fixed commitment, more functionality increases scope while still being constrained by the deadlines.

This could lead to reducing scope, quality or testing effort, an increased workload, and a risk of missing the deadline or delivering an incomplete project.

**Team Size and Schedule**

We are restricted to three team members and fixed deadlines, giving us limited time and limited resources.

This forces us to work carefully without unnecessary scope increases, and can lead to a rush to meet deadlines and reduced quality in order to stay on schedule.

**Cost and realism**

We are limited by our budget meaning we are unable to make use of an actual live WhatsApp and SMS service. Therefore we chose to simulate these notifications and interactions.

**Quality and cost**

Quality asks for fast response while cost forces us to remain with free hosting, which can be slow at times. A Target set such as 95% of requests within 2 seconds would be hard to meet under these conditions. Thus we have chosen to change this and rather have 90% of requests within 4 seconds while 2 seconds still being kept as a goal we hope to achieve.

**Engineering Decision Log:**

| No. | Decision | Status | Reason | Evidence | Impact |
|---|---|---|---|---|---|
| 1 | Technology stack | Deferred. No longer applicable as of 2026/09/30.<br>Decision 6 | Insufficient information available for milestone 1 | Technology needs and requirements yet to be completed | May influence architecture, implementation and decisions for further milestones |
| 2 | Architecture | Deferred. No longer applicable as of 2026/09/30.<br>Decision 5 | Our current research for milestone 1 will be used to make an informed decision | Milestone 1 explains the requirements and constraints, giving us the information after completing our research. | Architecture will be decided after Milestone 1. Most likely before or when starting with milestone 2 |
| 3 | Baseline and scope | Decided | Avoid scope creep, mainly affected by schedule and quality. | Our scope and constraints analysis. | Future scope change must first be evaluated and properly documented before being accepted. |
| 4 | GitHub Control | Direct main changes not allowed, branches, requests and documented commits only allowed and pushed one approval is given | Requested to be used as well as allows for controlled reviews and traceable changes | Milestone 1 GitHub governance requirement | Creates evidence of team collaborations, avoids uncontrolled changes to the baseline. |
| 5 | Architecture: modular monolith application (layered: routes, controllers, services, repositories) | Decided. 2026/09/30. Platform updated 2026/10/14 (now Node.js + Express with TypeScript, see Decision 14) | Member count, low/no cost budget and fixed deadlines is easier to manage with his Architecture choice versus a microservice. | Constraints 1-3 influences this decision to keep costs and quality. | Easier to build, test and host but comes at the cost of being harder to scale modules individually. |
| 6 | Technology stack: .NET 10 ASP.NET Core, EF Core with Npgsql, PostgreSQL, ASP.NET Core Identity, xUnit, GitHub Actions | Deferred. Replaced by Decision 14 on 2026/10/14 | Tech must be free to use, supported and able to remain usable during the entire project, relational data accepted. | Persistence of EF Core and PostgresSQL. .NET 10 is the longest supported.<br>Identity provides password hashing and roles | No longer applied; kept for the record. Could be revisited if the team changes language later. Same language C# would have been required, which does not match the team's strengths (see Decision 14). |
| 7 | Data and persistence: relational database with layered integrity. Business rules in the application, NOT NULL/CHECK/UNIQUE/foreign-key constraints in PostgreSQL, request creation as one transaction, concurrency tokens, no caching of request data, indexes on frequently filtered fields | Decided.<br>2026/09/30 | Security and integrity of data. Data must succeed or fail all together. | Layered protection, transactions, stale-cache risk | Rules and constraints of data exist in two locations so more testing is required to confirm success. User has to reload on a conflict. |
| 8 | Design decision 1: status-change reactions use an Observer-style, in-process event. Audit, notification and reporting handlers react to a simulated status changed event | Decided.<br>2026/09/30 | One status change can trigger multiple reactions. | Observer lowers coupling when there are several consumers and avoids messaging complexity | New reactions added without changing the request service. |
| 9 | Design decision 2: category processing starts as simple conditional logic in one category rules component and switches to the Strategy pattern once categories need different rules | Decided.<br>2026/09/30<br>Conditional | Category rules are not decided as of yet. | Strategy only where category behaviour really differs | Less code now as the switch to Strategy will be logged as a new decision. |
| 10 | Interface: the React front end calls the back end through a REST API; inside the back end, modules call each other through service interfaces in the same application. | Decided. 2026/09/30. Updated 2026/10/14 for Decision 14 | Tech stack and Architecture influence | A separate React front end needs an HTTP boundary (ADR-004: REST for front end to back end, in-process interfaces internally). | Simpler to use and an API can be implemented without changing logic. |
| 11 | Interface: SMS and WhatsApp notifications are simulated behind a replaceable interface | Decided.<br>2026/09/28 | Live services cost money per message and need business verification and template approval. | PED contains notification simulated information as well as constraints cost branches slightly on topic. (Meta, 2026a; 2026b). | No cost and no personal data leaves the system; the simulation cannot copy every real behaviour. |
| 12 | Live SMS and WhatsApp services | Deferred | Cost, business verification and POPIA duties | Approved budget, provider contract, template approval, operator agreement | - |
| 13 | Quality-gate thresholds, threat model, rollback and backup strategy | Deferred | Not enough research available yet. Milestone 3 decision | Need M3 risk assessment and built Architecture | Revisit in M3 |
| 14 | Technology stack: TypeScript throughout. Back end: Node.js 22+ with Express 5, Zod (input validation), JWT login tokens and bcrypt password hashing. Front end: React + TypeScript + Vite (HTML/CSS). Database: PostgreSQL. Testing: Vitest + Supertest. Build: npm. CI: GitHub Actions. | Decided. 2026/10/14. Replaces Decision 6 | The team's resources are limited and all members are trained in JavaScript/TypeScript. Using one language for both the front and back end lowers schedule risk, and all the tools are free and open source (cost constraint). | ADR-004 comparison table (Node.js + Express and React + TypeScript + Vite chosen). Working back-end slice with 48 automated API tests passing in GitHub Actions. | Decision 6 (.NET) deferred. ASP.NET Core Identity replaced by JWT + bcrypt; EF Core replaced by repository classes (PostgreSQL connection added with the database work). RTM technology column updated. Closes RISK-008; supports RISK-010 and RISK-012. |

### Initial Design Decisions (M2)

Two real CivicConnect design problems were chosen using the team's Assignment 2 research. Both are recorded in the Engineering Decision Log (Decisions 8 and 9).

#### Design problem 1: Reacting to a status change

**Problem:** When staff change a request's status, several things must happen: the change must be written to the audit history, the requester must be notified, and management views must update. If RequestService called each of these directly, it would have to change every time a new reaction is added.

**Options considered (A2, Problem 1):** direct calls from RequestService, the Observer pattern, or a separate event/notification service.

**Decision:** Use an Observer-style event inside the application. RequestService saves the change and publishes a "StatusChanged" event. Separate handlers react to it: AuditHandler, NotificationHandler and ReportingHandler.

**Benefit:** RequestService stays small and does not need to know about each reaction, and each handler can be tested on its own. **Trade-off:** more classes and one extra step to follow when debugging.

**Affects:** RequestService, the three handlers, STATUS_HISTORY and the notification log (FR-STF-007, FR-REQ-007, FR-NOT-001, NFR-AUD-001).

![design_observer](media/design_observer.png)

Figure: Status-change handling with an Observer-style event

#### Design problem 2: Different rules for different request categories

**Problem:** Some request categories (for example facility faults, IT support or security concerns) may later need their own validation, priority or routing rules. Putting all of these in one growing if/else block would make the code hard to change.

**Options considered (A2, Problem 2):** simple conditional logic, the Strategy pattern, or Factory Method.

**Decision:** Start simple. All category rules sit behind one interface (ICategoryRules) with one class that uses simple conditions. If categories later need clearly different rules, each category gets its own Strategy class behind the same interface, and this is logged as a new decision.

**Benefit:** less code now, and a clear path to Strategy later without changing RequestService. **Trade-off:** the switch must be watched for, so the rules do not grow too large before it happens.

**Affects:** RequestService and the category rules component (FR-REQ-002, FR-STF-003, NFR-MAIN-001).

![design_category_rules](media/design_category_rules.png)

Figure: Category rules now (simple) and later (Strategy)

**AI usage register:**

| No. | Date | User | AI tool | Task | AI Contribution | Human Verification | Outcome |
|---|---|---|---|---|---|---|---|
| 1 | 07 September 2026 | Herman | ChatGPT | Engineering Decision Log Creation | Explained and gave examples of what a proper EDL should look like | Based on other projects and internet sources compared AI given example | Accepted example and made use to create our EDL |
| 2 | 07 September | Jason | ChatGPT | Construction of md file | Suggested format and proper spelling | Reviewed suggestion made changes and used suggestion only as design guideline | Accepted suggestion as visual guideline |
| 3 | 08 September | Zander | Copilot | Construction of RTM and Risk Register files | Suggested format | Reviewed suggested structure and made changes according to project needs | Accepted structure as guideline |
| 4 | 28 September 2026 | Herman | Claude | Performance justification and SMS/WhatsApp simulation sections | Found sources and drafted text | Sources and wording to be checked by Herman before submission | Pending review |
| 5 | 27 September | Zander | Copilot | RTM, Risk Register and Forward Engineering Consideration Enhancements | Suggested formats, enhancements and assisted in identifying new risks. | Reviewed suggestions and made changes according to project needs and requirements. | Accepted structure and expanded on newly identified risks and enhancements. |

**Proposed M3 AI register continuation (team to verify):**

| 6 (draft) | 14–16 October 2026 | Jason (verify with team) | ChatGPT | Frontend integration, test diagnostics, CI workflow guidance and M3 evidence drafting | Suggested code patches, debugging steps, and documentation wording | Team/user executed 99 frontend and 63 backend tests, verified browser scenarios; final peer review of generated code and documents pending | Pending team approval; do not claim AI output independently verified |

## References

Atlassian (2026) Agile at Scale. Available at: https://www.atlassian.com/agile/agile-at-scale/ (Accessed: 26 September 2026).

Beyer, B., Murphy, N.R., Rensin, D.K., Kawahara, K. and Thurgood, S. (eds.) (2018) The Site Reliability Workbook: Practical Ways to Implement SRE. Sebastopol, CA: O’Reilly Media. Available at: https://sre.google/workbook/implementing-slos/ (Accessed: 28 September 2026).

City of Cape Town (2023) Use WhatsApp to report water and sanitation service requests. 19 June. Available at: https://www.capetown.gov.za/Media-and-news/Use%20WhatsApp%20to%20report%20water%20and%20sanitation%20service%20requests (Accessed: 28 September 2026).

CivicPlus (2026) SeeClickFix 311 CRM. Available at: https://www.civicplus.com/seeclickfix-311-crm/ (Accessed: 28 September 2026).

Clegg, D. and Barker, R. (1994) Case Method Fast-Track: A RAD Approach. Wokingham: Addison-Wesley.

Clickatell (2026) SMS API reference. Available at: https://help.clickatell.com/developers-api-reference/sms-api (Accessed: 28 September 2026).

Cockburn, A. and Garrido de Paz, J.M. (2024) Hexagonal Architecture Explained: How the Ports & Adapters Architecture Simplifies Your Life, and How to Implement It. Humans and Technology Inc.

Driessen, V. (2010) A successful Git branching model. Available at: https://nvie.com/posts/a-successful-git-branching-model/ (Accessed: 9 September 2026).

Freeman, E. and Robson, E. (2020) Head First Design Patterns. 2nd edn. Sebastopol, CA: O’Reilly Media.

Galperin, R. (2021) Re: The 411 on 311: Calling for a Customer-First Approach. Los Angeles: Office of the Controller, City of Los Angeles.

GitHub (2023) About Pull Requests. Available at: https://docs.github.com/en/pull-requests (Accessed: 26 September 2026).

GitHub (2024) About Branches. Available at: https://docs.github.com/en/repositories (Accessed: 26 September 2026).

GitHub (2026) Building and Testing Node.js. Available at: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs (Accessed: 29 September 2026).

Grafana Labs (2026) Thresholds – Grafana k6 documentation. Available at: https://grafana.com/docs/k6/latest/using-k6/thresholds/ (Accessed: 28 September 2026).

International Organization for Standardization (ISO) (2018) ISO 31000:2018 Risk management — Guidelines. Geneva: ISO.

International Organization for Standardization and International Electrotechnical Commission (ISO/IEC) (2011) ISO/IEC 25010:2011 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models. Geneva: ISO/IEC.

International Organization for Standardization and International Electrotechnical Commission (ISO/IEC) (2023) ISO/IEC 25010:2023 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model. Geneva: ISO/IEC.

International Organization for Standardization, International Electrotechnical Commission and Institute of Electrical and Electronics Engineers (ISO/IEC/IEEE) (2018) ISO/IEC/IEEE 29148:2018 Systems and software engineering — Life cycle processes — Requirements engineering. Geneva: ISO/IEC/IEEE.

Jariyal, H., Rasam, P., Humaira and Grogg, A.T. (2025) ‘Performance’, in The Web Almanac 2025. HTTP Archive. Available at: https://almanac.httparchive.org/en/2025/performance (Accessed: 28 September 2026).

McQuade, B. (2020) Defining the Core Web Vitals metrics thresholds. web.dev. Available at: https://web.dev/articles/defining-core-web-vitals-thresholds (Accessed: 28 September 2026).

Meta (2026a) WhatsApp Cloud API: Get started. Available at: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started (Accessed: 28 September 2026).

Meta (2026b) Pricing on the WhatsApp Business Platform. Available at: https://developers.facebook.com/docs/whatsapp/pricing (Accessed: 28 September 2026).

Meta (2026c) Template fundamentals. Available at: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview (Accessed: 28 September 2026).

Meta (2026d) Getting opt-in for WhatsApp. Available at: https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in (Accessed: 28 September 2026).

Microsoft (2026a) Architecture Styles. Microsoft Learn. Available at: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/ (Accessed: 28 September 2026).

Microsoft (2026b) Microservices Architecture Style. Microsoft Learn. Available at: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices (Accessed: 28 September 2026).

Mzekandaba, S. (2020) ‘Tshwane turns to WhatsApp to boost citizen engagement’, ITWeb, 9 July. Available at: https://www.itweb.co.za/content/KWEBb7yZQXjMmRjO (Accessed: 28 September 2026).

NASA (2022) 'NASA Engineering Network', in Crumbley, T. (ed.) Software Engineering Handbook. Chicago: NASA, p. 720.

New Mexico Public Regulation Commission (2024) NM PRC. Available at: https://www.prc.nm.gov/wp-content/uploads/2024/09/RFP-2025-0001.pdf (Accessed: 28 September 2026).

New Relic (2026) Apdex: Measure user satisfaction. Available at: https://docs.newrelic.com/docs/apm/new-relic-apm/apdex/apdex-measure-user-satisfaction/ (Accessed: 28 September 2026).

NodeJS (2026) Getting Started. Available at: https://nodejs.org/learn/getting-started/introduction-to-nodejs (Accessed: 28 September 2026).

NPM (2026) Express. Available at: https://www.npmjs.com/package/express (Accessed: 28 September 2026).

Ogden City Corporation (2024) Request for Proposal: Ogden 311 CRM Software. Available at: https://ogdencity.gov/DocumentCenter/View/30791/311-CRM-Software-RFP_FINAL-10-09-2024 (Accessed: 28 September 2026).

Opensignal (2025) South Africa: Mobile Network Experience Report, August 2025. Available at: https://insights.opensignal.com/reports/2025/08/southafrica/mobile-network-experience (Accessed: 28 September 2026).

OWASP (2024) Password Storage Cheat Sheet. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html (Accessed: 9 September 2026).

OWASP Foundation (2025) OWASP Top 10:2025. Available at: https://owasp.org/Top10/2025 (Accessed: 25 September 2026).

PostgreSQL (2026a) Constraints. Available at: https://www.postgresql.org/docs/18/ddl-constraints.html (Accessed: 28 September 2026).

PostgreSQL (2026b) Foreign Key Tutorial. Available at: https://www.postgresql.org/docs/current/tutorial-fk.html (Accessed: 28 August 2026).

PostgreSQL (2026c) Transaction Processing. Available at: https://www.postgresql.org/docs/current/transactions.html (Accessed: 28 September 2026).

PostgreSQL (2026d) Transactions. Available at: https://www.postgresql.org/docs/18/tutorial-transactions.html (Accessed: 28 September 2026).

PostgreSQL (2026e) Tutorial. Available at: https://www.postgresql.org/docs/current/tutorial.html (Accessed: 28 September 2026).

Project Management Institute (2021) A Guide to the Project Management Body of Knowledge (PMBOK Guide). 7th edn. Newtown Square, PA: Project Management Institute.

Raj, R., Ramesh, A., Seetharam, A. and DeFazio, D. (2021) 'SWIFT: A non-emergency response prediction system using sparse Gaussian Conditional Random Fields', Pervasive and Mobile Computing, 71, 101317. doi:10.1016/j.pmcj.2020.101317.

React (2026) Using TypeScript. Available at: https://react.dev/learn/typescript (Accessed: 28 September 2026).

Render (2026a) Platforms with a Real Free Tier for Developers in 2026. Available at: https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026 (Accessed: 28 September 2026).

Render (2026b) Deploy for Free. Available at: https://render.com/docs/free (Accessed: 29 September 2026).

Republic of South Africa (2013) Protection of Personal Information Act 4 of 2013. Government Gazette, 581(37067), 26 November. Pretoria: Government Printer.

Richardson, C. (2018) Microservices Patterns: With Examples in Java. Shelter Island, NY: Manning Publications.

Sandhu, R.S., Coyne, E.J., Feinstein, H.L. and Youman, C.E. (1996) ‘Role-based access control models’, Computer, 29(2), pp. 38–47.

Sommerville, I. (2016) Software Engineering. 10th edn. Harlow: Pearson Education.

Stepasiuk, T. (2017) Case Study: Building a 311 System in Haverhill. Memorandum to MassIT. Boston: Edward J. Collins, Jr. Center for Public Management, University of Massachusetts Boston. Available at: https://www.mass.gov/doc/haverhill-311-system/download (Accessed: 30 September 2026).

Twilio (2026a) Test credentials. Available at: https://www.twilio.com/docs/iam/test-credentials (Accessed: 28 September 2026).

Twilio (2026b) Track the message status of outbound messages. Available at: https://www.twilio.com/docs/messaging/guides/track-outbound-message-status (Accessed: 28 September 2026).

Vite (2026) Getting Started. Available at: https://vite.dev/guide/ (Accessed: 28 September 2026).

Vitest (2026) Getting Started. Available at: https://main.vitest.dev/guide/ (Accessed: 28 September 2026).

web.dev (2020) Measure performance with the RAIL model. Available at: https://web.dev/articles/rail (Accessed: 28 September 2026).

Winters, T., Manshreck, T. and Wright, H. (eds.) (2020) Software Engineering at Google: Lessons Learned from Programming Over Time. Sebastopol, CA: O’Reilly Media. Available at: https://abseil.io/resources/swe-book/html/ch13.html (Accessed: 28 September 2026).

## Milestone 3 verification and release-readiness continuation (16 October 2026)

**Controlled-document status: DRAFT for team verification.** This chapter continues the teammate-updated v2.2 PED. It does not revise historical M1/M2 decisions retroactively. Final release commit, documentary proof of reviewers, team sign-off, and the in-memory persistence deviation require completion before issuing the PDF. PR #29 is team-confirmed approved and merged.

### M3.1 Working increment and implemented interfaces

The integrated local prototype uses a React + TypeScript + Vite frontend and Node.js + Express + TypeScript backend with JWT-authenticated `REQUESTER`, `STAFF`, `MANAGER`, and `ADMIN` roles. Requester submission and tracking, staff self-assignment/status updates and audited history, and management totals and request reporting were connected to the real backend. The release-facing Staff Triage and Request Register screens use authenticated API data; mock implementations remain in the source for historical demonstration and are not evidence of live dispatch integration.

The backend remains **in-memory**, not PostgreSQL-backed. Data and history are not durable across a server restart. This deviates from the M2 data/persistence baseline and materially limits a production-readiness claim. SMS/WhatsApp notifications are simulated; photo upload persistence and real municipal integrations are not established by the cited verification.

### M3.2 Verification summary (verified execution, not forecast)

| Gate | Evidence observed by 16 October 2026 | Verdict and limits |
|---|---|---|
| Frontend automated regression | `frontend`: `npm run test:run` → **99/99 tests PASS** across 21 files; includes new auth, live reporting and request-register tests | PASS on local working branch; repeat on final submitted SHA |
| Backend automated regression | `backend`: `npx vitest run --pool=forks --maxWorkers=1 --no-file-parallelism --reporter=verbose` → **63/63 PASS** across 6 files, exit `0` | PASS locally; prior worker-thread run stopped early, retain diagnostic context |
| TypeScript and production builds | Both `npm run build` commands completed successfully in local terminals | PASS locally; repeat on final SHA |
| Browser acceptance, central login and RBAC | Eight tester-confirmed checks: initial login, requester/staff/manager routing, restricted nav/direct URL, requester submission, staff operations, and management totals | 8/8 PASS in local simulated staging; manual evidence, not browser automation |
| Critical end-to-end journeys | `TC-E2E-001`, `TC-E2E-002`, `TC-E2E-003` tester-confirmed: submission/tracking, request isolation/relogin, and requester→staff assignment→IN_PROGRESS→requester status/history | PASS for same-process scenarios; restart durability unverified/known absent |
| Release-facing operational pages | `TC-SYS-004`: five tester-confirmed browser checks for live Staff Triage, Live Request Register, history, manager analytics and requester access denial | 5/5 PASS; browser evidence is tester-reported |
| Performance smoke | `TC-PERF-001`: authenticated GET `/api/requests`; 100/100 success, concurrency 10, p50 1.58 ms, p90 3.34 ms, p95 7.75 ms | PASS for short local in-memory smoke **only**; not the M2 ten-minute/25-concurrent assumption or production SLA |
| Dependency and limited secrets checks | 14 October npm audits at high-severity threshold passed for backend/frontend; tracked-code pattern scan found no matches | Limited PASS as of 14 October; repeat/audit current baseline and document scope |
| CI gate | Root `.github/workflows/frontend-ci.yml` updated to run `npm run test:run` before `npm run build`; PR #29 screenshot displays one successful check | PASS for displayed GitHub Actions run; obtain permanent run URL and confirm backend CI on submitted SHA |
| Peer reviews | PR #29 was approved and merged on 16 October 2026, per team confirmation; rule required two approvals | **MERGED**; record the names and review dates from the GitHub PR before final PED sign-off |
| Staging | React at `http://localhost:5173`, Express at `http://localhost:4000`; demo users configured through development-only seeding | Simulated local staging; assessor must be given startup/demo instructions; URLs are localhost, not public deployment |

**Test evidence index:** `Milestone 3/CivicConnect_Project_working/evidence/M3_Test_Evidence.md`; performance `M3_Performance_Result.json`; dependency check `M3_Dependency_Audit.txt`; actual regression outputs should be saved or referenced by CI run URLs. Test totals are not a substitute for the 15-case risk-based traceable sample and explicit test-technique categories in the M3 brief.

### M3.3 Quality claims and limitations

- **Security / access:** frontend role-aware navigation and route guards were browser-tested; backend tests include object-level requester isolation, staff/manager authorization and password handling. Hiding navigation alone is not a security control.
- **Black-box design:** equivalence partitioning of request fields/categories and state-transition tests of the controlled lifecycle are supported by actual backend/test-case evidence. Boundary-value test evidence is present for requester form validation.
- **Audit:** backend tests verify actor/timestamp history; browser journey `TC-E2E-003` confirmed the displayed history after assignment and status change.
- **Availability and durability:** no restart survival, backup restore, full deployment rollback, or database constraints were demonstrated. The current in-memory store cannot satisfy the intended persistent data baseline.
- **Performance:** 100 local GETs are insufficient to certify the four-second standard-action target across the system or the M2 sustained workload. Do not label the service-level target as attained.

### M3.4 Controlled scope/risk decision awaiting approval

| Decision / register | Proposed M3 disposition |
|---|---|
| M2 Decision 7: PostgreSQL and transactional data constraints | **Deviation open.** Use of in-memory repositories must be corrected or formally accepted as a limited M3 demonstration exception; no production durability claim. |
| RISK-011 / RISK-017: data loss, integrity and persistence | Reassess probability/priority because data loss on restart is a known behaviour; team to approve and assign owner. |
| RISK-007: role based access | Automated and browser evidence reduces uncertainty for implemented paths; negative and production-security gaps remain. |
| RISK-012 / RISK-014: late testing and merges | PR #29 was approved and merged per team confirmation; retain residual risk until verified final main SHA, updated documentation and reproducible CI evidence. |
| Decision 13 quality gate / threat model / backup strategy | Root frontend CI now includes test/build gate. Complete/approve decision entry; threat model, recovery and data durability remain open. |
| Defect / technical debt | Historical interrupted Vitest worker run resolved for this local run via fork pool; keep reproducibility note. In-memory persistence remains outstanding debt. |
| AI usage | Review proposed M3 entry above against actual team contributions and approve in controlled AI register. |

**Related controlled artefacts:** `docs/traceability/RTM.md`, `docs/traceability/Evidence and Traceability.md`, `docs/risk register/Risk Register.md`; check other defect, debt and architecture decision records in the repository before claiming they are current.

### M3.5 Release Evidence Summary / decision

**Provisional classification as of the evidence snapshot: NOT READY for formal release sign-off**, although the agreed core integrated workflows are suitable for a **controlled, locally simulated assessment demonstration**. PR #29 is team-confirmed approved and merged; remaining gates are verification of the exact submitted `main` SHA and relevant CI checks, current traceability/register reconciliation, team sign-off, and formal disposition of the PostgreSQL/in-memory departure. A limited M3 demonstration acceptance is distinct from production readiness.

| Submission identifier | Recorded value / completion action |
|---|---|
| Team/project | CivicConnect; three-person SEN381 team (see original PED cover/team records) |
| Repository | `https://github.com/Hakumen1011/SEN381_Civicconnect_Project` |
| Substantive PR | `https://github.com/Hakumen1011/SEN381_Civicconnect_Project/pull/29` |
| **M3 release candidate SHA/tag** | **PENDING**: capture merged `main` commit and test that SHA, not the feature branch or PR number |
| Final review | PR #29 approved and merged (team-confirmed); **PENDING**: record both reviewers and obtain team/document sign-off |
| Exact CI run evidence URL | **PENDING**: link successful run(s) against final baseline |
| RTM and risk register | Existing repository Markdown files linked above, with M3 verification extension |
| Local staging procedure | From repo root open separate frontend/backend terminals; use approved development/demo config; demonstrate at 5173/4000, note data resets on restart |
| Submission | Export continued PED v3.0 as PDF **after** review; supply GitHub URL, exact SHA and staging instructions |

**Team review checklist:** (1) confirm authoritative PED file/version and resolve the duplicate v2.2 Markdown copy; (2) reconcile historical milestone dates with lecturer instructions; (3) approve risk/debt/AI/ADR changes; (4) link concrete GitHub Actions run and both reviewers; (5) replace pending SHA from final main baseline; (6) rerun/verify the integrated SHA; (7) sign off and export the PED as PDF. No unchecked claim should be silently changed to PASS.
