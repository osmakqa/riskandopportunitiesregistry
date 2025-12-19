
import React from 'react';
import { 
  BookOpen, X, PlusCircle, CheckCircle2, 
  Activity, AlertTriangle, ShieldCheck, 
  ClipboardCheck, Target, Bot, Info, FileText,
  User, Calendar, ShieldAlert
} from 'lucide-react';

const UserManualModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-osmak-green p-5 flex justify-between items-center text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
           <div className="bg-white/20 p-2 rounded-lg">
            <BookOpen size={24} />
           </div>
           <div>
            <h2 className="text-xl font-bold">System User Manual</h2>
            <p className="text-xs text-green-100 opacity-80">v3.0 • Step-by-Step Workflow Guide</p>
           </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={28}/></button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-gray-50 text-gray-800 leading-relaxed">
        <div className="max-w-3xl mx-auto space-y-16">
            
            {/* 1. Introduction */}
            <section className="text-center border-b pb-10">
                <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="h-20 mx-auto mb-4" />
                <h1 className="text-3xl font-extrabold text-osmak-green mb-2 uppercase tracking-tight">OsMak Registry Guide</h1>
                <p className="text-gray-500 font-medium">Standardized Procedures for Process Owners and Quality Assurance.</p>
            </section>

            {/* 2. For Sections */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 border-l-4 border-osmak-green pl-4">
                    <div className="bg-green-100 p-2 rounded-lg text-osmak-green">
                        <PlusCircle size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">For Sections (Process Owners)</h3>
                </div>

                <div className="space-y-6">
                    {/* Step 1: Registration */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-osmak-green">
                            <span className="w-7 h-7 rounded-full bg-osmak-green text-white text-xs flex items-center justify-center">1</span>
                            Register a Risk or Opportunity
                        </h4>
                        <p className="text-sm text-gray-600 mb-6 font-medium italic">Click the <strong className="text-osmak-green inline-flex items-center gap-1"><PlusCircle size={14}/> New Entry</strong> button to start.</p>
                        
                        <div className="space-y-5">
                            <div className="flex gap-4">
                                <FileText size={20} className="text-gray-400 shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-sm text-gray-800">Description & Context</p>
                                    <p className="text-xs text-gray-600">Write a clear description of the risk (what can go wrong). Use the <strong className="text-indigo-600">Suggest</strong> button if you need AI assistance.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <ShieldAlert size={20} className="text-red-400 shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-sm text-gray-800">Impact & Controls</p>
                                    <p className="text-xs text-gray-600">For Risks, write the <strong>Potential Impact on QMS</strong> (the consequence) and list your <strong>Existing Controls</strong> (what you currently do to prevent it).</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Activity size={20} className="text-orange-400 shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-sm text-gray-800">Risk Rating</p>
                                    <p className="text-xs text-gray-600">Set the <strong>Likelihood</strong> and <strong>Severity</strong> sliders. The system auto-calculates the level (Low to Critical).</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Calendar size={20} className="text-blue-400 shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-sm text-gray-800">Action Plan</p>
                                    <p className="text-xs text-gray-600">Add at least one action. Specify the <strong>Strategy</strong>, <strong>Description</strong>, <strong>Responsible Person</strong>, and <strong>Target Date</strong>.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Implementation */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-600">
                            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                            Implementation & Completion
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                                <CheckCircle2 size={20} className="text-blue-600 shrink-0" />
                                <p className="text-sm text-blue-800">
                                    Once you have performed the planned action, find the entry on your dashboard and click the <strong className="font-bold">Completed</strong> button.
                                </p>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                                <Target size={20} className="text-amber-600 shrink-0" />
                                <div className="text-sm text-amber-900">
                                    <p className="font-bold mb-1">Enter Residual Data</p>
                                    <p className="text-xs">You <u>must</u> provide the new Likelihood and Severity scores. This shows IQA how much the risk was reduced by your action.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex gap-3">
                                <AlertTriangle size={20} className="text-red-500 shrink-0" />
                                <p className="text-sm text-red-800">
                                    <strong>Overdue Items:</strong> If the target date is passed, you must write a <strong className="font-bold">Reason for Delay</strong> before submitting.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. For IQA */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 border-l-4 border-indigo-600 pl-4">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">For IQA (Quality Assurance)</h3>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-indigo-700 flex items-center gap-2">
                            <ClipboardCheck size={20}/> Check Completed Risks
                        </h4>
                        <p className="text-sm text-gray-600">Navigate to the <strong>Pending Tasks</strong> list to see items submitted by Sections for verification.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h5 className="font-bold text-xs uppercase text-gray-400 mb-2">1. Verify Implementation</h5>
                            <p className="text-xs text-gray-700">Check the evidence provided (e.g., reports, photos, logs) to ensure the section actually performed the planned action.</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <h5 className="font-bold text-xs uppercase text-indigo-400 mb-2">2. Verify Effectiveness</h5>
                            <p className="text-xs text-indigo-800">Review the <strong>Residual Risk Rating</strong>. If the action successfully mitigated the risk, you may close the entry. If not, reject it for further action.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-5 border-t bg-white flex justify-center items-center">
          <button onClick={onClose} className="bg-osmak-green text-white px-16 py-3 rounded-lg font-bold hover:bg-osmak-green-dark transition shadow-lg transform active:scale-95 text-lg">
              Got it!
          </button>
      </div>
    </div>
  </div>
);

export default UserManualModal;
