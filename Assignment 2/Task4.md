# Task 4: Collaborative Engineering and Continuous Integration Controls

## 4.1 Version Control and Software Configuration Management

Version Control Systems(VCS) like Git are systems that have been created to track changes to source code over time. They offer features like commit histories, branching, merging and rollback capabilities (<Organisation>IEEE</Organisation>, 2023).

Software Configuration Management(SCM) is a broader dicipline that includes version control but also change management, release management, build management, auditing and traceability across software artefacts (<Organisation>IEEE</Organisation>, 2023).

CivicConnect uses Git for version control and SCM practices for traceability and governance of requirements, code changes, test, reviews and releases throughout development. (<Organisation>IEEE</Organisation>, 2023).

| Version Control | Software Configuration Management |
|----------------|----------------------------------|
| Tracks code changes | Controls all project artefacts |
| Support branching and merging | Includes release, build and change management |
| Focuses on source code | Focuses on the entire lifecycle of the software system |
| Eg. Git | Eg. Git + PRs + Reviews + CI + Release management |

### Branching practices

GitHub Flow uses short lived feature branches and a protected main branch. This approach allows for frrequesnt integration and reduces administrative complexity compared to Git Flow (<Organisation> GitHub </Organisation>, n.d.)

### Pull requests

Pull requests are a defined point of integration where proposed changes can be reviewed and tested before being integrated into the main branch (<Organisation> GitHub </Organisation>, n.d.)

Benifits:

- Defect detection
- Collaboration between team members
- Documentation of design conversations
- Improved code quality

### Peer reviews

Peer reviews improve software quality through early detection of defects and facilitation of knowledge sharing between team members (<Organisation>IEEE</Organisation>, 2023).

### Traceability

Traceability links requirements, development tasks, code changes, tests and review activities. Good traceability allows project stakeholders to track implementation and verification of requirements (<Organisation>IEEE</Organisation>, 2023).

### Protected-Main and Two-Reviewer requirements

the Master Project Brief requires the main branch to be secured and for all pull requests to be approved by at least 2 reviewers before they can be merged. These requirements should be implemented in a manner that enhances software quality rather than iin a procedural formality.

The protectiong prevents developers from commiting code directly to the main branch of the project. All changes instead must be performed through pull requests so that they can be reviewed and validated before integration (<Organisation> GitHub </Organisation>, n.d.)

Having two reviewers reduces the chance that defects, security issues or misunderstandings of requirements will be missed before merging. Peer reviews also encourage sharing of knowledge and shared ownership of the codebase (<Organisation>IEEE</Organisation>, 2023).

However the need for two approvals does not necessarily mean meaningful reviews. If reviewers approve changes without careful inspection of the implemetation, the effectiveness of the control may be reduced. To avoid this, the CivicConnect workflow should require reviewers to access:

- Compliance with project requirements
- Allignment with architectural decisions
- Test evidence submitted with the pull request
- Code quality and maintainability
- Potential security concerns

Furthermore, automated CI checks should pass before reviews are performed. This saves reviewers time by not looking at code that fails basic quality checks (<Organisation> GitHub </Organisation>, n.d.; <Organisation> Atlassian </Organisation>, n.d.).

For CivicConnect the reccomended workflow is:

1. Developer creates a feature branch.
2. Changes are committed and pushed.
3. A pull request is created.
4. Automated CI checks execute.
5. Two reviewers perform meaningful code reviews.
6. Issues identifies during review are resolved.
7. The pull request is merged into the protected main branch.

This workflow addresses the protected-main and two-reviewer requirements while ensuring reviews contribute to software knowledge sharing and traceability rather than being a simple administrative checklist (<Organisation> GitHub </Organisation>, n.d.; <Organisation> IEEE </Organisation>, 2023).

---

## 7.2 Continuous Integration and Quality gates

Continuous Integration(CI) is a software development practice where developers regularly merge their code changes into a central repository, after which automated builds and tests are run (<Organisation> GitHub </Organisation>, n.d).

CI is more than simply using Git. Git has version control features such as commits, branching and merging but it does not by itself include any means to automatically check that integrated code is working or defect free (<Organisation> IEEE </Organisation>, 2023).

CI is alos different from automated deployment pipelines. Continuous integration is about validating changes to the software before they are integrated. Deployment pipelines are about delivering the software to test, staging or production environments after it has been validated (<Organisation> Atlassian </Organisation>, n.d).

Because of this, CI should be viewed as a means of quality assurance that helps identify integration problems early in the development lifecycle.

