# Risk Register

## Overview

The Risk Register sets out and monitors project risks associated with CivicConnect. These risks have been obtained from the stakeholder analysis, project constraints, scope decisions, engineering decisions and the known project assumptions.

For each risk there is an evaluation of its probability, impact, priority, mitigation strategies, contingency actions, ownership and its current status.

Risk ratings use the following scale:

- Low
- Medium
- High
- Critical

--- 

## Risk register

| Risk ID | Risk Description | Probability | Impact | Priority | Mitigation Strategy | Contingency Plan | Owner | Status |
|----------|-----------------|-------------|---------|----------|--------------------|------------------|--------|--------|
| RISK-001 | Scope creep resulting from requests for additional functionality outside the approved baseline | High | High | Critical | Enforce scope baseline and change control process and review all requested changes before approval | Re-evaluate project scope and prioritise mandatory requirements only | Team | Open |
| RISK-002 | Requirements may change post approval, requiring rework and affect project schedule commitments  | High | High | Critical | Baseline requirements and maintain traceability, and obtain team approval before introducing changes| Replan project activities and update affected deliverables | Team | Open |
| RISK-003 | Milestone deadlines may not be met due to limited available time for analysis, development, testing and documentation | High | High | Critical | Monitor progress against milestones and complete high priority work first | Reduce lower priority deliverables and focus on mandatory project outcomes | Team | Open |
| RISK-004 | Team member unavailability may reduce project capacity and delay deliverables | Medium | High | High | Share knowledge, document work clearly and maintain repository visibility | Reassign work among remaining team members | Team | Open |
| RISK-005 | Limited team size may create workload imbalance during critical project phases | Medium | High | High | Distribute work according to responsibilities and monitor workload regularly | Reallocate tasks and prioritise essential deliverables | Team | Open |
| RISK-006 | Security vulnerabilities may be discovered during testing and require significant redesign efforts | Medium | High | High | Apply security requirements | Allocate time for remidation and security retesting | Development Team | Open |
| RISK-007 | Failure to satisfy role based access control requirements could expose sensitive information | Medium | High | High | Include security controls in requirements, design and testing activities | Rstrict system functions until appropriate controls are implemented | Development Team | Open |
| RISK-008 | Technology stack selection may be delayed because the decision has been deferred until sufficient information is available | Medium | High | High | Complete requirements and architectural analysis before technology selection | Select a technology stack based on available project constraints and requirements | Team | Open |
| RISK-009 | Architectural decisions may be delayed, impacting future implementation planning | Medium | High | High | Complete research activities and requirements analysis before architectural decision | Schedule architecture definition as a priority activity | Team | Open |
| RISK-010 | Free or low cost technology may not provide all desired functionality | Medium | Medium | Medium | Evaluate technologies against project requiremetns and cost constraints | Reduce dependency on optional deatures or identift alternative solutions | Team | Open |
| RISK-011 | Data loss or corruption could affect service request information and auditability | Low | High | Medium | Implement backup and recovery considerations during design | Restore data from backups and investigate root cause | Development Team | Open |
| RISK-012 | Insufficient testing time may result in undetected defects reaching later milestones | Medium | High | High | Allocate testing effort throughout development rather than just at the end | Prioritise testing of critical functional and security requirementss | Team | Open |
| RISK-013 | Poor traceability between stakeholder needs, requirements and acceptance criteria may reduce project quality and auditability | Low | High | Medium | Maintain RTM and controlled project artefacts | Perform traceability reviews before milestone submission | Requirements & Analysis Lead | Open |
| RISK-014 | GitHub merge conflicts or incorrect repository practices may result in lost work or integration delays | Medium | Medium | Medium | Follow GitHub gevernance processes inclding branches, pull requests and approvals | Resolve conflicts through review and controlled integration | Team | Open |
| RISK-015 | Future integration requirements may introduce complexity not considered in current scope | Low | Medium | Low | Keep deferred features documented seperately from the approved baseline | Evaluate integrations through formal change protocol processes | Team | Open |

---

## Highest priority risks

The following are considered the most significant threats to project success.

### RISK-001: Scope creep

The CivicConnect project is facing tight milestone deadlines and has a small team. Uncontrolled scope additions can negatively impact schedule, quality, testing effort and project stability.

Mitigation:
- Maintain accproved scope baseline
- Apply formal change control
- Evaluate all requested changes before approval

---

### RISK-002: Requirement changes

Changes to approved requirements may result in rework in requirements, traceability, design implementation and testing artefacts.

Mitigation: 
- Baseline requirements
- Maintain traceability
- Require teamn review and approval for changes

---

### RISK-003 Schedule delays

Milestones are due on certain days and future milestones are contingent upon the successful completion of current deliverables. Delays in one milestone may have a negative impact on subsequesnt activities.

Mitigation:
- Monitor progress regularly
- Prioritise mandatory requirements
- Address issues early

---

## Risk Traceability

The following shows how CivicConnect project risks are tracced to project constraints and decisions.

### Constraint to risk traceability

| Constraint | Ralated Risk |
|------------|-------------|
| Team Size | RISK-004, RISK-005 |
| Schedule | RISK-003, RISK-012 |
| Cost | RISK-010 |
| Scope control | RISK-001, RISK-002 |
| Security | RISK-006, RISK-007 |

### Engeneering decision to risk traceability

| Engeneering decision | Related Risk |
|---------------------|-------------|
| Technology stack deferred | RISK-008 |
| Architecture deferred | RISK-009 |
| Scope baseline approved | RISK-001, RISK-002 |
| GitHub governance controls | RISK-014 |

---

## Risk monitoring approach

Throughout the project lifecycle, the risks will be reviewed and updated when: 

- New risks are discovered
- Risks already in play change in intensity
- Mitigation measures implemented
- Uncertainty is introducced by engineering choices
- Scope changes are approved
- New project restrictions emerge

All approved changes to risk status will be recorded in controlled project artefacts to ensure traceability throughout the CivicConnect project.
