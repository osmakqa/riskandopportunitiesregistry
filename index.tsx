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
  Loader2,
  Wifi,
  WifiOff,
  Download,
  BookOpen,
  ArrowUpDown,
  Pencil,
  Save,
  BarChart3,
  Filter,
  X
} from 'lucide-react';

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://jtohqxhfinqjspihturh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0b2hxeGhmaW5xanNwaWh0dXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTkzNDgsImV4cCI6MjA3OTgzNTM0OH0.-XZbu74I7OtJ11tEnSUfgegGaWH0aGF0hyEXpqLJoV0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Types & Interfaces ---

type EntryType = 'RISK' | 'OPPORTUNITY';
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
// Removed PLAN_REVIEW from WorkflowStatus
type WorkflowStatus = 'IMPLEMENTATION' | 'REASSESSMENT' | 'QA_VERIFICATION' | 'CLOSED';
type ActionStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REVISION_REQUIRED' | 'FOR_VERIFICATION' | 'COMPLETED';

interface AuditEvent {
  timestamp: string;
  event: string;
  user: string;
}

interface ActionPlan {
  id: string;
  strategy: string; 
  description: string;
  evidence: string;
  responsiblePerson: string;
  targetDate: string;
  status: ActionStatus;
  completionRemarks?: string;
}

interface RegistryItem {
  id: string;
  section: string;
  dateIdentified: string;
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
  closedAt?: string;
  auditTrail: AuditEvent[];
}

interface DonutChartProps {
  title: string;
  data: Record<string, number>;
  colors: Record<string, string>;
}

// --- Data Mapping Helpers (CamelCase <-> SnakeCase) ---

const mapToDb = (item: RegistryItem) => ({
  id: item.id,
  section: item.section,
  date_identified: item.dateIdentified,
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
  // Specific mapping for Residual Risk fields
  residual_likelihood: item.residualLikelihood,
  residual_severity: item.residualSeverity,
  residual_risk_rating: item.residualRiskRating,
  residual_risk_level: item.residualRiskLevel,
  effectiveness_remarks: item.effectivenessRemarks,
  reassessment_date: item.reassessmentDate,
  status: item.status,
  created_at: item.createdAt,
  closed_at: item.closedAt,
  audit_trail: item.auditTrail
});

const mapFromDb = (dbItem: any): RegistryItem => ({
  id: dbItem.id,
  section: dbItem.section,
  dateIdentified: dbItem.date_identified || '', // Default to empty string to prevent null split error
  process: dbItem.process || '',
  source: dbItem.source || '',
  description: dbItem.description || '',
  type: dbItem.type,
  impactQMS: dbItem.impact_qms,
  likelihood: dbItem.likelihood,
  severity: dbItem.severity,
  riskRating: dbItem.risk_rating,
  riskLevel: dbItem.risk_level,
  existingControls: dbItem.existing_controls,
  expectedBenefit: dbItem.expected_benefit,
  feasibility: dbItem.feasibility,
  actionPlans: (dbItem.action_plans || []) as ActionPlan[],
  residualLikelihood: dbItem.residual_likelihood,
  residualSeverity: dbItem.residual_severity,
  residualRiskRating: dbItem.residual_risk_rating,
  residualRiskLevel: dbItem.residual_risk_level,
  effectivenessRemarks: dbItem.effectiveness_remarks,
  reassessmentDate: dbItem.reassessment_date,
  status: dbItem.status,
  createdAt: dbItem.created_at || new Date().toISOString(),
  closedAt: dbItem.closed_at,
  auditTrail: dbItem.audit_trail || []
});

const SECTIONS = [
  'QA (Quality Assurance)',
  'Admitting Section',
  'Ambulatory Care Medicine Complex',
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
].sort();

// --- MOCK CREDENTIALS STORE ---
const CREDENTIALS: Record<string, string> = {
  'QA (Quality Assurance)': 'admin123',
  'DEFAULT': 'osmak123' // Fallback for all other sections
};

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

// Generate Chronological Display IDs (R1, R2... O1, O2...)
const getDisplayIds = (items: RegistryItem[]) => {
  const map: Record<string, string> = {};
  
  // Sort by createdAt to ensure chronological order
  const risks = items.filter(i => i.type === 'RISK').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const opps = items.filter(i => i.type === 'OPPORTUNITY').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  risks.forEach((item, index) => {
    map[item.id] = `R${index + 1}`;
  });
  
  opps.forEach((item, index) => {
    map[item.id] = `O${index + 1}`;
  });
  
  return map;
};

// Audit Trail Helper
const addAuditEvent = (item: RegistryItem, event: string, user: string): RegistryItem => {
  const newEvent: AuditEvent = {
    timestamp: new Date().toISOString(),
    event,
    user,
  };
  return {
    ...item,
    auditTrail: [...(item.auditTrail || []), newEvent],
  };
};

const getPillColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'IMPLEMENTATION': return 'bg-purple-100 text-purple-800';
      case 'REASSESSMENT': return 'bg-amber-100 text-amber-800';
      case 'QA_VERIFICATION': return 'bg-teal-100 text-teal-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

const getLevelPillColor = (level?: RiskLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

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
    case 'IMPLEMENTATION': return 'bg-purple-100 text-purple-800';
    case 'REASSESSMENT': return 'bg-amber-100 text-amber-800';
    case 'QA_VERIFICATION': return 'bg-indigo-100 text-indigo-800';
    case 'CLOSED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: WorkflowStatus) => {
  if (status === 'QA_VERIFICATION') return 'QA VERIFICATION';
  if (status === 'REASSESSMENT') return 'REASSESSMENT';
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

// Reusable Header Component matching the "Antimicrobial" style
const AppHeader = ({ title, subtitle, centered = false, small = false }: { title: string, subtitle: string, centered?: boolean, small?: boolean }) => (
  <header className={`sticky ${small ? 'h-16 px-4' : 'h-20 px-7'} top-0 z-50 flex items-center gap-3 bg-osmak-green text-white py-3 shadow-header w-full ${centered ? 'justify-center' : ''}`}>
    <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="OsMak Logo" className={`${small ? 'h-10' : 'h-14'} w-auto object-contain`} />
    <div className="flex flex-col justify-center">
      <h1 className={`text-white ${small ? 'text-xs' : 'text-xl'} font-extrabold tracking-wide uppercase leading-tight`}>{title}</h1>
      <span className={`text-white ${small ? 'text-[0.65rem]' : 'text-sm'} opacity-90 tracking-wider`}>{subtitle}</span>
    </div>
  </header>
);

const SidebarHeader = ({ onClose }: { onClose: () => void }) => (
    <header className="flex bg-[#009a3e] h-16 px-4 items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
        <img 
            src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" 
            alt="Logo" 
            className="h-10 w-auto object-contain"
        />
        <div className="flex flex-col">
            <h1 className="text-white text-sm font-extrabold tracking-wide uppercase leading-none">OSPITAL NG MAKATI</h1>
            <span className="text-green-50 text-[0.65rem] font-medium opacity-90 tracking-wider mt-0.5">Risk & Opportunities Registry</span>
        </div>
        </div>
        <button onClick={onClose} className="md:hidden text-white p-1 hover:bg-green-700 rounded-full transition-colors">
            <X size={24} />
        </button>
    </header>
);

const WorkflowModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-5 bg-osmak-green text-white flex justify-between items-center border-b border-osmak-800">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <BookOpen size={24} className="text-white" /> 
          Registry System Workflow
        </h2>
        <button onClick={onClose} className="hover:text-osmak-200 transition"><XCircle size={24}/></button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Step 1: Submission */}
          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-yellow-400 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">1</div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-yellow-600" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Submission</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
              <strong>Section User</strong> logs a new Risk or Opportunity. System calculates <strong>Risk Level</strong>. Action Plans are mandatory for <strong>ALL</strong> Risks.
            </p>
            <div className="mt-auto">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded">Status: IMPLEMENTATION</span>
            </div>
          </div>

          {/* Step 2: Implementation (Merged Plan Review) */}
          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-indigo-500 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">2</div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-indigo-600" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Implementation</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
              <strong>Section User</strong> executes plans immediately. For Risks, click <strong>"Reassess"</strong> to input Residual Risk values. For Opportunities, mark as Completed.
            </p>
            <div className="mt-auto">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded">Status: FOR VERIFICATION</span>
            </div>
          </div>

          {/* Step 3: Reassessment */}
          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">3</div>
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="text-teal-600" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Reassessment</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
              System saves the <strong>Residual Risk</strong> data. QA verifies the action implementation and the reassessed values.
            </p>
            <div className="mt-auto">
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded">Status: QA VERIFICATION</span>
            </div>
          </div>

          {/* Step 4: Closure */}
          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col pt-8 border-green-200 bg-green-50/50">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg flex items-center justify-center shadow-md ring-4 ring-gray-50">4</div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-green-700" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Validation & Closure</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-1">
              <strong>QA</strong> performs final review of Residual Risk or Opportunity outcome and adds closing remarks.
            </p>
            <div className="mt-auto">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded">Status: CLOSED</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-100 text-center border-t border-gray-200">
         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            Ospital ng Makati Quality Management System • ISO 9001:2015 Compliant
         </p>
      </div>
    </div>
  </div>
);

