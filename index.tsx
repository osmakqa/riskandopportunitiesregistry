import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from "@google/genai";
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
  X,
  Video,
  Sparkles,
  Bot,
  RefreshCw,
  Search
} from 'lucide-react';

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://jtohqxhfinqjspihturh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0b2hxeGhmaW5xanNwaWh0dXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTkzNDgsImV4cCI6MjA3OTgzNTM0OH0.-XZbu74I7OtJ11tEnSUfgegGaWH0aGF0hyEXpqLJoV0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Google Sheets Backup Configuration ---
// TODO: Deploy the Google Apps Script and paste the Web App URL here
const GOOGLE_SHEET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCjGXypU6bVgG8YtpvQTEAmiiY5ylvmTgyJ2NU-lXp0WXTtDkKhHKRfdKlsHf3Wl4/exec'; 

// --- Types & Interfaces ---

type EntryType = 'RISK' | 'OPPORTUNITY';
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
// Renamed QA_VERIFICATION to IQA_VERIFICATION
type WorkflowStatus = 'IMPLEMENTATION' | 'REASSESSMENT' | 'IQA_VERIFICATION' | 'CLOSED';
type ActionStatus = 'PENDING_APPROVAL' | 'FOR_IMPLEMENTATION' | 'REVISION_REQUIRED' | 'FOR_VERIFICATION' | 'COMPLETED';

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
  verificationRemarks?: string;
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
  residual_likelihood: item.residualLikelihood,
  residual_severity: item.residualSeverity,
  residual_risk_rating: item.residualRiskRating,
  residual_risk_level: item.residualRiskLevel,
  effectiveness_remarks: item.effectivenessRemarks,
  status: item.status,
  created_at: item.createdAt,
  closed_at: item.closedAt,
  audit_trail: item.auditTrail
});

// --- Backup Helper ---
const backupToGoogleSheets = async (item: RegistryItem) => {
  if (!GOOGLE_SHEET_SCRIPT_URL) {
    console.warn("Google Sheet Backup Skipped: No Script URL Configured");
    return;
  }
  
  const dbItem = mapToDb(item);
  
  // Ensure array/object fields are strictly stringified for the payload
  // The GAS script should parse the main JSON body, but individual object fields
  // are best sent as their DB representation or stringified to ensure they fit in cells.
  const payload = {
    ...dbItem,
    action_plans: JSON.stringify(dbItem.action_plans),
    audit_trail: JSON.stringify(dbItem.audit_trail)
  };

  try {
    await fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // 'no-cors' is required for simple requests to GAS Web Apps without preflight issues
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log("Backup sent to Google Sheets");
  } catch (e) {
    console.error("Google Sheets Backup Failed", e);
  }
};

const mapFromDb = (dbItem: any): RegistryItem => {
  let trail: AuditEvent[] = [];
  try {
      trail = typeof dbItem.audit_trail === 'string' ? JSON.parse(dbItem.audit_trail) : (dbItem.audit_trail || []);
  } catch (e) {
      console.error("Error parsing audit trail", e);
      trail = [];
  }

  // SYNC AUDIT TRAIL TIMESTAMPS WITH DB COLUMNS
  // This ensures that if created_at is edited in Supabase, the "Entry Created" event reflects that date.
  if (dbItem.created_at) {
      const idx = trail.findIndex(e => e.event === 'Entry Created');
      if (idx !== -1) {
          trail[idx] = { ...trail[idx], timestamp: dbItem.created_at };
      }
  }
  
  if (dbItem.closed_at) {
      const idx = trail.findIndex(e => e.event === 'Entry Validated and Closed' || e.event.includes('Closed'));
      if (idx !== -1) {
          trail[idx] = { ...trail[idx], timestamp: dbItem.closed_at };
      }
  }

  return {
      id: dbItem.id,
      section: dbItem.section,
      dateIdentified: dbItem.date_identified || '',
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
      residualRiskRating: dbItem.risk_rating, // Initial value
      residualRiskLevel: dbItem.risk_level, // Initial value
      effectivenessRemarks: dbItem.effectiveness_remarks,
      reassessmentDate: dbItem.reassessment_date,
      status: dbItem.status,
      createdAt: dbItem.created_at || new Date().toISOString(),
      closedAt: dbItem.closed_at,
      auditTrail: trail
  };
};

