
import React, { useState } from 'react';
import { ArrowUpDown, RotateCcw, Download, ChevronRight } from 'lucide-react';
import { RegistryItem, EntryType } from '../../lib/types';
import { getPillColor, formatStatus, getLevelPillColor, getDaysRemaining, exportCSV } from '../../lib/utils';

interface RegistryTableProps {
  data: RegistryItem[];
  displayIdMap: Record<string, string>;
  isIQA: boolean;
  onSelectItem: (item: RegistryItem) => void;
  onViewAuditTrail: (item: RegistryItem) => void;
  showDays?: boolean;
  isClosed?: boolean;
  type?: EntryType | 'BOTH';
  maxHeight?: string;
  view?: string;
}

export const RegistryTable = ({ 
  data, 
  displayIdMap, 
  isIQA, 
  onSelectItem, 
  onViewAuditTrail,
  showDays = false, 
  isClosed = false, 
  type = 'RISK', 
  maxHeight,
  view = 'DASHBOARD'
}: RegistryTableProps) => {
    const [sortField, setSortField] = useState<'dateIdentified' | 'riskLevel' | 'status' | 'createdAt'>('dateIdentified');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: 'dateIdentified' | 'riskLevel' | 'status' | 'createdAt') => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };
  
    const sortedData = [...data].sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        
        if (sortField === 'riskLevel') {
            const levels = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'CRITICAL': 4 };
            valA = levels[a.riskLevel || 'LOW'] || 0;
            valB = levels[b.riskLevel || 'LOW'] || 0;
        }
        
        if (sortField === 'createdAt') {
            valA = a.createdAt;
            valB = b.createdAt;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col`}>
      {view === 'DASHBOARD' && !isClosed && type === 'RISK' && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b shrink-0">
              <h3 className="font-bold text-gray-700">Open Risks</h3>
              <button onClick={() => exportCSV(data, 'Open_Risks', displayIdMap)} className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                  <Download size={14}/> CSV
              </button>
          </div>
      )}

      <div className={`overflow-x-auto ${maxHeight ? `${maxHeight} overflow-y-auto` : ''}`}>
        <table className="w-full text-left text-sm relative">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b sticky top-0 z-10 shadow-sm">
            <tr>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                onClick={() => handleSort('createdAt')}
              >
                  <div className="flex items-center gap-1">Ref # <ArrowUpDown size={14} className={sortField === 'createdAt' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                  onClick={() => handleSort('dateIdentified')}
              >
                  <div className="flex items-center gap-1">Date <ArrowUpDown size={14} className={sortField === 'dateIdentified' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              {isIQA && (
                 <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap">
                    Section
                 </th>
              )}
              <th className="px-6 py-4 w-1/3 min-w-[200px]">Description</th>
              <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                  onClick={() => handleSort('status')}
              >
                  <div className="flex items-center gap-1">Status <ArrowUpDown size={14} className={sortField === 'status' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              {type === 'BOTH' ? (
                <th className="px-6 py-4 whitespace-nowrap">Type</th>
              ) : null}
              <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                  onClick={() => handleSort('riskLevel')}
              >
                  <div className="flex items-center gap-1">Level / Feasibility <ArrowUpDown size={14} className={sortField === 'riskLevel' ? 'text-gray-600' : 'text-gray-300'}/></div>
              </th>
              {showDays && <th className="px-6 py-4 whitespace-nowrap">Target</th>}
              <th className="px-6 py-4 text-center whitespace-nowrap">History</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedData.length === 0 ? (
                <tr><td colSpan={isIQA ? 9 : 8} className="px-6 py-8 text-center text-gray-400 italic">No records found.</td></tr>
            ) : sortedData.map(item => {
              const days = getDaysRemaining(item);
              const refId = displayIdMap[item.id] || item.id;
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition group">
                  <td onClick={() => onSelectItem(item)} className="px-6 py-4 font-mono text-xs text-gray-500 font-bold cursor-pointer group-hover:text-gray-800 align-top">
                      {refId}
                  </td>
                  <td onClick={() => onSelectItem(item)} className="px-6 py-4 text-gray-600 text-xs cursor-pointer align-top whitespace-nowrap">
                      {item.dateIdentified}
                      <div className="text-[10px] text-gray-300 mt-0.5">DATE</div>
                  </td>
                  {isIQA && (
                     <td onClick={() => onSelectItem(item)} className="px-6 py-4 text-xs text-gray-600 align-top">
                        {item.section}
                     </td>
                  )}
                  <td onClick={() => onSelectItem(item)} className="px-6 py-4 font-medium text-gray-800 text-sm cursor-pointer align-top">{item.description}</td>
                  <td onClick={() => onSelectItem(item)} className="px-6 py-4 cursor-pointer align-top">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${getPillColor(item.status)}`}>
                      {formatStatus(item.status)}
                    </span>
                  </td>
                  {type === 'BOTH' ? (
                    <td onClick={() => onSelectItem(item)} className="px-6 py-4 cursor-pointer align-top">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'RISK' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.type}
                      </span>
                    </td>
                  ) : null}
                  <td onClick={() => onSelectItem(item)} className="px-6 py-4 cursor-pointer align-top">
                     {item.type === 'RISK' ? (
                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelPillColor(item.riskLevel)}`}>{item.riskLevel}</span>
                     ) : (
                        <span className="text-green-600 font-bold text-xs">{item.feasibility}</span>
                     )}
                  </td>
                  {showDays && (
                      <td onClick={() => onSelectItem(item)} className="px-6 py-4 cursor-pointer align-top whitespace-nowrap">
                          {days ? (
                              <div className="flex flex-col">
                                  <span className={`text-xs font-bold ${days.days < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                      {days.days < 0 ? `${Math.abs(days.days)} days late` : days.days === 0 ? 'Due today' : `${days.days} days left`}
                                  </span>
                              </div>
                          ) : (
                              <span className="text-gray-300 text-xs">-</span>
                          )}
                      </td>
                  )}
                  <td className="px-6 py-4 text-center align-top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAuditTrail(item);
                      }}
                      className="text-gray-300 hover:text-gray-600 transition-colors p-1"
                      title="View Audit Trail"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </td>
                  <td onClick={() => onSelectItem(item)} className="px-6 py-4 text-right cursor-pointer align-top">
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
};