const AuditTrailModal = ({ trail, onClose, itemId }: { trail: AuditEvent[], onClose: () => void, itemId: string }) => {
    const getIcon = (event: string) => {
        if (event.includes('Created')) return <PlusCircle size={16} className="text-blue-500" />;
        if (event.includes('Closed') || event.includes('Verified')) return <CheckCircle2 size={16} className="text-green-500" />;
        if (event.includes('Edited')) return <Pencil size={16} className="text-yellow-500" />;
        if (event.includes('Reopened')) return <RotateCcw size={16} className="text-orange-500" />;
        return <Activity size={16} className="text-gray-500" />;
    };

    const formatTimestamp = (ts: string) => {
        return new Date(ts).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Audit Trail for: <span className="font-mono text-osmak-green">{itemId}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="relative pl-8">
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                        <div className="space-y-8">
                            {[...trail].reverse().map((event, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-8 top-1 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                        {getIcon(event.event)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{event.event}</h3>
                                        <p className="text-sm text-gray-500">
                                            by <span className="font-medium text-gray-700">{event.user}</span> on {formatTimestamp(event.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Login = ({ onLogin }: { onLogin: (section: string) => void }) => {
  const [section, setSection] = useState(SECTIONS[1]); // Default to first non-QA
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSection = isAdmin ? SECTIONS[0] : section;
    const correctPassword = CREDENTIALS[targetSection] || CREDENTIALS['DEFAULT'];

    if (password === correctPassword) {
      onLogin(targetSection);
    } else {
      setError('Invalid password. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F0FFF4] flex items-center justify-center p-4">
      {showWorkflow && <WorkflowModal onClose={() => setShowWorkflow(false)} />}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Updated Header Style - Left Aligned per request */}
        <AppHeader title="OSPITAL NG MAKATI" subtitle="Risk & Opportunities Registry System" />
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button type="button" onClick={() => { setIsAdmin(false); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isAdmin ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Section User</button>
            <button type="button" onClick={() => { setIsAdmin(true); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isAdmin ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Quality Assurance</button>
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
              Logging in as <strong>Quality Assurance Auditor</strong>.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 outline-none bg-white text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
            <p className="text-gray-400 text-xs mt-2 italic">
               Hint: Use <strong>{isAdmin ? 'admin123' : 'osmak123'}</strong>
            </p>
          </div>
          <div className="space-y-4">
            <button type="submit" className="w-full bg-osmak-green hover:bg-osmak-green-dark text-white font-semibold py-3 rounded-lg transition shadow-md">
              Login
            </button>
            
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowWorkflow(true)}
                  className="w-full text-osmak-green text-sm font-medium hover:underline flex items-center justify-center gap-2 py-1"
                >
                  <BookOpen size={16} /> View System Workflow
                </button>
                
                <a 
                  href="https://drive.google.com/file/d/1obDtzRxsTOpUMF0_pjScmyx-njpW_JAB/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full text-blue-600 text-sm font-medium hover:underline flex items-center justify-center gap-2 py-1"
                >
                   <FileText size={16} /> Download User Manual
                </a>

                <a 
                   href="https://drive.google.com/file/d/1m3TXXwC7nV7lp2JNLgB9cxAbXsosaOLA/view?usp=sharing"
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full text-purple-600 text-sm font-medium hover:underline flex items-center justify-center gap-2 py-1"
                >
                   <Eye size={16} /> Watch Orientation
                </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const ItemDetailModal = ({ 
  item, 
  isQA, 
  currentUser,
  displayId,
  onClose, 
  onUpdate, 
  onDelete 
}: { 
  item: RegistryItem, 
  isQA: boolean, 
  currentUser: string,
  displayId: string,
  onClose: () => void, 
  onUpdate: (updated: RegistryItem) => void,
  onDelete: (id: string) => void
}) => {
  const [reassessment, setReassessment] = useState({
    likelihood: 1,
    severity: 1,
    remarks: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<RegistryItem>(item);

  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
  const [completingActionId, setCompletingActionId] = useState<string | null>(null);
  const [completionRemarks, setCompletionRemarks] = useState('');

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Reopen Confirmation State
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [reopenPassword, setReopenPassword] = useState('');
  const [reopenError, setReopenError] = useState('');

  const reassessmentRiskRating = reassessment.likelihood * reassessment.severity;
  const reassessmentRiskLevel = calculateRiskLevel(reassessment.likelihood, reassessment.severity);

  // Sync editData when modal opens/item changes
  useEffect(() => {
    setEditData(item);
  }, [item]);

  const handleActionStatusChange = (actionId: string, newStatus: ActionStatus, remarks?: string) => {
    const updatedActions = item.actionPlans.map(ap => 
      ap.id === actionId ? { ...ap, status: newStatus, completionRemarks: remarks || ap.completionRemarks } : ap
    ) as ActionPlan[];
    
    let nextStatus = item.status;
    let eventLog = '';
    
    if (isQA && item.status === 'IMPLEMENTATION') {
      eventLog = 'Action Plan Verified as Complete';
      const allCompleted = updatedActions.every(a => a.status === 'COMPLETED');
      if (allCompleted) {
         if (item.type === 'RISK') {
            nextStatus = 'REASSESSMENT';
         } else {
            nextStatus = 'QA_VERIFICATION';
         }
      }
    }
    
    let updatedItem = addAuditEvent(item, eventLog, currentUser);
    updatedItem = {...updatedItem, actionPlans: updatedActions, status: nextStatus };

    onUpdate(updatedItem);
    setCompletingActionId(null);
    setCompletionRemarks('');
  };

  const handleUserMarkCompleted = (actionId: string) => {
    let updatedItem = addAuditEvent(item, "Action Submitted for Verification", currentUser);
    
    // Prepare updates
    let updates: Partial<RegistryItem> = {};

    if (item.type === 'RISK') {
        const rating = reassessment.likelihood * reassessment.severity;
        const level = calculateRiskLevel(reassessment.likelihood, reassessment.severity);
        updates = {
             residualLikelihood: reassessment.likelihood,
             residualSeverity: reassessment.severity,
             residualRiskRating: rating,
             residualRiskLevel: level,
        };
    }

    const updatedActions = item.actionPlans.map(ap => 
      ap.id === actionId ? { ...ap, status: 'FOR_VERIFICATION', completionRemarks } : ap
    ) as ActionPlan[];

    onUpdate({ ...updatedItem, actionPlans: updatedActions, ...updates });
    setCompletingActionId(null);
    setCompletionRemarks('');
  };

  const handleSubmitReassessment = () => {
    let updatedItem = addAuditEvent(item, "Residual Risk Reassessment Submitted", currentUser);
    
    // Auto-compute residual values
    const rating = reassessment.likelihood * reassessment.severity;
    const level = calculateRiskLevel(reassessment.likelihood, reassessment.severity);

    onUpdate({
      ...updatedItem,
      residualLikelihood: reassessment.likelihood,
      residualSeverity: reassessment.severity,
      residualRiskRating: rating,
      residualRiskLevel: level,
      effectivenessRemarks: reassessment.remarks,
      reassessmentDate: reassessment.date,
      status: 'QA_VERIFICATION'
    });
  };


  const handleFinalClose = () => {
    const finalRemarks = reassessment.remarks || item.effectivenessRemarks;
    let updatedItem = addAuditEvent(item, "Entry Validated and Closed", currentUser);
    onUpdate({ 
      ...updatedItem, 
      status: 'CLOSED',
      effectivenessRemarks: finalRemarks,
      closedAt: new Date().toISOString().split('T')[0]
    });
  };
  
  const handleRequirePlan = () => {
     alert("Please notify the section that an action plan is mandatory.");
  }

  const handleRejectReassessment = () => {
    let updatedItem = addAuditEvent(item, "Reassessment Rejected", currentUser);
    onUpdate({ ...updatedItem, status: 'REASSESSMENT' });
  };
  
  const handleReopen = () => {
      const updatedItem = addAuditEvent(item, "Entry Reopened", currentUser);
      onUpdate({ ...updatedItem, status: 'IMPLEMENTATION', closedAt: undefined });
  };

  const confirmDelete = () => {
      const correctPassword = CREDENTIALS[currentUser] || CREDENTIALS['DEFAULT'];
      if (deletePassword === correctPassword) {
          onDelete(item.id);
      } else {
          setDeleteError('Incorrect password. Please try again.');
      }
  };

  const confirmReopen = () => {
      const correctPassword = CREDENTIALS[currentUser] || CREDENTIALS['DEFAULT'];
      if (reopenPassword === correctPassword) {
          handleReopen();
      } else {
          setReopenError('Incorrect password. Please try again.');
      }
  };

  const handleAddPlanInModal = () => {
    if (!newPlan.description || !newPlan.strategy) return;
    const action: ActionPlan = {
      id: `AP-${Date.now()}`,
      ...newPlan,
      status: 'APPROVED' // Auto-approved as Plan Review is skipped
    };
    const updatedItem = addAuditEvent(item, `Action Plan Added: ${newPlan.description}`, currentUser);
    onUpdate({
      ...updatedItem,
      actionPlans: [...updatedItem.actionPlans, action]
    });
    setNewPlan({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
    setIsAddingPlan(false);
  };

  const handleDeletePlan = (id: string) => {
    const planToDelete = item.actionPlans.find(ap => ap.id === id);
    let updatedItem = addAuditEvent(item, `Action Plan Removed: ${planToDelete?.description}`, currentUser);
    onUpdate({
      ...updatedItem,
      actionPlans: updatedItem.actionPlans.filter(ap => ap.id !== id)
    });
  };

  // --- Edit Logic ---
  const updateEditRisk = (l: number, s: number) => {
    setEditData(prev => ({
      ...prev,
      likelihood: l,
      severity: s,
      riskRating: l * s,
      riskLevel: calculateRiskLevel(l, s)
    }));
  };

  const handleSaveEdit = () => {
    const updatedItem = addAuditEvent(editData, "Details Edited", currentUser);
    onUpdate(updatedItem);
    setIsEditing(false);
  };

  const strategies = item.type === 'RISK' ? RISK_STRATEGIES : OPP_STRATEGIES;
  // Allow edit in IMPLEMENTATION since PLAN_REVIEW is removed
  const canEdit = !isQA && item.status === 'IMPLEMENTATION';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-gray-500 bg-white border px-2 py-0.5 rounded">{displayId}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                {formatStatus(item.status)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.type === 'RISK' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {item.type}
              </span>
            </div>
            {isEditing ? (
              <input 
                type="text" 
                className="w-full text-xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-osmak-600 bg-transparent"
                value={editData.description}
                onChange={e => setEditData({...editData, description: e.target.value})}
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">{item.description}</h2>
            )}
          </div>
          <div className="flex gap-2">
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-gray-500 hover:text-osmak-700 p-1 rounded hover:bg-gray-100 transition"
                title="Edit Details"
              >
                <Pencil size={24}/>
              </button>
            )}
            {isEditing && (
              <button 
                onClick={handleSaveEdit} 
                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition"
                title="Save Changes"
              >
                <Save size={24}/>
              </button>
            )}
            <button onClick={() => { setIsEditing(false); onClose(); }} className="text-gray-400 hover:text-gray-600"><XCircle size={28}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white relative">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm p-4 bg-gray-50 rounded-xl border border-gray-100">
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Section</span>
                <span className="font-semibold text-gray-800">{item.section}</span>
             </div>
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Process / Function</span>
                {isEditing ? (
                   <input type="text" className="w-full border rounded p-1 bg-white" value={editData.process} onChange={e => setEditData({...editData, process: e.target.value})} />
                ) : (
                   <span className="font-semibold text-gray-800">{item.process}</span>
                )}
             </div>
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Source</span>
                {isEditing ? (
                   <div className="relative">
                      <select 
                          className="w-full border rounded p-1 bg-white appearance-none"
                          value={SOURCES.includes(editData.source) ? editData.source : 'Others'}
                          onChange={e => {
                              if (e.target.value === 'Others') setEditData({...editData, source: ''});
                              else setEditData({...editData, source: e.target.value});
                          }}
                      >
                          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {(!SOURCES.includes(editData.source) || editData.source === '') && (
                          <input 
                              type="text" 
                              className="w-full border rounded p-1 mt-1 bg-white" 
                              placeholder="Specify source..."
                              value={editData.source}
                              onChange={e => setEditData({...editData, source: e.target.value})}
                          />
                      )}
                   </div>
                ) : (
                   <span className="font-semibold text-gray-800">{item.source}</span>
                )}
             </div>
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Date Identified</span>
                {isEditing ? (
                   <input type="date" className="w-full border rounded p-1 bg-white" value={editData.dateIdentified} onChange={e => setEditData({...editData, dateIdentified: e.target.value})} />
                ) : (
                   <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400"/> {item.dateIdentified || 'N/A'}
                   </span>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                 <FileText size={18} /> {item.type === 'RISK' ? 'Risk Assessment' : 'Opportunity Assessment'}
               </h3>
               
               {item.type === 'RISK' ? (
                 <>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Potential Impact on QMS</span>
                     {isEditing ? (
                        <textarea className="w-full border rounded p-2 bg-white" value={editData.impactQMS} onChange={e => setEditData({...editData, impactQMS: e.target.value})} />
                     ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">{item.impactQMS}</p>
                     )}
                   </div>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Existing Controls / Mitigation</span>
                     {isEditing ? (
                        <textarea className="w-full border rounded p-2 bg-white" value={editData.existingControls} onChange={e => setEditData({...editData, existingControls: e.target.value})} />
                     ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">{item.existingControls || 'N/A'}</p>
                     )}
                   </div>
                 </>
               ) : (
                 <>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Expected Benefit</span>
                     {isEditing ? (
                        <textarea className="w-full border rounded p-2 bg-white" value={editData.expectedBenefit} onChange={e => setEditData({...editData, expectedBenefit: e.target.value})} />
                     ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">{item.expectedBenefit}</p>
                     )}
                   </div>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Feasibility</span>
                     {isEditing ? (
                        <select className="w-full border rounded p-2 bg-white" value={editData.feasibility} onChange={e => setEditData({...editData, feasibility: e.target.value as any})}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                     ) : (
                        <span className="text-green-700 font-bold">{item.feasibility}</span>
                     )}
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
                     <div className={`flex-1 ${isEditing ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} p-4 rounded-lg text-center`}>
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-2">Likelihood</span>
                        {isEditing ? (
                           <>
                             <input type="range" min="1" max="5" className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-osmak-600" value={editData.likelihood} onChange={e => updateEditRisk(parseInt(e.target.value), editData.severity || 1)} />
                             <div className="text-xl font-bold text-osmak-800 mt-1">{editData.likelihood}</div>
                           </>
                        ) : (
                           <div className="text-2xl font-bold text-gray-900">{item.likelihood}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{LIKELIHOOD_DESC[(isEditing ? editData.likelihood : item.likelihood) || 1]}</div>
                     </div>
                     
                     <div className={`flex-1 ${isEditing ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} p-4 rounded-lg text-center`}>
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-2">Severity</span>
                        {isEditing ? (
                           <>
                             <input type="range" min="1" max="5" className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-osmak-600" value={editData.severity} onChange={e => updateEditRisk(editData.likelihood || 1, parseInt(e.target.value))} />
                             <div className="text-xl font-bold text-osmak-800 mt-1">{editData.severity}</div>
                           </>
                        ) : (
                           <div className="text-2xl font-bold text-gray-900">{item.severity}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{SEVERITY_DESC[(isEditing ? editData.severity : item.severity) || 1]}</div>
                     </div>

                     <div className="flex-1 p-4 rounded-lg text-center border-2 border-gray-100 flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Risk Rating</span>
                        <div className={`text-3xl font-bold ${
                           (isEditing ? editData.riskLevel : item.riskLevel) === 'CRITICAL' ? 'text-red-600' : 
                           (isEditing ? editData.riskLevel : item.riskLevel) === 'HIGH' ? 'text-orange-500' : 'text-gray-800'
                        }`}>
                          {isEditing ? editData.riskRating : item.riskRating}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${getRiskColor(isEditing ? editData.riskLevel : item.riskLevel)}`}>
                            {isEditing ? editData.riskLevel : item.riskLevel}
                        </span>
                     </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm">
                    Opportunities are prioritized based on Feasibility ({isEditing ? editData.feasibility : item.feasibility}) and Impact.
                  </div>
                )}
             </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck size={20} /> Action Plans
              </h3>
              {(!isQA && item.status === 'IMPLEMENTATION' && !isAddingPlan) && (
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
                            <>
                              {item.status === 'IMPLEMENTATION' && (
                                <button onClick={() => handleDeletePlan(ap.id)} className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 size={16} />
                                </button>
                              )}
                              {item.status === 'IMPLEMENTATION' && (ap.status === 'APPROVED' || ap.status === 'REVISION_REQUIRED') && !completingActionId && (
                                <button 
                                    onClick={() => {
                                        setCompletingActionId(ap.id);
                                        // Initialize reassessment values for the expansion row
                                        if (item.type === 'RISK') {
                                            setReassessment(prev => ({
                                                ...prev,
                                                likelihood: item.residualLikelihood || item.likelihood || 1,
                                                severity: item.residualSeverity || item.severity || 1
                                            }));
                                        }
                                    }} 
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 shadow-sm"
                                >
                                  {item.type === 'RISK' ? 'Reassess' : 'Mark Completed'}
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                      {completingActionId === ap.id && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-green-50">
                            <div className="flex flex-col gap-4">
                                {item.type === 'RISK' && (
                                    <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                        <h4 className="font-bold text-green-800 text-sm mb-3 border-b pb-2 flex items-center gap-2">
                                            <Activity size={16}/> Proposed Residual Risk Assessment
                                        </h4>
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Likelihood (1-5)</label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="range" min="1" max="5" 
                                                        value={reassessment.likelihood}
                                                        onChange={e => setReassessment({...reassessment, likelihood: parseInt(e.target.value)})}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                                    />
                                                    <span className="font-bold text-gray-800 w-6 text-center">{reassessment.likelihood}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">{LIKELIHOOD_DESC[reassessment.likelihood]}</div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity (1-5)</label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="range" min="1" max="5" 
                                                        value={reassessment.severity}
                                                        onChange={e => setReassessment({...reassessment, severity: parseInt(e.target.value)})}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                                    />
                                                    <span className="font-bold text-gray-800 w-6 text-center">{reassessment.severity}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">{SEVERITY_DESC[reassessment.severity]}</div>
                                            </div>
                                            <div className="text-center px-6 border-l flex flex-col items-center">
                                                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Residual Rating</div>
                                                <div className="text-2xl font-bold text-gray-800">{reassessment.likelihood * reassessment.severity}</div>
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded mt-1 ${getLevelPillColor(calculateRiskLevel(reassessment.likelihood, reassessment.severity))}`}>
                                                    {calculateRiskLevel(reassessment.likelihood, reassessment.severity)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-green-800 mb-1">Completion Remarks (Optional)</label>
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
                                    className="bg-green-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-800 disabled:opacity-50"
                                >
                                    Submit for Verification
                                </button>
                                <button 
                                    onClick={() => { setCompletingActionId(null); setCompletingActionId(null); setCompletionRemarks(''); }}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {isQA && item.status === 'IMPLEMENTATION' && item.type === 'RISK' && item.actionPlans.length === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-red-900">Missing Action Plan</h4>
                        <p className="text-sm text-red-800">Action plans are mandatory for all risks. Please require the section to add one.</p>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={handleRequirePlan} className="px-4 py-2 bg-white border border-red-300 text-red-800 rounded font-bold hover:bg-red-100 text-sm">Require Action Plan</button>
                    </div>
                </div>
            )}

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
                     placeholder="Verification / Evidence (e.g. Photo, Logbook)"
                     className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300"
                     value={newPlan.evidence}
                     onChange={e => setNewPlan({...newPlan, evidence: e.target.value})}
                   />
                   <div className="flex gap-4">
                     <input 
                       type="text" 
                       placeholder="Responsible Person"
                       className="flex-1 p-2 border rounded bg-white text-gray-900 border-gray-300"
                       value={newPlan.responsiblePerson}
                       onChange={e => setNewPlan({...newPlan, responsiblePerson: e.target.value})}
                     />
                     <input 
                       type="date" 
                       className="flex-1 p-2 border rounded bg-white text-gray-900 border-gray-300"
                       value={newPlan.targetDate}
                       onChange={e => setNewPlan({...newPlan, targetDate: e.target.value})}
                     />
                   </div>
                   <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => setIsAddingPlan(false)} 
                       className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleAddPlanInModal} 
                       className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                       disabled={!newPlan.description || !newPlan.strategy}
                     >
                       Save Plan
                     </button>
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* QA Verification & Closure Section */}
          {(item.status === 'REASSESSMENT' || item.status === 'QA_VERIFICATION' || item.status === 'CLOSED') && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                 <ShieldAlert size={18} /> QA Verification & Closure
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div>
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Residual Risk Rating (User Proposed)</span>
                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-gray-800">{item.residualRiskRating || 'N/A'}</div>
                            {item.residualRiskLevel && (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRiskColor(item.residualRiskLevel)}`}>
                                    {item.residualRiskLevel}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Effectiveness / Completion Remarks</span>
                        {isQA && item.status !== 'CLOSED' ? (
                            <textarea 
                                className="w-full p-2 border rounded bg-white text-gray-900" 
                                value={reassessment.remarks}
                                onChange={e => setReassessment({...reassessment, remarks: e.target.value})}
                                placeholder="Enter QA remarks here..."
                            />
                        ) : (
                            <p className="p-3 bg-white border rounded text-gray-800 text-sm">{item.effectivenessRemarks || 'No remarks.'}</p>
                        )}
                    </div>
                 </div>
                 
                 {isQA && item.status !== 'CLOSED' && (
                    <div className="flex flex-col justify-end gap-3">
                        <div className="text-sm text-gray-600 italic bg-blue-50 p-3 rounded">
                            Review the evidence in the Action Plans above. If satisfied, verify and close.
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleFinalClose} className="flex-1 bg-green-700 text-white font-bold py-3 rounded hover:bg-green-800 shadow-sm flex justify-center items-center gap-2">
                                <CheckCircle2 size={18}/> Verify & Close Registry Entry
                            </button>
                            <button onClick={handleRejectReassessment} className="px-4 py-3 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 border border-red-200">
                                Reject & Request Re-Eval
                            </button>
                        </div>
                    </div>
                 )}
                 {item.status === 'CLOSED' && (
                     <div className="flex flex-col justify-end">
                         <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3">
                             <CheckCircle2 size={24} className="text-green-600"/>
                             <div>
                                 <h4 className="font-bold text-green-900">Closed by Quality Assurance</h4>
                                 <p className="text-xs text-green-700">Date Closed: {item.closedAt}</p>
                             </div>
                         </div>
                     </div>
                 )}
              </div>
            </div>
          )}

          {/* Delete & Reopen Zone */}
          <div className="pt-8 border-t flex justify-between">
              <div>
                  {isQA && item.status === 'CLOSED' && (
                      <button 
                          onClick={() => setShowReopenConfirm(true)}
                          className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 px-3 py-2 rounded hover:bg-orange-50 transition"
                      >
                          <RotateCcw size={16}/> Reopen Entry
                      </button>
                  )}
              </div>
              <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 transition"
              >
                  <Trash2 size={16}/> Delete Entry
              </button>
          </div>

          {/* Confirmation Modals */}
          {showDeleteConfirm && (
              <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center p-8 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                  <p className="text-gray-600 mb-4 text-center">This action cannot be undone. Please enter your password to confirm.</p>
                  <input 
                      type="password" 
                      className="border p-2 rounded w-64 mb-2 bg-white text-gray-900"
                      placeholder="Password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                  />
                  {deleteError && <p className="text-red-500 text-xs mb-2">{deleteError}</p>}
                  <div className="flex gap-2">
                      <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded font-bold">Confirm Delete</button>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                  </div>
              </div>
          )}

          {showReopenConfirm && (
              <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center p-8 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Reopen</h3>
                  <p className="text-gray-600 mb-4 text-center">Status will revert to IMPLEMENTATION. Enter password to confirm.</p>
                  <input 
                      type="password" 
                      className="border p-2 rounded w-64 mb-2 bg-white text-gray-900"
                      placeholder="Password"
                      value={reopenPassword}
                      onChange={e => setReopenPassword(e.target.value)}
                  />
                  {reopenError && <p className="text-red-500 text-xs mb-2">{reopenError}</p>}
                  <div className="flex gap-2">
                      <button onClick={confirmReopen} className="bg-orange-600 text-white px-4 py-2 rounded font-bold">Confirm Reopen</button>
                      <button onClick={() => { setShowReopenConfirm(false); setReopenPassword(''); setReopenError(''); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Navigation & View State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [auditTrailItem, setAuditTrailItem] = useState<RegistryItem | null>(null);

  // Filters
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegistryItem, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('registry_items').select('*');
    if (data) {
      const parsed = data.map(mapFromDb);
      setItems(parsed);
    }
    setLoading(false);
  };

  const handleLogin = (section: string) => {
    setUser(section);
    setIsAdmin(section === 'QA (Quality Assurance)');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setItems([]);
    setCurrentView('dashboard');
  };

  const handleCreate = async (newItem: RegistryItem) => {
    const itemToSave = { ...newItem, section: user! };
    // Set initial status to IMPLEMENTATION (skipping Plan Review)
    // and ensure mandatory action plans logic in wizard is respected
    const dbPayload = mapToDb(itemToSave);
    const { error } = await supabase.from('registry_items').insert(dbPayload);
    if (!error) {
      fetchItems();
      setShowWizard(false);
    } else {
      alert('Error creating item: ' + error.message);
    }
  };

  const handleUpdate = async (updatedItem: RegistryItem) => {
    const dbPayload = mapToDb(updatedItem);
    const { error } = await supabase.from('registry_items').update(dbPayload).eq('id', updatedItem.id);
    if (!error) {
      setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('registry_items').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(i => i.id !== id));
      setSelectedItem(null);
    }
  };

  // --- Derived Data ---
  
  const displayIds = useMemo(() => getDisplayIds(items), [items]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    items.forEach(item => {
      // Robust check for date existence before split
      if (item.dateIdentified && typeof item.dateIdentified === 'string') {
         const y = item.dateIdentified.split('-')[0];
         if (y) years.add(y);
      } else if (item.createdAt && typeof item.createdAt === 'string') {
         const y = item.createdAt.split('-')[0];
         if (y) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  }, [items]);

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Section Filter (if not Admin viewing global)
    if (!isAdmin) {
      filtered = filtered.filter(i => i.section === user);
    }

    // View-Based Filtering
    if (currentView === 'pending_tasks') {
        // QA Pending Tasks: anything not Closed
        filtered = filtered.filter(i => i.status !== 'CLOSED');
    } else if (currentView === 'ro_list') {
        // R&O List: Apply manual filters
        if (filterYear !== 'All') {
             filtered = filtered.filter(i => i.dateIdentified?.startsWith(filterYear) || i.createdAt?.startsWith(filterYear));
        }
        if (filterStatus !== 'All') {
             if (filterStatus === 'Open') filtered = filtered.filter(i => i.status !== 'CLOSED');
             else if (filterStatus === 'Closed') filtered = filtered.filter(i => i.status === 'CLOSED');
        }
        if (filterType !== 'All') {
            filtered = filtered.filter(i => i.type === filterType.toUpperCase());
        }
    }

    return filtered;
  }, [items, isAdmin, user, currentView, filterYear, filterStatus, filterType]);

  const sortedItems = useMemo(() => {
    let sortable = [...filteredItems];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        // Special sorting for "Ref #" using createdAt which mimics the ID order
        if (sortConfig.key === 'id') {
             const dateA = new Date(a.createdAt).getTime();
             const dateB = new Date(b.createdAt).getTime();
             return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default Sort: Newest First
      sortable.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sortable;
  }, [filteredItems, sortConfig]);

  const handleSort = (key: keyof RegistryItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- Render Helpers ---

  const renderTable = (data: RegistryItem[], columns: any[], onRowClick: any, maxHeight?: string) => (
    <div className={`overflow-x-auto rounded-lg shadow border border-gray-200 bg-white ${maxHeight ? 'overflow-y-auto ' + maxHeight : ''}`}>
      <table className="w-full text-sm text-left text-gray-500 relative">
         <thead className={`text-xs text-gray-700 uppercase bg-gray-50 border-b ${maxHeight ? 'sticky top-0 z-10 shadow-sm' : ''}`}>
            <tr>
              {columns.map((col: any) => (
                <th 
                    key={col.key} 
                    className={`px-6 py-3 cursor-pointer hover:bg-gray-100 transition ${col.hidden ? 'hidden md:table-cell' : ''}`}
                    onClick={() => handleSort(col.sortKey || col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={12} className="opacity-50"/>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
         </thead>
         <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-400">No records found.</td></tr>
            ) : data.map((item) => (
               <tr key={item.id} onClick={() => onRowClick(item)} className="bg-white hover:bg-gray-50 cursor-pointer transition">
                  {columns.map((col: any) => (
                    <td key={col.key} className={`px-6 py-4 font-medium ${col.hidden ? 'hidden md:table-cell' : ''}`}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setAuditTrailItem(item)} className="text-gray-400 hover:text-osmak-600 transition p-1 rounded-full hover:bg-gray-100" title="View History">
                        <History size={16}/>
                    </button>
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
    </div>
  );

  const DashboardView = () => {
    const sectionItems = isAdmin ? items : items.filter(i => i.section === user);
    
    // Deadlines Logic
    const deadlines = sectionItems
      .filter(i => i.status !== 'CLOSED' && i.actionPlans.some(ap => ap.status !== 'COMPLETED'))
      .map(item => ({ item, meta: getDaysRemaining(item) }))
      .filter(x => x.meta !== null)
      .sort((a, b) => a.meta!.days - b.meta!.days)
      .slice(0, 4);

    const openRisks = sectionItems.filter(i => i.type === 'RISK' && i.status !== 'CLOSED');
    const openOpps = sectionItems.filter(i => i.type === 'OPPORTUNITY' && i.status !== 'CLOSED');

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Deadline Cards */}
        {deadlines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {deadlines.map(({ item, meta }) => (
               <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <span className="font-mono text-xs text-gray-400">{displayIds[item.id]}</span>
                     <span className={`text-xs font-bold uppercase ${meta!.color}`}>{meta!.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 flex-1">{item.description}</p>
                  <div className="flex justify-between items-center text-xs mt-auto">
                     <span className="text-gray-500">{item.section}</span>
                     <ChevronRight size={14} className="text-gray-400"/>
                  </div>
               </div>
             ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Open Risks Table */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={20}/> Open Risks
                </h3>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{openRisks.length}</span>
              </div>
              {renderTable(
                openRisks, 
                [
                  { key: 'id', label: 'Ref #', render: (i: RegistryItem) => <span className="font-mono text-xs">{displayIds[i.id]}</span> },
                  { key: 'description', label: 'Description', render: (i: RegistryItem) => <span className="line-clamp-1">{i.description}</span> },
                  { key: 'riskLevel', label: 'Level', render: (i: RegistryItem) => <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRiskColor(i.riskLevel)}`}>{i.riskLevel}</span>},
                  { key: 'status', label: 'Status', render: (i: RegistryItem) => <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPillColor(i.status)}`}>{formatStatus(i.status)}</span> }
                ],
                setSelectedItem,
                "max-h-[350px]"
              )}
           </div>

           {/* Open Opportunities Table */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="text-green-500" size={20}/> Open Opportunities
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{openOpps.length}</span>
              </div>
              {renderTable(
                openOpps, 
                [
                  { key: 'id', label: 'Ref #', render: (i: RegistryItem) => <span className="font-mono text-xs">{displayIds[i.id]}</span> },
                  { key: 'description', label: 'Description', render: (i: RegistryItem) => <span className="line-clamp-1">{i.description}</span> },
                  { key: 'feasibility', label: 'Feasibility', render: (i: RegistryItem) => <span className="text-xs font-bold text-green-700">{i.feasibility}</span>},
                  { key: 'status', label: 'Status', render: (i: RegistryItem) => <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPillColor(i.status)}`}>{formatStatus(i.status)}</span> }
                ],
                setSelectedItem,
                "max-h-[350px]"
              )}
           </div>
        </div>
      </div>
    );
  };

  const ROListView = () => {
    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ListFilter className="text-osmak-green"/> Registry List (R&O)
                </h2>
                <div className="flex gap-2">
                    <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="p-2 border rounded text-sm bg-gray-50">
                        <option value="All">All Years</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded text-sm bg-gray-50">
                        <option value="All">All Types</option>
                        <option value="Risk">Risks</option>
                        <option value="Opportunity">Opportunities</option>
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded text-sm bg-gray-50">
                        <option value="All">All Status</option>
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            {renderTable(
                sortedItems,
                [
                    { key: 'id', label: 'Ref #', sortKey: 'id', render: (i: RegistryItem) => <span className="font-mono font-bold text-osmak-700">{displayIds[i.id]}</span> },
                    { key: 'dateIdentified', label: 'Date ID', render: (i: RegistryItem) => <span className="text-xs">{i.dateIdentified}</span> },
                    { key: 'section', label: 'Section', hidden: !isAdmin },
                    { key: 'description', label: 'Description', render: (i: RegistryItem) => <span className="font-medium">{i.description}</span> },
                    { key: 'type', label: 'Type', render: (i: RegistryItem) => i.type === 'RISK' ? <span className="text-red-600 font-bold text-xs">RISK</span> : <span className="text-green-600 font-bold text-xs">OPP</span> },
                    { key: 'riskLevel', label: 'Level/Feas.', render: (i: RegistryItem) => i.type === 'RISK' ? <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRiskColor(i.riskLevel)}`}>{i.riskLevel}</span> : <span className="text-xs font-bold text-green-700">{i.feasibility}</span> },
                    { key: 'status', label: 'Status', render: (i: RegistryItem) => <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPillColor(i.status)}`}>{formatStatus(i.status)}</span> }
                ],
                setSelectedItem,
                "max-h-[550px]"
            )}
        </div>
    );
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F0FFF4] flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      <div className="md:hidden fixed inset-0 bg-black/50 z-40 hidden" id="mobile-overlay"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-osmak-green shadow-xl z-50 flex flex-col fixed md:sticky top-0 h-screen transition-transform duration-300 transform -translate-x-full md:translate-x-0">
        <SidebarHeader onClose={() => {}} />
        
        <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
          <div className="bg-green-800/50 rounded-lg p-4 border border-green-700/50">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                   {user.charAt(0)}
                </div>
                <div>
                   <p className="text-green-100 text-xs uppercase tracking-wider font-semibold">Logged in as</p>
                   <p className="text-white font-bold text-sm leading-tight">{isAdmin ? 'Quality Assurance' : user}</p>
                   {isAdmin && <span className="text-[10px] bg-yellow-400 text-yellow-900 px-1.5 rounded font-bold mt-1 inline-block">AUDITOR</span>}
                </div>
             </div>
          </div>

          <nav className="space-y-1">
             <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${currentView === 'dashboard' ? 'bg-white text-osmak-green shadow-md' : 'text-green-100 hover:bg-green-700'}`}>
                <LayoutDashboard size={20}/> Dashboard
             </button>
             {isAdmin && (
                <button onClick={() => setCurrentView('pending_tasks')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${currentView === 'pending_tasks' ? 'bg-white text-osmak-green shadow-md' : 'text-green-100 hover:bg-green-700'}`}>
                   <ClipboardList size={20}/> Pending Tasks
                </button>
             )}
             
             {/* Unified R&O List Menu Item */}
             <button onClick={() => setCurrentView('ro_list')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${currentView === 'ro_list' ? 'bg-white text-osmak-green shadow-md' : 'text-green-100 hover:bg-green-700'}`}>
                <ListFilter size={20}/> R&O List
             </button>

             <button onClick={() => setCurrentView('analysis')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${currentView === 'analysis' ? 'bg-white text-osmak-green shadow-md' : 'text-green-100 hover:bg-green-700'}`}>
                <BarChart3 size={20}/> Data Analysis
             </button>
          </nav>

          <div className="mt-auto space-y-3">
             {!isAdmin && (
               <button onClick={() => setShowWizard(true)} className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95">
                  <PlusCircle size={20}/> New Entry
               </button>
             )}
             <button onClick={handleLogout} className="w-full border border-green-400 text-green-100 hover:bg-green-700 font-medium py-3 rounded-lg transition flex items-center justify-center gap-2">
                <LogOut size={18}/> Logout
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
         <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
               {currentView === 'dashboard' ? 'Dashboard Overview' : 
                currentView === 'pending_tasks' ? 'Pending Tasks' :
                currentView === 'ro_list' ? 'Risks & Opportunities List' :
                'Data Analysis'}
            </h2>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:inline-block">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>
         </header>

         <div className="p-4 md:p-8 overflow-y-auto flex-1">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Loader2 size={48} className="animate-spin mb-4 text-osmak-green"/>
                    <p>Loading registry data...</p>
                </div>
            ) : (
                <>
                    {currentView === 'dashboard' && <DashboardView />}
                    
                    {currentView === 'pending_tasks' && (
                        <div className="space-y-4 animate-fadeIn">
                             <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 text-blue-800">
                                <Info size={24}/>
                                <div>
                                    <h3 className="font-bold">Pending Verification</h3>
                                    <p className="text-sm">These items require your attention for verification or closure.</p>
                                </div>
                             </div>
                             {renderTable(
                                sortedItems, 
                                [
                                    { key: 'id', label: 'Ref #', render: (i: RegistryItem) => <span className="font-mono text-xs">{displayIds[i.id]}</span> },
                                    { key: 'section', label: 'Section' },
                                    { key: 'description', label: 'Description', render: (i: RegistryItem) => <span className="font-medium">{i.description}</span> },
                                    { key: 'status', label: 'Status', render: (i: RegistryItem) => <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPillColor(i.status)}`}>{formatStatus(i.status)}</span> }
                                ],
                                setSelectedItem
                             )}
                        </div>
                    )}

                    {currentView === 'ro_list' && <ROListView />}

                    {currentView === 'analysis' && (
                        <div className="animate-fadeIn text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <BarChart3 size={64} className="mx-auto text-gray-300 mb-4"/>
                            <h3 className="text-xl font-bold text-gray-400">Data Analysis Module</h3>
                            <p className="text-gray-500">Charts and reporting features will be displayed here.</p>
                        </div>
                    )}
                </>
            )}
         </div>
      </main>

      {/* Modals */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          isQA={isAdmin} 
          currentUser={user}
          displayId={displayIds[selectedItem.id]}
          onClose={() => setSelectedItem(null)} 
          onUpdate={(updated) => { handleUpdate(updated); setSelectedItem(updated); }}
          onDelete={handleDelete}
        />
      )}

      {showWizard && (
        <Wizard 
          section={user!} 
          onClose={() => setShowWizard(false)} 
          onSubmit={handleCreate} 
        />
      )}

      {auditTrailItem && (
         <AuditTrailModal 
            trail={auditTrailItem.auditTrail} 
            itemId={displayIds[auditTrailItem.id]} 
            onClose={() => setAuditTrailItem(null)}
         />
      )}
    </div>
  );
}

// --- Simplified Wizard Component (No Plan Review Step) ---
const Wizard = ({ section, onClose, onSubmit }: { section: string, onClose: () => void, onSubmit: (item: RegistryItem) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<RegistryItem>>({
    id: `R-${Date.now()}`, // Temporary ID, simplified in list view
    section,
    type: 'RISK',
    dateIdentified: new Date().toISOString().split('T')[0],
    actionPlans: []
  });

  const updateData = (updates: Partial<RegistryItem>) => setData({ ...data, ...updates });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Validate Step 1
  const step1Valid = data.process && data.source && data.description && data.dateIdentified;
  
  // Validate Step 2 (Scoring)
  const step2Valid = data.type === 'RISK' 
     ? (data.likelihood && data.severity && data.impactQMS && data.existingControls) 
     : (data.expectedBenefit && data.feasibility);

  // Validate Step 3 (Action Plan MANDATORY)
  const isMandatoryAction = true; // Now mandatory for all
  const step3Valid = !isMandatoryAction || (data.actionPlans && data.actionPlans.length > 0);

  // Risk Calc for Wizard
  const riskRating = (data.likelihood || 0) * (data.severity || 0);
  const riskLevel = calculateRiskLevel(data.likelihood || 0, data.severity || 0);

  const [currentPlan, setCurrentPlan] = useState<Partial<ActionPlan>>({
    strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: ''
  });

  const addActionPlan = () => {
    if (!currentPlan.description || !currentPlan.strategy) return;
    const newPlan: ActionPlan = {
      id: `AP-${Date.now()}`,
      strategy: currentPlan.strategy!,
      description: currentPlan.description!,
      evidence: currentPlan.evidence!,
      responsiblePerson: currentPlan.responsiblePerson!,
      targetDate: currentPlan.targetDate!,
      status: 'APPROVED' // Auto-approved
    };
    updateData({ actionPlans: [...(data.actionPlans || []), newPlan] });
    setCurrentPlan({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
  };

  const removePlan = (id: string) => {
      updateData({ actionPlans: data.actionPlans?.filter(p => p.id !== id) });
  };

  const strategies = data.type === 'RISK' ? RISK_STRATEGIES : OPP_STRATEGIES;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-fadeIn overflow-hidden">
        {/* Wizard Header */}
        <div className="bg-osmak-green p-6 text-white flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold">New Registry Entry</h2>
             <p className="text-green-100 text-sm">Step {step} of 3: {step === 1 ? 'Context & Identification' : step === 2 ? 'Assessment & Scoring' : 'Action Planning'}</p>
          </div>
          <button onClick={onClose}><XCircle size={32} className="hover:text-green-200 transition"/></button>
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
           {step === 1 && (
             <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Process / Function</label>
                        <input type="text" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 border-gray-300" placeholder="e.g. Patient Admission" value={data.process} onChange={e => updateData({ process: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Date Identified</label>
                        <input type="date" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 border-gray-300" value={data.dateIdentified} onChange={e => updateData({ dateIdentified: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Source</label>
                    <select className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 border-gray-300" value={SOURCES.includes(data.source || '') ? data.source : 'Others'} onChange={e => updateData({ source: e.target.value === 'Others' ? '' : e.target.value })}>
                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {(!SOURCES.includes(data.source || '') || data.source === '') && (
                        <input type="text" className="w-full border p-3 rounded-lg mt-2 focus:ring-2 focus:ring-green-500 bg-white text-gray-900 border-gray-300" placeholder="Specify Source..." value={data.source} onChange={e => updateData({ source: e.target.value })} />
                    )}
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Entry Type</label>
                   <div className="flex gap-4">
                      <button onClick={() => updateData({ type: 'RISK' })} className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${data.type === 'RISK' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-200'}`}>
                         <AlertTriangle size={32}/>
                         <span className="font-bold">RISK</span>
                      </button>
                      <button onClick={() => updateData({ type: 'OPPORTUNITY' })} className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${data.type === 'OPPORTUNITY' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'}`}>
                         <Lightbulb size={32}/>
                         <span className="font-bold">OPPORTUNITY</span>
                      </button>
                   </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 h-24 bg-white text-gray-900 border-gray-300" placeholder={`Describe the ${data.type?.toLowerCase()}...`} value={data.description} onChange={e => updateData({ description: e.target.value })}></textarea>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-6 animate-fadeIn">
                {data.type === 'RISK' ? (
                   <>
                     <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
                        <div>
                            <span className="text-red-800 text-xs font-bold uppercase">Calculated Risk Level</span>
                            <h3 className={`text-3xl font-bold ${riskLevel === 'CRITICAL' ? 'text-red-700' : riskLevel === 'HIGH' ? 'text-orange-600' : 'text-yellow-700'}`}>{riskLevel} ({riskRating})</h3>
                        </div>
                        <AlertTriangle size={48} className="text-red-200"/>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Likelihood (1-5)</label>
                            <input type="range" min="1" max="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" value={data.likelihood || 1} onChange={e => updateData({ likelihood: parseInt(e.target.value) })} />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                               <span>1: Rare</span><span>5: Almost Certain</span>
                            </div>
                            <p className="text-sm font-medium text-red-600 mt-1">{LIKELIHOOD_DESC[data.likelihood || 1]}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Severity (1-5)</label>
                            <input type="range" min="1" max="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" value={data.severity || 1} onChange={e => updateData({ severity: parseInt(e.target.value) })} />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                               <span>1: Insignificant</span><span>5: Critical</span>
                            </div>
                            <p className="text-sm font-medium text-red-600 mt-1">{SEVERITY_DESC[data.severity || 1]}</p>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Potential Impact on QMS</label>
                        <textarea className="w-full border p-3 rounded-lg bg-white text-gray-900 border-gray-300" value={data.impactQMS} onChange={e => updateData({ impactQMS: e.target.value })}></textarea>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Existing Controls</label>
                        <textarea className="w-full border p-3 rounded-lg bg-white text-gray-900 border-gray-300" value={data.existingControls} onChange={e => updateData({ existingControls: e.target.value })}></textarea>
                     </div>
                     <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800 flex gap-2">
                         <Info size={16} className="shrink-0 mt-0.5"/>
                         <p><strong>Mandatory Action Strategy:</strong> All risks require an action plan.</p>
                     </div>
                   </>
                ) : (
                   <>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Expected Benefit</label>
                            <textarea className="w-full border p-3 rounded-lg h-32 bg-white text-gray-900 border-gray-300" value={data.expectedBenefit} onChange={e => updateData({ expectedBenefit: e.target.value })}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Feasibility</label>
                            <select className="w-full border p-3 rounded-lg bg-white text-gray-900 border-gray-300" value={data.feasibility} onChange={e => updateData({ feasibility: e.target.value as any })}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                     </div>
                   </>
                )}
             </div>
           )}

           {step === 3 && (
             <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                   <h3 className="text-blue-900 font-bold mb-1">Action Planning</h3>
                   <p className="text-blue-800 text-sm mb-4">Define how you will address this {data.type?.toLowerCase()}. At least one action plan is mandatory.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <select className="p-2 border rounded bg-white text-gray-900 border-gray-300" value={currentPlan.strategy} onChange={e => setCurrentPlan({...currentPlan, strategy: e.target.value})}>
                          <option value="">Select Strategy</option>
                          {Object.keys(strategies).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input type="text" className="p-2 border rounded bg-white text-gray-900 border-gray-300" placeholder="Action Description" value={currentPlan.description} onChange={e => setCurrentPlan({...currentPlan, description: e.target.value})} />
                      <input type="text" className="p-2 border rounded bg-white text-gray-900 border-gray-300" placeholder="Verification Evidence (e.g. Logs)" value={currentPlan.evidence} onChange={e => setCurrentPlan({...currentPlan, evidence: e.target.value})} />
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 p-2 border rounded bg-white text-gray-900 border-gray-300" placeholder="Responsible" value={currentPlan.responsiblePerson} onChange={e => setCurrentPlan({...currentPlan, responsiblePerson: e.target.value})} />
                        <input type="date" className="flex-1 p-2 border rounded bg-white text-gray-900 border-gray-300" value={currentPlan.targetDate} onChange={e => setCurrentPlan({...currentPlan, targetDate: e.target.value})} />
                      </div>
                   </div>
                   <button onClick={addActionPlan} disabled={!currentPlan.description || !currentPlan.strategy} className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                      Add Action Plan
                   </button>
                </div>

                <div className="space-y-2">
                    <h4 className="font-bold text-gray-700 text-sm uppercase">Added Plans ({data.actionPlans?.length})</h4>
                    {data.actionPlans?.length === 0 && <p className="text-gray-400 italic text-sm">No plans added yet.</p>}
                    {data.actionPlans?.map(p => (
                        <div key={p.id} className="bg-white border p-3 rounded-lg flex justify-between items-start shadow-sm">
                            <div>
                                <span className="text-xs font-bold bg-gray-200 px-2 py-0.5 rounded text-gray-700 uppercase mr-2">{p.strategy}</span>
                                <span className="font-medium text-gray-800">{p.description}</span>
                                <div className="text-xs text-gray-500 mt-1">
                                    By: {p.responsiblePerson} • Due: {p.targetDate}
                                </div>
                            </div>
                            <button onClick={() => removePlan(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
            {step > 1 ? (
                <button onClick={prevStep} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold">Back</button>
            ) : (
                <div></div>
            )}
            
            {step < 3 ? (
                <button onClick={nextStep} disabled={step === 1 ? !step1Valid : !step2Valid} className="px-8 py-3 bg-osmak-green text-white rounded-lg font-bold shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next Step
                </button>
            ) : (
                <button onClick={() => {
                    const finalItem = { 
                        ...data, 
                        status: 'IMPLEMENTATION' as WorkflowStatus,
                        riskRating: (data.likelihood || 0) * (data.severity || 0),
                        riskLevel: calculateRiskLevel(data.likelihood || 0, data.severity || 0)
                    } as RegistryItem;
                    onSubmit(finalItem);
                }} disabled={!step3Valid} className="px-8 py-3 bg-osmak-green text-white rounded-lg font-bold shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <Save size={20}/> Submit Entry
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);