const SECTIONS = [
  'Admitting Section',
  'Ambulatory Care Medicine Complex',
  'Billing Section',
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

const IQA_USERS = [
  'Main IQA Account',
  'Ana Concepcion Biligan',
  'Bernadette Babanto',
  'Catherine Vibal',
  'Charisse Baga',
  'Gemma Alli',
  'Joanna Christina Santos',
  'Marieta Avila',
  'Max Angelo G. Terrenal',
  'Michelle Loraine Rimando',
  'Millicent Lumabao',
  'Richard Son Solito',
  'Rochelle Del Rosario',
  'Ruth Sagales',
  'Sharalyn Dasigan',
  'Teodorico Frigillana'
];

// --- MOCK CREDENTIALS STORE ---
const CREDENTIALS: Record<string, string> = {
  // IQA Accounts
  'Main IQA Account': 'admin123',
  'Ana Concepcion Biligan': 'Biligan123',
  'Bernadette Babanto': 'Babanto123',
  'Catherine Vibal': 'Vibal123',
  'Charisse Baga': 'Baga123',
  'Gemma Alli': 'Alli123',
  'Joanna Christina Santos': 'Santos123',
  'Marieta Avila': 'Avila123',
  'Max Angelo G. Terrenal': 'Terrenal123',
  'Michelle Loraine Rimando': 'Rimando123',
  'Millicent Lumabao': 'Lumabao123',
  'Richard Son Solito': 'Solito123',
  'Rochelle Del Rosario': 'DelRosario123',
  'Ruth Sagales': 'Sagales123',
  'Sharalyn Dasigan': 'Dasigan123',
  'Teodorico Frigillana': 'Frigillana123',
  // Default Section Password
  'DEFAULT': 'osmak123' 
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
      case 'IQA_VERIFICATION': return 'bg-teal-100 text-teal-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

const getActionPillColor = (status: ActionStatus) => {
  switch (status) {
    case 'FOR_IMPLEMENTATION': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'FOR_VERIFICATION': return 'bg-purple-100 text-purple-800';
    case 'REVISION_REQUIRED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

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
    case 'IQA_VERIFICATION': return 'bg-indigo-100 text-indigo-800';
    case 'CLOSED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: WorkflowStatus) => {
  if (status === 'IQA_VERIFICATION') return 'IQA VERIFICATION';
  if (status === 'REASSESSMENT') return 'REASSESSMENT';
  return status.replace('_', ' ');
}

// Calculate days remaining to target date
const getDaysRemaining = (item: RegistryItem): { days: number, label: string, color: string } | null => {
  if (item.status === 'CLOSED' || item.actionPlans.length === 0) return null;
  
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
            <h1 className="text-white text-xs font-extrabold tracking-wide uppercase leading-none">OSPITAL NG MAKATI</h1>
            <span className="text-green-50 text-[0.65rem] font-medium opacity-90 tracking-wider mt-0.5">Risk & Opportunities Registry</span>
        </div>
        </div>
        <button onClick={onClose} className="md:hidden text-white p-1 hover:bg-green-700 rounded-full transition-colors">
            <X size={24} />
        </button>
    </header>
);

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

const AuditTrailModal = ({ trail, onClose, itemId }: { trail: AuditEvent[], onClose: () => void, itemId: string }) => {
    const getIcon = (event: string) => {
        if (event.includes('Created')) return <PlusCircle size={16} className="text-blue-500" />;
        if (event.includes('Closed') || event.includes('Verified')) return <CheckCircle2 size={16} className="text-green-500" />;
        if (event.includes('Edited')) return <Pencil size={16} className="text-yellow-500" />;
        if (event.includes('Reopened')) return <RotateCcw size={16} className="text-orange-500" />;
        return <Activity size={16} className="text-gray-500" />;
    };

    const formatTimestamp = (ts: string) => {
        try {
            const date = new Date(ts);
            if (isNaN(date.getTime())) return ts;
            return date.toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'numeric', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
        } catch {
            return ts;
        }
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
  const [section, setSection] = useState(SECTIONS[0]);
  const [iqaUser, setIqaUser] = useState(IQA_USERS[0]);
  const [isIQA, setIsIQA] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = isIQA ? iqaUser : section;
    const correctPassword = CREDENTIALS[targetUser] || CREDENTIALS['DEFAULT'];

    if (password.toLowerCase() === correctPassword.toLowerCase()) {
      onLogin(targetUser);
    } else {
      setError('Invalid password. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F0FFF4] flex items-center justify-center p-4">
      {showWorkflow && <WorkflowModal onClose={() => setShowWorkflow(false)} />}
      {showManual && <UserManualModal onClose={() => setShowWorkflow(false)} />}
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <AppHeader title="OSPITAL NG MAKATI" subtitle="Risk & Opportunities Registry System" />
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button type="button" onClick={() => { setIsIQA(false); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isIQA ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Process Owner</button>
            <button type="button" onClick={() => { setIsIQA(true); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isIQA ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>IQA</button>
          </div>

          {!isIQA ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
              <select 
                value={section} 
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 focus:border-transparent outline-none transition text-sm bg-white text-gray-900"
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select IQA</label>
              <select 
                value={iqaUser} 
                onChange={(e) => setIqaUser(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 focus:border-transparent outline-none transition text-sm bg-white text-gray-900"
              >
                {IQA_USERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
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
          </div>
          <div className="space-y-4">
            <button type="submit" className="w-full bg-osmak-green hover:bg-osmak-green-dark text-white font-semibold py-3 rounded-lg transition shadow-md">
              Login
            </button>
            <div className="space-y-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowWorkflow(true)}
                  className="w-full text-osmak-green text-sm font-medium hover:underline flex items-center justify-center gap-2"
                >
                  <BookOpen size={16} /> View System Workflow
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowManual(true)}
                  className="w-full text-osmak-green text-sm font-medium hover:underline flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> View User Manual
                </button>
                 <a 
                  href="https://drive.google.com/file/d/1m3TXXwC7nV7lp2JNLgB9cxAbXsosaOLA/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full text-osmak-green text-sm font-medium hover:underline flex items-center justify-center gap-2"
                >
                  <Video size={16} /> Watch Orientation Video
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
  isIQA, 
  currentUser,
  displayId,
  onClose, 
  onUpdate, 
  onDelete 
}: { 
  item: RegistryItem, 
  isIQA: boolean, 
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
  
  const [iqaVerification, setIqaVerification] = useState({
    implementation: 'IMPLEMENTED' as 'IMPLEMENTED' | 'NOT_IMPLEMENTED',
    effectiveness: 'EFFECTIVE' as 'EFFECTIVE' | 'NOT_EFFECTIVE',
    remarks: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<RegistryItem>(item);

  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
  const [completingActionId, setCompletingActionId] = useState<string | null>(null);
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [delayReason, setDelayReason] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [reopenPassword, setReopenPassword] = useState('');
  const [reopenError, setReopenError] = useState('');

  const reassessmentRiskRating = reassessment.likelihood * reassessment.severity;
  const reassessmentRiskLevel = calculateRiskLevel(reassessment.likelihood, reassessment.severity);

  useEffect(() => {
    setEditData(item);
  }, [item]);

  const handleVerifyAction = (actionId: string, status: 'COMPLETED' | 'REVISION_REQUIRED') => {
      const updatedActions = item.actionPlans.map(ap => 
        ap.id === actionId ? { ...ap, status: status } : ap
      ) as ActionPlan[];
      
      let nextStatus = item.status;
      let eventLog = '';
      
      if (status === 'COMPLETED') {
         eventLog = 'Action Plan Verified as Complete';
         const allCompleted = updatedActions.every(a => a.status === 'COMPLETED');
         if (allCompleted) {
             nextStatus = 'IQA_VERIFICATION';
         }
      } else {
         eventLog = 'Action Plan Rejected by IQA';
      }
      
      let updatedItem = addAuditEvent(item, eventLog, currentUser);
      updatedItem = {...updatedItem, actionPlans: updatedActions, status: nextStatus };
  
      onUpdate(updatedItem);
  };

  const handleUserMarkCompleted = (actionId: string) => {
    const plan = item.actionPlans.find(ap => ap.id === actionId);
    if (!plan) return;

    const targetDate = new Date(plan.targetDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const isOverdue = targetDate < today;

    if (isOverdue && !delayReason.trim()) {
        alert("This item is overdue. Please provide a reason for the delay.");
        return;
    }

    let finalRemarks = completionRemarks;
    if (isOverdue) {
        finalRemarks = `[DELAY JUSTIFICATION: ${delayReason}] ${completionRemarks}`;
    }

    let updatedItem = addAuditEvent(item, "Action Submitted for Verification", currentUser);
    
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
      ap.id === actionId ? { ...ap, status: 'FOR_VERIFICATION', completionRemarks: finalRemarks } : ap
    ) as ActionPlan[];

    onUpdate({ ...updatedItem, actionPlans: updatedActions, ...updates });
    setCompletingActionId(null);
    setCompletionRemarks('');
    setDelayReason('');
  };

  const handleSubmitIQAVerification = () => {
      if (iqaVerification.implementation === 'NOT_IMPLEMENTED' || iqaVerification.effectiveness === 'NOT_EFFECTIVE') {
          const reason = `IQA Verification Failed: Implementation=${iqaVerification.implementation}, Effectiveness=${iqaVerification.effectiveness}`;
          let updatedItem = addAuditEvent(item, "IQA Verification Rejected", currentUser);
          
          const rejectionNote = `[IQA REJECTION] ${iqaVerification.remarks || 'No remarks provided.'}`;
          const currentRemarks = item.effectivenessRemarks || '';
          
          onUpdate({
              ...updatedItem,
              status: 'IMPLEMENTATION',
              effectivenessRemarks: currentRemarks ? `${currentRemarks}\n\n${rejectionNote}` : rejectionNote
          });
      } else {
          let updatedItem = addAuditEvent(item, "Entry Validated and Closed", currentUser);
          const closingNote = iqaVerification.remarks ? `[IQA VERIFIED] ${iqaVerification.remarks}` : (item.effectivenessRemarks || '');

          onUpdate({
              ...updatedItem,
              status: 'CLOSED',
              effectivenessRemarks: closingNote, 
              closedAt: new Date().toISOString().split('T')[0]
          });
      }
  }

  const handleRequirePlan = () => {
     alert("Please notify the section that an action plan is mandatory.");
  }

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
      status: 'FOR_IMPLEMENTATION'
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
  const canEdit = !isIQA && item.status === 'IMPLEMENTATION';

  const isPlanOverdue = (plan: ActionPlan) => {
    if (plan.status === 'COMPLETED' || plan.status === 'FOR_VERIFICATION') return false; 
    const target = new Date(plan.targetDate);
    const now = new Date();
    now.setHours(0,0,0,0);
    return target < now;
  }

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
                className="w-full text-xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-osmak-600 bg-white"
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
                   <input type="text" className="w-full border rounded p-1 bg-white text-gray-900" value={editData.process} onChange={e => setEditData({...editData, process: e.target.value})} />
                ) : (
                   <span className="font-semibold text-gray-800">{item.process}</span>
                )}
             </div>
             <div>
                <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Source</span>
                {isEditing ? (
                   <div className="relative">
                      <select 
                          className="w-full border rounded p-1 bg-white text-gray-900 appearance-none"
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
                              className="w-full border rounded p-1 mt-1 bg-white text-gray-900" 
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
                   <input type="date" className="w-full border rounded p-1 bg-white text-gray-900" value={editData.dateIdentified} onChange={e => setEditData({...editData, dateIdentified: e.target.value})} />
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
                        <textarea className="w-full border rounded p-2 bg-white text-gray-900" value={editData.impactQMS} onChange={e => setEditData({...editData, impactQMS: e.target.value})} />
                     ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">{item.impactQMS}</p>
                     )}
                   </div>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Existing Controls / Mitigation</span>
                     {isEditing ? (
                        <textarea className="w-full border rounded p-2 bg-white text-gray-900" value={editData.existingControls} onChange={e => setEditData({...editData, existingControls: e.target.value})} />
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
                        <textarea className="w-full border rounded p-2 bg-white text-gray-900" value={editData.expectedBenefit} onChange={e => setEditData({...editData, expectedBenefit: e.target.value})} />
                     ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">{item.expectedBenefit}</p>
                     )}
                   </div>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Feasibility</span>
                     {isEditing ? (
                        <select className="w-full border rounded p-2 bg-white text-gray-900" value={editData.feasibility} onChange={e => setEditData({...editData, feasibility: e.target.value as any})}>
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
                  <div className="space-y-6">
                    <div>
                        {(item.residualLikelihood || 0) > 0 && <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Initial Assessment</h4>}
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
                    </div>

                    {(item.residualLikelihood || 0) > 0 && (
                        <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 border-t pt-4">Residual Assessment</h4>
                             <div className="flex gap-4">
                                 <div className="flex-1 bg-amber-50 p-4 rounded-lg text-center border border-amber-100">
                                    <span className="text-gray-500 text-xs uppercase font-bold block mb-2">Likelihood</span>
                                    <div className="text-2xl font-bold text-gray-900">{item.residualLikelihood}</div>
                                    <div className="text-xs text-gray-400 mt-1">{LIKELIHOOD_DESC[item.residualLikelihood || 1]}</div>
                                 </div>
                                 
                                 <div className="flex-1 bg-amber-50 p-4 rounded-lg text-center border border-amber-100">
                                    <span className="text-gray-500 text-xs uppercase font-bold block mb-2">Severity</span>
                                    <div className="text-2xl font-bold text-gray-900">{item.residualSeverity}</div>
                                    <div className="text-xs text-gray-400 mt-1">{SEVERITY_DESC[item.residualSeverity || 1]}</div>
                                 </div>

                                 <div className="flex-1 p-4 rounded-lg text-center border-2 border-amber-100 flex flex-col justify-center items-center bg-white">
                                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Residual Rating</span>
                                    <div className="text-3xl font-bold text-gray-800">
                                      {item.residualRiskRating}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${getRiskColor(item.residualRiskLevel)}`}>
                                        {item.residualRiskLevel}
                                    </span>
                                 </div>
                              </div>
                        </div>
                    )}
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
              {(!isIQA && item.status === 'IMPLEMENTATION' && !isAddingPlan) && (
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
                  ) : item.actionPlans.map(ap => {
                    const overdue = isPlanOverdue(ap);
                    return (
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
                          {ap.verificationRemarks && (
                            <div className="mt-2 text-xs bg-indigo-50 p-2 rounded text-indigo-800 border border-indigo-100">
                              <span className="font-bold">IQA Notes:</span> {ap.verificationRemarks}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 align-top pt-4 italic">{ap.evidence}</td>
                        <td className="px-4 py-3 text-gray-600 align-top pt-4">{ap.responsiblePerson}</td>
                        <td className={`px-4 py-3 align-top pt-4 ${overdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            {ap.targetDate}
                            {overdue && <span className="block text-[10px] text-red-500">(Overdue)</span>}
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getActionPillColor(ap.status)}`}>
                            {ap.status === 'FOR_VERIFICATION' ? 'FOR VERIFICATION' : ap.status.replace('_', ' ')}
                          </span>
                          {overdue && <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded font-bold">OVERDUE</span>}
                        </td>
                        <td className="px-4 py-3 text-right align-top pt-4">
                          {isIQA ? (
                            <div className="flex flex-row gap-2 justify-end">
                              {item.status === 'IMPLEMENTATION' && ap.status === 'FOR_VERIFICATION' && (
                                <>
                                  <button 
                                      onClick={() => handleVerifyAction(ap.id, 'COMPLETED')} 
                                      className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 shadow-sm"
                                      title="Verify Complete"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                  <button 
                                      onClick={() => handleVerifyAction(ap.id, 'REVISION_REQUIRED')} 
                                      className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 shadow-sm"
                                      title="Return for Revision"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                              {item.status === 'IMPLEMENTATION' && ap.status === 'FOR_IMPLEMENTATION' && (
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
                              {item.status === 'IMPLEMENTATION' && (ap.status === 'FOR_IMPLEMENTATION' || ap.status === 'REVISION_REQUIRED') && !completingActionId && (
                                <button 
                                    onClick={() => {
                                        setCompletingActionId(ap.id);
                                        setDelayReason('');
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
                                  Completed
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
                                {isPlanOverdue(ap) && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-2">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="text-red-500 mt-1" size={20} />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-red-800 text-sm mb-2">Action Plan Overdue</h4>
                                                <p className="text-xs text-red-700 mb-3">
                                                    The target date ({ap.targetDate}) has passed. A justification is required to proceed.
                                                </p>
                                                <label className="block text-xs font-bold text-red-800 mb-1">Reason for Delay (Required)</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full border rounded p-2 text-sm bg-white text-gray-900 border-red-300 focus:ring-2 focus:ring-red-500 outline-none"
                                                    placeholder="Why was the target date missed?"
                                                    value={delayReason}
                                                    onChange={e => setDelayReason(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {item.type === 'RISK' && (
                                    <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                        <h4 className="font-bold text-green-800 text-sm mb-3 border-b pb-2 flex items-center gap-2">
                                            <Activity size={16}/> Residual Risk Assessment
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
                                    disabled={isPlanOverdue(ap) && !delayReason.trim()}
                                    className="bg-green-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit for Verification
                                </button>
                                <button 
                                    onClick={() => { setCompletingActionId(null); setCompletingActionId(null); setCompletionRemarks(''); setDelayReason(''); }}
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
                  )})}
                </tbody>
              </table>
            </div>

            {isIQA && item.status === 'IMPLEMENTATION' && item.type === 'RISK' && item.actionPlans.length === 0 && (
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

          <div className="mt-8 border-t pt-6 flex gap-4">
              {item.status === 'CLOSED' && isIQA && !showReopenConfirm && !showDeleteConfirm && (
                <button 
                    onClick={() => setShowReopenConfirm(true)}
                    className="text-blue-500 text-sm hover:underline hover:text-blue-700 flex items-center gap-2"
                >
                    <RotateCcw size={14}/> Reopen Entry
                </button>
              )}
              
              {!showDeleteConfirm && !showReopenConfirm && (
                  <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-500 text-sm hover:underline hover:text-red-700 flex items-center gap-2"
                  >
                      <Trash2 size={14}/> Delete Entry
                  </button>
              )}

              {showDeleteConfirm && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn w-full">
                      <h4 className="text-red-800 font-bold text-sm mb-2">Confirm Deletion</h4>
                      <p className="text-red-600 text-xs mb-3">This action cannot be undone. Please enter your password to confirm.</p>
                      <div className="flex gap-2 items-center">
                          <input 
                              type="password"
                              className="border border-red-300 rounded px-2 py-1 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-red-500"
                              placeholder="Password"
                              value={deletePassword}
                              onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                          />
                          <button onClick={confirmDelete} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-700">Confirm</button>
                          <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} className="text-gray-500 text-sm hover:text-gray-700 px-2">Cancel</button>
                      </div>
                      {deleteError && <p className="text-red-600 text-xs font-bold mt-2">{deleteError}</p>}
                  </div>
              )}

              {showReopenConfirm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fadeIn w-full">
                      <h4 className="text-blue-800 font-bold text-sm mb-2">Confirm Reopen</h4>
                      <p className="text-blue-600 text-xs mb-3">This will move the entry back to "Implementation". Please enter your password to confirm.</p>
                      <div className="flex gap-2 items-center">
                          <input 
                              type="password"
                              className="border border-blue-300 rounded px-2 py-1 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Password"
                              value={reopenPassword}
                              onChange={e => { setReopenPassword(e.target.value); setReopenError(''); }}
                          />
                          <button onClick={confirmReopen} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-700">Confirm Reopen</button>
                          <button onClick={() => { setShowReopenConfirm(false); setReopenPassword(''); }} className="text-gray-500 text-sm hover:text-gray-700 px-2">Cancel</button>
                      </div>
                      {reopenError && <p className="text-red-600 text-xs font-bold mt-2">{reopenError}</p>}
                  </div>
              )}
          </div>
        
            {item.status === 'IQA_VERIFICATION' && isIQA && (
              <div className="space-y-4 bg-indigo-50 p-6 rounded-xl border border-indigo-100 mt-4">
                 <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-lg">
                    <CheckCircle2 size={24}/> IQA Verification & Closure
                 </h4>
                 
                 {item.type === 'RISK' && (
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm mb-4">
                        <h5 className="font-bold text-gray-800 text-sm mb-3">User's Residual Risk Assessment</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-xs text-gray-500 uppercase">Input Scores</span>
                                <span className="text-gray-600">Likelihood: {item.residualLikelihood} × Severity: {item.residualSeverity}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 uppercase">Residual Rating</span>
                                <span className="font-bold text-gray-800">{item.residualRiskRating} ({item.residualRiskLevel})</span>
                            </div>
                        </div>
                    </div>
                 )}

                 <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Implementation Verification</label>
                             <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" name="implementation" value="IMPLEMENTED"
                                        checked={iqaVerification.implementation === 'IMPLEMENTED'}
                                        onChange={() => setIqaVerification({...iqaVerification, implementation: 'IMPLEMENTED'})}
                                        className="accent-indigo-600"
                                    />
                                    <span className="text-sm text-gray-800 font-medium">Implemented</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" name="implementation" value="NOT_IMPLEMENTED"
                                        checked={iqaVerification.implementation === 'NOT_IMPLEMENTED'}
                                        onChange={() => setIqaVerification({...iqaVerification, implementation: 'NOT_IMPLEMENTED'})}
                                        className="accent-red-600"
                                    />
                                    <span className="text-sm text-gray-800 font-medium">Not Implemented</span>
                                </label>
                             </div>
                         </div>
                         
                         <div>
                             <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Effectiveness Verification</label>
                             <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" name="effectiveness" value="EFFECTIVE"
                                        checked={iqaVerification.effectiveness === 'EFFECTIVE'}
                                        onChange={() => setIqaVerification({...iqaVerification, effectiveness: 'EFFECTIVE'})}
                                        className="accent-indigo-600"
                                    />
                                    <span className="text-sm text-gray-800 font-medium">Effective</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" name="effectiveness" value="NOT_EFFECTIVE"
                                        checked={iqaVerification.effectiveness === 'NOT_EFFECTIVE'}
                                        onChange={() => setIqaVerification({...iqaVerification, effectiveness: 'NOT_EFFECTIVE'})}
                                        className="accent-red-600"
                                    />
                                    <span className="text-sm text-gray-800 font-medium">Not Effective</span>
                                </label>
                             </div>
                         </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Final Remarks</label>
                        <textarea 
                           className="w-full border rounded-lg p-3 text-sm bg-gray-50 text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
                           placeholder="Enter remarks regarding implementation evidence and effectiveness..."
                           rows={3}
                           value={iqaVerification.remarks} 
                           onChange={e => setIqaVerification({...iqaVerification, remarks: e.target.value})} 
                        />
                     </div>
                     
                     <div className="pt-2">
                        <button 
                            onClick={handleSubmitIQAVerification}
                            className={`w-full py-3 rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2 ${
                                iqaVerification.implementation === 'NOT_IMPLEMENTED' || iqaVerification.effectiveness === 'NOT_EFFECTIVE'
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {iqaVerification.implementation === 'NOT_IMPLEMENTED' || iqaVerification.effectiveness === 'NOT_EFFECTIVE'
                             ? 'Reject & Revert to Implementation'
                             : 'Verify Completion & Close Entry'
                            }
                        </button>
                     </div>
                 </div>
              </div>
            )}

            {item.status === 'CLOSED' && (
              <div className="space-y-4 mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-green-700 font-bold flex items-center gap-2 text-lg">
                  <CheckCircle2 size={24} /> This entry is verified and closed.
                </p>
                <p className="text-sm text-gray-500 ml-8">Closed on {item.closedAt}</p>
                
                {item.effectivenessRemarks && (
                   <div className="bg-white p-4 border border-gray-200 rounded-lg text-sm text-gray-600 ml-8 shadow-sm">
                      <strong className="block text-gray-800 mb-1">Final Remarks / Effectiveness:</strong> 
                      <div className="whitespace-pre-wrap">{item.effectivenessRemarks}</div>
                      {item.type === 'RISK' && item.residualRiskRating && (
                         <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4">
                             <div>
                                 <span className="text-xs text-gray-400 uppercase">Residual Rating</span>
                                 <div className="font-bold text-gray-800">{item.residualRiskRating}</div>
                             </div>
                             <div>
                                 <span className="text-xs text-gray-400 uppercase">Residual Level</span>
                                 <div className={`font-bold ${item.residualRiskLevel === 'CRITICAL' ? 'text-red-600' : 'text-green-600'}`}>{item.residualRiskLevel}</div>
                             </div>
                         </div>
                      )}
                   </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

const Wizard = ({ section, onClose, onSave }: { section: string, onClose: () => void, onSave: (item: any) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<RegistryItem>>({
    section,
    type: 'RISK',
    source: 'Process Review', // Default to 'Process Review'
    actionPlans: [],
    dateIdentified: new Date().toISOString().split('T')[0]
  });
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [isSuggestingImpact, setIsSuggestingImpact] = useState(false); // New state for Impact AI
  const [impactSuggestions, setImpactSuggestions] = useState<string[]>([]); // New state for Impact suggestions

  const [isSuggestingBenefit, setIsSuggestingBenefit] = useState(false); // New state for Benefit AI
  const [benefitSuggestions, setBenefitSuggestions] = useState<string[]>([]); // New state for Benefit suggestions


  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [suggestedPlans, setSuggestedPlans] = useState<any[]>([]);

  const [newPlan, setNewPlan] = useState({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });

  const isMandatoryAction = true;
  const canSubmit = isMandatoryAction ? (data.actionPlans?.length ?? 0) > 0 : true;

  const strategies = data.type === 'RISK' ? RISK_STRATEGIES : OPP_STRATEGIES;

  const handleNext = () => {
    if (step === 1) {
        if (!data.process || !data.source || !data.description || !data.dateIdentified) {
            alert("Please fill in all required fields.");
            return;
        }
    }
    if (step === 2) {
       if (data.type === 'RISK' && (!data.impactQMS || !data.likelihood || !data.severity || !data.existingControls)) {
           alert("Please complete the risk assessment.");
           return;
       }
       if (data.type === 'OPPORTUNITY' && (!data.expectedBenefit || !data.feasibility)) {
           alert("Please complete the opportunity assessment.");
           return;
       }
    }
    setStep(step + 1);
  }

  const addActionPlan = () => {
    if (!newPlan.description || !newPlan.strategy) return;
    setData(prev => ({
      ...prev,
      actionPlans: [...(prev.actionPlans || []), { 
        id: `AP-${Date.now()}`, 
        ...newPlan, 
        status: 'FOR_IMPLEMENTATION'
      }]
    }));
    setNewPlan({ strategy: '', description: '', evidence: '', responsiblePerson: '', targetDate: '' });
  };

  const removeActionPlan = (idx: number) => {
    setData(prev => ({
      ...prev,
      actionPlans: prev.actionPlans?.filter((_, i) => i !== idx)
    }));
  };

  const updateRisk = (l: number, s: number) => {
    setData(prev => ({
      ...prev,
      likelihood: l,
      severity: s,
      riskRating: l * s,
      riskLevel: calculateRiskLevel(l, s)
    }));
  };

  const handleSuggestDescription = async () => {
     if (!data.process || !data.section) {
         alert("Please enter a Process / Function and ensure the Section is set first.");
         return;
     }
     setIsSuggesting(true);
     setSuggestions([]);
     try {
         const apiKey = process.env.API_KEY;
         if (!apiKey) {
            alert("Configuration Error: API Key is missing. Please add API_KEY to Vercel environment variables and redeploy.");
            setIsSuggesting(false);
            return;
         }

         const ai = new GoogleGenAI({ apiKey });
         const prompt = `For a hospital process "${data.process}" in the "${data.section}" section, generate 3 specific and professional descriptions for a ${data.type.toLowerCase()}. These descriptions should clearly define the ${data.type.toLowerCase()} itself, focusing on its nature and context within the process, but *without* including any potential impacts on QMS or expected benefits. Focus on ISO 9001:2015 compliance.
         Return the response as a JSON array of strings.`;

         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
             config: {
                 responseMimeType: 'application/json',
                 responseSchema: {
                     type: Type.ARRAY,
                     items: { type: Type.STRING }
                 }
             }
         });
         
         const ideas = JSON.parse(response.text.trim());
         if (Array.isArray(ideas)) {
             setSuggestions(ideas);
         }
     } catch (e) {
         console.error("AI Suggest Error:", e);
         alert("Failed to generate suggestions. Please try again.");
     } finally {
         setIsSuggesting(false);
     }
  };

  const handleSuggestImpact = async () => {
    if (!data.description) {
      alert("Please enter a Risk Description first to generate potential impacts.");
      return;
    }
    setIsSuggestingImpact(true);
    setImpactSuggestions([]);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        alert("Configuration Error: API Key is missing. Please add API_KEY to Vercel environment variables and redeploy.");
        setIsSuggestingImpact(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate 3 potential impacts on a Quality Management System (QMS) for the following risk description: '${data.description}'. 
      Focus on aspects relevant to ISO 9001:2015 (e.g., non-conformity, customer satisfaction, process efficiency, compliance, financial, reputational).
      Return the response as a JSON array of strings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const impacts = JSON.parse(response.text.trim());
      if (Array.isArray(impacts)) {
        setImpactSuggestions(impacts);
      }
    } catch (e) {
      console.error("AI Impact Suggest Error:", e);
      alert("Failed to generate impact suggestions. Please try again.");
    } finally {
      setIsSuggestingImpact(false);
    }
  };

  const handleSuggestBenefit = async () => {
    if (!data.description) {
      alert("Please enter an Opportunity Description first to generate expected benefits.");
      return;
    }
    setIsSuggestingBenefit(true);
    setBenefitSuggestions([]);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        alert("Configuration Error: API Key is missing. Please add API_KEY to Vercel environment variables and redeploy.");
        setIsSuggestingBenefit(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate 3 potential expected benefits or positive outcomes for the following opportunity description: '${data.description}'. 
      Focus on aspects relevant to a hospital's Quality Management System (QMS) (e.g., improved patient care, cost savings, efficiency gains, staff morale, innovation, compliance).
      Return the response as a JSON array of strings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const benefits = JSON.parse(response.text.trim());
      if (Array.isArray(benefits)) {
        setBenefitSuggestions(benefits);
      }
    } catch (e) {
      console.error("AI Benefit Suggest Error:", e);
      alert("Failed to generate benefit suggestions. Please try again.");
    } finally {
      setIsSuggestingBenefit(false);
    }
  };


  const handleGenerateActionPlans = async () => {
     if (!data.description) {
         alert("Please provide a description first to generate action plans.");
         return;
     }
     setIsGeneratingPlans(true);
     setSuggestedPlans([]);
     try {
         const apiKey = process.env.API_KEY;
         if (!apiKey) {
            alert("Configuration Error: API Key is missing. Please add API_KEY to Vercel environment variables and redeploy.");
            setIsGeneratingPlans(false);
            return;
         }

         const ai = new GoogleGenAI({ apiKey });
         const prompt = `Generate 3 specific action plans for a hospital risk registry based on this description: "${data.description}" and type "${data.type}". 
         Return JSON format. 
         The strategy must be one of: ${Object.keys(strategies).join(', ')}. Do not include responsible person or target date.`;

         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
             config: {
                 responseMimeType: 'application/json',
                 responseSchema: {
                     type: Type.ARRAY,
                     items: {
                         type: Type.OBJECT,
                         properties: {
                             strategy: { type: Type.STRING },
                             description: { type: Type.STRING },
                             evidence: { type: Type.STRING }
                         }
                     }
                 }
             }
         });
         
         const plans = JSON.parse(response.text.trim());
         if (Array.isArray(plans)) {
             setSuggestedPlans(plans);
         }
     } catch (e) {
         console.error("AI Action Plan Error:", e);
         alert("Failed to generate action plans. Please try again.");
     } finally {
         setIsGeneratingPlans(false);
     }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-osmak-green p-4 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2"><PlusCircle size={20}/> New Registry Entry</h2>
          <button onClick={onClose}><XCircle size={24} className="hover:text-osmak-200"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-osmak-500' : 'bg-gray-200'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-bold text-lg text-gray-800">1. Context & Description</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entry Type</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setData({...data, type: 'RISK'})}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold flex items-center justify-center gap-2 ${data.type === 'RISK' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <ShieldAlert size={20}/> Risk
                  </button>
                  <button 
                    onClick={() => setData({...data, type: 'OPPORTUNITY'})}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold flex items-center justify-center gap-2 ${data.type === 'OPPORTUNITY' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <Lightbulb size={20}/> Opportunity
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date Identified</label>
                <input 
                  type="date" 
                  className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300"
                  value={data.dateIdentified}
                  onChange={e => setData({...data, dateIdentified: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Process / Function</label>
                <input type="text" className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300" value={data.process || ''} onChange={e => setData({...data, process: e.target.value})} placeholder="e.g. Document Control" />
                <div className="mt-2 text-xs text-gray-500 flex items-start gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <Info size={14} className="mt-0.5 text-gray-400 shrink-0"/>
                    <span>
                        e.g., Patient Admission, Medication Dispensing, Supply Chain Management.
                    </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source</label>
                <div className="relative">
                    <select 
                        className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300 appearance-none"
                        value={SOURCES.includes(data.source || '') ? data.source : 'Others'}
                        onChange={e => {
                            if (e.target.value === 'Others') setData({...data, source: ''});
                            else setData({...data, source: e.target.value});
                        }}
                    >
                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                {(!SOURCES.includes(data.source || '') || data.source === '') && (
                    <input 
                        type="text" 
                        className="w-full border p-2 rounded mt-2 bg-white text-gray-900 border-gray-300" 
                        placeholder="Please specify source..."
                        value={data.source || ''}
                        onChange={e => setData({...data, source: e.target.value})}
                    />
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Description</label>
                    <button 
                        onClick={handleSuggestDescription}
                        disabled={!data.process || isSuggesting}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                        title="Generate risk/opportunity description suggestions"
                    >
                        {isSuggesting ? <Loader2 size={16} className="animate-spin"/> : <Bot size={16}/>} 
                        Suggest
                    </button>
                </div>
                {suggestions.length > 0 && (
                    <div className="mb-2 space-y-2 bg-indigo-50 p-3 rounded border border-indigo-100 animate-fadeIn">
                        <p className="text-xs font-bold text-indigo-800">Suggestions (Click to apply):</p>
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => { setData({...data, description: s}); setSuggestions([]); }}
                                className="block w-full text-left text-xs p-2 bg-white border border-indigo-200 rounded hover:bg-indigo-600 hover:text-white transition"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                <textarea className="w-full border p-2 rounded h-24 bg-white text-gray-900 border-gray-300" value={data.description || ''} onChange={e => setData({...data, description: e.target.value})} placeholder="Describe the risk or opportunity..." />
              </div>
            </div>
          )}

          {step === 2 && data.type === 'RISK' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-bold text-lg text-gray-800">2. Risk Assessment</h3>
              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Potential Impact on QMS</label>
                    <button 
                        onClick={handleSuggestImpact}
                        disabled={!data.description || isSuggestingImpact}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                        title="Generate potential QMS impact suggestions"
                    >
                        {isSuggestingImpact ? <Loader2 size={16} className="animate-spin"/> : <Bot size={16}/>} 
                        Suggest
                    </button>
                </div>
                {impactSuggestions.length > 0 && (
                    <div className="mb-2 space-y-2 bg-indigo-50 p-3 rounded border border-indigo-100 animate-fadeIn">
                        <p className="text-xs font-bold text-indigo-800">Suggestions (Click to apply):</p>
                        {impactSuggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => { setData({...data, impactQMS: s}); setImpactSuggestions([]); }}
                                className="block w-full text-left text-xs p-2 bg-white border border-indigo-200 rounded hover:bg-indigo-600 hover:text-white transition"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                <textarea className="w-full border p-2 rounded h-20 bg-white text-gray-900 border-gray-300" value={data.impactQMS || ''} onChange={e => setData({...data, impactQMS: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Likelihood (1-5)</label>
                    <input type="range" min="1" max="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-osmak-600" value={data.likelihood || 1} onChange={e => updateRisk(parseInt(e.target.value), data.severity || 1)} />
                    <div className="text-xs text-gray-500 mt-1 font-medium">{LIKELIHOOD_DESC[data.likelihood || 1]}</div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Severity (1-5)</label>
                    <input type="range" min="1" max="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-osmak-600" value={data.severity || 1} onChange={e => updateRisk(data.likelihood || 1, parseInt(e.target.value))} />
                    <div className="text-xs text-gray-500 mt-1 font-medium">{SEVERITY_DESC[data.severity || 1]}</div>
                 </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                 <div>
                    <span className="text-gray-500 text-xs uppercase font-bold">Risk Rating</span>
                    <div className="text-2xl font-bold text-gray-800">{data.riskRating || 1}</div>
                 </div>
                 <div className="text-right">
                    <span className="text-gray-500 text-xs uppercase font-bold">Risk Level</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getRiskColor(data.riskLevel)}`}>{data.riskLevel || 'LOW'}</div>
                 </div>
              </div>

              <div className={`p-4 rounded-lg border text-sm ${
                data.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-800' :
                data.riskLevel === 'HIGH' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                data.riskLevel === 'MODERATE' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                'bg-green-50 border-green-200 text-green-800'
              }`}>
                 <strong className="block mb-1">Mandated Action Strategy:</strong>
                 {data.riskLevel === 'CRITICAL' && "Urgent Action Required. Immediate mitigation and Top Management attention."}
                 {data.riskLevel === 'HIGH' && "Action Needed. Detailed mitigation plan required."}
                 {data.riskLevel === 'MODERATE' && "Action Plan Required. Detailed mitigation or monitoring plan required."}
                 {data.riskLevel === 'LOW' && "Action Plan Required. Detailed mitigation or monitoring plan required."}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Existing Controls</label>
                <textarea className="w-full border p-2 rounded h-20 bg-white text-gray-900 border-gray-300" value={data.existingControls || ''} onChange={e => setData({...data, existingControls: e.target.value})} placeholder="What is currently in place?" />
                <div className="mt-2 text-xs text-gray-500 flex items-start gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <Info size={14} className="mt-0.5 text-gray-400 shrink-0"/>
                    <span>
                        Examples: Standard Operating Procedures (SOPs), Staff Training, Equipment Maintenance, Regular Audits, Quality Checks, Insurance, Contingency Plans.
                    </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && data.type === 'OPPORTUNITY' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-bold text-lg text-gray-800">2. Opportunity Assessment</h3>
              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Expected Benefit</label>
                    <button 
                        onClick={handleSuggestBenefit}
                        disabled={!data.description || isSuggestingBenefit}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                        title="Generate expected benefit suggestions"
                    >
                        {isSuggestingBenefit ? <Loader2 size={16} className="animate-spin"/> : <Bot size={16}/>} 
                        Suggest
                    </button>
                </div>
                {benefitSuggestions.length > 0 && (
                    <div className="mb-2 space-y-2 bg-indigo-50 p-3 rounded border border-indigo-100 animate-fadeIn">
                        <p className="text-xs font-bold text-indigo-800">Suggestions (Click to apply):</p>
                        {benefitSuggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => { setData({...data, expectedBenefit: s}); setBenefitSuggestions([]); }}
                                className="block w-full text-left text-xs p-2 bg-white border border-indigo-200 rounded hover:bg-indigo-600 hover:text-white transition"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                <textarea className="w-full border p-2 rounded h-24 bg-white text-gray-900 border-gray-300" value={data.expectedBenefit || ''} onChange={e => setData({...data, expectedBenefit: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Feasibility</label>
                <select className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300" value={data.feasibility || 'MEDIUM'} onChange={e => setData({...data, feasibility: e.target.value as any})}>
                    <option value="LOW">Low - Hard to implement</option>
                    <option value="MEDIUM">Medium - Manageable</option>
                    <option value="HIGH">High - Easy win</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
               <div className="flex justify-between items-center">
                   <h3 className="font-bold text-lg text-gray-800">3. Action Planning</h3>
                   <button 
                       onClick={handleGenerateActionPlans}
                       disabled={isGeneratingPlans || !data.description}
                       className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                       title="Generate action plan suggestions"
                   >
                       {isGeneratingPlans ? <Loader2 size={16} className="animate-spin"/> : <Bot size={16}/>}
                       Suggest Plans
                   </button>
               </div>
               
               {isMandatoryAction ? (
                   <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4 flex items-center gap-2">
                      <Info size={16} /> Action Plan is <strong>MANDATORY</strong> for this entry.
                   </div>
               ) : (
                   <div className="bg-gray-50 text-gray-600 p-3 rounded text-sm mb-4">
                      Action Plan is optional for Low/Moderate risks, but recommended.
                   </div>
               )}

               <div className="space-y-3">
                  {data.actionPlans?.map((plan, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-start animate-fadeIn">
                          <div>
                              <span className="text-xs font-bold uppercase text-gray-500">{plan.strategy}</span>
                              <p className="font-medium text-sm text-gray-900">{plan.description}</p>
                              <p className="text-xs text-gray-500 mt-1">By {plan.responsiblePerson} on {plan.targetDate}</p>
                          </div>
                          <button onClick={() => removeActionPlan(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </div>
                  ))}
               </div>

               <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Add Action Plan</h4>

                  {/* Suggestions Area */}
                   {suggestedPlans.length > 0 && (
                       <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 animate-fadeIn mb-4">
                           <div className="flex justify-between items-center mb-3">
                               <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                                   <Sparkles size={16}/> Suggested Plans
                               </h4>
                               <button 
                                   onClick={() => setSuggestedPlans([])}
                                   className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                               >
                                   <XCircle size={14}/> Dismiss
                               </button>
                           </div>
                           <p className="text-xs text-purple-700 mb-3">Click on a plan to populate the editor below.</p>
                           <div className="space-y-2">
                               {suggestedPlans.map((plan, i) => (
                                   <div 
                                       key={i}
                                       onClick={() => {
                                           setNewPlan(prev => ({
                                               ...prev,
                                               strategy: plan.strategy || '',
                                               description: plan.description || '',
                                               evidence: plan.evidence || '',
                                           }));
                                       }}
                                       className="bg-white p-3 rounded border border-purple-100 cursor-pointer hover:border-purple-400 hover:shadow-md transition group"
                                   >
                                       <div className="flex justify-between">
                                           <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{plan.strategy}</span>
                                           <span className="text-xs text-purple-400 group-hover:text-purple-600 font-bold">Apply & Edit →</span>
                                       </div>
                                       <p className="text-sm font-medium text-gray-800 mt-1">{plan.description}</p>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}

                  <div className="space-y-3">
                     <div>
                        <select 
                            className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 text-sm"
                            value={newPlan.strategy}
                            onChange={e => setNewPlan({...newPlan, strategy: e.target.value})}
                        >
                            <option value="">Select Strategy...</option>
                            {Object.keys(strategies).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {newPlan.strategy && (
                            <div className="text-xs text-gray-500 mt-1 p-2 bg-white rounded border">
                                <strong>{strategies[newPlan.strategy].desc}</strong> <br/>
                                <em className="text-gray-400">Ex: {strategies[newPlan.strategy].ex}</em>
                            </div>
                        )}
                     </div>
                     <textarea 
                        className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 text-sm" 
                        placeholder="Describe the action..." 
                        value={newPlan.description}
                        onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                     />
                     <input 
                        className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 text-sm" 
                        placeholder="Verification / Evidence (e.g. Photo)" 
                        value={newPlan.evidence}
                        onChange={e => setNewPlan({...newPlan, evidence: e.target.value})}
                     />
                     <div className="grid grid-cols-2 gap-2">
                        <input 
                            className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 text-sm" 
                            placeholder="Responsible" 
                            value={newPlan.responsiblePerson}
                            onChange={e => setNewPlan({...newPlan, responsiblePerson: e.target.value})}
                        />
                        <input 
                            type="date"
                            className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 text-sm" 
                            value={newPlan.targetDate}
                            onChange={e => setNewPlan({...newPlan, targetDate: e.target.value})}
                        />
                     </div>
                     <button 
                        onClick={addActionPlan}
                        disabled={!newPlan.description || !newPlan.strategy}
                        className="w-full bg-osmak-600 text-white py-2 rounded text-sm font-bold hover:bg-osmak-700 disabled:opacity-50"
                     >
                        + Add to List
                     </button>
                  </div>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fadeIn text-center">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
               </div>
               <h3 className="font-bold text-xl text-gray-900">Ready to Submit?</h3>
               <p className="text-gray-600">Please review your details. Once submitted, it will be available for IQA review.</p>
               <div className="bg-gray-50 p-4 rounded text-left text-sm space-y-2">
                  <p><strong>Type:</strong> {data.type}</p>
                  <p><strong>Description:</strong> {data.description}</p>
                  <p><strong>Actions Planned:</strong> {data.actionPlans?.length}</p>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-between">
          {step > 1 && <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded">Back</button>}
          {step < 4 ? (
            <button onClick={handleNext} className="ml-auto px-6 py-2 bg-osmak-700 text-white rounded font-bold hover:bg-osmak-800">Next</button>
          ) : (
            <button 
                onClick={() => onSave(data)} 
                disabled={!canSubmit}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {canSubmit ? 'Submit Entry' : 'Action Plan Required'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <header className="md:hidden sticky top-0 left-0 right-0 h-16 bg-[#009a3e] flex items-center justify-between px-4 z-40 shadow-md">
    <div className="flex items-center gap-3">
      <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="h-10 w-10 object-contain" />
      <div>
        <h1 className="text-sm font-extrabold tracking-wide uppercase leading-tight">OSPITAL NG MAKATI</h1>
        <span className="text-[0.65rem] font-medium tracking-wider text-green-50 opacity-90 block">Risk & Opportunities Registry</span>
      </div>
    </div>
    <button 
      onClick={onMenuClick}
      className="p-1.5 border-2 border-green-400 rounded hover:bg-green-700 transition text-white"
    >
      <Menu size={24} />
    </button>
  </header>
);

type AppView = 'DASHBOARD' | 'RO_LIST' | 'IQA_PENDING' | 'IQA_ANALYSIS';

const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);
  const [selectedAuditTrailItem, setSelectedAuditTrailItem] = useState<RegistryItem | null>(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSectionsOpen, setIsSectionsOpen] = useState(false);
  const [closedFilterSection, setClosedFilterSection] = useState('');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [sortField, setSortField] = useState<'dateIdentified' | 'riskLevel' | 'status' | 'createdAt'>('dateIdentified');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [analysisStartDate, setAnalysisStartDate] = useState(new Date().getFullYear() + '-01-01');
  const [analysisEndDate, setAnalysisEndDate] = useState(new Date().getFullYear() + '-12-31');

  const [listFilterYear, setListFilterYear] = useState<string>('ALL');
  const [listFilterStatus, setListFilterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [listFilterType, setListFilterType] = useState<'ALL' | 'RISK' | 'OPPORTUNITY'>('ALL');
  
  const [searchQuery, setSearchQuery] = useState('');

  const displayIdMap = useMemo(() => getDisplayIds(items), [items]);

  const availableYears = useMemo(() => {
    const years = new Set(
        items
            .filter(i => i.dateIdentified)
            .map(i => i.dateIdentified.split('-')[0])
    );
    return Array.from(years).sort().reverse();
  }, [items]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('registry_items').select('*');
      if (error) throw error;
      if (data) {
        const mappedItems = data.map(mapFromDb);
        setItems(mappedItems);
        
        // Sync currently selected items if they are open, to reflect realtime changes
        setSelectedItem(prev => {
           if (!prev) return null;
           const match = mappedItems.find(i => i.id === prev.id);
           return match ? match : prev;
        });

        setSelectedAuditTrailItem(prev => {
           if (!prev) return null;
           const match = mappedItems.find(i => i.id === prev.id);
           return match ? match : prev;
        });

        setDbConnected(true);
      }
    } catch (err) {
      console.error('Supabase connection error:', err);
      setDbConnected(false);
      setItems([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
        fetchData();
        
        const channel = supabase
          .channel('registry_db_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'registry_items' },
            (payload) => {
              console.log('Realtime change detected:', payload);
              fetchData();
            }
          )
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }
  }, [user, fetchData]);

  const handleCreate = async (newItem: Partial<RegistryItem>) => {
    const initialEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      event: 'Entry Created',
      user: newItem.section || 'System',
    };

    const item: RegistryItem = {
      ...newItem as RegistryItem,
      id: `${newItem.type === 'RISK' ? 'R' : 'O'}-${Date.now().toString().slice(-6)}`,
      status: 'IMPLEMENTATION',
      createdAt: new Date().toISOString().split('T')[0],
      riskLevel: newItem.type === 'RISK' ? calculateRiskLevel(newItem.likelihood || 1, newItem.severity || 1) : undefined,
      auditTrail: [initialEvent]
    };

    try {
        const { error } = await supabase.from('registry_items').insert(mapToDb(item));
        if (error) throw error;
        setItems(prev => [item, ...prev]);
        setIsWizardOpen(false);
        // Backup to Google Sheets
        backupToGoogleSheets(item);
    } catch (err) {
        alert("Failed to save to database. Please check connection.");
        console.error(err);
    }
  };

  const handleUpdate = async (updatedItem: RegistryItem) => {
    try {
        const { error } = await supabase.from('registry_items').update(mapToDb(updatedItem)).eq('id', updatedItem.id);
        if (error) throw error;
        setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
        setSelectedItem(updatedItem);
        // Backup to Google Sheets
        backupToGoogleSheets(updatedItem);
    } catch (err) {
        alert("Update failed.");
        console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
      try {
          const { error } = await supabase.from('registry_items').delete().eq('id', id);
          if (error) throw error;
          setItems(prev => prev.filter(i => i.id !== id));
          setSelectedItem(null);
      } catch (err) {
          alert("Delete failed.");
          console.error(err);
      }
  }

  const exportCSV = (data: RegistryItem[], filename: string) => {
    const headers = [
        'No.',
        'Process / Function',
        'Source',
        'Type (Risk / Opportunity)',
        'Description of Risk / Opportunity',
        'Potential Impact on QMS',
        'Likelihood (1–5)',
        'Severity (1–5)',
        'Risk Rating (L×S)',
        'Risk Level',
        'Existing Controls / Mitigation',
        'Actions Plan (describe the action)',
        'Responsible Person',
        'Target Date',
        'Verification / Evidence',
        'Status (Open/Closed)',
        'Date of Re-Assessment',
        'Residual Likelihood (1–5)',
        'Residual Severity (1–5)',
        'Residual Risk Rating (L×S)',
        'Residual Risk Level',
        'Remarks on Effectiveness'
    ];

    const formatCell = (value: any) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        const escapedValue = stringValue.replace(/"/g, '""');
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
             return `"${escapedValue}"`;
        }
        return stringValue;
    };

    const rows = data.map(item => {
        const actionPlansCombinedDesc = item.actionPlans.map(p => `${p.strategy}: ${p.description}`).join('; ');
        const responsiblePersons = item.actionPlans.map(p => p.responsiblePerson).join('; ');
        const targetDates = item.actionPlans.map(p => p.targetDate).join('; ');
        const evidences = item.actionPlans.map(p => p.evidence).join('; ');

        const rowData = [
            displayIdMap[item.id] || item.id,
            item.process,
            item.source,
            item.type,
            item.description,
            item.type === 'RISK' ? item.impactQMS : '', // Potential Impact on QMS
            item.likelihood,
            item.severity,
            item.riskRating,
            item.riskLevel,
            item.existingControls,
            actionPlansCombinedDesc,
            responsiblePersons,
            targetDates,
            evidences,
            item.status === 'CLOSED' ? 'Closed' : 'Open',
            item.reassessmentDate,
            item.residualLikelihood,
            item.residualSeverity,
            item.residualRiskRating,
            item.residualRiskLevel,
            item.effectivenessRemarks
        ];
        
        return rowData.map(val => formatCell(val || '')).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


  const handleSort = (field: 'dateIdentified' | 'riskLevel' | 'status' | 'createdAt') => {
      if (sortField === field) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortField(field);
          setSortDirection('desc');
      }
  };

  const sortItems = (data: RegistryItem[]) => {
      return [...data].sort((a, b) => {
          let valA: any = a[sortField];
          let valB: any = b[sortField];
          
          if (sortField === 'riskLevel') {
              const levels = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'CRITICAL': 4 };
              valA = levels[a.riskLevel || 'LOW'] || 0;
              valB = levels[b.riskLevel || 'LOW'] || 0;
          }
          
          if (sortField === 'createdAt') {
              valA = a.createdAt;
              valB = b.createdAt;
          }

          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
      });
  };

  const isIQA = IQA_USERS.includes(user || '');
  const activeSection = isIQA && selectedSection ? selectedSection : user;
  
  const contextItems = useMemo(() => {
     if (isIQA && !selectedSection) return items;
     return items.filter(i => i.section === activeSection);
  }, [items, isIQA, selectedSection, activeSection]);

  const highRisks = contextItems.filter(i => i.type === 'RISK' && (i.riskLevel === 'HIGH' || i.riskLevel === 'CRITICAL') && i.status !== 'CLOSED');
  const openRisks = contextItems.filter(i => i.type === 'RISK' && i.status !== 'CLOSED');
  const openOpps = contextItems.filter(i => i.type === 'OPPORTUNITY' && i.status !== 'CLOSED');
  
  const allOpenRisks = items.filter(i => i.type === 'RISK' && i.status !== 'CLOSED');
  const allOpenOpps = items.filter(i => i.type === 'OPPORTUNITY' && i.status !== 'CLOSED');

  const pendingIQA = items.filter(i => 
    (i.status === 'IMPLEMENTATION' && i.actionPlans.some(ap => ap.status === 'FOR_VERIFICATION')) ||
    (i.status === 'IQA_VERIFICATION')
  );
  
  const filteredROList = useMemo(() => {
    return contextItems.filter(item => {
        if (listFilterYear !== 'ALL' && (!item.dateIdentified || !item.dateIdentified.startsWith(listFilterYear))) return false;
        if (listFilterStatus === 'OPEN' && item.status === 'CLOSED') return false;
        if (listFilterStatus === 'CLOSED' && item.status !== 'CLOSED') return false;
        if (listFilterType !== 'ALL' && item.type !== listFilterType) return false;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const displayId = (displayIdMap[item.id] || item.id).toLowerCase();
            const matchesId = displayId.includes(query);
            const matchesDesc = item.description.toLowerCase().includes(query);
            const matchesProcess = (item.process || '').toLowerCase().includes(query);
            const matchesSource = (item.source || '').toLowerCase().includes(query);
            const matchesSection = item.section.toLowerCase().includes(query);
            const matchesLevel = (item.riskLevel || '').toLowerCase().includes(query);
            
            return matchesId || matchesDesc || matchesProcess || matchesSource || matchesSection || matchesLevel;
        }

        return true;
    });
  }, [contextItems, listFilterYear, listFilterStatus, listFilterType, searchQuery, displayIdMap]);

  const renderTable = (data: RegistryItem[], showDays = false, isClosed = false, type: EntryType | 'BOTH' = 'RISK', maxHeight?: string) => {
    const sortedData = sortItems(data);
    
    return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col`}>
      {view === 'DASHBOARD' && !isClosed && type === 'RISK' && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b shrink-0">
              <h3 className="font-bold text-gray-700">Open Risks</h3>
              <button onClick={() => exportCSV(data, 'Open_Risks')} className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                  <Download size={14}/> CSV
              </button>
          </div>
      )}

      <div className={`overflow-x-auto ${maxHeight ? `${maxHeight} overflow-y-auto` : ''}`}>
        <table className="w-full text-left text-sm relative">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b sticky top-0 z-10 shadow-sm">
            <tr>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                onClick={() => handleSort('createdAt')}
              >
                  <div className="flex items-center gap-1">Ref # <ArrowUpDown size={14} className={sortField === 'createdAt' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                  onClick={() => handleSort('dateIdentified')}
              >
                  <div className="flex items-center gap-1">Date <ArrowUpDown size={14} className={sortField === 'dateIdentified' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              {isIQA && (
                 <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap">
                    Section
                 </th>
              )}
              <th className="px-6 py-4 w-1/3 min-w-[200px]">Description</th>
              <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                  onClick={() => handleSort('status')}
              >
                  <div className="flex items-center gap-1">Status <ArrowUpDown size={14} className={sortField === 'status' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              {type === 'BOTH' ? (
                <th className="px-6 py-4 whitespace-nowrap">Type</th>
              ) : null}
              <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                  onClick={() => handleSort('riskLevel')}
              >
                  <div className="flex items-center gap-1">Level / Feasibility <ArrowUpDown size={14} className={sortField === 'riskLevel' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              {showDays && <th className="px-6 py-4 whitespace-nowrap">Target</th>}
              <th className="px-6 py-4 text-center whitespace-nowrap">History</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedData.length === 0 ? (
                <tr><td colSpan={isIQA ? 9 : 8} className="px-6 py-8 text-center text-gray-400 italic">No records found.</td></tr>
            ) : sortedData.map(item => {
              const days = getDaysRemaining(item);
              const refId = displayIdMap[item.id] || item.id;
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition group">
                  <td onClick={() => setSelectedItem(item)} className="px-6 py-4 font-mono text-xs text-gray-500 font-bold cursor-pointer group-hover:text-gray-800 align-top">
                      {refId}
                  </td>
                  <td onClick={() => setSelectedItem(item)} className="px-6 py-4 text-gray-600 text-xs cursor-pointer align-top whitespace-nowrap">
                      {item.dateIdentified}
                      <div className="text-[10px] text-gray-300 mt-0.5">DATE</div>
                  </td>
                  {isIQA && (
                     <td onClick={() => setSelectedItem(item)} className="px-6 py-4 text-xs text-gray-600 align-top">
                        {item.section}
                     </td>
                  )}
                  <td onClick={() => setSelectedItem(item)} className="px-6 py-4 font-medium text-gray-800 text-sm cursor-pointer align-top">{item.description}</td>
                  <td onClick={() => setSelectedItem(item)} className="px-6 py-4 cursor-pointer align-top">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${getPillColor(item.status)}`}>
                      {formatStatus(item.status)}
                    </span>
                  </td>
                  {type === 'BOTH' ? (
                    <td onClick={() => setSelectedItem(item)} className="px-6 py-4 cursor-pointer align-top">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'RISK' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.type}
                      </span>
                    </td>
                  ) : null}
                  <td onClick={() => setSelectedItem(item)} className="px-6 py-4 cursor-pointer align-top">
                     {item.type === 'RISK' ? (
                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelPillColor(item.riskLevel)}`}>{item.riskLevel}</span>
                     ) : (
                        <span className="text-green-600 font-bold text-xs">{item.feasibility}</span>
                     )}
                  </td>
                  {showDays && (
                      <td onClick={() => setSelectedItem(item)} className="px-6 py-4 cursor-pointer align-top whitespace-nowrap">
                          {days ? (
                              <div className="flex flex-col">
                                  <span className={`text-xs font-bold ${days.days < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                      {days.days < 0 ? `${Math.abs(days.days)} days late` : days.days === 0 ? 'Due today' : `${days.days} days left`}
                                  </span>
                              </div>
                          ) : (
                              <span className="text-gray-300 text-xs">-</span>
                          )}
                      </td>
                  )}
                  <td className="px-6 py-4 text-center align-top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAuditTrailItem(item);
                      }}
                      className="text-gray-300 hover:text-gray-600 transition-colors p-1"
                      title="View Audit Trail"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </td>
                  <td onClick={() => setSelectedItem(item)} className="px-6 py-4 text-right cursor-pointer align-top">
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )};

  const DonutChart = ({ title, data, colors }: DonutChartProps) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    let currentAngle = 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-600 mb-4 w-full text-left">{title}</h3>
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {Object.entries(data).map(([key, value]) => {
                        if (value === 0) return null;
                        const percentage = value / total;
                        const angle = percentage * 360;
                        const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                        
                        const largeArcFlag = percentage > 0.5 ? 1 : 0;
                        
                        const pathData = total === value 
                            ? `M 50 10 A 40 40 0 1 1 49.99 10`
                            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        const slice = (
                            <path
                                key={key}
                                d={pathData}
                                fill={colors[key] || '#ccc'}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                        currentAngle += angle;
                        return slice;
                    })}
                    {total === 0 && (
                        <circle cx="50" cy="50" r="40" fill="#f3f4f6" />
                    )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{total}</span>
                        <span className="text-[10px] text-gray-400 uppercase">Total</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 w-full space-y-2">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[key] }}></span>
                            <span className="text-gray-600">{key}</span>
                        </div>
                        <span className="font-bold text-gray-800">{value} ({total > 0 ? Math.round((value/total)*100) : 0}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const RiskHeatmap = ({ items }: { items: RegistryItem[] }) => {
      const matrix = Array(5).fill(0).map(() => Array(5).fill(0));
      
      items.filter(i => i.type === 'RISK').forEach(item => {
          if (item.likelihood && item.severity) {
              const row = 5 - item.likelihood;
              const col = item.severity - 1;
              matrix[row][col]++;
          }
      });

      const getCellColor = (l: number, s: number, count: number) => {
          const rating = l * s;
          let baseColor = '';
          if (rating >= 16) baseColor = 'bg-red-100 text-red-800 border-red-200';
          else if (rating >= 11) baseColor = 'bg-orange-100 text-orange-800 border-orange-200';
          else if (rating >= 6) baseColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
          else baseColor = 'bg-green-100 text-green-800 border-green-200';

          if (count > 0) {
             if (rating >= 16) return 'bg-red-500 text-white font-bold';
             if (rating >= 11) return 'bg-orange-500 text-white font-bold';
             if (rating >= 6) return 'bg-yellow-400 text-black font-bold';
             return 'bg-green-500 text-white font-bold';
          }
          return baseColor + ' opacity-40';
      };

      return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Activity size={20}/> Risk Matrix Heatmap</h3>
              <div className="flex">
                  <div className="flex flex-col justify-between mr-4 py-8 h-64">
                      <span className="text-xs font-bold text-gray-400 -rotate-90">Likelihood</span>
                  </div>
                  <div className="flex-1">
                      <div className="grid grid-rows-5 gap-1 h-64">
                          {[5, 4, 3, 2, 1].map((likelihood, rowIndex) => (
                              <div key={likelihood} className="grid grid-cols-5 gap-1">
                                  {[1, 2, 3, 4, 5].map((severity, colIndex) => {
                                      const count = matrix[rowIndex][colIndex];
                                      return (
                                          <div 
                                              key={`${likelihood}-${severity}`} 
                                              className={`rounded flex items-center justify-center text-sm transition hover:opacity-100 cursor-default ${getCellColor(likelihood, severity, count)}`}
                                              title={`L:${likelihood} x S:${severity} = ${likelihood * severity}`}
                                          >
                                              {count > 0 && count}
                                          </div>
                                      );
                                  })}
                              </div>
                          ))}
                      </div>
                      <div className="grid grid-cols-5 mt-2 text-center text-xs font-bold text-gray-400">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                      </div>
                      <div className="text-center mt-1 text-xs font-bold text-gray-400">Severity</div>
                  </div>
              </div>
          </div>
      )
  }

  const renderAnalysisDashboard = () => {
    const filteredItems = items.filter(i => {
       const dateToCheck = i.closedAt || i.createdAt;
       return dateToCheck >= analysisStartDate && dateToCheck <= analysisEndDate;
    });

    const totalRisks = filteredItems.filter(i => i.type === 'RISK').length;
    const totalOpps = filteredItems.filter(i => i.type === 'OPPORTUNITY').length;

    const totalOpenRisks = filteredItems.filter(i => i.type === 'RISK' && i.status !== 'CLOSED').length;
    const totalOpenOpps = filteredItems.filter(i => i.type === 'OPPORTUNITY' && i.status !== 'CLOSED').length;

    const totalClosedRisks = filteredItems.filter(i => i.type === 'RISK' && i.status === 'CLOSED').length;
    const totalClosedOpps = filteredItems.filter(i => i.type === 'OPPORTUNITY' && i.status === 'CLOSED').length;

    const closedRisksBySection: Record<string, number> = {};
    SECTIONS.filter(s => !s.startsWith('IQA')).forEach(s => closedRisksBySection[s] = 0);

    filteredItems.filter(i => i.type === 'RISK' && i.status === 'CLOSED').forEach(i => {
       if (closedRisksBySection[i.section] !== undefined) {
           closedRisksBySection[i.section]++;
       }
    });

    const maxClosed = Math.max(...Object.values(closedRisksBySection), 1);

    const riskLevelData = {
        'Low': filteredItems.filter(i => i.type === 'RISK' && i.riskLevel === 'LOW').length,
        'Moderate': filteredItems.filter(i => i.type === 'RISK' && i.riskLevel === 'MODERATE').length,
        'High': filteredItems.filter(i => i.type === 'RISK' && i.riskLevel === 'CRITICAL').length, // CRITICAL and HIGH for better distribution
        'Critical': filteredItems.filter(i => i.type === 'RISK' && i.riskLevel === 'HIGH').length
    };

    const sourceData: Record<string, number> = {};
    filteredItems.forEach(i => {
        const src = i.source || 'Unspecified';
        sourceData[src] = (sourceData[src] || 0) + 1;
    });

    const sortedSources = Object.entries(sourceData).sort((a,b) => b[1] - a[1]);
    const topSources = sortedSources.slice(0, 5);
    const otherSourcesCount = sortedSources.slice(5).reduce((acc, curr) => acc + curr[1], 0);
    const finalSourceData: Record<string, number> = {};
    topSources.forEach(([k,v]) => finalSourceData[k] = v);
    if (otherSourcesCount > 0) finalSourceData['Others'] = otherSourcesCount;


    return (
       <div className="space-y-8 animate-fadeIn">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
             <div className="flex items-center gap-2 text-osmak-green-dark font-bold mb-1"><Filter size={20}/> Date Filter</div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">From</label>
                <input type="date" className="border rounded p-2 text-sm bg-white text-gray-900" value={analysisStartDate} onChange={e => setAnalysisStartDate(e.target.value)} />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">To</label>
                <input type="date" className="border rounded p-2 text-sm bg-white text-gray-900" value={analysisEndDate} onChange={e => setAnalysisEndDate(e.target.value)} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Total Risks Recorded</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{totalRisks}</p>
                        <p className="text-xs text-gray-400 mt-1">Open + Closed</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600"><Layers size={24}/></div>
                  </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Active Open Risks</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">{totalOpenRisks}</p>
                        <p className="text-xs text-gray-400 mt-1">Requiring action/monitoring</p>
                    </div>
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><ShieldAlert size={24}/></div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Closed Risks</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{totalClosedRisks}</p>
                        <p className="text-xs text-gray-400 mt-1">Successfully treated</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 size={24}/></div>
                  </div>
              </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Total Opportunities</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{totalOpps}</p>
                        <p className="text-xs text-gray-400 mt-1">Open + Closed</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600"><Layers size={24}/></div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Active Opportunities</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{totalOpenOpps}</p>
                        <p className="text-xs text-gray-400 mt-1">In progress</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Lightbulb size={24}/></div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Closed Opportunities</p>
                        <p className="text-3xl font-bold text-teal-600 mt-2">{totalClosedOpps}</p>
                        <p className="text-xs text-gray-400 mt-1">Realized/Concluded</p>
                    </div>
                    <div className="bg-teal-100 p-2 rounded-lg text-teal-600"><CheckCircle2 size={24}/></div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DonutChart 
                  title="Risk Level Distribution"
                  data={riskLevelData}
                  colors={{
                      'Low': '#4ade80',
                      'Moderate': '#facc15',
                      'High': '#fb923c',
                      'Critical': '#ef4444'
                  }}
              />

              <DonutChart 
                  title="Entries by Source"
                  data={finalSourceData}
                  colors={{
                      'Internal Audit': '#60a5fa',
                      'Incidents': '#f87171',
                      'Complaints': '#fbbf24',
                      'Nonconformities': '#a78bfa',
                      'Others': '#9ca3af'
                  }}
              />

              <RiskHeatmap items={filteredItems} />
          </div>

          {isIQA && !selectedSection && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><BarChart3 size={20}/> Closed Risks by Section</h3>
                <div className="space-y-3">
                    {Object.entries(closedRisksBySection).map(([sec, count]) => (
                    <div key={sec} className="flex items-center gap-4 text-sm">
                        <div className="w-64 text-right font-medium text-gray-600 truncate" title={sec}>{sec}</div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                            <div 
                                className="h-full bg-osmak-green rounded-full transition-all duration-500 flex items-center justify-end px-2 text-white font-bold text-xs"
                                style={{ width: `${(count / maxClosed) * 100}%` }}
                            >
                                {count > 0 && count}
                            </div>
                        </div>
                        <div className="w-8 font-bold text-gray-700">{count}</div>
                    </div>
                    ))}
                </div>
            </div>
          )}
       </div>
    );
  };

  const handleViewChange = (newView: AppView) => {
    setView(newView);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  const handleSectionSelect = (s: string) => {
    setSelectedSection(s);
    setView('DASHBOARD');
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  }

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-900">
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#009a3e] flex items-center justify-between px-4 z-40 shadow-md">
         <div className="flex items-center gap-2">
            <img 
               src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" 
               alt="Logo" 
               className="h-8 w-auto object-contain"
            />
            <div className="flex flex-col">
               <span className="text-white font-bold text-sm tracking-wide uppercase">Ospital ng Makati</span>
               <span className="text-white text-[0.65rem] opacity-90 tracking-wide">Risk & Opportunities Registry</span>
            </div>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>


      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`w-72 bg-white text-gray-800 flex flex-col shadow-2xl z-50 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarHeader onClose={() => setIsMobileMenuOpen(false)} />
        
        <div className="p-6 border-b border-gray-200 bg-gray-50">
           <div className="text-xs uppercase text-gray-500 font-bold mb-1">Logged in as</div>
           <div className="font-bold text-lg truncate text-osmak-green-dark">{user}</div>
           {isIQA && !selectedSection && <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded text-white mt-1 inline-block">IQA</span>}
           {selectedSection && <button onClick={() => { setSelectedSection(null); handleViewChange('DASHBOARD'); }} className="text-xs text-yellow-600 underline mt-2 hover:text-yellow-700">Exit Section View</button>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <button 
             onClick={() => handleViewChange('DASHBOARD')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'DASHBOARD' ? 'bg-osmak-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          {(!isIQA || selectedSection) ? (
             <>
                <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase px-4">Registries</div>
                <button 
                    onClick={() => handleViewChange('RO_LIST')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'RO_LIST' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> R&O List
                </button>
                <button 
                    onClick={() => handleViewChange('IQA_ANALYSIS')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'IQA_ANALYSIS' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <BarChart3 size={20} /> Data Analysis
                </button>
             </>
          ) : (
             <>
                <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase px-4">IQA Overview</div>
                <button 
                    onClick={() => handleViewChange('IQA_PENDING')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'IQA_PENDING' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> Pending Tasks
                    {pendingIQA.length > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full ml-auto">{pendingIQA.length}</span>}
                </button>
                <button 
                    onClick={() => handleViewChange('RO_LIST')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'RO_LIST' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> R&O List
                </button>
                
                <button 
                    onClick={() => handleViewChange('IQA_ANALYSIS')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'IQA_ANALYSIS' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <BarChart3 size={20} /> Data Analysis
                </button>

                <button 
                    onClick={() => setIsSectionsOpen(!isSectionsOpen)}
                    className="w-full flex items-center justify-between pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase hover:text-gray-600 transition group"
                >
                    <span>Hospital Sections</span>
                    {isSectionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {isSectionsOpen && (
                    <div className="space-y-1 animate-fadeIn">
                        {SECTIONS.filter(s => !s.startsWith('IQA')).map(s => (
                            <button 
                                key={s}
                                onClick={() => handleSectionSelect(s)}
                                className={`w-full flex items-start text-left gap-3 px-4 py-2 rounded-lg transition text-sm ${selectedSection === s ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Building2 size={16} className="shrink-0 mt-0.5" /> <span>{s}</span>
                            </button>
                        ))}
                    </div>
                )}
             </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button 
                onClick={() => setUser(null)} 
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
            >
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>


      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pt-20 md:pt-8 bg-[#F8FAFC]">
        <header className="flex justify-between items-center mb-8">
           <div>
              <h2 className="text-2xl font-bold text-gray-900">
                  {view === 'DASHBOARD' ? 'Dashboard' : 
                   view === 'RO_LIST' ? 'R&O Registry List' :
                   view.replace(/_/g, ' ')}
              </h2>
              {selectedSection && <p className="text-sm text-gray-500 mt-1">Viewing as: <span className="font-bold">{selectedSection}</span></p>}
           </div>
           
           <div className="flex items-center gap-2">
                <button 
                    onClick={fetchData}
                    className="p-2 text-gray-500 hover:text-osmak-green hover:bg-green-50 rounded-full transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>

               {(!isIQA || selectedSection) && (
                 <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition transform hover:-translate-y-0.5"
                 >
                    <PlusCircle size={18} /> <span className="hidden sm:inline">New Entry</span>
                 </button>
               )}
           </div>
        </header>

        {loading ? (
             <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-osmak-600" size={48} /></div>
        ) : (
           <>
             {view === 'DASHBOARD' && (
                <div className="space-y-8 animate-fadeIn">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">OPEN HIGH/CRITICAL RISKS</p>
                            <p className="text-4xl font-bold text-red-500">{highRisks.length}</p>
                         </div>
                         <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                            <AlertTriangle size={20}/>
                         </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL OPEN RISKS</p>
                            <p className="text-4xl font-bold text-gray-600">{openRisks.length}</p>
                         </div>
                         <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-400">
                            <ShieldAlert size={20}/>
                         </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">OPEN OPPORTUNITIES</p>
                            <p className="text-4xl font-bold text-gray-600">{openOpps.length}</p>
                         </div>
                         <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                            <Lightbulb size={20}/>
                         </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CLOSED ITEMS</p>
                            <p className="text-4xl font-bold text-gray-600">{contextItems.filter(i => i.status === 'CLOSED').length}</p>
                         </div>
                         <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <CheckCircle2 size={20}/>
                         </div>
                      </div>
                   </div>

                   {(!isIQA || selectedSection) && (() => {
                       const upcomingRisks = openRisks
                           .map(item => ({ item, days: getDaysRemaining(item) }))
                           .filter(data => data.days !== null)
                           .sort((a, b) => a.days!.days - b.days!.days)
                           .slice(0, 4);

                       if (upcomingRisks.length > 0) {
                           return (
                               <div className="mt-8">
                                   <h3 className="font-bold text-gray-500 text-sm mb-4">Upcoming Deadlines</h3>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                       {upcomingRisks.map(({ item, days }) => (
                                           <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" onClick={() => setSelectedItem(item)}>
                                               <div className={`text-4xl font-bold ${days!.color} mb-1`}>{days!.days < 0 ? `+${Math.abs(days!.days)}` : days!.days}</div>
                                               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">DAYS REMAINING</div>
                                               
                                               <div className="mt-4 pt-4 border-t border-gray-50">
                                                   <p className="text-sm font-medium text-gray-700 truncate mb-1" title={item.description}>{item.description}</p>
                                                   <span className="font-mono text-[10px] text-gray-300 uppercase tracking-widest">{displayIdMap[item.id] || item.id}</span>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           );
                       }
                       return null;
                   })()}

                   <div className="space-y-12">
                       <div className="space-y-4">
                           <div className="flex justify-between items-end mb-2">
                               <h3 className="font-bold text-gray-500 text-sm">Open Risks</h3>
                               <button onClick={() => exportCSV(openRisks, 'Open_Risks')} className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                                  <Download size={14}/> CSV
                               </button>
                           </div>
                           {renderTable(openRisks, true, false, 'RISK', 'max-h-[350px]')}
                       </div>
                       
                       <div className="space-y-4">
                           <div className="flex justify-between items-end mb-2">
                               <h3 className="font-bold text-gray-500 text-sm">Open Opportunities</h3>
                               <button onClick={() => exportCSV(openOpps, 'Open_Opps')} className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                                  <Download size={14}/> CSV
                               </button>
                           </div>
                           {renderTable(openOpps, true, false, 'OPPORTUNITY', 'max-h-[350px]')}
                       </div>
                   </div>

                   {isIQA && selectedSection && (
                       <div className="mt-8 pt-8 border-t">
                            <details className="group">
                                <summary className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-800 font-bold">
                                    <ChevronRight className="group-open:rotate-90 transition"/> Closed Registries (Click to Expand)
                                </summary>
                                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8 pl-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <h4 className="text-sm font-bold text-gray-500">Closed Risks</h4>
                                            <button onClick={() => exportCSV(contextItems.filter(i => i.type === 'RISK' && i.status === 'CLOSED'), 'Closed_Risks')} className="text-xs font-bold text-gray-500 hover:underline">CSV</button>
                                        </div>
                                        {renderTable(contextItems.filter(i => i.type === 'RISK' && i.status === 'CLOSED'), false, true)}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <h4 className="text-sm font-bold text-gray-500">Closed Opportunities</h4>
                                            <button onClick={() => exportCSV(contextItems.filter(i => i.type === 'OPPORTUNITY' && i.status === 'CLOSED'), 'Closed_Opps')} className="text-xs font-bold text-gray-500 hover:underline">CSV</button>
                                        </div>
                                        {renderTable(contextItems.filter(i => i.type === 'OPPORTUNITY' && i.status === 'CLOSED'), false, true)}
                                    </div>
                                </div>
                            </details>
                       </div>
                   )}
                </div>
             )}

            {view === 'RO_LIST' && (
                <div className="space-y-4">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                         <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><ClipboardList size={20}/> All Risks & Opportunities</h3>
                         
                         <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                             <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search ID, Description, Section..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-osmak-green outline-none"
                                />
                             </div>

                             <div className="flex flex-wrap items-center gap-2">
                                 <select 
                                    value={listFilterYear}
                                    onChange={(e) => setListFilterYear(e.target.value)}
                                    className="border rounded px-2 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-osmak-green outline-none"
                                 >
                                    <option value="ALL">All Years</option>
                                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                 </select>

                                 <select 
                                    value={listFilterType}
                                    onChange={(e) => setListFilterType(e.target.value as any)}
                                    className="border rounded px-2 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-osmak-green outline-none"
                                 >
                                    <option value="ALL">All Types</option>
                                    <option value="RISK">Risks</option>
                                    <option value="OPPORTUNITY">Opportunities</option>
                                 </select>

                                 <select 
                                    value={listFilterStatus}
                                    onChange={(e) => setListFilterStatus(e.target.value as any)}
                                    className="border rounded px-2 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-osmak-green outline-none"
                                 >
                                    <option value="ALL">All Status</option>
                                    <option value="OPEN">Open</option>
                                    <option value="CLOSED">Closed</option>
                                 </select>

                                 <button onClick={() => exportCSV(filteredROList, 'Filtered_Registry')} className="flex items-center gap-2 bg-white border px-3 py-2 rounded shadow-sm text-sm font-bold text-gray-600 hover:bg-gray-50">
                                    <Download size={16}/> Export
                                 </button>
                            </div>
                         </div>
                     </div>
                     {renderTable(filteredROList, true, false, 'BOTH', 'max-h-[500px]')}
                </div>
            )}
             {view === 'IQA_PENDING' && (
                 <div className="space-y-4">
                     <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-indigo-800 text-sm mb-4">
                         These items require your attention for <strong>Implementation Verification</strong> or <strong>Final Verification/Closure</strong>.
                     </div>
                     {renderTable(pendingIQA, true)}
                 </div>
             )}
             {view === 'IQA_ANALYSIS' && renderAnalysisDashboard()}
           </>
        )}
      </main>

      {isWizardOpen && (
        <Wizard 
          section={user || ''} 
          onClose={() => setIsWizardOpen(false)} 
          onSave={handleCreate} 
        />
      )}
      
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          isIQA={isIQA}
          currentUser={user || ''}
          displayId={displayIdMap[selectedItem.id] || selectedItem.id}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {selectedAuditTrailItem && (
        <AuditTrailModal 
          trail={selectedAuditTrailItem.auditTrail} 
          onClose={() => setSelectedAuditTrailItem(null)} 
          itemId={displayIdMap[selectedAuditTrailItem.id] || selectedAuditTrailItem.id}
        />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);