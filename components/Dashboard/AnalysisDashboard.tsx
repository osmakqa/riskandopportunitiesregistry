
import React, { useState } from 'react';
import { Layers, ShieldAlert, CheckCircle2, Lightbulb, BarChart3, Filter } from 'lucide-react';
import { RegistryItem } from '../../lib/types';
import { SECTIONS } from '../../lib/constants';
import { DonutChart } from './DonutChart';
import { RiskHeatmap } from './RiskHeatmap';

interface AnalysisDashboardProps {
  items: RegistryItem[];
  isIQA: boolean;
  selectedSection: string | null;
}

export const AnalysisDashboard = ({ items, isIQA, selectedSection }: AnalysisDashboardProps) => {
    const [analysisStartDate, setAnalysisStartDate] = useState(new Date().getFullYear() + '-01-01');
    const [analysisEndDate, setAnalysisEndDate] = useState(new Date().getFullYear() + '-12-31');

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
