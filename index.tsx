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
  RefreshCw
} from 'lucide-react';

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://jtohqxhfinqjspihturh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0b2hxeGhmaW5xanNwaWh0dXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTkzNDgsImV4cCI6MjA3OTgzNTM0OH0.-XZbu74I7OtJ11tEnSUfgegGaWH0aGF0hyEXpqLJoV0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Types & Interfaces ---

type EntryType = 'RISK' | 'OPPORTUNITY';
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
// Renamed QA_VERIFICATION to IQA_VERIFICATION
type WorkflowStatus = 'IMPLEMENTATION' | 'REASSESSMENT' | 'IQA_VERIFICATION' | 'CLOSED';
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
  reassessment_date: item.reassessmentDate,
  status: item.status,
  created_at: item.createdAt,
  closed_at: item.closedAt,
  audit_trail: item.auditTrail
});

const mapFromDb = (dbItem: any): RegistryItem => {
  let trail: AuditEvent[] = typeof dbItem.audit_trail === 'string' ? JSON.parse(dbItem.audit_trail) : (dbItem.audit_trail || []);
  
  // Clone trail to avoid mutating the original if needed
  trail = [...trail];

  // Sync the first audit event (usually creation) with the database 'created_at' column
  // This allows manual DB edits to created_at to be reflected in the audit trail UI
  if (trail.length > 0 && dbItem.created_at) {
      trail[0] = { ...trail[0], timestamp: dbItem.created_at };
  }

  // Sync the last audit event with 'closed_at' if the item is closed
  if (dbItem.status === 'CLOSED' && dbItem.closed_at && trail.length > 0) {
      const lastIdx = trail.length - 1;
      const lastEvent = trail[lastIdx];
      // Only update if it looks like a closing/verifying event
      if (lastEvent.event.toLowerCase().includes('closed') || lastEvent.event.toLowerCase().includes('verified')) {
          trail[lastIdx] = { ...lastEvent, timestamp: dbItem.closed_at };
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
    residualRiskRating: dbItem.residual_risk_rating,
    residualRiskLevel: dbItem.residual_risk_level,
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
                           <li>Use <strong>"Pending Tasks"</strong> menu to see all items requiring attention.</li>
                           <li><strong>Action Plan Verification:</strong> Verify individual plans or return for revision.</li>
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
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span> 
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
        if (!ts) return '';
        const date = new Date(ts);
        // Check for invalid date
        if (isNaN(date.getTime())) return ts;
        
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
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
      {showManual && <UserManualModal onClose={() => setShowManual(false)} />}
      
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
