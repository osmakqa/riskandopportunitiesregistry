
import { RegistryItem, AuditEvent, RiskLevel, WorkflowStatus, ActionStatus } from './types';

// Data Mapping Helpers
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
      residualRiskRating: dbItem.risk_rating, // Initial value fallback if residuals not set
      residualRiskLevel: dbItem.risk_level, // Initial value fallback
      effectivenessRemarks: dbItem.effectiveness_remarks,
      reassessmentDate: dbItem.reassessment_date,
      status: dbItem.status,
      createdAt: dbItem.created_at || new Date().toISOString(),
      closedAt: dbItem.closed_at,
      auditTrail: trail
  };
};

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

export const calculateRiskLevel = (l: number, s: number): RiskLevel => {
  const rating = l * s;
  if (rating >= 16) return 'CRITICAL';
  if (rating >= 11) return 'HIGH';
  if (rating >= 6) return 'MODERATE';
  return 'LOW';
};

// Styling Helpers
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

export const exportCSV = (data: RegistryItem[], filename: string, displayIdMap: Record<string, string>) => {
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
            item.type === 'RISK' ? item.impactQMS : '',
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
