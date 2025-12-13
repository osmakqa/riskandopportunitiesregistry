
import React from 'react';
import { BookOpen, X, Lightbulb, CheckCircle2, LayoutDashboard, PlusCircle, ListFilter, Pencil, Activity, AlertTriangle, ShieldAlert, History, BarChart3, Info } from 'lucide-react';

const UserManualModal = ({ onClose }: { onClose: () => void }) => (
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
            {/* Rest of the manual content omitted for brevity but should be here */}
            {/* ... */}
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

export default UserManualModal;
