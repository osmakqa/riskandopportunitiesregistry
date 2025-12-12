
import React from 'react';
import { BookOpen, X, Lightbulb, CheckCircle2, LayoutDashboard, PlusCircle, ListFilter, Pencil, Activity, AlertTriangle, ShieldAlert, History, BarChart3, Info } from 'lucide-react';

export const UserManualModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-osmak-green p-4 flex justify-between items-center text-white shrink-0">
        <h2 className="text-lg font-bold flex items-center gap-2">
           <BookOpen size={20} /> User Manual
        </h2>
        <button onClick={onClose} className="hover:text-green-200 transition"><X size={24}/></button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50 text-gray-800 leading-relaxed text-sm">
         <div className="max-w-3xl mx-auto space-y-10">
            
            {/* Title Page */}
            <div className="text-center border-b pb-8">
               <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="h-24 mx-auto mb-4" />
               <h1 className="text-2xl font-extrabold text-osmak-green mb-2 uppercase">OsMak Risk & Opportunities Registry System</h1>
               <h3 className="text-xl text-gray-600 font-medium">User Manual</h3>
               <p className="text-sm text-gray-500 mt-2">Streamlining Risk Management with ISO 9001:2015 Compliance</p>
            </div>

            {/* 1. System Overview */}
            <section className="space-y-4">
               <h3 className="flex items-center gap-3 text-xl font-bold text-osmak-green">
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
                  System Overview
               </h3>
               <p className="text-gray-600">
                  The <strong>OsMak Risk & Opportunities Registry System</strong> is a digital platform designed to streamline the identification, evaluation, and management of risks and opportunities across Ospital ng Makati. It replaces spreadsheet-based submissions with a guided, ISO 9001:2015 compliant workflow.
               </p>
               <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Lightbulb size={16} className="text-yellow-500"/> Core Features</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                     <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> <span><strong>Role-Based Access:</strong> Distinct views for Sections and IQA.</span></li>
                     <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> <span><strong>Automated Scoring:</strong> Real-time Risk Rating calculation.</span></li>
                     <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> <span><strong>Guided Workflow:</strong> Submission → Implementation → Verification → Closure.</span></li>
                     <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> <span><strong>Data Analysis:</strong> Real-time charts and KPI tracking.</span></li>
                     <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> <span><strong>Audit Trail:</strong> Complete history of user actions.</span></li>
                     <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> <span><strong>Cloud Storage:</strong> Secure data persistence via Supabase.</span></li>
                  </ul>
               </div>
            </section>

            {/* 2. Getting Started */}
            <section className="space-y-6">
               <h3 className="flex items-center gap-3 text-xl font-bold text-osmak-green">
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
                  Getting Started
               </h3>
               
               {/* Login Credentials */}
               <div>
                   <h4 className="font-bold text-gray-800 mb-2">Login Credentials</h4>
                   <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                      <table className="w-full text-left">
                         <thead className="bg-gray-100 text-gray-600 border-b">
                            <tr>
                               <th className="px-4 py-2 font-semibold">User Role</th>
                               <th className="px-4 py-2 font-semibold">Password Format</th>
                               <th className="px-4 py-2 font-semibold">Example</th>
                            </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-100">
                            <tr>
                               <td className="px-4 py-2 font-medium">Process Owner (Section)</td>
                               <td className="px-4 py-2 font-mono text-gray-600">osmak123</td>
                               <td className="px-4 py-2 text-gray-500">osmak123</td>
                            </tr>
                            <tr>
                               <td className="px-4 py-2 font-medium">IQA</td>
                               <td className="px-4 py-2 font-mono text-gray-600">[Lastname]123</td>
                               <td className="px-4 py-2 text-gray-500">Alli123</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* User Support */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2">User Support & Resources</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li><strong>View System Workflow:</strong> A visual guide to the 4-step registry process.</li>
                           <li><strong>View User Manual:</strong> Access this full manual directly within the application.</li>
                           <li><strong>Watch Orientation Video:</strong> A video tutorial covering system basics.</li>
                       </ul>
                   </div>
                   {/* Navigation Sidebar */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2">Navigation Sidebar</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li><strong>Dashboard:</strong> High-level statistics and upcoming deadlines.</li>
                           <li><strong>R&O List:</strong> Combined chronological list of all Risks and Opportunities.</li>
                           <li><strong>Data Analysis:</strong> Charts and performance metrics.</li>
                       </ul>
                   </div>
               </div>
            </section>

             {/* 3. Guide for Process Owners */}
            <section className="space-y-6">
               <h3 className="flex items-center gap-3 text-xl font-bold text-osmak-green">
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> 
                  Guide for Process Owners
               </h3>
               
               <div className="space-y-6 pl-4 border-l-2 border-gray-200 ml-3">
                   {/* A. Dashboard */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><LayoutDashboard size={16} className="text-blue-500"/> A. Understanding the Dashboard</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li><strong>Upcoming Deadlines:</strong> Countdown cards for the 4 open risks with the nearest target dates. <span className="text-red-500 font-bold">Red</span>=Overdue, <span className="text-orange-500 font-bold">Orange</span>=Due in 7 days, <span className="text-green-500 font-bold">Green</span>=Safe.</li>
                           <li><strong>Open Registries:</strong> Stacked tables for Open Risks and Open Opportunities for easy review.</li>
                       </ul>
                   </div>

                   {/* B. Creating Entry */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><PlusCircle size={16} className="text-green-500"/> B. Creating a New Entry</h4>
                       <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                           <li>Click the <strong>"+ New Entry"</strong> button on the top right.</li>
                           <li>Follow the 4-step wizard to input all required details.</li>
                           <li><strong>Action Plans are MANDATORY</strong> for ALL Risks and Opportunities.</li>
                           <li>Upon submission, the entry immediately enters the <strong>IMPLEMENTATION</strong> phase.</li>
                       </ol>
                   </div>

                   {/* C. Lists */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><ListFilter size={16} className="text-purple-500"/> C. Viewing and Sorting Lists</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li>Navigate to <strong>R&O List</strong> for a combined chronological view (e.g., R1, R2, O1).</li>
                           <li>Use filters for Year, Status (Open/Closed), or Type (Risk/Opportunity).</li>
                           <li>Click headers like <strong>"Date"</strong>, <strong>"Status"</strong>, or <strong>"Level"</strong> to sort the list.</li>
                       </ul>
                   </div>

                   {/* D. Editing */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Pencil size={16} className="text-yellow-500"/> D. Editing an Entry</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li>You can edit an entry while in the <strong>IMPLEMENTATION</strong> phase.</li>
                           <li>Open the entry, click the <strong>Pencil Icon</strong> (Edit) in the top-right corner.</li>
                           <li>Modify details (including re-scoring risks) and click the <strong>Save Icon</strong>.</li>
                       </ul>
                   </div>

                   {/* E. Implementation */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> E. Implementation & Evidence</h4>
                       <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                           <li>Once submitted, status is <strong>IMPLEMENTATION</strong>. Execute your action plans.</li>
                           <li>Open the entry and scroll to <strong>Action Plans</strong>.</li>
                           <li><strong>For Risks:</strong> Click the <strong>"Completed"</strong> button. A <strong>Residual Risk Assessment</strong> panel will appear. Adjust the sliders based on the result. The system automatically calculates the new Level.</li>
                           <li><strong>For Opportunities:</strong> Click "Completed".</li>
                           <li>Add <strong>Completion Remarks</strong> (optional) and click "Submit for Verification".</li>
                       </ol>
                   </div>

                   {/* F. Overdue */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> F. Handling Overdue Items</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li>If a Target Date has passed, it appears in <span className="text-red-500 font-bold">RED</span> with an <strong>"OVERDUE"</strong> badge.</li>
                           <li>When marking as "Completed", the system requires a mandatory <strong>Reason for Delay</strong>.</li>
                           <li>You cannot submit without providing this justification.</li>
                       </ul>
                   </div>

                   {/* G. IQA Verification */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><ShieldAlert size={16} className="text-teal-500"/> G. IQA Verification Process</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li>Submitted actions become <strong>FOR VERIFICATION</strong>.</li>
                           <li>When all actions are done, entry status becomes <strong>IQA VERIFICATION</strong>.</li>
                           <li>IQA Decision:
                                <ul className="list-[circle] pl-5 mt-1 space-y-1 text-xs">
                                    <li><strong>Verified:</strong> Entry is <strong>CLOSED</strong>.</li>
                                    <li><strong>Rejected:</strong> Reverts to <strong>IMPLEMENTATION</strong>. Review remarks and re-submit.</li>
                                </ul>
                           </li>
                       </ul>
                   </div>

                   {/* H. Audit Trail */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><History size={16} className="text-gray-500"/> H. Viewing Audit Trail</h4>
                       <p className="text-gray-600 pl-5">Click the <strong>History (clock) icon</strong> in any list row to view the timeline of who created, edited, approved, or closed the entry.</p>
                   </div>
                   
                   {/* I. Data Analysis */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><BarChart3 size={16} className="text-blue-600"/> I. Data Analysis (Your Section)</h4>
                       <p className="text-gray-600 pl-5">Navigate to <strong>Data Analysis</strong>. View charts for Status Overview, Risk Level Distribution, Annual Volume, and Sources filtered to your section.</p>
                   </div>
               </div>
            </section>

            {/* 4. Guide for IQA */}
            <section className="space-y-6">
               <h3 className="flex items-center gap-3 text-xl font-bold text-osmak-green">
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span> 
                  Guide for IQA
               </h3>
               
               <div className="space-y-6 pl-4 border-l-2 border-gray-200 ml-3">
                   {/* A. Reviewing */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2">A. Reviewing & Verifying Items</h4>
                       <ul className="list-disc pl-5 space-y-1 text-gray-600">
                           <li>Use <strong>"Pending Tasks"</strong> menu to see all items requiring your attention across the hospital.</li>
                           <li><strong>Action Plan Verification:</strong> You can verify individual action plans or return them for revision.</li>
                           <li><strong>Final Verification & Closure:</strong>
                                <ul className="list-[circle] pl-5 mt-1 space-y-1 text-xs">
                                    <li>Once all actions are completed, status becomes <strong>IQA VERIFICATION</strong>.</li>
                                    <li>Review user's <strong>Residual Risk Assessment</strong> and evidence.</li>
                                    <li>Fill Verification Form:
                                        <ul className="list-disc pl-4 mt-1">
                                            <li><strong>Implementation:</strong> Select "Implemented" or "Not Implemented".</li>
                                            <li><strong>Effectiveness:</strong> Select "Effective" or "Not Effective".</li>
                                            <li><strong>Remarks:</strong> Add mandatory verification notes.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Outcome:</strong>
                                        <ul className="list-disc pl-4 mt-1">
                                            <li><strong>Verify & Close:</strong> Marks entry as <strong>CLOSED</strong>.</li>
                                            <li><strong>Reject:</strong> Reverts entry to <strong>IMPLEMENTATION</strong>.</li>
                                        </ul>
                                    </li>
                                </ul>
                           </li>
                       </ul>
                   </div>

                   {/* B. Viewing Sections */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2">B. Viewing Section Registries</h4>
                       <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                           <li>From sidebar, click <strong>"Hospital Sections"</strong> dropdown.</li>
                           <li>Select a section to view their Dashboard and List as if logged in as them.</li>
                           <li>Click <strong>"Exit Section View"</strong> to return to global dashboard.</li>
                       </ol>
                   </div>

                   {/* C. Reopening */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2">C. Reopening a Closed Entry</h4>
                       <p className="text-gray-600 mb-2 text-xs italic">This function is <strong>exclusive to IQA</strong> and is used for correction of records or reactivating recurring risks.</p>
                       <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                           <li>Open any entry with a <strong>CLOSED</strong> status.</li>
                           <li>At the bottom, click the <strong>"Reopen Entry"</strong> button (next to Delete).</li>
                           <li>A confirmation dialog will appear. Enter your password to confirm.</li>
                           <li>The entry's status will revert to <strong>IMPLEMENTATION</strong> and the action will be logged in the Audit Trail.</li>
                       </ol>
                   </div>

                   {/* D. Data Analysis */}
                   <div>
                       <h4 className="font-bold text-gray-800 mb-2">D. Data Analysis (Hospital-Wide)</h4>
                       <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                           <li>Navigate to <strong>Data Analysis</strong> menu.</li>
                           <li>Set the <strong>From</strong> and <strong>To</strong> dates to filter the dataset.</li>
                           <li>View KPIs (Total vs Active vs Closed) for both Risks and Opportunities.</li>
                           <li>The bar chart shows "Closed Risks by Section" to monitor departmental performance.</li>
                       </ol>
                   </div>
               </div>
            </section>

             {/* 5. Troubleshooting */}
            <section className="space-y-6">
               <h3 className="flex items-center gap-3 text-xl font-bold text-osmak-green">
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-sm">5</span> 
                  Troubleshooting
               </h3>

               <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-gray-100 text-gray-600 border-b">
                        <tr>
                           <th className="px-4 py-2 font-semibold w-1/3">Issue</th>
                           <th className="px-4 py-2 font-semibold">Solution</th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        <tr>
                           <td className="px-4 py-3 font-medium text-red-600">PDF Download Freezes</td>
                           <td className="px-4 py-3 text-gray-600">Ensure internet connection. Retry after 5 seconds.</td>
                        </tr>
                        <tr>
                           <td className="px-4 py-3 font-medium text-red-600">"Closed CARs" List is Empty</td>
                           <td className="px-4 py-3 text-gray-600">As IQA, you <strong>must</strong> select a Department from the filter dropdown.</td>
                        </tr>
                        <tr>
                           <td className="px-4 py-3 font-medium text-red-600">Cannot Submit Response</td>
                           <td className="px-4 py-3 text-gray-600">Ensure "Acknowledged By" and "Date Acknowledged" are filled.</td>
                        </tr>
                        <tr>
                           <td className="px-4 py-3 font-medium text-red-600">"Return" Button Disabled</td>
                           <td className="px-4 py-3 text-gray-600">You must enter remarks in the "IQA Remarks" box before returning a CAR.</td>
                        </tr>
                     </tbody>
                  </table>
               </div>

               <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                   <div className="flex items-start gap-3">
                       <div className="mt-0.5"><Info size={20} className="text-blue-600"/></div>
                       <div>
                           <h4 className="font-bold text-blue-900 text-sm">System Administrator Contact</h4>
                           <p className="text-blue-800 text-sm">Quality Assurance Division</p>
                           <p className="text-blue-800 text-sm">Extension: <strong>1234</strong></p>
                       </div>
                   </div>
               </div>
            </section>

            {/* 6. Workflow Definitions */}
            <section className="space-y-4">
               <h3 className="flex items-center gap-3 text-xl font-bold text-osmak-green">
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span> 
                  Workflow Status Definitions
               </h3>
               <div className="grid gap-3">
                   <div className="flex gap-4 p-3 bg-white border-l-4 border-purple-500 rounded shadow-sm">
                       <span className="font-bold w-36 shrink-0 text-purple-700">IMPLEMENTATION</span>
                       <span className="text-gray-600">Entry submitted. Section is executing actions.</span>
                   </div>
                   <div className="flex gap-4 p-3 bg-white border-l-4 border-amber-500 rounded shadow-sm">
                       <span className="font-bold w-36 shrink-0 text-amber-600">FOR VERIFICATION</span>
                       <span className="text-gray-600">Section marked action as done. IQA is reviewing evidence.</span>
                   </div>
                   <div className="flex gap-4 p-3 bg-white border-l-4 border-teal-500 rounded shadow-sm">
                       <span className="font-bold w-36 shrink-0 text-teal-600">IQA VERIFICATION</span>
                       <span className="text-gray-600">All actions completed. IQA performing final effectiveness review.</span>
                   </div>
                   <div className="flex gap-4 p-3 bg-white border-l-4 border-gray-500 rounded shadow-sm">
                       <span className="font-bold w-36 shrink-0 text-gray-600">CLOSED</span>
                       <span className="text-gray-600">Process verified effective and formally closed by IQA.</span>
                   </div>
               </div>
            </section>

         </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t bg-white flex justify-end">
          <button onClick={onClose} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow">
              Close Manual
          </button>
      </div>
    </div>
  </div>
);
