import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldAlert, 
  Lightbulb, 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  LogOut, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Info,
  XCircle,
  Clock,
  UserCheck,
  ClipboardCheck,
  Calendar,
  Trash2,
  Users,
  Building2,
  ArrowRightCircle,
  Eye,
  Menu,
  ListFilter,
  History,
  ClipboardList,
  RotateCcw,
  Layers,
  MessageSquare,
  Loader2
} from 'lucide-react';

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://jtohqxhfinqjspihturh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0b2hxeGhmaW5xanNwaWh0dXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTkzNDgsImV4cCI6MjA3OTgzNTM0OH0.-XZbu74I7OtJ11tEnSUfgegGaWH0aGF0hyEXpqLJoV0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Types & Interfaces ---

type EntryType = 'RISK' | 'OPPORTUNITY';
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
type WorkflowStatus = 'PLAN_REVIEW' | 'IMPLEMENTATION' | 'REASSESSMENT' | 'QA_VERIFICATION' | 'CLOSED';
type ActionStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REVISION_REQUIRED' | 'FOR_VERIFICATION' | 'COMPLETED';

interface ActionPlan {
  id: string;
  strategy: string; 
  description: string;
  evidence: string;
  responsiblePerson: string;
  targetDate: string;
  status: ActionStatus;
  completionRemarks?: string; // New field for user completion notes
}

interface RegistryItem {
  id: string;
  section: string;
  process: string;
  source: string;
  description: string;
  type: EntryType;
  
  // Risk Assessment
  impactQMS?: string;
  likelihood?: number;
  severity?: number;
  riskRating?: number;
  riskLevel?: RiskLevel;
  existingControls?: string;

  // Opportunity Specific
  expectedBenefit?: string;
  feasibility?: 'LOW' | 'MEDIUM' | 'HIGH';

  // Action Plans (Multiple)
  actionPlans: ActionPlan[];

  // Reassessment (Filled by User after Implementation)
  residualLikelihood?: number;
  residualSeverity?: number;
  residualRiskRating?: number;
  residualRiskLevel?: RiskLevel;
  effectivenessRemarks?: string;
  reassessmentDate?: string;

  // Meta
  status: WorkflowStatus;
  createdAt: string;
}

// --- Data Mapping Helpers (CamelCase <-> SnakeCase) ---

const mapToDb = (item: RegistryItem) => ({
  id: item.id,
  section: item.section,
  process: item.process,
  source: item.source,
  description: item.description,
  type: item.type,
  impact_qms: item.impactQMS,
  likelihood: item.likelihood,
  severity: item.severity,
  risk_rating: item.riskRating,
  risk_level: item.riskLevel,
  existing_controls: item.existingControls,
  expected_benefit: item.expectedBenefit,
  feasibility: item.feasibility,
  action_plans: item.actionPlans,
  residual_likelihood: item.residualLikelihood,
  residual_severity: item.residualSeverity,
  residual_risk_rating: item.residualRiskRating,
  residual_risk_level: item.residualRiskLevel,
  effectiveness_remarks: item.effectivenessRemarks,
  reassessment_date: item.reassessmentDate,
  status: item.status,
  created_at: item.createdAt
});

const mapFromDb = (dbItem: any): RegistryItem => ({
  id: dbItem.id,
  section: dbItem.section,
  process: dbItem.process,
  source: dbItem.source,
  description: dbItem.description,
  type: dbItem.type,
  impactQMS: dbItem.impact_qms,
  likelihood: dbItem.likelihood,
  severity: dbItem.severity,
  riskRating: dbItem.risk_rating,
  riskLevel: dbItem.risk_level,
  existingControls: dbItem.existing_controls,
  expectedBenefit: dbItem.expected_benefit,
  feasibility: dbItem.feasibility,
  actionPlans: dbItem.action_plans || [],
  residualLikelihood: dbItem.residual_likelihood,
  residualSeverity: dbItem.residual_severity,
  residualRiskRating: dbItem.residual_risk_rating,
  residualRiskLevel: dbItem.residual_risk_level,
  effectivenessRemarks: dbItem.effectiveness_remarks,
  reassessmentDate: dbItem.reassessment_date,
  status: dbItem.status,
  createdAt: dbItem.created_at
});

const SECTIONS = [
  'QA (Quality Assurance)',
  'Admitting Section',
  'Cardiovascular Diagnostics',
  'Cashier Management',
  'Claims',
  'Emergency Room Complex',
  'Food and Nutrition Management',
  'General Services Section',
  'Health Records and Documents Management',
  'Housekeeping Laundry and Linen',
  'Industrial Clinic',
  'Information Technology',
  'Laboratory',
  'Medical Social Service',
  'Nursing Division',
  'Pathology',
  'Pharmacy',
  'Physical and Occupational Therapy',
  'Radiology',
  'Requisition Section',
  'Supply Management Section',
  'Surgical Care Complex'
];

const SOURCES = [
  'Internal Audit',
  'Incidents',
  'Complaints',
  'Nonconformities',
  'Applicable Law',
  'Management Review',
  'Process Review',
  'Performance Review',
  'Trends',
  'Others'
];

// --- Helpers & Dictionaries ---

const RISK_STRATEGIES: Record<string, { desc: string, ex: string }> = {
  'Avoid': { desc: 'Eliminate the hazard or discontinue the activity.', ex: 'Stop using a hazardous chemical.' },
  'Mitigate': { desc: 'Reduce the likelihood or severity of the risk.', ex: 'Install safeguards or training.' },
  'Accept': { desc: 'Acknowledge the risk and monitor it.', ex: 'Low risk activities where cost of mitigation exceeds benefit.' },
  'Transfer': { desc: 'Shift the risk to a third party.', ex: 'Insurance or outsourcing.' },
  'Exploit': { desc: 'Take advantage of a situation despite the risk (Positive Risk).', ex: 'Expediting a project launch.' },
  'Others': { desc: 'Other custom strategies.', ex: 'Please specify in description.' }
};

const OPP_STRATEGIES: Record<string, { desc: string, ex: string }> = {
  'Exploit': { desc: 'Make the opportunity definitely happen.', ex: 'Assign top talent to a new project.' },
  'Enhance': { desc: 'Increase the probability or impact.', ex: 'Add more resources to finish early.' },
  'Share': { desc: 'Allocate ownership to a third party who can capture it.', ex: 'Joint venture or partnership.' },
  'Accept': { desc: 'Take advantage if it happens, but do not actively pursue.', ex: 'Wait for market conditions.' }
};

const LIKELIHOOD_DESC: Record<number, string> = {
  1: 'Rare – may occur only in exceptional circumstances',
  2: 'Unlikely – could happen but not expected',
  3: 'Possible – might occur at some time',
  4: 'Likely – will probably occur in most circumstances',
  5: 'Almost Certain – expected to occur frequently'
};

const SEVERITY_DESC: Record<number, string> = {
  1: 'Insignificant – no major effect on QMS or service',
  2: 'Minor – minor deviation, easily corrected',
  3: 'Moderate – affects process output or timelines',
  4: 'Major – causes service disruption or non-conformity',
  5: 'Critical – results in customer dissatisfaction or legal issue'
};

