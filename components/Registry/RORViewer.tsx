
import React, { useState, useMemo, useRef } from 'react';
import { Printer, Filter, ChevronDown, Search, Download, FileText, Activity, ShieldAlert, Lightbulb } from 'lucide-react';
import { RegistryItem } from '../../lib/types';
import { SECTIONS } from '../../lib/constants';

interface RORViewerProps {
  items: RegistryItem[];
  displayIdMap: Record<string, string>;
}

// Mapping from Section names to PDF Metadata
const SECTION_METADATA: Record<string, { title: string, docNo: string }> = {
  'Admitting Section': { title: 'ADMITTING AND INFORMATION SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-ADM-SD-ROR' },
  'Ambulatory Care Medicine Complex': { title: 'AMBULATORY CARE MEDICINE RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-ACM-SD-ROR' },
  'Billing Section': { title: 'BILLING SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-BIL-SD-ROR' },
  'Cardiovascular Diagnostics': { title: 'CARDIOVASCULAR DIAGNOSTIC SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-CVDS-SD-ROR' },
  'Cashier Management': { title: 'CASH MANAGEMENT SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-CASH-SD-ROR' },
  'Claims': { title: 'CLAIMS SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-CLAIMS-SD-ROR' },
  'Emergency Room Complex': { title: 'EMERGENCY ROOM COMPLEX RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-ERC-SD-ROR' },
  'Food and Nutrition Management': { title: 'FOOD AND NUTRITION MANAGEMENT SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-FNM-SD-ROR' },
  'General Services Section': { title: 'GENERAL SERVICE SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-GSS-SD-ROR' },
  'Health Records and Documents Management': { title: 'HEALTH RECORDS AND DOCUMENTATION MANAGEMENT SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-HRDMS-SD-ROR' },
  'Housekeeping Laundry and Linen': { title: 'HOUSEKEEPING LAUNDRY AND LINEN SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-HLLS-SD-ROR' },
  'Human Resources and Management Section': { title: 'HUMAN RESOURCE MANAGEMENT SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-HRM-SD-ROR' },
  'Industrial Clinic': { title: 'INDUSTRIAL CLINIC RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-IC-SD-ROR' },
  'Information Technology': { title: 'INFORMATION TECHNOLOGY SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-IT-SD-ROR' },
  'Laboratory': { title: 'LABORATORY SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-LAB-SD-ROR' },
  'Medical Social Service': { title: 'MEDICAL SOCIAL SERVICE SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-MSS-SD-ROR' },
  'Nursing Division': { title: 'NURSING DIVISION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-ND-SD-ROR' },
  'Pathology': { title: 'DEPARTMENT OF PATHOLOGY RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-PATHO-SD-ROR' },
  'Pharmacy': { title: 'PHARMACY SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-PHA-SD-ROR' },
  'Physical and Occupational Therapy': { title: 'PHYSICAL AND OCCUPATIONAL THERAPY SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-POTS-SD-ROR' },
  'Radiology': { title: 'DEPARTMENT OF RADIOLOGY RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-RAD-SD-ROR' },
  'Requisition Section': { title: 'REQUISITION SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-REQ-SD-ROR' },
  'Respiratory Diagnostic Section': { title: 'RESPIRATORY DIAGNOSTIC SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-RDS-SD-ROR' },
  'Supply Management Section': { title: 'SUPPLY MANAGEMENT SECTION RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-SUP-SD-ROR' },
  'Surgical Care Complex': { title: 'SURGICAL CARE COMPLEX RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-SCC-SD-ROR' },
  'INTERNAL QUALITY AUDIT': { title: 'INTERNAL QUALITY AUDIT RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-IQA-SD-ROR' },
  'TOP MANAGEMENT': { title: 'TOP MANAGEMENT RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OsMak-QMR-SD-ROR' }
};

