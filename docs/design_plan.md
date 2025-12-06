# Design and Development Plan (ISO 9001:2015 Clause 8.3.2)

**Project Title:** Digital Risk & Opportunities Registry System  
**Department:** Quality Management Office / IT  
**Date Prepared:** [Insert Date]  

---

## 1. Objective
To transition from decentralized spreadsheet-based risk assessments to a centralized, web-based application. This ensures compliance with **ISO 9001:2015 Clause 6.1 (Actions to address risks and opportunities)** by standardizing how sections identify, evaluate, and mitigate risks across the hospital.

## 2. Development Stages

### Phase 1: Planning & Requirements Gathering
*   **Input:** Review of existing "Risk Registry Form" and "Opportunity Matrix."
*   **Activity:** Consultation with IQA Head to define the Risk Scoring Matrix (Likelihood × Severity) and thresholds for mandatory action planning.
*   **Output:** Software Requirements Specification (SRS).

### Phase 2: Design & Prototyping
*   **Activity:** Creation of UI wireframes for the "Multi-Step Submission Wizard" and dashboards.
*   **Activity:** Database schema design (Supabase tables for `registry_items`, `action_plans`, and `audit_trail`).
*   **Review:** Approval of the Risk Level logic (Low/Moderate/High/Critical) by the IQA Manager.

### Phase 3: Development / Coding
*   **Activity:** Frontend development using ReactJS and TailwindCSS (OsMak Branding).
*   **Activity:** Implementation of "Edit Mode," a comprehensive **Audit Trail**, and **Data Analysis** dashboards for both IQA (global) and Section (local) users.
*   **Activity:** Implementation of **Chronological Reference IDs** and **Residual Risk Reassessment** workflow.
*   **Optimization:** Removal of "Plan Review" step to streamline workflow (v2.2).
*   **Enhancement:** Implementation of **Overdue Item Logic** (Visual flags, mandatory justification) and **Enhanced IQA Verification** (Effectiveness checks).
*   **Backend:** Integration with Supabase for real-time data storage, sorting, and audit logging.

### Phase 4: Verification (Testing)
*   **Activity:** Developer performs unit testing on risk auto-calculation and audit log triggers.
*   **Activity:** Execution of Test Scripts (See `test_scripts.md`).

### Phase 5: Validation & Deployment
*   **Activity:** User Acceptance Testing (UAT) by IQA Auditors and selected Pilot Sections.
*   **Output:** UAT Sign-off and Go-Live.

## 3. Responsibilities and Authorities
*   **Project Lead / Developer:** Responsible for code architecture, database integrity, and feature implementation.
*   **Process Owner (IQA Manager):** Responsible for defining the Risk Matrix criteria and acceptance of the system.
*   **End Users (Section Heads):** Responsible for populating the registry and verifying workflow usability.

## 4. Resources
*   **Hardware:** Standard hospital workstations.
*   **Software:** Visual Studio Code, Supabase (Cloud Database).
*   **Reference Standards:** ISO 9001:2015 Standard (Clause 6.1).

---
**Prepared By:** _________________________ (Developer)  
**Approved By:** _________________________ (IQA Manager)