const calculateRiskLevel = (l: number, s: number): RiskLevel => {
  const rating = l * s;
  if (rating >= 16) return 'CRITICAL';
  if (rating >= 11) return 'HIGH';
  if (rating >= 6) return 'MODERATE';
  return 'LOW';
};

const getRiskColor = (level?: RiskLevel) => {
  switch (level) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: WorkflowStatus) => {
  switch (status) {
    case 'PLAN_REVIEW': return 'bg-blue-100 text-blue-800';
    case 'IMPLEMENTATION': return 'bg-purple-100 text-purple-800';
    case 'REASSESSMENT': return 'bg-amber-100 text-amber-800';
    case 'QA_VERIFICATION': return 'bg-indigo-100 text-indigo-800';
    case 'CLOSED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: WorkflowStatus) => {
  if (status === 'QA_VERIFICATION') return 'FOR QA VERIFICATION';
  if (status === 'REASSESSMENT') return 'FOR REASSESSMENT';
  return status.replace('_', ' ');
}

// Calculate days remaining to target date
const getDaysRemaining = (item: RegistryItem): { days: number, label: string, color: string } | null => {
  if (item.status === 'CLOSED' || item.actionPlans.length === 0) return null;
  
  // Find closest target date of active plans
  const activePlans = item.actionPlans.filter(p => p.status !== 'COMPLETED');
  if (activePlans.length === 0) return null;

  const targetDates = activePlans.map(p => new Date(p.targetDate).getTime());
  const nearest = Math.min(...targetDates);
  const now = new Date().getTime();
  const diffTime = nearest - now;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  let color = 'text-green-600';
  if (days < 0) color = 'text-red-600 font-bold';
  else if (days < 7) color = 'text-orange-600 font-bold';

  return { days, label: days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`, color };
};

// --- Components ---

const Login = ({ onLogin }: { onLogin: (section: string) => void }) => {
  const [section, setSection] = useState(SECTIONS[1]); // Default to first non-QA
  const [isAdmin, setIsAdmin] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-osmak-50 to-osmak-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-osmak-900 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="OsMak Logo" className="h-20 w-auto" />
          </div>
          <h1 className="text-2xl font-bold">Ospital ng Makati</h1>
          <p className="text-osmak-200 text-sm mt-2">Risk & Opportunities Registry System</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(isAdmin ? SECTIONS[0] : section); }} className="p-8 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button type="button" onClick={() => setIsAdmin(false)} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isAdmin ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Section User</button>
            <button type="button" onClick={() => setIsAdmin(true)} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isAdmin ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>QA Admin</button>
          </div>

          {!isAdmin ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
              <select 
                value={section} 
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 focus:border-transparent outline-none transition text-sm bg-white text-gray-900"
              >
                {SECTIONS.filter(s => !s.startsWith('QA')).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <div className="p-4 bg-indigo-50 text-indigo-800 text-sm rounded-lg border border-indigo-100">
              Logging in as <strong>QA Command Center</strong>.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 outline-none bg-white text-gray-900"
              placeholder="••••••••"
              defaultValue="demo123"
            />
          </div>
          <button type="submit" className="w-full bg-osmak-700 hover:bg-osmak-800 text-white font-semibold py-3 rounded-lg transition shadow-md">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const ItemDetailModal = ({ item, isQA, onClose, onUpdate }: { item: RegistryItem, isQA: boolean, onClose: () => void, onUpdate: (updated: RegistryItem) => void }) => {
  const [reassessment, setReassessment] = useState({
    likelihood: 1,
    severity: 1,
    remarks: '',
    date: new Date().toISOString().split('T')[0]
  });

  // State for adding/editing action plans inside modal (for revisions)
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });

  // State for user marking action plan as completed (adding remarks)
  const [completingActionId, setCompletingActionId] = useState<string | null>(null);
  const [completionRemarks, setCompletionRemarks] = useState('');

  // Computed Risk Level for Reassessment Form
  const reassessmentRiskRating = reassessment.likelihood * reassessment.severity;
  const reassessmentRiskLevel = calculateRiskLevel(reassessment.likelihood, reassessment.severity);

  const handleActionStatusChange = (actionId: string, newStatus: ActionStatus, remarks?: string) => {
    const updatedActions = item.actionPlans.map(ap => 
      ap.id === actionId ? { ...ap, status: newStatus, completionRemarks: remarks || ap.completionRemarks } : ap
    );
    
    let nextStatus = item.status;
    
    if (isQA && item.status === 'PLAN_REVIEW') {
      const allApproved = updatedActions.every(a => a.status === 'APPROVED' || a.status === 'COMPLETED');
      if (allApproved) nextStatus = 'IMPLEMENTATION';
    }

    if (isQA && item.status === 'IMPLEMENTATION') {
      const allCompleted = updatedActions.every(a => a.status === 'COMPLETED');
      if (allCompleted) {
         if (item.type === 'RISK') {
            nextStatus = 'REASSESSMENT';
         } else {
            nextStatus = 'QA_VERIFICATION';
         }
      }
    }

    onUpdate({ ...item, actionPlans: updatedActions, status: nextStatus });
    setCompletingActionId(null);
    setCompletionRemarks('');
  };

  const handleUserMarkCompleted = (actionId: string) => {
    handleActionStatusChange(actionId, 'FOR_VERIFICATION', completionRemarks);
  };

  const handleSubmitReassessment = () => {
    onUpdate({
      ...item,
      residualLikelihood: reassessment.likelihood,
      residualSeverity: reassessment.severity,
      residualRiskRating: reassessmentRiskRating,
      residualRiskLevel: reassessmentRiskLevel,
      effectivenessRemarks: reassessment.remarks,
      reassessmentDate: reassessment.date,
      status: 'QA_VERIFICATION'
    });
  };

  const handleFinalClose = () => {
    const finalRemarks = reassessment.remarks || item.effectivenessRemarks;
    onUpdate({ 
      ...item, 
      status: 'CLOSED',
      effectivenessRemarks: finalRemarks 
    });
  };

  const handleRejectReassessment = () => {
    onUpdate({ ...item, status: 'REASSESSMENT' });
  };

  const handleAddPlanInModal = () => {
    if (!newPlan.description || !newPlan.strategy) return;
    const action: ActionPlan = {
      id: `AP-${Date.now()}`,
      ...newPlan,
      status: 'PENDING_APPROVAL'
    };
    onUpdate({
      ...item,
      actionPlans: [...item.actionPlans, action]
    });
    setNewPlan({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
    setIsAddingPlan(false);
  };

  const handleDeletePlan = (id: string) => {
    onUpdate({
      ...item,
      actionPlans: item.actionPlans.filter(ap => ap.id !== id)
    });
  };

  const strategies = item.type === 'RISK' ? RISK_STRATEGIES : OPP_STRATEGIES;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-gray-500 bg-white border px-2 py-0.5 rounded">{item.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                {formatStatus(item.status)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.type === 'RISK' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {item.type}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{item.description}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={28}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
          
          {/* Section 1: Core Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm p-4 bg-gray-50 rounded-xl border border-gray-100">
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Section</span>
                <span className="font-semibold text-gray-800">{item.section}</span>
             </div>
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Process / Function</span>
                <span className="font-semibold text-gray-800">{item.process}</span>
             </div>
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Source</span>
                <span className="font-semibold text-gray-800">{item.source}</span>
             </div>
          </div>

          {/* Section 2: Assessment Details (Full Data) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                 <FileText size={18} /> {item.type === 'RISK' ? 'Risk Assessment' : 'Opportunity Assessment'}
               </h3>
               
               {item.type === 'RISK' ? (
                 <>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Potential Impact on QMS</span>
                     <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">{item.impactQMS}</p>
                   </div>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Existing Controls / Mitigation</span>
                     <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">{item.existingControls || 'N/A'}</p>
                   </div>
                 </>
               ) : (
                 <>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Expected Benefit</span>
                     <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">{item.expectedBenefit}</p>
                   </div>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Feasibility</span>
                     <span className="text-green-700 font-bold">{item.feasibility}</span>
                   </div>
                 </>
               )}
             </div>

             <div className="space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Activity size={18} /> Scoring & Level
                </h3>
                {item.type === 'RISK' ? (
                  <div className="flex gap-4">
                     <div className="flex-1 bg-gray-50 p-4 rounded-lg text-center">
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-2">Likelihood</span>
                        <div className="text-2xl font-bold text-gray-900">{item.likelihood}</div>
                        <div className="text-xs text-gray-400 mt-1">{LIKELIHOOD_DESC[item.likelihood || 1]}</div>
                     </div>
                     <div className="flex-1 bg-gray-50 p-4 rounded-lg text-center">
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-2">Severity</span>
                        <div className="text-2xl font-bold text-gray-900">{item.severity}</div>
                        <div className="text-xs text-gray-400 mt-1">{SEVERITY_DESC[item.severity || 1]}</div>
                     </div>
                     <div className="flex-1 p-4 rounded-lg text-center border-2 border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Risk Rating</span>
                        <div className={`text-3xl font-bold ${item.riskLevel === 'CRITICAL' ? 'text-red-600' : item.riskLevel === 'HIGH' ? 'text-orange-500' : 'text-gray-800'}`}>
                          {item.riskRating}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${getRiskColor(item.riskLevel)}`}>{item.riskLevel}</span>
                     </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm">
                    Opportunities are prioritized based on Feasibility ({item.feasibility}) and Impact.
                  </div>
                )}
             </div>
          </div>

          {/* Section 3: Action Plans */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck size={20} /> Action Plans
              </h3>
              {(!isQA && item.status === 'PLAN_REVIEW' && !isAddingPlan) && (
                <button onClick={() => setIsAddingPlan(true)} className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 border border-blue-200">
                  + Add / Revise Plan
                </button>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Strategy</th>
                    <th className="px-4 py-3">Action Description</th>
                    <th className="px-4 py-3">Verification/Evidence</th>
                    <th className="px-4 py-3">Responsible</th>
                    <th className="px-4 py-3">Target Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {item.actionPlans.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">No action plans recorded.</td></tr>
                  ) : item.actionPlans.map(ap => (
                    <React.Fragment key={ap.id}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-xs font-bold uppercase text-gray-600 align-top pt-4">{ap.strategy}</td>
                        <td className="px-4 py-3 font-medium align-top pt-4">
                          {ap.description}
                          {ap.completionRemarks && (
                            <div className="mt-2 text-xs bg-gray-100 p-2 rounded text-gray-700">
                              <span className="font-bold">Completion Remarks:</span> {ap.completionRemarks}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 align-top pt-4 italic">{ap.evidence}</td>
                        <td className="px-4 py-3 text-gray-600 align-top pt-4">{ap.responsiblePerson}</td>
                        <td className="px-4 py-3 text-gray-600 align-top pt-4">{ap.targetDate}</td>
                        <td className="px-4 py-3 align-top pt-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            ap.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            ap.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            ap.status === 'REVISION_REQUIRED' ? 'bg-red-100 text-red-800' :
                            ap.status === 'FOR_VERIFICATION' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{ap.status === 'FOR_VERIFICATION' ? 'FOR VERIFICATION' : ap.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3 text-right align-top pt-4">
                          {isQA ? (
                            <div className="flex flex-col gap-2 items-end">
                              {item.status === 'PLAN_REVIEW' && ap.status === 'PENDING_APPROVAL' && (
                                <>
                                  <button onClick={() => handleActionStatusChange(ap.id, 'APPROVED')} className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-2 py-1 rounded">Approve</button>
                                  <button onClick={() => handleActionStatusChange(ap.id, 'REVISION_REQUIRED')} className="text-red-600 hover:text-red-800 text-xs font-bold border border-red-200 px-2 py-1 rounded">Revise</button>
                                </>
                              )}
                              {/* QA Verifies User's Implementation */}
                              {item.status === 'IMPLEMENTATION' && ap.status === 'FOR_VERIFICATION' && (
                                <button onClick={() => handleActionStatusChange(ap.id, 'COMPLETED')} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 shadow-sm flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Verify Completion
                                </button>
                              )}
                              {item.status === 'IMPLEMENTATION' && ap.status === 'APPROVED' && (
                                <span className="text-xs text-gray-400 italic">Waiting for user...</span>
                              )}
                            </div>
                          ) : (
                            // User Controls
                            <>
                              {item.status === 'PLAN_REVIEW' && (
                                <button onClick={() => handleDeletePlan(ap.id)} className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 size={16} />
                                </button>
                              )}
                              {item.status === 'IMPLEMENTATION' && (ap.status === 'APPROVED' || ap.status === 'REVISION_REQUIRED') && !completingActionId && (
                                <button onClick={() => setCompletingActionId(ap.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 shadow-sm">
                                  Mark Implemented
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                      {/* User Remark Input Form */}
                      {completingActionId === ap.id && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-green-50">
                            <div className="flex gap-4 items-end">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-green-800 mb-1">Completion Remarks (Required)</label>
                                <input 
                                  type="text" 
                                  className="w-full border rounded p-2 text-sm bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                  placeholder="e.g. Installed software on May 20, 2024. Evidence attached."
                                  value={completionRemarks}
                                  onChange={e => setCompletionRemarks(e.target.value)}
                                />
                              </div>
                              <button 
                                onClick={() => handleUserMarkCompleted(ap.id)}
                                disabled={!completionRemarks}
                                className="bg-green-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-800 disabled:opacity-50"
                              >
                                Submit for Verification
                              </button>
                              <button 
                                onClick={() => { setCompletingActionId(null); setCompletionRemarks(''); }}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Action Plan Form inside Modal */}
            {isAddingPlan && (
              <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fadeIn">
                 <h4 className="text-sm font-bold text-blue-800 mb-3">New Action Plan Details</h4>
                 <div className="space-y-3">
                   <div>
                     <select 
                       className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                       value={newPlan.strategy}
                       onChange={e => setNewPlan({...newPlan, strategy: e.target.value})}
                     >
                       <option value="">Select Strategy</option>
                       {Object.keys(strategies).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>
                   <textarea 
                     placeholder="Action Steps..."
                     className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                     value={newPlan.description}
                     onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                   />
                   <input 
                     type="text" 
                     placeholder="Verification / Evidence (e.g. Photo log, Certificate)"
                     className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                     value={newPlan.evidence}
                     onChange={e => setNewPlan({...newPlan, evidence: e.target.value})}
                   />
                   <div className="grid grid-cols-2 gap-3">
                     <input 
                       type="text" 
                       placeholder="Responsible Person"
                       className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                       value={newPlan.responsiblePerson}
                       onChange={e => setNewPlan({...newPlan, responsiblePerson: e.target.value})}
                     />
                     <input 
                       type="date" 
                       className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                       value={newPlan.targetDate}
                       onChange={e => setNewPlan({...newPlan, targetDate: e.target.value})}
                     />
                   </div>
                   <div className="flex gap-2">
                    <button 
                      onClick={handleAddPlanInModal}
                      className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
                    >
                      Add Plan
                    </button>
                    <button 
                      onClick={() => setIsAddingPlan(false)}
                      className="px-4 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* Section 4: Workflow Actions */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wide">Workflow Status: {formatStatus(item.status)}</h3>
            
            {item.status === 'PLAN_REVIEW' && (
              <p className="text-slate-700 flex items-center gap-2">
                <Clock size={18} /> 
                {item.actionPlans.some(ap => ap.status === 'REVISION_REQUIRED') 
                  ? <span className="text-red-600 font-bold">Action Plans require revision. Please update above.</span> 
                  : "Waiting for QA to review action plans."}
              </p>
            )}

            {item.status === 'IMPLEMENTATION' && (
              <p className="text-slate-700 flex items-center gap-2">
                <Activity size={18} /> 
                {item.actionPlans.some(ap => ap.status === 'FOR_VERIFICATION') 
                   ? "Pending QA Verification of implemented actions." 
                   : "Actions are being implemented. Mark as implemented when done."}
              </p>
            )}

            {item.status === 'REASSESSMENT' && item.type === 'RISK' && !isQA && (
              <div className="space-y-6 animate-fadeIn">
                <p className="text-amber-700 font-medium">All actions verified by QA. Please perform reassessment.</p>
                
                {/* Reassessment Sliders & Matrix */}
                <div className="grid grid-cols-2 gap-8 pt-2">
                   <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18}/> Residual Risk Scoring</h4>
                      <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Likelihood (1-5)</label>
                        <input 
                          type="range" min="1" max="5" 
                          value={reassessment.likelihood} 
                          onChange={(e) => setReassessment({...reassessment, likelihood: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <div className="text-xs text-gray-400 mt-2 font-medium">{LIKELIHOOD_DESC[reassessment.likelihood]}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Severity (1-5)</label>
                        <input 
                          type="range" min="1" max="5" 
                          value={reassessment.severity} 
                          onChange={(e) => setReassessment({...reassessment, severity: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                         <div className="text-xs text-gray-400 mt-2 font-medium">{SEVERITY_DESC[reassessment.severity]}</div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-4">
                      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <span className="text-gray-500 text-sm font-medium mb-2">Residual Risk Level</span>
                        <div className={`text-6xl font-bold mb-2 ${
                          reassessmentRiskLevel === 'CRITICAL' ? 'text-red-600' :
                          reassessmentRiskLevel === 'HIGH' ? 'text-orange-500' :
                          reassessmentRiskLevel === 'MODERATE' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {reassessmentRiskRating}
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getRiskColor(reassessmentRiskLevel)}`}>
                          {reassessmentRiskLevel}
                        </span>
                      </div>
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Remarks on Effectiveness</label>
                  <textarea className="w-full border rounded p-2 h-20 bg-white text-gray-900 border-gray-300" placeholder="Why was the action effective? Describe residual risk."
                    value={reassessment.remarks} onChange={e => setReassessment({...reassessment, remarks: e.target.value})} />
                </div>
                <button onClick={handleSubmitReassessment} className="w-full bg-amber-600 text-white py-2 rounded font-bold hover:bg-amber-700">
                  Submit Reassessment
                </button>
              </div>
            )}

            {item.status === 'QA_VERIFICATION' && !isQA && item.type === 'OPPORTUNITY' && (
               <p className="text-slate-700 flex items-center gap-2"><Clock size={18} /> Actions Verified. Waiting for QA to Close Opportunity.</p>
            )}

            {item.status === 'QA_VERIFICATION' && isQA && (
              <div className="space-y-4">
                 {item.type === 'RISK' ? (
                   <>
                    <div className="bg-indigo-50 p-4 rounded border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-2">Reassessment Data Submitted</h4>
                        <p className="text-sm">Residual Rating: <strong>{item.residualLikelihood} x {item.residualSeverity} = {item.residualRiskRating} ({item.residualRiskLevel})</strong></p>
                        <p className="text-sm mt-1">Remarks: {item.effectivenessRemarks}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleRejectReassessment} className="flex-1 border border-red-300 text-red-700 py-2 rounded font-bold hover:bg-red-50 flex items-center justify-center gap-2">
                          <RotateCcw size={16} /> Reject & Request Re-Eval
                        </button>
                        <button onClick={handleFinalClose} className="flex-[2] bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">
                          Verify & Close Registry Entry
                        </button>
                    </div>
                   </>
                 ) : (
                    <div className="space-y-4">
                       <h4 className="font-bold text-indigo-900 border-b border-indigo-100 pb-2">Final Opportunity Review</h4>
                       <p className="text-sm text-gray-600">All actions for this opportunity have been verified. Please add remarks and close.</p>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">QA Remarks</label>
                          <textarea 
                            className="w-full border rounded p-2 h-24 bg-white text-gray-900 border-gray-300" 
                            placeholder="Final remarks on the opportunity outcome..."
                            value={reassessment.remarks} 
                            onChange={e => setReassessment({...reassessment, remarks: e.target.value})} 
                          />
                       </div>
                       <button onClick={handleFinalClose} className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                          Close Opportunity
                       </button>
                    </div>
                 )}
              </div>
            )}

            {item.status === 'CLOSED' && (
              <div className="space-y-4">
                <p className="text-green-700 font-medium flex items-center gap-2"><CheckCircle2 size={18} /> This entry is verified and closed.</p>
                {item.effectivenessRemarks && (
                   <div className="bg-white p-3 border rounded text-sm text-gray-600">
                      <strong>QA/Final Remarks:</strong> {item.effectivenessRemarks}
                      {item.type === 'RISK' && item.residualRiskRating && (
                         <span className="block mt-1">Residual Risk Level: {item.residualRiskLevel} ({item.residualRiskRating})</span>
                      )}
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Wizard = ({ section, onCancel, onSubmit }: { section: string, onCancel: () => void, onSubmit: (item: RegistryItem) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<RegistryItem>>({
    section: section,
    type: 'RISK',
    likelihood: 1,
    severity: 1,
    status: 'PLAN_REVIEW',
    actionPlans: []
  });

  // State for adding new action plans
  const [showActionForm, setShowActionForm] = useState(false);
  const [tempAction, setTempAction] = useState({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
  const [otherSource, setOtherSource] = useState('');

  // Re-calculate risk
  useEffect(() => {
    if (data.type === 'RISK' && data.likelihood && data.severity) {
      const rating = data.likelihood * data.severity;
      const level = calculateRiskLevel(data.likelihood, data.severity);
      setData(prev => ({ ...prev, riskRating: rating, riskLevel: level }));
    }
  }, [data.likelihood, data.severity, data.type]);

  const handleChange = (field: keyof RegistryItem, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addActionPlan = () => {
    if(!tempAction.description || !tempAction.responsiblePerson || !tempAction.targetDate || !tempAction.strategy || !tempAction.evidence) return;
    
    const newAction: ActionPlan = {
      id: `AP-${Date.now()}`,
      strategy: tempAction.strategy,
      description: tempAction.description,
      evidence: tempAction.evidence,
      responsiblePerson: tempAction.responsiblePerson,
      targetDate: tempAction.targetDate,
      status: 'PENDING_APPROVAL'
    };

    setData(prev => ({
      ...prev,
      actionPlans: [...(prev.actionPlans || []), newAction]
    }));
    setTempAction({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
  };

  const isHighRisk = data.type === 'RISK' && (data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL');
  const needsMandatoryAction = isHighRisk || data.type === 'OPPORTUNITY';

  // --- Steps Renders ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
          <div className="flex space-x-2">
            <button 
              type="button"
              onClick={() => handleChange('type', 'RISK')}
              className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 ${data.type === 'RISK' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-white border-gray-200 text-gray-500'}`}
            >
              <AlertTriangle size={18} /> Risk
            </button>
            <button 
              type="button"
              onClick={() => handleChange('type', 'OPPORTUNITY')}
              className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 ${data.type === 'OPPORTUNITY' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white border-gray-200 text-gray-500'}`}
            >
              <Lightbulb size={18} /> Opportunity
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select 
            className="w-full p-3 border rounded-lg bg-white text-gray-900 border-gray-300"
            value={data.source}
            onChange={(e) => handleChange('source', e.target.value)}
          >
            <option value="">Select Source...</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {data.source === 'Others' && (
            <input 
              type="text" 
              placeholder="Please specify..."
              className="w-full p-3 border rounded-lg mt-2 bg-white text-gray-900 border-gray-300"
              value={otherSource}
              onChange={(e) => setOtherSource(e.target.value)}
            />
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Process / Function</label>
        <input 
          type="text" 
          className="w-full p-3 border rounded-lg bg-white text-gray-900 border-gray-300"
          placeholder="e.g., Patient Admission, Drug Dispensing"
          value={data.process}
          onChange={(e) => handleChange('process', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description of {data.type === 'RISK' ? 'Risk' : 'Opportunity'}</label>
        <textarea 
          className="w-full p-3 border rounded-lg h-32 bg-white text-gray-900 border-gray-300"
          placeholder={`Describe the ${data.type?.toLowerCase()} clearly...`}
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      {data.type === 'RISK' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potential Impact on QMS / Patient Safety</label>
            <textarea 
              className="w-full p-3 border rounded-lg h-24 bg-white text-gray-900 border-gray-300"
              placeholder="What happens if this risk materializes?"
              value={data.impactQMS}
              onChange={(e) => handleChange('impactQMS', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Existing Controls / Current Mitigation</label>
            <textarea 
              className="w-full p-3 border rounded-lg h-24 bg-white text-gray-900 border-gray-300"
              placeholder="What mechanisms are currently in place?"
              value={data.existingControls}
              onChange={(e) => handleChange('existingControls', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18}/> Risk Matrix Input</h4>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Likelihood (1-5)</label>
                <input 
                  type="range" min="1" max="5" 
                  value={data.likelihood} 
                  onChange={(e) => handleChange('likelihood', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-osmak-600"
                />
                <div className="text-xs text-gray-400 mt-2 font-medium">{LIKELIHOOD_DESC[data.likelihood || 1]}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Severity (1-5)</label>
                <input 
                  type="range" min="1" max="5" 
                  value={data.severity} 
                  onChange={(e) => handleChange('severity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-osmak-600"
                />
                 <div className="text-xs text-gray-400 mt-2 font-medium">{SEVERITY_DESC[data.severity || 1]}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <span className="text-gray-500 text-sm font-medium mb-2">Computed Risk Level</span>
                <div className={`text-6xl font-bold mb-2 ${
                  data.riskLevel === 'CRITICAL' ? 'text-red-600' :
                  data.riskLevel === 'HIGH' ? 'text-orange-500' :
                  data.riskLevel === 'MODERATE' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {data.riskRating}
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getRiskColor(data.riskLevel)}`}>
                  {data.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm mb-4 flex items-center gap-2">
            <Info size={16} />
            For Opportunities, risk scoring is skipped. Focus on benefits.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Benefit</label>
            <textarea 
              className="w-full p-3 border rounded-lg h-32 bg-white text-gray-900 border-gray-300"
              placeholder="What is the positive outcome?"
              value={data.expectedBenefit}
              onChange={(e) => handleChange('expectedBenefit', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feasibility</label>
            <select 
              className="w-full p-3 border rounded-lg bg-white text-gray-900 border-gray-300"
              value={data.feasibility}
              onChange={(e) => handleChange('feasibility', e.target.value)}
            >
              <option value="LOW">Low - Hard to implement</option>
              <option value="MEDIUM">Medium - Manageable</option>
              <option value="HIGH">High - Easy win</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => {
    const strategies = data.type === 'RISK' ? RISK_STRATEGIES : OPP_STRATEGIES;
    const selectedStrategyInfo = tempAction.strategy ? strategies[tempAction.strategy] : null;

    return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Review Summary</h3>
        <p className="text-sm text-gray-600 mb-4">Please review your assessment before adding action plans.</p>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm">
           <div className="text-gray-500">Description</div>
           <div className="font-medium text-gray-900">{data.description}</div>
           
           <div className="text-gray-500">{data.type === 'RISK' ? 'Risk Level' : 'Feasibility'}</div>
           <div className={`font-bold ${data.type === 'RISK' ? (data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-gray-900') : 'text-green-600'}`}>
              {data.type === 'RISK' ? `${data.riskRating} (${data.riskLevel})` : data.feasibility}
           </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        {needsMandatoryAction && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertTriangle size={18} />
            <span className="text-sm font-bold">Action Plan is MANDATORY for {data.type === 'RISK' ? 'High/Critical Risks' : 'Opportunities'}.</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Action Plans</h3>
          {(!needsMandatoryAction && data.actionPlans?.length === 0 && !showActionForm) && (
             <button onClick={() => setShowActionForm(true)} className="text-osmak-600 text-sm font-semibold hover:underline">
               + Add Optional Action Plan
             </button>
          )}
        </div>

        {/* List of added plans */}
        {data.actionPlans?.length > 0 && (
          <div className="space-y-3 mb-6">
            {data.actionPlans.map((plan, idx) => (
              <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm flex justify-between items-start">
                 <div>
                   <p className="text-xs font-bold uppercase text-gray-500 mb-1">{plan.strategy}</p>
                   <p className="font-semibold text-gray-900">{plan.description}</p>
                   <p className="text-xs text-gray-500 italic mt-1">Evidence: {plan.evidence}</p>
                   <p className="text-xs text-gray-500 mt-1">
                     <span className="font-medium text-gray-700">{plan.responsiblePerson}</span> • By {plan.targetDate}
                   </p>
                 </div>
                 <button 
                  onClick={() => setData(prev => ({...prev, actionPlans: prev.actionPlans?.filter((_, i) => i !== idx)}))}
                  className="text-gray-400 hover:text-red-500"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        {(showActionForm || needsMandatoryAction || data.actionPlans?.length > 0) && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <h4 className="text-sm font-bold text-blue-800 mb-3">New Action Plan Details</h4>
             <div className="space-y-3">
               <div>
                 <select 
                   className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                   value={tempAction.strategy}
                   onChange={e => setTempAction({...tempAction, strategy: e.target.value})}
                 >
                   <option value="">Select Strategy</option>
                   {Object.keys(strategies).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 {selectedStrategyInfo && (
                   <div className="mt-2 text-xs text-blue-800 bg-blue-100/50 p-2 rounded">
                     <strong>{selectedStrategyInfo.desc}</strong> <br/>
                     <span className="italic">Example: {selectedStrategyInfo.ex}</span>
                   </div>
                 )}
               </div>
               <textarea 
                 placeholder="Specific action steps..."
                 className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                 value={tempAction.description}
                 onChange={e => setTempAction({...tempAction, description: e.target.value})}
               />
               <input 
                 type="text" 
                 placeholder="Verification / Evidence (e.g., Photo log, Certificate)"
                 className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                 value={tempAction.evidence}
                 onChange={e => setTempAction({...tempAction, evidence: e.target.value})}
               />
               <div className="grid grid-cols-2 gap-3">
                 <input 
                   type="text" 
                   placeholder="Responsible Person"
                   className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                   value={tempAction.responsiblePerson}
                   onChange={e => setTempAction({...tempAction, responsiblePerson: e.target.value})}
                 />
                 <input 
                   type="date" 
                   className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                   value={tempAction.targetDate}
                   onChange={e => setTempAction({...tempAction, targetDate: e.target.value})}
                 />
               </div>
               <button 
                 onClick={addActionPlan}
                 disabled={!tempAction.description || !tempAction.responsiblePerson || !tempAction.targetDate || !tempAction.strategy || !tempAction.evidence}
                 className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Add Action to List
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  )};

  const steps = [
    { num: 1, title: 'Context' },
    { num: 2, title: 'Assessment' },
    { num: 3, title: 'Actions & Submit' }
  ];

  const canSubmit = () => {
    if (step === 1) {
       // Step 1 Validation
       if (!data.description || !data.process || !data.source) return false;
       if (data.source === 'Others' && !otherSource) return false;
       return true;
    }
    if (step === 2) {
       // Step 2 Validation
       if (data.type === 'RISK') {
          return !!data.impactQMS && !!data.existingControls;
       } else {
          return !!data.expectedBenefit;
       }
    }
    // Step 3 Validation
    if (needsMandatoryAction && (!data.actionPlans || data.actionPlans.length === 0)) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Registry Entry</h2>
            <p className="text-sm text-gray-500">Step {step} of 3: {steps[step-1].title}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <LogOut size={20} />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5">
          <div className="bg-osmak-600 h-1.5 transition-all duration-300" style={{ width: `${(step/3)*100}%` }}></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center bg-gray-50 rounded-b-2xl">
          <button 
            onClick={() => step > 1 ? setStep(s => s - 1) : onCancel()}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            onClick={() => {
              if (step < 3) {
                setStep(s => s + 1);
              } else {
                const finalSource = data.source === 'Others' ? `Others: ${otherSource}` : data.source;
                onSubmit({
                  ...data,
                  source: finalSource,
                  id: `${data.type === 'RISK' ? 'R' : 'O'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                  createdAt: new Date().toISOString().split('T')[0]
                } as RegistryItem);
              }
            }}
            disabled={!canSubmit()}
            className="px-8 py-2.5 rounded-lg bg-osmak-700 text-white font-medium hover:bg-osmak-800 transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? (
              <>Submit Entry <CheckCircle2 size={18} /></>
            ) : (
              <>Next Step <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionView = ({ sectionName, entries, onNewEntry, onItemClick, mode = 'OVERVIEW', readOnly }: { sectionName: string, entries: RegistryItem[], onNewEntry: () => void, onItemClick: (i: RegistryItem) => void, mode?: 'OVERVIEW' | 'RISKS' | 'OPPORTUNITIES' | 'ALL_OPEN_RISKS' | 'ALL_OPEN_OPPS', readOnly?: boolean }) => {
  // State for collapsible QA section views
  const [showClosedRisks, setShowClosedRisks] = useState(false);
  const [showClosedOpps, setShowClosedOpps] = useState(false);

  // --- Stats Calculation ---
  const totalHighRisk = entries.filter(e => e.type === 'RISK' && (e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL')).length;
  const openHighRisk = entries.filter(e => e.type === 'RISK' && (e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL') && e.status !== 'CLOSED').length;
  const totalOpenRisk = entries.filter(e => e.type === 'RISK' && e.status !== 'CLOSED').length;
  const totalOpenOpp = entries.filter(e => e.type === 'OPPORTUNITY' && e.status !== 'CLOSED').length;

  // --- Filtered Lists based on Mode ---
  const openRisks = entries.filter(e => e.type === 'RISK' && e.status !== 'CLOSED');
  const openOpps = entries.filter(e => e.type === 'OPPORTUNITY' && e.status !== 'CLOSED');
  const closedRisks = entries.filter(e => e.type === 'RISK' && e.status === 'CLOSED');
  const closedOpps = entries.filter(e => e.type === 'OPPORTUNITY' && e.status === 'CLOSED');

  const Table = ({ items, title, icon, showDays = false }: { items: RegistryItem[], title: string, icon: React.ReactNode, showDays?: boolean }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4">ID</th>
              {mode.includes('ALL') && <th className="px-6 py-4">Section</th>}
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Rating/Feasibility</th>
              <th className="px-6 py-4">Action Plans</th>
              {showDays && <th className="px-6 py-4">Due In</th>}
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(entry => {
              const daysRemaining = showDays ? getDaysRemaining(entry) : null;
              return (
              <tr key={entry.id} onClick={() => onItemClick(entry)} className="hover:bg-gray-50 transition cursor-pointer group">
                <td className="px-6 py-4 font-mono text-gray-500">{entry.id}</td>
                {mode.includes('ALL') && <td className="px-6 py-4 font-medium text-gray-900">{entry.section}</td>}
                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{entry.description}</td>
                <td className="px-6 py-4">
                  {entry.type === 'RISK' ? (
                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskColor(entry.riskLevel)}`}>{entry.riskRating} ({entry.riskLevel})</span>
                  ) : (
                     <span className="text-green-600 font-bold">{entry.feasibility}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                    <ClipboardCheck size={12} /> {entry.actionPlans.length}
                  </span>
                </td>
                {showDays && (
                   <td className="px-6 py-4">
                      {daysRemaining ? (
                        <span className={`text-xs ${daysRemaining.color}`}>{daysRemaining.label}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                   </td>
                )}
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(entry.status)}`}>
                    {formatStatus(entry.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 group-hover:text-osmak-600">
                  <ChevronRight size={16} />
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-8 text-center text-gray-500">No entries found.</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'OVERVIEW' && 'Risk and Opportunities Registry'}
            {mode === 'RISKS' && 'Risk Registry'}
            {mode === 'OPPORTUNITIES' && 'Opportunities Registry'}
          </h1>
          <p className="text-gray-500">
            Overview for <span className="font-semibold text-osmak-700">{sectionName}</span>
          </p>
        </div>
        {!readOnly && (
          <button 
            onClick={onNewEntry}
            className="bg-osmak-600 hover:bg-osmak-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md flex items-center gap-2 transition"
          >
            <PlusCircle size={20} /> New Entry
          </button>
        )}
      </div>

      {/* Stats Cards - Only on Overview */}
      {mode === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-red-50 p-5 rounded-xl border border-red-100">
            <span className="text-xs font-bold text-red-600 uppercase">Open High/Critical</span>
            <p className="text-3xl font-bold text-red-900 mt-2">{openHighRisk}</p>
          </div>
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
            <span className="text-xs font-bold text-orange-600 uppercase">Total High/Critical</span>
            <p className="text-3xl font-bold text-orange-900 mt-2">{totalHighRisk}</p>
          </div>
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <span className="text-xs font-bold text-blue-600 uppercase">Total Open Risks</span>
            <p className="text-3xl font-bold text-blue-900 mt-2">{totalOpenRisk}</p>
          </div>
          <div className="bg-green-50 p-5 rounded-xl border border-green-100">
            <span className="text-xs font-bold text-green-600 uppercase">Total Open Opps</span>
            <p className="text-3xl font-bold text-green-900 mt-2">{totalOpenOpp}</p>
          </div>
        </div>
      )}

      {/* Tables based on Mode */}
      {mode === 'OVERVIEW' && (
        <>
          <Table items={openRisks} title="Open Risks Registry" icon={<ShieldAlert className="text-red-600"/>} showDays={true} />
          <Table items={openOpps} title="Open Opportunities Registry" icon={<Lightbulb className="text-green-600"/>} showDays={true} />
          
          {/* Collapsible Closed Registries for QA View */}
          {readOnly && (
            <div className="space-y-4 pt-8 border-t">
               <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Closed Registries</h3>
               
               {/* Closed Risks */}
               <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                 <button 
                  onClick={() => setShowClosedRisks(!showClosedRisks)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                 >
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                       <CheckCircle2 size={18} /> Closed Risks Registry ({closedRisks.length})
                    </div>
                    {showClosedRisks ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                 </button>
                 {showClosedRisks && (
                    <div className="p-4 border-t border-gray-100">
                        <Table items={closedRisks} title="Closed Risks" icon={<CheckCircle2 className="text-gray-500"/>} />
                    </div>
                 )}
               </div>

               {/* Closed Opportunities */}
               <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                 <button 
                  onClick={() => setShowClosedOpps(!showClosedOpps)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                 >
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                       <CheckCircle2 size={18} /> Closed Opportunities Registry ({closedOpps.length})
                    </div>
                    {showClosedOpps ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                 </button>
                 {showClosedOpps && (
                    <div className="p-4 border-t border-gray-100">
                        <Table items={closedOpps} title="Closed Opportunities" icon={<CheckCircle2 className="text-gray-500"/>} />
                    </div>
                 )}
               </div>
            </div>
          )}
        </>
      )}

      {mode === 'RISKS' && (
        <>
          <Table items={openRisks} title="Open Risks Registry" icon={<ShieldAlert className="text-red-600"/>} showDays={true} />
          <Table items={closedRisks} title="Closed Risks Registry" icon={<CheckCircle2 className="text-gray-600"/>} />
        </>
      )}

      {mode === 'OPPORTUNITIES' && (
        <>
          <Table items={openOpps} title="Open Opportunities Registry" icon={<Lightbulb className="text-green-600"/>} showDays={true} />
          <Table items={closedOpps} title="Closed Opportunities Registry" icon={<CheckCircle2 className="text-gray-600"/>} />
        </>
      )}
    </div>
  );
};

const QADashboard = ({ entries, onItemClick }: { entries: RegistryItem[], onItemClick: (i: RegistryItem) => void }) => {
  const highRisks = entries.filter(e => e.type === 'RISK' && (e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL')).length;
  const openItems = entries.filter(e => e.status !== 'CLOSED').length;
  const closedItems = entries.filter(e => e.status === 'CLOSED').length;
  const pendingReview = entries.filter(e => e.status === 'PLAN_REVIEW').length;
  const forVerification = entries.filter(e => e.status === 'QA_VERIFICATION').length;

  // Filter pending tasks for QA (Plan Review or Verification)
  const pendingTasks = entries.filter(e => e.status === 'PLAN_REVIEW' || e.status === 'QA_VERIFICATION' || e.actionPlans.some(ap => ap.status === 'FOR_VERIFICATION'));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QA Command Center</h1>
        <p className="text-gray-500">Hospital-Wide Risk & Opportunity Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
         <div className="bg-red-50 p-4 rounded-xl border border-red-100">
           <span className="text-xs font-bold text-red-600 uppercase">Total High Risks</span>
           <p className="text-2xl font-bold text-red-900 mt-1">{highRisks}</p>
         </div>
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
           <span className="text-xs font-bold text-blue-600 uppercase">Total Open</span>
           <p className="text-2xl font-bold text-blue-900 mt-1">{openItems}</p>
         </div>
         <div className="bg-green-50 p-4 rounded-xl border border-green-100">
           <span className="text-xs font-bold text-green-600 uppercase">Total Closed</span>
           <p className="text-2xl font-bold text-green-900 mt-1">{closedItems}</p>
         </div>
         <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
           <span className="text-xs font-bold text-indigo-600 uppercase">Plan Review</span>
           <p className="text-2xl font-bold text-indigo-900 mt-1">{pendingReview}</p>
         </div>
         <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
           <span className="text-xs font-bold text-purple-600 uppercase">For Verification</span>
           <p className="text-2xl font-bold text-purple-900 mt-1">{forVerification}</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <ClipboardList className="text-indigo-600" size={20} />
          <h3 className="font-bold text-gray-800">Pending Tasks for QA</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Task Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingTasks.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No pending tasks.</td></tr>
              ) : pendingTasks.map(entry => {
                let taskLabel = 'Review Plans';
                let taskColor = 'text-indigo-600';
                if (entry.status === 'QA_VERIFICATION') {
                   taskLabel = 'Final Verification';
                   taskColor = 'text-purple-600';
                } else if (entry.actionPlans.some(ap => ap.status === 'FOR_VERIFICATION')) {
                   taskLabel = 'Verify Implementation';
                   taskColor = 'text-green-600';
                }

                return (
                <tr key={entry.id} onClick={() => onItemClick(entry)} className="hover:bg-gray-50 transition cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-gray-900">{entry.section}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{entry.id}</td>
                  <td className="px-6 py-4">
                     <span className={`font-bold ${taskColor}`}>{taskLabel}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{entry.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(entry.status)}`}>
                      {formatStatus(entry.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 group-hover:text-osmak-600">
                    <Eye size={16} />
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ entries, onItemClick }: { entries: RegistryItem[], onItemClick: (i: RegistryItem) => void }) => {
  // Sort by created_at desc
  const sortedEntries = [...entries].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-2">
         <History className="text-gray-700" size={28} />
         <div>
          <h1 className="text-2xl font-bold text-gray-900">Recent Activity</h1>
          <p className="text-gray-500">Activity stream across all sections</p>
         </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedEntries.map(entry => (
                <tr key={entry.id} onClick={() => onItemClick(entry)} className="hover:bg-gray-50 transition cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-gray-900">{entry.section}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{entry.id}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.type === 'RISK' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {entry.type === 'RISK' ? <ShieldAlert size={12} /> : <Lightbulb size={12} />}
                        {entry.type}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{entry.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(entry.status)}`}>
                      {formatStatus(entry.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 group-hover:text-osmak-600">
                    <Eye size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [isQA, setIsQA] = useState(false);
  const [qaSelectedSection, setQaSelectedSection] = useState<string | null>(null);
  
  const [view, setView] = useState<'DASHBOARD' | 'WIZARD' | 'RISKS' | 'OPPORTUNITIES' | 'RECENT_ACTIVITY' | 'ALL_OPEN_RISKS' | 'ALL_OPEN_OPPS'>('DASHBOARD');
  
  // Data State
  const [entries, setEntries] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);

  // Fetch Data from Supabase
  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('registry_items').select('*');
    if (error) {
      console.error('Error fetching data:', error);
      alert('Failed to connect to database. Please check configuration.');
    } else {
      setEntries(data.map(mapFromDb));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleLogin = (section: string) => {
    setUser(section);
    setIsQA(section.includes('QA'));
  };

  const handleUpdateItem = async (updated: RegistryItem) => {
    // Optimistic Update
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedItem(updated);

    // DB Update
    const { error } = await supabase
      .from('registry_items')
      .update(mapToDb(updated))
      .eq('id', updated.id);

    if (error) {
      console.error("Update failed", error);
      alert("Failed to save changes to database.");
      fetchEntries(); // Revert
    }
  };

  const handleSubmitEntry = async (entry: RegistryItem) => {
    // Optimistic Update
    setEntries([entry, ...entries]);
    setView('DASHBOARD');

    // DB Insert
    const { error } = await supabase
      .from('registry_items')
      .insert([mapToDb(entry)]);

    if (error) {
      console.error("Insert failed", error);
      alert("Failed to create entry in database.");
      fetchEntries(); // Revert
    }
  };

  if (loading && !user) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-osmak-700 font-bold gap-2"><Loader2 className="animate-spin" /> Loading Registry System...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-row items-center gap-3">
             <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="w-12 h-12" />
             <span className="text-osmak-900 font-bold text-sm leading-tight">Ospital ng Makati</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          {isQA ? (
            <div className="space-y-1">
              <button onClick={() => { setQaSelectedSection(null); setView('DASHBOARD'); }} className={`w-full text-left px-3 py-2 rounded text-sm font-bold ${!qaSelectedSection && view === 'DASHBOARD' ? 'bg-osmak-50 text-osmak-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                <LayoutDashboard size={16} className="inline mr-2" /> Command Center
              </button>
              <button onClick={() => { setQaSelectedSection(null); setView('RECENT_ACTIVITY'); }} className={`w-full text-left px-3 py-2 rounded text-sm font-bold ${view === 'RECENT_ACTIVITY' ? 'bg-osmak-50 text-osmak-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                <History size={16} className="inline mr-2" /> Recent Activity
              </button>
              <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase px-3">Sections</div>
              {SECTIONS.filter(s => !s.includes('QA')).map(s => (
                <button 
                  key={s} 
                  onClick={() => { setQaSelectedSection(s); setView('DASHBOARD'); }}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium truncate ${qaSelectedSection === s ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <button onClick={() => setView('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${view === 'DASHBOARD' ? 'bg-osmak-50 text-osmak-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <LayoutDashboard size={20} /> Dashboard
              </button>
              <button onClick={() => setView('RISKS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${view === 'RISKS' ? 'bg-osmak-50 text-osmak-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <ShieldAlert size={20} /> Risks
              </button>
              <button onClick={() => setView('OPPORTUNITIES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${view === 'OPPORTUNITIES' ? 'bg-osmak-50 text-osmak-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Lightbulb size={20} /> Opportunities
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-osmak-100 text-osmak-700 flex items-center justify-center font-bold text-xs">
              {user.substring(0,2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user}</p>
              <p className="text-xs text-gray-500">Logged In</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {loading ? (
           <div className="flex items-center justify-center h-full text-gray-500"><Loader2 className="animate-spin mr-2"/> Syncing...</div>
        ) : isQA ? (
          view === 'RECENT_ACTIVITY' ? (
             <RecentActivity entries={entries} onItemClick={setSelectedItem} />
          ) : qaSelectedSection ? (
            // QA Viewing a specific section (Read Only with Closed Registries)
            <SectionView 
              sectionName={qaSelectedSection}
              entries={entries.filter(e => e.section === qaSelectedSection)}
              onNewEntry={() => {}} 
              onItemClick={setSelectedItem}
              readOnly={true}
              mode="OVERVIEW"
            />
          ) : (
            // QA Main Dashboard
            <QADashboard entries={entries} onItemClick={setSelectedItem} />
          )
        ) : (
          // Regular User Logic
          <SectionView 
            sectionName={user}
            entries={entries.filter(e => e.section === user)}
            onNewEntry={() => setView('WIZARD')} 
            onItemClick={setSelectedItem}
            mode={view === 'RISKS' ? 'RISKS' : view === 'OPPORTUNITIES' ? 'OPPORTUNITIES' : 'OVERVIEW'}
          />
        )}
      </main>

      {/* Wizard Modal */}
      {view === 'WIZARD' && (
        <Wizard 
          section={user} 
          onCancel={() => setView('DASHBOARD')} 
          onSubmit={handleSubmitEntry} 
        />
      )}

      {/* Detail Management Modal */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem}
          isQA={isQA}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdateItem}
        />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);