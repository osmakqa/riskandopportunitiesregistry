# Software Requirements Specification (SRS) (ISO 9001:2015 Clause 8.3.3)

**Project:** Digital Risk & Opportunities Registry System  
**Version:** 1.3  

---

## 1. Introduction
This document defines the requirements for the Digital Risk & Opportunities Registry, a system designed to manage the hospital's preventive actions and continuous improvement initiatives.

## 2. Functional Requirements

### 2.1 User Roles & Access
*   **Section User:**
    *   Can view/edit only their own section's data.
    *   Can submit new Risks/Opportunities via Wizard.
    *   Can edit entries while in `IMPLEMENTATION`.
    *   Can perform **Residual Risk Assessment** during implementation.
    *   Can view a **Data Analysis** dashboard filtered to their own section's data.
    *   Access to a chronological **R&O List** with simplified reference IDs (e.g., R1, O1).
*   **QA Command Center (Admin):**
    *   Full visibility of all sections (Drill-down capability).
    *   Authority to Verify Evidence and Close entries.
    *   Exclusive, password-protected authority to **Reopen** closed entries.
    *   Access to Data Analysis Dashboard.

### 2.2 Risk Assessment Logic
*   **Auto-Calculation:** The system must automatically calculate `Risk Rating = Likelihood (1-5) × Severity (1-5)`.
*   **Risk Levels:**
    *   1-5: Low (Acceptable)
    *   6-10: Moderate
    *   11-15: High
    *   16-25: Critical
*   **Mandatory Actions:** Action Plans are mandatory for **ALL** Risk Levels (Low to Critical) and all Opportunities. The system must prevent submission if no action plan is present.

### 2.3 Workflow Progression
1.  **Submission:** Entry created -> Status `IMPLEMENTATION`. Action Plans are auto-approved.
2.  **Action Execution:**
    *   User clicks **"Reassess"** (for Risks) to input proposed Residual Likelihood and Severity.
    *   System calculates proposed Residual Rating.
    *   Status -> `FOR VERIFICATION`.
3.  **Verification:** QA verifies evidence and reviews residual scores -> Status `REASSESSMENT` (Risks) or `QA VERIFICATION` (Opps).
4.  **Closure:** Final QA validation -> Status `CLOSED`.

### 2.4 Data Analysis & Reporting
*   **Dashboard:** Section users must see a "Countdown" of upcoming target dates (Red/Orange/Green indicators).
*   **Analytics:**
    *   **QA** must have a global dashboard showing Total, Active, and Closed counts, and a bar chart for "Closed Risks per Section".
    *   **Section Users** must have a dashboard showing charts for their own section's Open vs. Closed items, Risk Level distribution, Annual Volume, and Source breakdown.
*   **Export:** System must export data to CSV including all risk fields, action plans (aggregated), and reassessment data.

### 2.5 Traceability & Data Integrity
*   **Audit Trail:** The system must automatically log specific events (Creation, Edits, Status Changes, Plan Approvals, Reopening, Closure) with the Username and Timestamp. This trail must be accessible via an icon in the registry list.
*   **Edit Restrictions:** Users can edit details during the Implementation phase to correct data.
*   **Deletion/Reopening:** These critical actions require password confirmation.
*   **Numbering:** System must generate chronological, human-readable Reference IDs (R1, R2, O1...) based on creation date.

---
**Verified By:** _________________________ (Project Lead)  
**Date:** _________________________