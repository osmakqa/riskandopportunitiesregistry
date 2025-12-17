
import { RegistryItem, AuditEvent, WorkflowStatus, RiskLevel, ActionStatus } from './types';
import { GOOGLE_SHEET_SCRIPT_URL } from './constants';

export const mapToDb = (item: RegistryItem) => ({
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

export const getDisplayIds = (items: RegistryItem[]) => {
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

export const backupToGoogleSheets = async (item: RegistryItem, displayIds?: Record<string, string>) => {
  if (!GOOGLE_SHEET_SCRIPT_URL) {
    console.warn("Google Sheet Backup Skipped: No Script URL Configured");
    return;
  }
  
  // Helper to format cells consistent with CSV export logic
  const formatCell = (value: any) => {
      if (value === null || value === undefined) return '';
      return String(value);
  };

  const actionPlansCombinedDesc = item.actionPlans.map(p => `${p.strategy}: ${p.description}`).join('; ');
  const responsiblePersons = item.actionPlans.map(p => p.responsiblePerson).join('; ');
  const targetDates = item.actionPlans.map(p => p.targetDate).join('; ');
  const evidences = item.actionPlans.map(p => p.evidence).join('; ');

  // Determine Display ID (Ref No)
  // If displayIds map is not passed (e.g. immediate create), fallback to internal ID or logic needs to calculate it.
  // Ideally, backup should happen after state update where displayIds are recalculated, or we accept we use internal ID if map missing.
  const displayId = displayIds ? (displayIds[item.id] || item.id) : item.id;

  // Construct payload exactly matching CSV columns
  // Note: Keys here will become headers in Google Sheets
  const payload = {
    'No.': displayId,
    'Process / Function': formatCell(item.process),
    'Source': formatCell(item.source),
    'Type (Risk / Opportunity)': formatCell(item.type),
    'Description of Risk / Opportunity': formatCell(item.description),
    'Potential Impact on QMS': item.type === 'RISK' ? formatCell(item.impactQMS) : '',
    'Likelihood (1–5)': formatCell(item.likelihood),
    'Severity (1–5)': formatCell(item.severity),
    'Risk Rating (L×S)': formatCell(item.riskRating),
    'Risk Level': formatCell(item.riskLevel),
    'Existing Controls / Mitigation': formatCell(item.existingControls),
    'Actions Plan (describe the action)': actionPlansCombinedDesc,
    'Responsible Person': responsiblePersons,
    'Target Date': targetDates,
    'Verification / Evidence': evidences,
    'Status (Open/Closed)': item.status === 'CLOSED' ? 'Closed' : 'Open',
    'Date of Re-Assessment': formatCell(item.reassessmentDate),
    'Residual Likelihood (1–5)': formatCell(item.residualLikelihood),
    'Residual Severity (1–5)': formatCell(item.residualSeverity),
    'Residual Risk Rating (L×S)': formatCell(item.residualRiskRating),
    'Residual Risk Level': formatCell(item.residualRiskLevel),
    'Remarks on Effectiveness': formatCell(item.effectivenessRemarks),
    // Hidden System Columns for Script Identification
    'id': item.id // Keep internal ID for the script to identify row for updates
  };

  try {
    await fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
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

export const mapFromDb = (dbItem: any): RegistryItem => {
  let trail: AuditEvent[] = [];
  try {
      trail = typeof dbItem.audit_trail === 'string' ? JSON.parse(dbItem.audit_trail) : (dbItem.audit_trail || []);
  } catch (e) {
      console.error("Error parsing audit trail", e);
      trail = [];
  }

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
      actionPlans: (dbItem.action_plans || []) as any[],
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

export const addAuditEvent = (item: RegistryItem, event: string, user: string): RegistryItem => {
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

export const getPillColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'IMPLEMENTATION': return 'bg-purple-100 text-purple-800';
      case 'REASSESSMENT': return 'bg-amber-100 text-amber-800';
      case 'IQA_VERIFICATION': return 'bg-teal-100 text-teal-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

export const getActionPillColor = (status: ActionStatus) => {
  switch (status) {
    case 'FOR_IMPLEMENTATION': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'FOR_VERIFICATION': return 'bg-purple-100 text-purple-800';
    case 'REVISION_REQUIRED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export const getLevelPillColor = (level?: RiskLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

export const calculateRiskLevel = (l: number, s: number): RiskLevel => {
  const rating = l * s;
  if (rating >= 16) return 'CRITICAL';
  if (rating >= 11) return 'HIGH';
  if (rating >= 6) return 'MODERATE';
  return 'LOW';
};

export const getRiskColor = (level?: RiskLevel) => {
  switch (level) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: WorkflowStatus) => {
  switch (status) {
    case 'IMPLEMENTATION': return 'bg-purple-100 text-purple-800';
    case 'REASSESSMENT': return 'bg-amber-100 text-amber-800';
    case 'IQA_VERIFICATION': return 'bg-indigo-100 text-indigo-800';
    case 'CLOSED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const formatStatus = (status: WorkflowStatus) => {
  if (status === 'IQA_VERIFICATION') return 'IQA VERIFICATION';
  if (status === 'REASSESSMENT') return 'REASSESSMENT';
  return status.replace('_', ' ');
}

export const getDaysRemaining = (item: RegistryItem): { days: number, label: string, color: string } | null => {
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
