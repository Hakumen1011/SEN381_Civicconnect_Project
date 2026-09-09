# Evidence and traceability

## Overview

Evidence and traceability are such that all artefacts of the project trace to the source, are justified by documented decisions, and are verified by all controlled processes. Traceability allows you to be accountable, to manage changes, to assure quality and to plan future project activities.

For CivicConnect traceability is maintained between stakeholders, stakeholder needs, requirements, acceptance criteria, risks, engineering decision and project artefacts.

---

# Requirements Traceability

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

The traceability chain provides assurance that each requirement is traceable to a validated need of the stakeholder and is verifiable by measurable acceptance criteria and subsequent testing activities.

--- 

## Example requirement traceability

### Request status visibility

```text
STK-001 Requester
    ↓
STK-NEED-003
Visibility of current request status
    ↓
FR-REQ-005
Requester can view current request status
    ↓
AC-REQ-005-A
Authenticated requester can view submitted requests

AC-REQ-005-B
Each displayed request shows its current status

AC-REQ-005-C
Requesters cannot view protected request status belonging to other users
```

---

### Request assignment

```text
STK-002 Service Staff
    ↓
STK-NEED-007
Clear ownership and assignment
    ↓
FR-STF-006
Assign or accept responsibility for requests
    ↓
AC-STF-006-A
Authorised staff can assign responsibility

AC-STF-006-B
Assignment is stored

AC-STF-006-C
Responsible party can be identified
```

---

### Role based access control

```text
STK-004 Administrator
STK-007 Security Responsibility
    ↓
STK-NEED-011
STK-NEED-014
    ↓
FR-SEC-002
Role based authorisation
    ↓
AC-SEC-002-A
Permitted functions accessible

AC-SEC-002-B
Restricted functions inaccessible

AC-SEC-002-C
Protected information inaccessible to unauthorised users
```

---

# Risk traceability

## Constraint to risk traceability

| Constraint | Related Risk |
|------------|-------------|
| Team Size | RISK-004, RISK-005 |
| Schedule | RISK-003, RISK-012 |
| Cost | RISK-010 |
| Scope control | RISK-001, RISK-002 |
| Security | RISK-006, RISK-007 |

---

## Example risk traceability

### Scope creep

```text
Constraint:
Controlled scope baseline
    ↓
RISK-001
Scope creep
    ↓
Mitigation:
Formal change control
```

### Schedule pressure

```text
Constraint:
Fixed milestone deadlines
    ↓
RISK-003
Schedule delays
    ↓
Mitigation:
Progress monitoring and prioritisation
```

### Security compliance

```text
Constraint:
Security requirements
    ↓
RISK-006
Security vulnerabilities
    ↓
Mitigation
Security reviews and testing
```

---

# Engineering decision traceability

Engineering decisions provide controlled justification for future project activities.

## Decision traceability model

```text
Requirement / Constraint
    ↓
Engineering decision
    ↓
Impact
    ↓
Future activity
```

---

## Decision 1: Technology stack

```text
Requirement analysis
    ↓
Technology stack deferred
    ↓
Additional information required
    ↓
Technology selection during milestone 2
```

### Rationale 

The project team determined that not enough information was available at milestone 1 to make an informed technology decision

---

## Decision 2: Architecture

```text
Requirements
Constraints
Research
    ↓
Architecture deferred
    ↓
Milestone 2 architecture design
```

### Rationale

Architectural decisions require completed requirements analysis and constraint evaluation before selection

---

## Decision 3: Scope baseline

```text
Business need
Stakeholder needs
    ↓
Approved scope baseline
    ↓
Formal change control process
```

### Impact

Prevents uncontrolled growth of the project scope and supports the schedule and quality objectives

---

## Decision 4: GitHub governance

```text
Project artefacts
    ↓
Feature branch
    ↓
Commit
    ↓
Pull request
    ↓
Approval
    ↓
Merge
```

### Impact
It provides a traceable development history and prevents uncontrolled changes to the project artefacts

---

# Scope traceability

Scope is directly related to the business problem and the stakeholder needs that were identified

## Scope traceability model

```text
Business need
    ↓
Stakeholder need
    ↓
Requirement
    ↓
Scope baseline
```

---

## Example

```text
Business need:
Improve visibility and accountability of service requests
    ↓
STK-NEED-003
Visibility of request status
    ↓
FR-REQ-005
View status requests
    ↓
Included in scope baseline
```

---

## Deferred scope traceability

The following items have been intentionally deferred:

- Whatsapp integration
- Automated SMS notifications
- Advanced dashboards
- AI-assisted categorisation
- Predictive analytics
- External system integrations
- Dedicated mobile applications

Each deferred item is documented and can only be added through a controlled change process in the future

---

# GitHub traceability

GitHub provides configuration management and evidence of controlled project work

## GitHub governance process

```text
Feature branch
    ↓
Development commit
    ↓
Pull request
    ↓   
Review
    ↓
Approval
    ↓
Merge to main branch
```

## Governance principles

- Direct changes to the main branch are prohibited
- Work must be completed in dedicated branches
- Pull requests must be reviewed before merging
- Meaningful commit messages are required
- Repository history must remain intact
- All approved artefacts remain version controlled

---

# Artefact evidence register

| Artefact | Purpose | Evidence Source |
|-----------|----------|----------------|
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

---

# Traceability summary

The CivicConnect project provides traceability for all major engineering artefacts through controlled identifiers, documented stakeholder needs, requirements, acceptance criteria, risks, engineering decisions and version controlled project artefacts.

The established traceability structure ensures that

- Every requirements can be traced to a stakeholder need
- Every requirements can be verified through acceptance criteria
- Risks can be traced to considerations and project decisions
- Engineering decisions are documented and justified
- Scope changes remain controlled
- Repository history provides evidence of team collaboration and change management

This traceability framework allows accountability, quality assurance, controlled change management and future lifecycle activities.
