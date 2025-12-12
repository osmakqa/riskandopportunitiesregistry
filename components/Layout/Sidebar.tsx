
import React, { useState } from 'react';
import { LayoutDashboard, ClipboardList, BarChart3, Building2, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { SidebarHeader } from './AppHeader';
import { SECTIONS } from '../../lib/constants';
import { AppView } from '../../lib/types';

interface SidebarProps {
  user: string;
  isIQA: boolean;
  selectedSection: string | null;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onViewChange: (view: AppView) => void;
  onSectionSelect: (section: string | null) => void;
  onLogout: () => void;
  currentView: AppView;
  pendingCount: number;
}

export const Sidebar = ({ 
  user, 
  isIQA, 
  selectedSection, 
  isMobileMenuOpen, 
  onCloseMobileMenu, 
  onViewChange, 
  onSectionSelect, 
  onLogout,
  currentView,
  pendingCount
}: SidebarProps) => {
  const [isSectionsOpen, setIsSectionsOpen] = useState(false);

  return (
    <aside className={`w-72 bg-white text-gray-800 flex flex-col shadow-2xl z-50 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarHeader onClose={onCloseMobileMenu} />
        
        <div className="p-6 border-b border-gray-200 bg-gray-50">
           <div className="text-xs uppercase text-gray-500 font-bold mb-1">Logged in as</div>
           <div className="font-bold text-lg truncate text-osmak-green-dark">{user}</div>
           {isIQA && !selectedSection && <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded text-white mt-1 inline-block">IQA</span>}
           {selectedSection && <button onClick={() => { onSectionSelect(null); onViewChange('DASHBOARD'); }} className="text-xs text-yellow-600 underline mt-2 hover:text-yellow-700">Exit Section View</button>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <button 
             onClick={() => onViewChange('DASHBOARD')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'DASHBOARD' ? 'bg-osmak-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          {(!isIQA || selectedSection) ? (
             <>
                <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase px-4">Registries</div>
                <button 
                    onClick={() => onViewChange('RO_LIST')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'RO_LIST' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> R&O List
                </button>
                <button 
                    onClick={() => onViewChange('IQA_ANALYSIS')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'IQA_ANALYSIS' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <BarChart3 size={20} /> Data Analysis
                </button>
             </>
          ) : (
             <>
                <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase px-4">IQA Overview</div>
                <button 
                    onClick={() => onViewChange('IQA_PENDING')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'IQA_PENDING' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> Pending Tasks
                    {pendingCount > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full ml-auto">{pendingCount}</span>}
                </button>
                <button 
                    onClick={() => onViewChange('RO_LIST')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'RO_LIST' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> R&O List
                </button>
                
                <button 
                    onClick={() => onViewChange('IQA_ANALYSIS')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'IQA_ANALYSIS' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <BarChart3 size={20} /> Data Analysis
                </button>

                <button 
                    onClick={() => setIsSectionsOpen(!isSectionsOpen)}
                    className="w-full flex items-center justify-between pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase hover:text-gray-600 transition group"
                >
                    <span>Hospital Sections</span>
                    {isSectionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {isSectionsOpen && (
                    <div className="space-y-1 animate-fadeIn">
                        {SECTIONS.filter(s => !s.startsWith('IQA')).map(s => (
                            <button 
                                key={s}
                                onClick={() => onSectionSelect(s)}
                                className={`w-full flex items-start text-left gap-3 px-4 py-2 rounded-lg transition text-sm ${selectedSection === s ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Building2 size={16} className="shrink-0 mt-0.5" /> <span>{s}</span>
                            </button>
                        ))}
                    </div>
                )}
             </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button 
                onClick={onLogout} 
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
            >
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>
  );
};
