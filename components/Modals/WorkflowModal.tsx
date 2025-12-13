
import React from 'react';
import { BookOpen, XCircle, FileText, Activity, ClipboardCheck, CheckCircle2 } from 'lucide-react';

const WorkflowModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
      <div className="p-5 bg-osmak-green text-white flex justify-between items-center border-b border-osmak-800">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <BookOpen size={24} className="text-white" /> 
          Registry System Workflow
        </h2>
        <button onClick={onClose} className="hover:text-osmak-200 transition"><XCircle size={24}/></button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-yellow-400 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">1</div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-yellow-600" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Submission</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
              <strong>Process Owner</strong> logs a new Risk or Opportunity. System calculates <strong>Risk Level</strong>. Action Plans are mandatory for <strong>ALL</strong> Risks.
            </p>
            <div className="mt-auto">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded">Status: IMPLEMENTATION</span>
            </div>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-indigo-500 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">2</div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-indigo-600" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Implementation</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
              <strong>Process Owner</strong> executes plans. For Risks, click <strong>"Completed"</strong> to input Residual Risk values. For Opportunities, mark as Completed.
            </p>
            <div className="mt-auto">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded">Status: FOR VERIFICATION</span>
            </div>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">3</div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="text-teal-600" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Verification</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
              <strong>IQA</strong> verifies actions and the Residual Risk provided by the section. IQA may add verification remarks.
            </p>
            <div className="mt-auto">
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded">Status: IQA VERIFICATION</span>
            </div>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8 border-green-200 bg-green-50/50">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">4</div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-green-700" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Validation & Closure</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-1">
              <strong>IQA</strong> performs final review of effectiveness and closes the entry.
            </p>
            <div className="mt-auto">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded">Status: CLOSED</span>
            </div>
          </div>

        </div>
      </div>

      <div className="p-4 bg-gray-100 text-center border-t border-gray-200">
         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            Ospital ng Makati Quality Management System • ISO 9001:2015 Compliant
         </p>
      </div>
    </div>
  </div>
);

export default WorkflowModal;
