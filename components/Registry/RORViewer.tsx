
import React, { useState, useMemo, useRef } from 'react';
import { Printer, Filter, ChevronDown, Search, Download, FileText, Activity, ShieldAlert, Lightbulb, FileCode, Loader2 } from 'lucide-react';
import { RegistryItem } from '../../lib/types';
import { SECTIONS } from '../../lib/constants';

interface RORViewerProps {
  items: RegistryItem[];
  displayIdMap: Record<string, string>;
}

// Mapping from Section names to Metadata
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

  const handleDownloadHTML = () => {
    if (!reportRef.current || filterSection === 'ALL') return;

    const content = reportRef.current.innerHTML;
    const sectionName = filterSection.replace(/\s+/g, '_');
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filterSection} ROR Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            font-family: Arial, Helvetica, sans-serif !important; 
            background: white; 
            margin: 0;
            padding: 20px;
        }
        * { font-family: Arial, Helvetica, sans-serif !important; }
        table { border-collapse: collapse; width: 100%; table-layout: fixed; }
        th, td { border: 1px solid #9ca3af !important; padding: 4px; overflow: visible; word-wrap: break-word; }
        .no-print { display: none !important; }
        @media print {
            @page { size: legal landscape; margin: 0.5cm; }
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div style="min-width: 1450px;">
        ${content}
    </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sectionName}_ROR_Report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <div className="flex items-end gap-2">
            <button 
                onClick={handlePrint}
                className="flex-1 bg-osmak-green hover:bg-osmak-green-dark text-white font-bold py-2 rounded-lg shadow-md transition flex items-center justify-center gap-2"
            >
                <Printer size={18}/> <span className="hidden sm:inline">Print</span>
            </button>
            <button 
                onClick={handleDownloadHTML}
                disabled={filterSection === 'ALL'}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FileCode size={18}/> 
                <span className="hidden sm:inline">HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white shadow-2xl rounded-lg mx-auto overflow-x-auto print:shadow-none print:m-0 print:p-0" ref={reportRef}>
        <div id="ror-report-content" className="p-4 min-w-[1450px] print:min-w-0 print:p-0 print:w-full bg-white flex flex-col pt-8 overflow-visible ror-arial-font">
           
           {/* HEADER TABLE */}
           <table className="w-full border-collapse border border-gray-800 mb-6 text-[10px]">
              <tbody>
                 <tr>
                    <td className="border border-gray-800 p-2 w-[120px] text-center align-middle" rowSpan={2}>
                       <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="h-22 w-auto mx-auto" />
                    </td>
                    <td className="border border-gray-800 p-2 text-center align-middle flex-1">
                       <div className="space-y-0.5">
                          <p className="font-bold text-black uppercase text-xs">City Government of Makati</p>
                          <h1 className="text-2xl font-black text-[#009a3e] leading-tight tracking-[0.2em] py-2">OSPITAL NG MAKATI</h1>
                          <p className="text-[9px] text-black font-medium">Sampaguita corner Gumamela Sts., Bgy. Pembo, Taguig City</p>
                       </div>
                    </td>
                    <td className="border border-gray-800 p-2 w-[160px] align-top">
                       <p className="font-bold text-black">Document No.:</p>
                       <p className="text-gray-800 mt-1">{currentMetadata.docNo}</p>
                    </td>
                    <td className="border border-gray-800 p-2 w-[160px] align-top">
                       <p className="font-bold text-black">As of:</p>
                       <p className="text-gray-800 mt-1">{new Date().toLocaleDateString()}</p>
                    </td>
                 </tr>
                 <tr>
                    <td className="border border-gray-800 p-2 align-top" colSpan={3}>
                       <p className="font-bold text-black">Document Title:</p>
                       <p className="text-gray-800 font-bold uppercase mt-1">{currentMetadata.title}</p>
                    </td>
                 </tr>
              </tbody>
           </table>

           {/* MAIN REPORT TABLE */}
           <table className="w-full border-collapse border border-gray-400 text-[8.5px] leading-normal print:text-[7.5px] table-fixed overflow-visible">
              <thead className="bg-gray-100 text-black">
                 <tr>
                    <th className="border border-gray-400 px-1 py-3 text-center align-middle w-[30px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>No.</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[95px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Process / Function</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[75px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Source</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[150px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Description</th>
                    <th className="border border-gray-400 px-1 py-3 text-center align-middle w-[55px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Type</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[105px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Impact on QMS</th>
                    <th className="border border-gray-400 px-1 py-3 text-center align-middle font-bold text-black overflow-visible" colSpan={3} style={{ lineHeight: '1.2' }}>Initial Assessment</th>
                    <th className="border border-gray-400 px-1 py-3 text-center align-middle w-[50px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Level</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[110px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Existing Controls</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[150px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Planned Actions</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[95px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Responsible / Target</th>
                    <th className="border border-gray-400 px-1 py-3 text-center align-middle w-[80px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Date of Reassessment</th>
                    <th className="border border-gray-400 px-1 py-3 text-center align-middle font-bold text-black overflow-visible" colSpan={3} style={{ lineHeight: '1.2' }}>Residual Risk</th>
                    <th className="border border-gray-400 px-1 py-3 text-center align-middle w-[55px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Status</th>
                    <th className="border border-gray-400 px-1 py-3 text-left align-middle w-[120px] font-bold text-black overflow-visible" rowSpan={2} style={{ lineHeight: '1.2' }}>Remarks on Effectiveness</th>
                 </tr>
                 <tr className="bg-gray-100 text-center">
                    <th className="border border-gray-400 px-1 py-2 w-[24px] font-bold text-black align-middle overflow-visible">L</th>
                    <th className="border border-gray-400 px-1 py-2 w-[24px] font-bold text-black align-middle overflow-visible">S</th>
                    <th className="border border-gray-400 px-1 py-2 w-[24px] font-bold text-black align-middle overflow-visible">R</th>
                    <th className="border border-gray-400 px-1 py-2 w-[24px] font-bold text-black align-middle overflow-visible">L</th>
                    <th className="border border-gray-400 px-1 py-2 w-[24px] font-bold text-black align-middle overflow-visible">S</th>
                    <th className="border border-gray-400 px-1 py-2 w-[24px] font-bold text-black align-middle overflow-visible">R</th>
                 </tr>
              </thead>
              <tbody>
                 {filterSection === 'ALL' ? (
                     <tr>
                         <td colSpan={20} className="border border-gray-400 p-10 text-center text-gray-400 italic font-medium">Please select a specific section to view report data.</td>
                     </tr>
                 ) : filteredItems.length === 0 ? (
                     <tr>
                         <td colSpan={20} className="border border-gray-400 p-10 text-center text-gray-400 italic font-medium">No entries match the current filters.</td>
                     </tr>
                 ) : filteredItems.map((item, idx) => {
                     const isRisk = item.type === 'RISK';
                     
                     return (
                        <tr key={item.id} className="hover:bg-gray-50 break-inside-avoid">
                           <td className="border border-gray-400 p-1.5 text-center font-bold text-black align-top">{idx + 1}</td>
                           <td className="border border-gray-400 p-1.5 break-words text-black align-top leading-tight">{item.process}</td>
                           <td className="border border-gray-400 p-1.5 break-words text-black align-top leading-tight">{item.source}</td>
                           <td className="border border-gray-400 p-1.5 text-gray-700 break-words align-top leading-tight">{item.description}</td>
                           <td className="border border-gray-400 p-1.5 text-center font-medium uppercase text-black align-top leading-tight">{item.type}</td>
                           <td className="border border-gray-400 p-1.5 break-words text-black align-top leading-tight">{item.impactQMS || '-'}</td>
                           
                           {/* Initial Assessment L, S, R */}
                           <td className="border border-gray-400 p-1.5 text-center text-black align-top">{isRisk ? item.likelihood : '-'}</td>
                           <td className="border border-gray-400 p-1.5 text-center text-black align-top">{isRisk ? item.severity : '-'}</td>
                           <td className="border border-gray-400 p-1.5 text-center font-bold text-black align-top">{isRisk ? item.riskRating : '-'}</td>
                           
                           <td className="border border-gray-400 p-1.5 text-center font-bold uppercase text-[7px] text-black align-top">
                               {isRisk ? item.riskLevel : item.feasibility}
                           </td>
                           <td className="border border-gray-400 p-1.5 break-words text-black align-top leading-tight">{item.existingControls || '-'}</td>
                           
                           <td className="border border-gray-400 p-1.5 space-y-1 align-top">
                               {item.actionPlans.map(ap => (
                                   <div key={ap.id} className="border-b border-gray-100 last:border-0 pb-1 break-words leading-tight text-black">
                                       <span className="font-bold text-[7.5px] uppercase">{ap.strategy}:</span> {ap.description}
                                   </div>
                               ))}
                           </td>
                           <td className="border border-gray-400 p-1.5 align-top">
                                {item.actionPlans.map(ap => (
                                    <div key={ap.id} className="mb-2 last:mb-0 break-words leading-tight text-black">
                                        <span className="font-bold text-[7.5px]">{ap.responsiblePerson}</span>
                                        <span className="block text-[7px] text-gray-500 font-medium mt-0.5">({ap.targetDate})</span>
                                    </div>
                                ))}
                           </td>

                           <td className="border border-gray-400 p-1.5 text-center text-black whitespace-nowrap align-top">{item.closedAt || '-'}</td>
                           
                           {/* Residual Risk L, S, R */}
                           <td className="border border-gray-400 p-1.5 text-center text-black align-top">{item.residualLikelihood || '-'}</td>
                           <td className="border border-gray-400 p-1.5 text-center text-black align-top">{item.residualSeverity || '-'}</td>
                           <td className="border border-gray-400 p-1.5 text-center font-bold text-black align-top">{item.residualRiskRating || '-'}</td>
                           
                           <td className="border border-gray-400 p-1.5 text-center font-bold text-[7px] uppercase leading-none text-black align-top">
                               {item.status === 'CLOSED' ? 'CLOSED' : 'OPEN'}
                           </td>

                           <td className="border border-gray-400 p-1.5 break-words text-black align-top leading-tight">{item.effectivenessRemarks || '-'}</td>
                        </tr>
                     );
                 })}
              </tbody>
           </table>
        </div>
      </div>

      <style>{`
          .ror-arial-font, .ror-arial-font * {
              font-family: Arial, Helvetica, sans-serif !important;
          }
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            main { margin: 0 !important; padding: 0 !important; }
            aside { display: none !important; }
            header { display: none !important; }
            #ror-report-content { width: 100% !important; min-width: unset !important; padding: 0.1in 0 !important; }
            table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
            th, td { border: 1px solid #000 !important; padding: 4px !important; color: black !important; overflow: visible !important; }
            thead { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
            @page {
                size: legal landscape;
                margin: 0;
            }
          }
      `}</style>
    </div>
  );
};

export default RORViewer;
