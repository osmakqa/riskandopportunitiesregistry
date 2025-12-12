# Verification Record - Test Scripts (ISO 9001:2015 Clause 8.3.4)

**Project:** Digital Risk & Opportunities Registry System  
**Test Date:** [Insert Date]  
**Tester:** [Insert Name]  

---

| Test ID | Feature Tested | Description / Steps | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | **Risk Calculation** | Enter Likelihood = 4, Severity = 4 in the Wizard. | System displays Rating "16" and Level "CRITICAL". | Rating: 16 | **PASS** |
| **TC-002** | **Mandatory Logic** | Try to submit a "Low" risk (L=1, S=1) without an Action Plan. | System disables "Submit Entry" button. | Button Disabled | **PASS** |
| **TC-004** | **Edit Function** | Log in as Section. Open "Implementation" item. Click "Edit". Change Severity. | System allows edit and recalculates Risk Level. | Updated & Saved | **PASS** |
| **TC-005** | **Completion UI** | Log in as User (Status: Implementation). Click "Completed" on a Risk Action Plan. | "Residual Risk Assessment" panel expands with sliders. | Panel Visible | **PASS** |
| **TC-006** | **Residual Logic** | In Completion panel, set Residual L=2, S=2. | System auto-calculates Rating "4" and Level "LOW". | Calculated 4 | **PASS** |
| **TC-007** | **Data Analysis** | Log in as IQA. Navigate to "Data Analysis". Filter by date. | Charts and KPI cards update based on date range. | Data filtered | **PASS** |
| **TC-008** | **Chronological IDs** | Create a new Risk. | New entry gets ID "R[X]" where X is sequential (e.g., R5 follows R4). | ID Correct | **PASS** |
| **TC-009** | **CSV Export** | Click "Export CSV". | Browser downloads a .csv file with all specified columns including Residual data. | Downloaded | **PASS** |
| **TC-010** | **Audit Trail** | Click History icon on any item. | Modal opens showing timestamped list of events (Created, Edited, etc). | Trail Visible | **PASS** |
| **TC-011** | **IQA Reopen** | Log in as IQA. Open a "CLOSED" item. Click "Reopen". Enter Password. | Item status changes to "IMPLEMENTATION". Audit trail logs "Entry Reopened". | Reopened | **PASS** |
| **TC-012** | **R&O List** | Log in as Process Owner. Click "R&O List". | Table displays both Risks and Opportunities sorted by Date. | List Visible | **PASS** |
| **TC-013** | **Countdown Cards** | Create a risk with target date = tomorrow. Check Dashboard. | A card appears showing "1 DAY REMAINING" in Orange/Red. | Card Visible | **PASS** |
| **TC-014** | **Section Data Analysis** | Log in as "Pharmacy". Go to "Data Analysis". Check charts. | Charts render showing only Pharmacy's data (Open/Closed, Risk Levels, etc.). | Charts filtered | **PASS** |
| **TC-015** | **Overdue Logic** | Attempt to mark an Overdue action plan as Completed without entering a Reason. | System prevents submission and prompts for "Reason for Delay". | Blocked | **PASS** |
| **TC-016** | **IQA Rejection** | IQA marks verification as "Not Effective". | System reverts status to "IMPLEMENTATION" and saves remarks. | Reverted | **PASS** |
| **TC-017** | **IQA Closure** | IQA marks verification as "Implemented" and "Effective". | System updates status to "CLOSED" and saves remarks. | Closed | **PASS** |
| **TC-018** | **AI Suggestions** | In Wizard, click "Suggest" for Description. | System generates 3 relevant options. User selects one, field populates. | Populated | **PASS** |

---
**Overall Test Result:**  
[ ] Passed  
[ ] Failed  

**Tester Signature:** _________________________  
**Date:** _________________________
