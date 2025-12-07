# Software Requirements Specification (SRS) (ISO 9001:2015 Clause 8.3.3)

**Project:** Digital Risk & Opportunities Registry System  
**Version:** 1.5

---

## 1. Introduction
This document defines the requirements for the Digital Risk & Opportunities Registry, a system designed to manage the hospital's preventive actions and continuous improvement initiatives.

## 2. Functional Requirements

### 2.1 User Roles & Access
*   **Process Owner:**
    *   Can view/edit only their own section's data.
    *   Can submit new Risks/Opportunities via Wizard.
    *   Can edit entries while in `IMPLEMENTATION`.
    *   Can perform **Residual Risk Assessment** when marking actions as completed.
    *   Can view a **Data Analysis** dashboard filtered to their own section's data.
    *   Access to a chronological **R&O List** with simplified reference IDs (e.g., R1, O1).
*   **IQA (Admin):**
    *   Full visibility of all sections (Drill-down capability).
    *   Authority to Verify Evidence, Evaluate Effectiveness, and Close entries.
    *   Exclusive, password-protected authority to **Reopen** closed entries.
    *   Access to Data Analysis Dashboard.

### 2.2 Risk Assessment Logic
*   **Auto-Calculation:** The system must automatically calculate `Risk Rating = Likelihood (1-5) × Severity (1-5)`.
*   **Risk Levels:**
    *   1-5: Low
    *   6-10: Moderate
    *   11-15: High
    *   16-25: Critical
*   **Mandatory Actions:** Action Plans are mandatory for **ALL** Risk Levels (Low to Critical) and all Opportunities. The system must prevent submission if no action plan is present.

### 2.3 Workflow Progression
1.  **Submission:** Entry created -> Status `IMPLEMENTATION`. Action Plans are auto-approved.
2.  **Action Execution:**
    *   User clicks **"Completed"**.
    *   **Overdue Check**: If Target Date is past, system requires "Reason for Delay".
    *   **Residual Risk**: User inputs proposed Residual Likelihood and Severity.
    *   Action Plan Status -> `FOR VERIFICATION`.
3.  **IQA Verification & Closure:**
    *   IQA reviews completed actions.
    *   If all actions are verified, entry status -> `IQA_VERIFICATION`.
    *   IQA validates **Implementation** (Implemented/Not Implemented) and **Effectiveness** (Effective/Not Effective).
    *   **Pass**: If Implemented & Effective -> Status `CLOSED`.
    *   **Fail**: If Not Implemented OR Not Effective -> Status `IMPLEMENTATION` (Returned to user).

### 2.4 Data Analysis & Reporting
*   **Dashboard:** Users must see a "Countdown" of upcoming target dates (Red/Orange/Green indicators).
*   **Analytics:**
    *   **IQA** must have a global dashboard showing Total, Active, and Closed counts, and a bar chart for "Closed Risks per Section".
    *   **Process Owners** must have a dashboard showing charts for their own section's Open vs. Closed items, Risk Level distribution, Annual Volume, and Source breakdown.
*   **Export:** System must export data to CSV including all risk fields, action plans (aggregated), and reassessment data.

### 2.5 Traceability & Data Integrity
*   **Audit Trail:** The system must automatically log specific events (Creation, Edits, Status Changes, Plan Approvals, Reopening, Closure) with the Username and Timestamp.
*   **Edit Restrictions:** Users can edit details during the Implementation phase to correct data.
*   **Deletion/Reopening:** These critical actions require password confirmation.
*   **Numbering:** System must generate chronological, human-readable Reference IDs (R1, R2, O1...) based on creation date.

---
**Verified By:** _________________________ (Project Lead)  
**Date:** _________________________