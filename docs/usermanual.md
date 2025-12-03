# OsMak Risk & Opportunities Registry System - User Manual

## **1. System Overview**
The **OsMak Risk & Opportunities Registry System** is a digital platform designed to streamline the identification, evaluation, and management of risks and opportunities across Ospital ng Makati. It replaces spreadsheet-based submissions with a guided, ISO 9001:2015 compliant workflow.

### **Core Features**
*   **Role-Based Access**: Distinct views for Hospital Sections and Quality Assurance (QA).
*   **Automated Scoring**: Real-time calculation of Risk Ratings (Likelihood × Severity).
*   **Guided Workflow**: Submission → Implementation → Verification → Closure.
*   **Data Analysis**: Real-time charts and KPI tracking for both QA and Section users.
*   **Audit Trail**: Complete history of every action taken on an entry.
*   **Cloud Storage**: Secure data persistence via Supabase.

---

## **2. Getting Started**

### **Login Credentials**
*   **Section Users** (e.g., ER, Pharmacy, Nursing):
    *   **Password**: `osmak123`
*   **Quality Assurance Auditor**:
    *   **Password**: `admin123`

### **Navigation Sidebar**
*   **Dashboard**: High-level statistics, upcoming deadlines, and scrollable tables for Open Risks/Opportunities.
*   **R&O List**: A master list of all entries (Risks & Opportunities), sortable and filterable by Year, Status, and Type.
*   **Data Analysis**: Charts and performance metrics for your role.

---

## **3. Guide for Section Users**

### **A. Understanding the Dashboard**
*   **Upcoming Deadlines**: The top of your dashboard features **Countdown Cards** for the 4 open risks with the nearest target dates.
    *   **Red**: Overdue (Immediate action required).
    *   **Orange**: Due within 7 days.
    *   **Green**: Due in more than 7 days.
*   **Open Registries**: Below the countdowns, you will find your section's **Open Risks** and **Open Opportunities** tables. These tables are scrollable to save space.

### **B. Creating a New Entry**
1.  Click the **"+ New Entry"** button on the top right.
2.  Follow the 4-step wizard to input all required details.
3.  **Action Plans** are **MANDATORY** for **ALL** Risks (regardless of rating) and all Opportunities. You cannot submit an entry without at least one action plan.
4.  Upon submission, the entry immediately enters the **Implementation** phase.

### **C. Viewing and Sorting Lists**
*   Navigate to the **R&O List** menu item.
*   This view contains all your records (both Open and Closed).
*   **Filtering**: Use the dropdowns at the top to filter by **Year**, **Type** (Risk/Opportunity), or **Status** (Open/Closed).
*   **Sorting**: Click on the **Ref #** column header to sort chronologically (e.g., R1, R2, O1).

### **D. Editing an Entry**
*   You can edit an entry while in the `IMPLEMENTATION` phase.
*   Open the entry from the dashboard or list.
*   Click the **Pencil Icon** (Edit) in the top-right corner.
*   Modify details (including re-scoring risks) and click the **Save Icon**.

### **E. Implementation & Evidence**
1.  Once submitted, the status is `IMPLEMENTATION`. Proceed to execute your action plans.
2.  Open the entry and scroll to **Action Plans**.
3.  **For Risks**: Click the **"Reassess"** button next to the specific action.
    *   A "Proposed Residual Risk Assessment" panel will appear.
    *   Adjust the **Residual Likelihood** and **Residual Severity** sliders based on the action taken.
    *   The system will automatically calculate the new Residual Rating and Level.
4.  **For Opportunities**: Click "Mark Completed".
5.  **Completion Remarks**: These are now optional but recommended to provide context on the action taken.
6.  Click "Submit for Verification".

### **F. Risk Reassessment**
1.  For Risks, once *all* action plans are verified by QA, the status changes to `REASSESSMENT`.
2.  Open the entry.
3.  Review and confirm the **Residual Risk** score.
4.  Add **Remarks on Effectiveness** and submit for QA Verification.

### **G. Viewing the Audit Trail**
*   In any registry table, click the **History (clock) icon** in the row of a specific item.
*   This opens a timeline view showing exactly who created, edited, approved, or closed the entry and when.

### **H. Data Analysis (Your Section)**
*   Navigate to the **"Data Analysis"** menu item in your sidebar.
*   This dashboard provides charts that visualize your section's performance.
*   You can filter the data by a specific date range.
*   Available charts include:
    *   **Status Overview**: Open vs. Closed breakdown for Risks and Opportunities.
    *   **Risk Level Distribution**: How many of your risks are Critical, High, Moderate, or Low.
    *   **Annual Volume**: A trend of how many items your section logs per year.
    *   **Source Analysis**: Which sources (e.g., Internal Audit, Incidents) generate the most entries for your section.

---

## **4. Guide for Quality Assurance Auditor**

### **A. Reviewing & Verifying Items**
*   Use the **"Pending Tasks"** menu to see all items requiring your attention across the hospital.
*   **Verification**: Verify evidence provided by sections during the Implementation phase.
*   **Closure**: Review the user's proposed **Residual Risk Assessment** and close the entry.

### **B. Viewing Closed Registries**
1.  Navigate to **"R&O List"** from the sidebar.
2.  Use the **Status Filter** dropdown and select **"Closed"**.
3.  The table will display all closed records. You can further filter by **Year** or **Type**.
4.  Click on any item to view its full details, including the closure remarks.

### **C. Reopening a Closed Entry**
*   This function is **exclusive to QA** and is used for correction of records or reactivating recurring risks.
1.  Open any entry with a `CLOSED` status.
2.  At the bottom, click the **"Reopen Entry"** button (next to Delete).
3.  A confirmation dialog will appear. Enter your password (`admin123`) to confirm.
4.  The entry's status will revert to `IMPLEMENTATION` and the action will be logged in the Audit Trail.

### **D. Data Analysis**
1.  Navigate to the **Data Analysis** menu.
2.  Set the **From** and **To** dates to filter the dataset.
3.  View Key Performance Indicators (Total vs Active vs Closed) for both Risks and Opportunities.
4.  The bar chart shows "Closed Risks by Section" to monitor departmental performance.

---

## **5. Workflow Status Definitions**

| Status | Description |
| :--- | :--- |
| **IMPLEMENTATION** | Entry submitted and plans approved. Section is executing actions. |
| **FOR VERIFICATION** | Section marked action as done. QA is verifying evidence. |
| **REASSESSMENT** | (Risks Only) Actions verified. Section confirming residual risk. |
| **QA VERIFICATION** | Final review stage before closure. |
| **CLOSED** | Process completed and formally closed by QA. |