# OsMak Risk & Opportunities Registry System - User Manual

## **1. System Overview**
The **OsMak Risk & Opportunities Registry System** is a digital platform designed to streamline the identification, evaluation, and management of risks and opportunities across Ospital ng Makati. It replaces spreadsheet-based submissions with a guided, ISO 9001:2015 compliant workflow.

### **Core Features**
*   **Role-Based Access**: Distinct views for Hospital Sections and Internal Quality Audit (IQA).
*   **Automated Scoring**: Real-time calculation of Risk Ratings (Likelihood × Severity).
*   **Guided Workflow**: Submission → Implementation → Verification → Closure.
*   **Data Analysis**: Real-time charts and KPI tracking for both IQA and Section users.
*   **Audit Trail**: Complete history of every action taken on an entry.
*   **Cloud Storage**: Secure data persistence via Supabase.

---

## **2. Getting Started**

### **Login Credentials**
*   **Process Owners** (e.g., ER, Pharmacy, Nursing):
    *   **Password**: `osmak123`
*   **IQA Auditor**:
    *   **Password**: `Lastname123` (e.g., `Alli123`)

### **User Support & Resources**
Directly from the **Login Screen**, you can access the following resources:
*   **View System Workflow**: A visual guide to the 4-step registry process.
*   **Download User Manual**: A direct link to download this PDF guide.
*   **Watch Orientation Video**: A video tutorial covering system basics and best practices.

### **Navigation Sidebar**
*   **Dashboard**: High-level statistics and upcoming deadlines.
*   **R&O List**: A combined chronological list of all Risks and Opportunities with filters.
*   **Data Analysis**: Charts and performance metrics for your role.

---

## **3. Guide for Process Owners**

### **A. Understanding the Dashboard**
*   **Upcoming Deadlines**: The top of your dashboard features **Countdown Cards** for the 4 open risks with the nearest target dates.
    *   **Red**: Overdue (Immediate action required).
    *   **Orange**: Due within 7 days.
    *   **Green**: Due in more than 7 days.
*   **Open Registries**: Below the countdowns, you will find your section's **Open Risks** and **Open Opportunities** tables stacked for easy review.

### **B. Creating a New Entry**
1.  Click the **"+ New Entry"** button on the top right.
2.  Follow the 4-step wizard to input all required details.
3.  **Action Plans** are **MANDATORY** for **ALL** Risks (regardless of rating) and all Opportunities. You cannot submit an entry without at least one action plan.
4.  Upon submission, the entry immediately enters the **Implementation** phase.

### **C. Viewing and Sorting Lists**
*   Navigate to the **R&O List** to see a combined view sorted chronologically by Reference ID (e.g., R1, R2, O1).
*   Use the filters to view by Year, Status (Open/Closed), or Type (Risk/Opportunity).
*   Click on table headers like **"Date"**, **"Status"**, or **"Level"** to sort the list.

### **D. Editing an Entry**
*   You can edit an entry while in the `IMPLEMENTATION` phase.
*   Open the entry from the list.
*   Click the **Pencil Icon** (Edit) in the top-right corner.
*   Modify details (including re-scoring risks) and click the **Save Icon**.

### **E. Implementation & Evidence**
1.  Once submitted, the status is `IMPLEMENTATION`. Proceed to execute your action plans.
2.  Open the entry and scroll to **Action Plans**.
3.  **For Risks**: Click the **"Completed"** button next to the specific action.
    *   A **"Residual Risk Assessment"** panel will appear.
    *   Adjust the **Residual Likelihood** and **Residual Severity** sliders based on the result of your action.
    *   The system will automatically calculate the new Residual Rating and Level.
4.  **For Opportunities**: Click "Completed".
5.  **Completion Remarks**: Provide context on the action taken (Optional).
6.  Click "Submit for Verification".

