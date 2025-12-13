
import React, { useState } from 'react';
import { PlusCircle, XCircle, ShieldAlert, Lightbulb, ChevronDown, Loader2, Bot, Info, Sparkles, Trash2, CheckCircle2, ClipboardList } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { RegistryItem } from '../../lib/types';
import { SOURCES, RISK_STRATEGIES, OPP_STRATEGIES, LIKELIHOOD_DESC, SEVERITY_DESC } from '../../lib/constants';
import { calculateRiskLevel, getRiskColor } from '../../lib/utils';

interface WizardProps {
  section: string;
  onClose: () => void;
  onSave: (item: any) => void;
}

const Wizard = ({ section, onClose, onSave }: WizardProps) => {
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

  const [isSuggestingImpact, setIsSuggestingImpact] = useState(false);
  const [impactSuggestions, setImpactSuggestions] = useState<string[]>([]);

  const [isSuggestingBenefit, setIsSuggestingBenefit] = useState(false);
  const [benefitSuggestions, setBenefitSuggestions] = useState<string[]>([]);


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
         const prompt = `For a hospital process "${data.process}" in the "${data.section}" section, generate 3 specific and professional descriptions for a ${data.type?.toLowerCase()}. These descriptions should clearly define the ${data.type?.toLowerCase()} itself, focusing on its nature and context within the process, but *without* including any potential impacts on QMS or expected benefits. Focus on ISO 9001:2015 compliance.
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
                <input 
                    type="text" 
                    className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300" 
                    value={data.process || ''} 
                    onChange={e => setData({...data, process: e.target.value})} 
                    placeholder="e.g. Document Control (Patient Admission, Medication Dispensing, Supply Chain Management...)" 
                />
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
                <textarea 
                    className="w-full border p-2 rounded h-24 bg-white text-gray-900 border-gray-300" 
                    value={data.description || ''} 
                    onChange={e => setData({...data, description: e.target.value})} 
                    placeholder="Describe the risk or opportunity... Example: Failure to verify patient ID before medication administration leading to..." 
                />
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
                <textarea 
                    className="w-full border p-2 rounded h-20 bg-white text-gray-900 border-gray-300" 
                    value={data.impactQMS || ''} 
                    onChange={e => setData({...data, impactQMS: e.target.value})} 
                    placeholder="Describe potential impact... Example: Patient safety compromise, legal non-conformity, delay in service..."
                />
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
                <textarea 
                    className="w-full border p-2 rounded h-20 bg-white text-gray-900 border-gray-300" 
                    value={data.existingControls || ''} 
                    onChange={e => setData({...data, existingControls: e.target.value})} 
                    placeholder="What is currently in place? Example: SOPs, Staff Training, Equipment Maintenance, Regular Audits, Quality Checks..." 
                />
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
                        placeholder="Verification / Evidence. Example: Photo log, Signed attendance sheet, Certificate..." 
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
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded shadow-lg text-sm font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 animate-pulse"
                     >
                        <PlusCircle size={18}/> ADD PLAN TO LIST (REQUIRED TO PROCEED)
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

export default Wizard;
