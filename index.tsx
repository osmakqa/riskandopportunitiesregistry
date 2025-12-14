
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  PlusCircle, 
  RefreshCw, 
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { RegistryItem, AuditEvent, EntryType } from './lib/types';
import { mapFromDb, mapToDb, backupToGoogleSheets, calculateRiskLevel, getDisplayIds } from './lib/utils';
import { SECTIONS, IQA_USERS } from './lib/constants';

import Login from './components/Auth/Login';
import Sidebar from './components/Layout/Sidebar';
import MobileHeader from './components/Layout/MobileHeader';
import RegistryTable from './components/Registry/RegistryTable';
import AnalysisDashboard from './components/Dashboard/AnalysisDashboard';
import Wizard from './components/Registry/Wizard';
import ItemDetailModal from './components/Registry/ItemDetailModal';
import AuditTrailModal from './components/Modals/AuditTrailModal';

// Charts and cards
import { ShieldAlert, Lightbulb, CheckCircle2, AlertTriangle, Download, Search, Layers, BarChart3, ClipboardList, ChevronRight, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { getDaysRemaining } from './lib/utils';

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
        
        // Optimistic update
        const newItems = [item, ...items];
        setItems(newItems);
        setIsWizardOpen(false);

        // Recalculate IDs for backup to ensure accuracy
        const newDisplayMap = getDisplayIds(newItems);
        
        // Backup to Google Sheets
        backupToGoogleSheets(item, newDisplayMap);
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
        
        // Backup to Google Sheets (using existing map is fine for updates as IDs don't change often)
        backupToGoogleSheets(updatedItem, displayIdMap);
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

  const isIQA = IQA_USERS.includes(user || '');
  const activeSection = isIQA && selectedSection ? selectedSection : user;
  
  const contextItems = useMemo(() => {
     if (isIQA && !selectedSection) return items;
     return items.filter(i => i.section === activeSection);
  }, [items, isIQA, selectedSection, activeSection]);

  const highRisks = contextItems.filter(i => i.type === 'RISK' && (i.riskLevel === 'HIGH' || i.riskLevel === 'CRITICAL') && i.status !== 'CLOSED');
  const openRisks = contextItems.filter(i => i.type === 'RISK' && i.status !== 'CLOSED');
  const openOpps = contextItems.filter(i => i.type === 'OPPORTUNITY' && i.status !== 'CLOSED');
  
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

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex min-h-screen bg-[#F0FFF4] font-sans text-gray-900">
      <MobileHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
          user={user}
          isIQA={isIQA}
          selectedSection={selectedSection}
          view={view}
          isMobileMenuOpen={isMobileMenuOpen}
          isSectionsOpen={isSectionsOpen}
          pendingCount={pendingIQA.length}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onExitSection={() => { setSelectedSection(null); setView('DASHBOARD'); }}
          onViewChange={(v) => { setView(v); setSearchQuery(''); setIsMobileMenuOpen(false); }}
          onSectionSelect={(s) => { setSelectedSection(s); setView('DASHBOARD'); setSearchQuery(''); setIsMobileMenuOpen(false); }}
          onToggleSections={() => setIsSectionsOpen(!isSectionsOpen)}
          onLogout={() => setUser(null)}
      />

      <main className="flex-1 overflow-y-auto p-4 xl:p-8 relative pt-20 xl:pt-8 bg-[#F0FFF4] xl:ml-0">
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
                           <RegistryTable 
                                data={openRisks} 
                                showDays={true} 
                                isClosed={false} 
                                type="RISK" 
                                maxHeight="max-h-[350px]"
                                isIQA={isIQA}
                                displayIdMap={displayIdMap}
                                view={view}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                onSelectItem={setSelectedItem}
                                onSelectAuditTrail={setSelectedAuditTrailItem}
                                onExport={exportCSV}
                           />
                       </div>
                       
                       <div className="space-y-4">
                           <div className="flex justify-between items-end mb-2">
                               <h3 className="font-bold text-gray-500 text-sm">Open Opportunities</h3>
                               <button onClick={() => exportCSV(openOpps, 'Open_Opps')} className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                                  <Download size={14}/> CSV
                               </button>
                           </div>
                           <RegistryTable 
                                data={openOpps} 
                                showDays={true} 
                                isClosed={false} 
                                type="OPPORTUNITY" 
                                maxHeight="max-h-[350px]"
                                isIQA={isIQA}
                                displayIdMap={displayIdMap}
                                view={view}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                onSelectItem={setSelectedItem}
                                onSelectAuditTrail={setSelectedAuditTrailItem}
                                onExport={exportCSV}
                           />
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
                                        <RegistryTable 
                                            data={contextItems.filter(i => i.type === 'RISK' && i.status === 'CLOSED')} 
                                            isClosed={true}
                                            isIQA={isIQA}
                                            displayIdMap={displayIdMap}
                                            view={view}
                                            sortField={sortField}
                                            sortDirection={sortDirection}
                                            onSort={handleSort}
                                            onSelectItem={setSelectedItem}
                                            onSelectAuditTrail={setSelectedAuditTrailItem}
                                            onExport={exportCSV}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <h4 className="text-sm font-bold text-gray-500">Closed Opportunities</h4>
                                            <button onClick={() => exportCSV(contextItems.filter(i => i.type === 'OPPORTUNITY' && i.status === 'CLOSED'), 'Closed_Opps')} className="text-xs font-bold text-gray-500 hover:underline">CSV</button>
                                        </div>
                                        <RegistryTable 
                                            data={contextItems.filter(i => i.type === 'OPPORTUNITY' && i.status === 'CLOSED')} 
                                            isClosed={true}
                                            isIQA={isIQA}
                                            displayIdMap={displayIdMap}
                                            view={view}
                                            sortField={sortField}
                                            sortDirection={sortDirection}
                                            onSort={handleSort}
                                            onSelectItem={setSelectedItem}
                                            onSelectAuditTrail={setSelectedAuditTrailItem}
                                            onExport={exportCSV}
                                        />
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
                     <RegistryTable 
                        data={filteredROList} 
                        showDays={true} 
                        isClosed={false} 
                        type="BOTH" 
                        maxHeight="max-h-[500px]"
                        isIQA={isIQA}
                        displayIdMap={displayIdMap}
                        view={view}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onSelectItem={setSelectedItem}
                        onSelectAuditTrail={setSelectedAuditTrailItem}
                        onExport={exportCSV}
                     />
                </div>
            )}
             {view === 'IQA_PENDING' && (
                 <div className="space-y-4">
                     <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-indigo-800 text-sm mb-4">
                         These items require your attention for <strong>Implementation Verification</strong> or <strong>Final Verification/Closure</strong>.
                     </div>
                     <RegistryTable 
                        data={pendingIQA} 
                        showDays={true}
                        isIQA={isIQA}
                        displayIdMap={displayIdMap}
                        view={view}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onSelectItem={setSelectedItem}
                        onSelectAuditTrail={setSelectedAuditTrailItem}
                        onExport={exportCSV}
                     />
                 </div>
             )}
             {view === 'IQA_ANALYSIS' && (
                 <AnalysisDashboard 
                    items={items}
                    isIQA={isIQA}
                    selectedSection={selectedSection}
                    startDate={analysisStartDate}
                    endDate={analysisEndDate}
                    onStartDateChange={setAnalysisStartDate}
                    onEndDateChange={setAnalysisEndDate}
                 />
             )}
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