### CI Triggers

Research indicates that an automated CI check should execute whenever changes are introduced into shared development workflows (<Organisation> GitHub </Organisation>, n.d.).

For CivicConnect, the reccomended CI triggers are:

1. When a pull request is created
2. When additional commits are pushed into an existing pull request
3. When changes are merged into the protected main branch

These triggers should ensure that all software changes are properly verified before becoming part of the project baseline (<Organisation> GitHub </Organisation>, n.d.).

### Repeatable Build Requirements

A repeatable build is one that can be run repeatedly and get predictable results no matter who runs it or where it is run. (<Organisation> IEEE </Organisation>, 2023).

For the CivicConnect technology stack, a repeatable build should include: 

- Source code stored in Git
- Version controlled build scripts
- Fixed dependency versions
- Consistent environment configuration
- Automated build execution through GutHub actions
- Documentation of required runtime dependencies

If dependency versions are not fixed, builds may produce different behaviour as package versions change over time.

### Automated Verification Checks

#### Build verification

Build verification ensures that the application complies successfully and the project dependencies are configured correctly (<Organisation> GitHub </Organisation>, n.d.).

**Recommendation:** If the build fails, the integration should be stopped since software that does not compile cannot be reliably tested or developed.

#### Unit tests

Unit testing ensures that a unit of software performs correctly under different conditions (<Organisation> GitHub </Organisation>, n.d.; <Organisation> Atlassian </Organisation>, n.d.).

**Recommendation:** Failed unit tests should block integration because failed tests show potential defects or regressions.

#### Static analysis and Linting

Static analysis tools analyse source code without executing it and can detect coding standard violations, maintainability problems and potential defects (<Organisation> GitHub </Organisation>, n.d.).

**Recommendation:** Static analysis violations should be warnings during early development and not a merge blocker. Critical violations should be blocking checks when there are coding standards.

#### Dependency and Security scanning

The NIST Secure Software Development Framework reccomends integrating security verification activities throughout the software development lifecycle to reduce vulnerabilities and improve software security (<Organisation> NIST </Organisation>, 2022).

**Recommendation**
- Critical vulnerabilities should block integration
- Medium and low security vulnerabilities should initially generate warnings and remediation recommendations

This approach should balance project needs with security concerns

### Quality gate Comparison

| Check | Block Integration? | Reason |
|---------|---------|---------|
| Build verification | Yes | Software cannot be executed if it does not build |
| Unit tests | Yes | Indicates possible functional defects |
| Critical security vulnerabilities | Yes | May expose the application to security risks |
| Dependency vulnerabilities (Medium/Low) | Initially no | Allows remediation planning while maintaining progress |
| Linting violations | Initially no | Improves code quality but may not affect functionality immediately |
| Code coverage targets | Warning initially | useful for quality measurement but should not delay early development |

### Secrets and Configuration management

Sensitive information such as database credentials, API keys and authentication tokens should never be stored within source code repositories.

Instead they should be managed using secure mechanisms like:

- GitHub Secrets
- Environment variables
- Secure creddential stores

The NIST Secure Software Development Framework puts emphasis on the importance of the protection of sensitice artefacts to reduce the risk of exposure of confidential information during the software lifecycle (<Organisation> NIST </Organisation>, 2022).

For CivicConnect, all deployment credentials and configuration secrets should be stored outside the repository and refrenced securely during CI execution.

### Visibility of CI results

Research shows that CI results should be visible directly withing pull requests so that reviewers can assess whether the quality of submitted changes meet requirements before approving them (<Organisation> GitHub </Organisation>, n.d.).

Reviewers should be able to see:

- Build status
- Test results
- Security scan outcomes
- Static analysis results
- Deployment readiness indicators

Providing this information within the review process inproves decision making and reduces likelihood of approving defective code changes.

### Why automation supports but does not replace human reviews

Automated tools can identify syntax errors, failed tests, dependancy vulnerabilities and conding standard violations. But they are unable to fully evaluate software architecture, business requirements, usability considerations or design quality concerns (<Organisation> IEEE </Organisation>, 2023)

Peer reviewers provide judgement that automated systems are unable to replicate. Human reviewers can determine whether software truely satisfies business requirements, whether architectural decisions are appropriate and whether implementation choices align with project goals.

Because of this, automation should be used to complement human reviews rather than replace them. Automated checks improve efficiency by identifying technical issues while peer review provides the contextual understanding necessary for effective software engineering decisions (<Organisation> GitHub </Organisation>, n.d.; <Organisation> IEEE </Organisation>, 2023).