const RORViewer = ({ items, displayIdMap }: RORViewerProps) => {
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterItemId, setFilterItemId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const reportRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSection = filterSection === 'ALL' || item.section === filterSection;
      const matchType = filterType === 'ALL' || item.type === filterType;
      const refId = displayIdMap[item.id] || item.id;
      const matchItem = filterItemId === 'ALL' || refId === filterItemId;
      
      const matchSearch = searchQuery === '' || 
        refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.process.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSection && matchType && matchItem && matchSearch;
    }).sort((a, b) => {
        return new Date(a.dateIdentified).getTime() - new Date(b.dateIdentified).getTime();
    });
  }, [items, filterSection, filterType, filterItemId, searchQuery, displayIdMap]);

  const availableItemIds = useMemo(() => {
     return items
        .filter(i => (filterSection === 'ALL' || i.section === filterSection) && (filterType === 'ALL' || i.type === filterType))
        .map(i => displayIdMap[i.id] || i.id)
        .sort();
  }, [items, filterSection, filterType, displayIdMap]);

  const handlePrint = () => {
    window.print();
  };

  const currentMetadata = useMemo(() => {
    if (filterSection === 'ALL') {
      return { title: 'CONSOLIDATED RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OM-GEN-ROR-2025' };
    }
    return SECTION_METADATA[filterSection] || { title: 'RISKS AND OPPORTUNITIES REGISTRY', docNo: 'OM-ROR-2025' };
  }, [filterSection]);

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 no-print">
        <div className="flex items-center gap-2 text-osmak-green font-bold mb-4">
            <Filter size={20}/> Report Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section</label>
            <select 
              className="w-full border rounded-lg p-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-osmak-green outline-none"
              value={filterSection}
              onChange={(e) => { setFilterSection(e.target.value); setFilterItemId('ALL'); }}
            >
              <option value="ALL">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entry Type</label>
            <select 
              className="w-full border rounded-lg p-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-osmak-green outline-none"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setFilterItemId('ALL'); }}
            >
              <option value="ALL">Risks & Opportunities</option>
              <option value="RISK">Risks Only</option>
              <option value="OPPORTUNITY">Opportunities Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specific ID</label>
            <select 
              className="w-full border rounded-lg p-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-osmak-green outline-none"
              value={filterItemId}
              onChange={(e) => setFilterItemId(e.target.value)}
            >
              <option value="ALL">All Items</option>
              {availableItemIds.map(id => <option key={id} value={id}>{id}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
                onClick={handlePrint}
                className="w-full bg-osmak-green hover:bg-osmak-green-dark text-white font-bold py-2 rounded-lg shadow-md transition flex items-center justify-center gap-2"
            >
                <Printer size={18}/> Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white shadow-2xl rounded-lg mx-auto overflow-x-auto print:shadow-none print:m-0 print:p-0" ref={reportRef}>
        <div className="p-10 min-w-[1200px] print:min-w-0 print:p-0 print:w-full">
           {/* Report Header */}
           <div className="flex items-center justify-between mb-8 border-b-2 border-osmak-green pb-6">
              <div className="flex items-center gap-4">
                  <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="h-20 w-auto" />
                  <div>
                      <h1 className="text-xl font-black text-gray-900 leading-tight">OSPITAL NG MAKATI</h1>
                      <h2 className="text-lg font-bold text-osmak-green leading-tight uppercase">{currentMetadata.title}</h2>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Document No.</p>
                  <p className="text-sm font-bold text-gray-800">{currentMetadata.docNo}</p>
                  <p className="text-xs text-gray-400 mt-1 italic">As of: {new Date().toLocaleDateString()}</p>
              </div>
           </div>

           {/* Report Table */}
           <table className="w-full border-collapse border border-gray-300 text-[10px] leading-tight print:text-[8px]">
              <thead>
                 <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-center" rowSpan={2}>No.</th>
                    <th className="border border-gray-300 p-2" rowSpan={2}>Section</th>
                    <th className="border border-gray-300 p-2" rowSpan={2}>Process / Function</th>
                    <th className="border border-gray-300 p-2 w-32" rowSpan={2}>Description</th>
                    <th className="border border-gray-300 p-2 text-center" colSpan={3}>Initial Assessment</th>
                    <th className="border border-gray-300 p-2" rowSpan={2}>Level</th>
                    <th className="border border-gray-300 p-2 w-32" rowSpan={2}>Planned Actions</th>
                    <th className="border border-gray-300 p-2" rowSpan={2}>Responsible / Target</th>
                    <th className="border border-gray-300 p-2 text-center" colSpan={3}>Residual Risk</th>
                    <th className="border border-gray-300 p-2" rowSpan={2}>Status</th>
                 </tr>
                 <tr className="bg-gray-100 text-center">
                    <th className="border border-gray-300 p-2">L</th>
                    <th className="border border-gray-300 p-2">S</th>
                    <th className="border border-gray-300 p-2">R</th>
                    <th className="border border-gray-300 p-2">L</th>
                    <th className="border border-gray-300 p-2">S</th>
                    <th className="border border-gray-300 p-2">R</th>
                 </tr>
              </thead>
              <tbody>
                 {filterSection === 'ALL' ? (
                     <tr>
                         <td colSpan={15} className="border border-gray-300 p-8 text-center text-gray-400 italic">Please select a specific section to view report data.</td>
                     </tr>
                 ) : filteredItems.length === 0 ? (
                     <tr>
                         <td colSpan={15} className="border border-gray-300 p-8 text-center text-gray-400 italic">No entries match the current filters.</td>
                     </tr>
                 ) : filteredItems.map((item, idx) => {
                     const isRisk = item.type === 'RISK';
                     
                     return (
                        <tr key={item.id} className="hover:bg-gray-50">
                           <td className="border border-gray-300 p-2 text-center font-bold">{idx + 1}</td>
                           <td className="border border-gray-300 p-2 font-medium">{item.section}</td>
                           <td className="border border-gray-300 p-2">{item.process}</td>
                           <td className="border border-gray-300 p-2 text-gray-700">{item.description}</td>
                           
                           {/* Initial Assessment L, S, R */}
                           <td className="border border-gray-300 p-2 text-center">{isRisk ? item.likelihood : '-'}</td>
                           <td className="border border-gray-300 p-2 text-center">{isRisk ? item.severity : '-'}</td>
                           <td className="border border-gray-300 p-2 text-center font-bold">{isRisk ? item.riskRating : '-'}</td>
                           
                           <td className="border border-gray-300 p-2 text-center font-bold">
                               {isRisk ? item.riskLevel : item.feasibility}
                           </td>
                           <td className="border border-gray-300 p-2 space-y-1">
                               {item.actionPlans.map(ap => (
                                   <div key={ap.id} className="border-b border-gray-100 last:border-0 pb-1">
                                       <span className="font-bold text-[8px] uppercase">{ap.strategy}:</span> {ap.description}
                                   </div>
                               ))}
                           </td>
                           <td className="border border-gray-300 p-2">
                                {item.actionPlans.map(ap => (
                                    <div key={ap.id} className="mb-1 last:mb-0">
                                        <span className="font-bold">{ap.responsiblePerson}</span> ({ap.targetDate})
                                    </div>
                                ))}
                           </td>
                           
                           {/* Residual Risk L, S, R */}
                           <td className="border border-gray-300 p-2 text-center">{item.residualLikelihood || '-'}</td>
                           <td className="border border-gray-300 p-2 text-center">{item.residualSeverity || '-'}</td>
                           <td className="border border-gray-300 p-2 text-center font-bold">{item.residualRiskRating || '-'}</td>
                           
                           <td className="border border-gray-300 p-2 text-center font-bold text-[8px] uppercase">
                               {item.status.replace(/_/g, ' ')}
                           </td>
                        </tr>
                     );
                 })}
              </tbody>
           </table>

           {/* Signatures for Print */}
           <div className="mt-16 grid grid-cols-3 gap-12 print:mt-12 no-screen">
              <div className="text-center">
                  <div className="border-b border-gray-900 mb-2 pt-4"></div>
                  <p className="text-xs font-bold uppercase">Prepared By</p>
                  <p className="text-[10px] text-gray-500">Section Head</p>
              </div>
              <div className="text-center">
                  <div className="border-b border-gray-900 mb-2 pt-4"></div>
                  <p className="text-xs font-bold uppercase">Reviewed By</p>
                  <p className="text-[10px] text-gray-500">IQA Auditor</p>
              </div>
              <div className="text-center">
                  <div className="border-b border-gray-900 mb-2 pt-4"></div>
                  <p className="text-xs font-bold uppercase">Approved By</p>
                  <p className="text-[10px] text-gray-500">IQA Head / DQMR</p>
              </div>
           </div>
        </div>
      </div>

      <style>{`
          @media screen {
            .no-screen { display: none; }
          }
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            main { margin: 0 !important; padding: 0 !important; }
            aside { display: none !important; }
            header { display: none !important; }
            .no-screen { display: grid !important; }
          }
      `}</style>
    </div>
  );
};

export default RORViewer;
