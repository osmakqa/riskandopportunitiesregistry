
import React, { useState, useEffect } from 'react';
import { Pencil, Save, XCircle, Calendar, FileText, Activity, ClipboardCheck, AlertTriangle, Trash2, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { RegistryItem, ActionPlan } from '../../lib/types';
import { SOURCES, RISK_STRATEGIES, OPP_STRATEGIES, LIKELIHOOD_DESC, SEVERITY_DESC, CREDENTIALS } from '../../lib/constants';
import { calculateRiskLevel, getRiskColor, getStatusColor, formatStatus, getActionPillColor, addAuditEvent, getLevelPillColor } from '../../lib/utils';

interface ItemDetailModalProps { 
  item: RegistryItem, 
  isIQA: boolean, 
  currentUser: string,
  displayId: string,
  onClose: () => void, 
  onUpdate: (updated: RegistryItem) => void,
  onDelete: (id: string) => void
}

const ItemDetailModal = ({ 
  item, isIQA, currentUser, displayId, onClose, onUpdate, onDelete 
}: ItemDetailModalProps) => {
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
                placeholder="Describe the risk or opportunity... Example: Failure to verify patient ID before medication administration leading to..."
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
                   <input 
                    type="text" 
                    className="w-full border rounded p-1 bg-white text-gray-900" 
                    value={editData.process} 
                    onChange={e => setEditData({...editData, process: e.target.value})}
                    placeholder="e.g. Document Control (Patient Admission...)"
                    />
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
                        <textarea 
                            className="w-full border rounded p-2 bg-white text-gray-900" 
                            value={editData.impactQMS} 
                            onChange={e => setEditData({...editData, impactQMS: e.target.value})} 
                            placeholder="Describe potential impact... Example: Patient safety compromise..."
                        />
                     ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">{item.impactQMS}</p>
                     )}
                   </div>
                   <div>
                     <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Existing Controls / Mitigation</span>
                     {isEditing ? (
                        <textarea 
                            className="w-full border rounded p-2 bg-white text-gray-900" 
                            value={editData.existingControls} 
                            onChange={e => setEditData({...editData, existingControls: e.target.value})} 
                            placeholder="What is currently in place? Example: SOPs, Staff Training..."
                        />
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

export default ItemDetailModal;