### **F. Handling Overdue Items**
*   If an action plan's **Target Date** has passed:
    *   The date will appear in **Red** in the table with an **"OVERDUE"** badge.
    *   When you mark it as "Completed", the system will require a **Reason for Delay**.
    *   You **cannot** submit the completion without providing this justification. This ensures compliance with ISO audit requirements.

### **G. IQA Verification Process**
1.  Once you submit an action as completed, its status becomes `FOR VERIFICATION`.
2.  If all actions in an entry are completed, the entry waits for **IQA Verification**.
3.  **IQA Decision**:
    *   **Verified**: If IQA confirms implementation and effectiveness, the entry is **CLOSED**.
    *   **Rejected**: If IQA marks it as "Not Implemented" or "Not Effective", the entry reverts to `IMPLEMENTATION` status. You must review the IQA remarks, address the issue, and re-submit.

### **H. Viewing the Audit Trail**
*   In any registry table, click the **History (clock) icon** in the row of a specific item.
*   This opens a timeline view showing exactly who created, edited, approved, or closed the entry and when.

### **I. Data Analysis (Your Section)**
*   Navigate to the **"Data Analysis"** menu item in your sidebar.
*   This dashboard provides charts that visualize your section's performance.
*   You can filter the data by a specific date range.
*   Available charts include:
    *   **Status Overview**: Open vs. Closed breakdown for Risks and Opportunities.
    *   **Risk Level Distribution**: How many of your risks are Critical, High, Moderate, or Low.
    *   **Annual Volume**: A trend of how many items your section logs per year.
    *   **Source Analysis**: Which sources (e.g., Internal Audit, Incidents) generate the most entries for your section.

---

## **4. Guide for IQA Auditors**

### **A. Reviewing & Verifying Items**
*   Use the **"Pending Tasks"** menu to see all items requiring your attention across the hospital.
*   **Action Plan Verification**: You can verify individual action plans or return them for revision.
*   **Final Verification & Closure**:
    *   Once all actions are completed by the section, the entry moves to **IQA Verification**.
    *   Review the user's **Residual Risk Assessment** and evidence.
    *   Fill out the Verification Form:
        *   **Implementation**: Select "Implemented" or "Not Implemented".
        *   **Effectiveness**: Select "Effective" or "Not Effective".
        *   **Remarks**: Add mandatory verification notes.
    *   **Outcome**:
        *   **Verify & Close**: Marks entry as `CLOSED`.
        *   **Reject**: Reverts entry to `IMPLEMENTATION`.

### **B. Viewing Section Registries**
*   From the sidebar, click the **"Hospital Sections"** dropdown.
*   Select any section to view their Dashboard and R&O List as if you were logged in as them.
*   Click **"Exit Section View"** to return to your global dashboard.

### **C. Reopening a Closed Entry**
*   This function is **exclusive to IQA** and is used for correction of records or reactivating recurring risks.
1.  Open any entry with a `CLOSED` status.
2.  At the bottom, click the **"Reopen Entry"** button (next to Delete).
3.  A confirmation dialog will appear. Enter your password to confirm.
4.  The entry's status will revert to `IMPLEMENTATION` and the action will be logged in the Audit Trail.

### **D. Data Analysis (Hospital-Wide)**
1.  Navigate to the **Data Analysis** menu.
2.  Set the **From** and **To** dates to filter the dataset.
3.  View Key Performance Indicators (Total vs Active vs Closed) for both Risks and Opportunities.
4.  The bar chart shows "Closed Risks by Section" to monitor departmental performance.

---

## **5. Workflow Status Definitions**

| Status | Description |
| :--- | :--- |
| **IMPLEMENTATION** | Entry submitted. Section is executing actions. |
| **FOR VERIFICATION** | Section marked action as done. IQA is reviewing evidence. |
| **IQA VERIFICATION** | All actions completed. IQA performing final effectiveness review. |
| **CLOSED** | Process verified effective and formally closed by IQA. |