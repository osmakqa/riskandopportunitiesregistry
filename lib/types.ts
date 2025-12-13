
export type EntryType = 'RISK' | 'OPPORTUNITY';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type WorkflowStatus = 'IMPLEMENTATION' | 'REASSESSMENT' | 'IQA_VERIFICATION' | 'CLOSED';
export type ActionStatus = 'PENDING_APPROVAL' | 'FOR_IMPLEMENTATION' | 'REVISION_REQUIRED' | 'FOR_VERIFICATION' | 'COMPLETED';

export interface AuditEvent {
  timestamp: string;
  event: string;
  user: string;
}

export interface ActionPlan {
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

export interface RegistryItem {
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

export interface DonutChartProps {
  title: string;
  data: Record<string, number>;
  colors: Record<string, string>;
}