### Final Recommendation

CivicConnect should implement a GutHub Actions CI pipeline that can automatically execute build verification, unit tests, satic analysis as well as dependency vulnerability scanning whenever pull requests are created or updated. Critical security vulnerabilities should prevent integration while linting and code coverage issues should initially generate warnings. CI results should be visible within all pull requests to support meaningful peer reviews while recognising that automated verification complements rather than replaces human judgement.

---

## 7.3 Recommended Team Control

### Recommended Collaborative Integration and CI Approach

Based on the research conducted on SCM branching strategies, peer reviews and CI, the recommended approach for CivicConnect would be to adopt a lightweight but structured collaborative engineering workflow.

The recommended workflow uses GitHub Flow with a protected-main branch, feature automated CI validation. GitHub Flow was selected because it provides effective collaboration with lowered administrative complexity than Git Flow making it suitable for a small development team (<Organisation> GitHub </Organisation>, n.d.; <Organisation> Atlassian </Organisation>, n.d.).

### Recommended development workflow

1. A developer creates a feature branch from the main branch
2. Changes are implemented and committed regularly
3. The feature branch is pushed to GitHub
4. A pull request is created
5. Automated CI checks execute automatically
6. Two team members review the pull request
7. Review comments are addressed by the developer
8. Once approvals and CI checks are complete the pull request is merged into the protected-main branch

The workflow strategy satisfies the Master Project Brief requirement for a protected-main branch and two reviewers while ensuring that there controls contribute meaningfully to software quality abd knowledge sharing amongst team members rather than becoming a procedural formality (<Organisation> GitHub </Organisation>, n.d.; <Organisation> IEEE </Organisation>, 2023).

### Recommended CI controls

The CivicConnect CI pipeline should execute automatically whenever:

- A pull request is created
- Additional commits are pushed to a pull request
- Changes are merged into the main branch

The pipeline should include:

- Build verification
- Automated unit testing
- Static analysis and linting
- Dependency vulnerability scanning

Research shows that Continuous Integration helps detect errors earlier, reduce integration problem and provide faster feedback to development teams (<Organisation> GitHub </Organisation>, n.d.; <Organisation> Atlassian </Organisation>, n.d.).

### Quality gate recommendations

The following checks should prevent integration:

- Build features
- Failed unit tests
- Critical security vulnerabilities

The following checks should initially generate warnings:

- Linting violations
- Code coverage targets
- Medium or low severity dependency vulnerabilities

This approach would allow the team to be able to maintain the development momentum while also gradually increasing quality standards as the project matures (<Organisation> NIST </Organisation>, 2022).

### Traceability practices

To support Software Configuration Management objectives each pull request should reference:

- The relevant project requirement
- The associated GitHub issue
- Related architecture decision records
- Relevant testing advice

Maintaining traceability between requirements, implementation, reviews and tests can improve project governance and accountability (<Organisation> IEEE </Organisation>, 2023)

### Final reccomendation

The CivicConnect team should adopt GitHub Flow supported by a protected-main branch, mandatory two reviewer pull requests, automated CI validation and requirement traceability. This approach provides an acceptable level of governance, quality assurance, collaboration and security for a small engineering team while remaining practical to implement during development (<Organisation> IEEE </Organisation>, 2023; <Organisation> GitHub </Organisation>, n.d.; <Organisation> NIST </Organisation>, 2022).

---
--- 

## Refrences

Atlassian. (n.d.). *Trunk-based development*. Atlassian. Retrieved September 13, 2026, from https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development

Atlassian. (n.d.). *What is continuous integration?*. Atlassian. Retrieved September 13, 2026, from https://www.atlassian.com/continuous-delivery/continuous-integration

GitHub. (n.d.). *Continuous Integration*. GitHub Docs. Retrieved September 13, 2026, from https://docs.github.com/en/actions/get-started/continuous-integration

IEEE. (2023). *Configuration Management: Best Practiced for Systems Engineering*. IEEE Educational Activities. Retrieved September 13, 2026, from https://ieeexplore.ieee.org/courses/details/EDP708

National Institute of Standards and Technology. (2022). *Secure Software Development Framework (SSDF) Version 1.1: Recommendations for Mirigating the Risk of Software Vulnerabilities (NIST SP 800-281)*. U.S. Department of Commerce. Retrieved September 14, 2026, from https://doi.org/10.6028/NIST.SP.800-218 
