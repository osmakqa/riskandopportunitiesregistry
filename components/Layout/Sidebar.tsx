
import React from 'react';
import { LayoutDashboard, ClipboardList, BarChart3, LogOut, ChevronUp, ChevronDown, Building2, X, FileText } from 'lucide-react';
import { SECTIONS } from '../../lib/constants';

const SidebarHeader = ({ onClose }: { onClose: () => void }) => (
    <header className="flex bg-[#009a3e] h-16 px-4 items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
        <img 
            src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" 
            alt="Logo" 
            className="h-10 w-auto object-contain"
        />
        <div className="flex flex-col">
            <h1 className="text-white text-xs font-extrabold tracking-wide uppercase leading-none">OSPITAL NG MAKATI</h1>
            <span className="text-green-50 text-[0.65rem] font-medium opacity-90 tracking-wider mt-0.5">Risk & Opportunities Registry</span>
        </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-white p-1 hover:bg-green-700 rounded-full transition-colors">
            <X size={24} />
        </button>
    </header>
);

type AppView = 'DASHBOARD' | 'RO_LIST' | 'IQA_PENDING' | 'IQA_ANALYSIS' | 'ROR_VIEWER';

interface SidebarProps {
  user: string;
  isIQA: boolean;
  selectedSection: string | null;
  view: AppView;
  isMobileMenuOpen: boolean;
  isSectionsOpen: boolean;
  pendingCount: number;
  onCloseMobile: () => void;
  onExitSection: () => void;
  onViewChange: (view: AppView) => void;
  onSectionSelect: (section: string) => void;
  onToggleSections: () => void;
  onLogout: () => void;
}

const Sidebar = ({ 
  user, isIQA, selectedSection, view, isMobileMenuOpen, isSectionsOpen, pendingCount,
  onCloseMobile, onExitSection, onViewChange, onSectionSelect, onToggleSections, onLogout 
}: SidebarProps) => {

  return (
      <aside className={`w-72 bg-white text-gray-800 flex flex-col shadow-2xl z-50 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarHeader onClose={onCloseMobile} />
        
        <div className="p-6 border-b border-gray-200 bg-gray-50">
           <div className="text-xs uppercase text-gray-500 font-bold mb-1">Logged in as</div>
           <div className="font-bold text-lg truncate text-osmak-green-dark">{user}</div>
           {isIQA && !selectedSection && <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded text-white mt-1 inline-block">IQA</span>}
           {selectedSection && <button onClick={onExitSection} className="text-xs text-yellow-600 underline mt-2 hover:text-yellow-700">Exit Section View</button>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <button 
             onClick={() => onViewChange('DASHBOARD')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'DASHBOARD' ? 'bg-osmak-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          {(!isIQA || selectedSection) ? (
             <>
                <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase px-4">Registries</div>
                <button 
                    onClick={() => onViewChange('RO_LIST')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'RO_LIST' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> R&O List
                </button>
                <button 
                    onClick={() => onViewChange('IQA_ANALYSIS')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'IQA_ANALYSIS' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <BarChart3 size={20} /> Data Analysis
                </button>
             </>
          ) : (
             <>
                <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase px-4">IQA Overview</div>
                <button 
                    onClick={() => onViewChange('IQA_PENDING')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'IQA_PENDING' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> Pending Tasks
                    {pendingCount > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full ml-auto">{pendingCount}</span>}
                </button>
                <button 
                    onClick={() => onViewChange('RO_LIST')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'RO_LIST' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} /> R&O List
                </button>
                
                <button 
                    onClick={() => onViewChange('IQA_ANALYSIS')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'IQA_ANALYSIS' ? 'bg-osmak-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <BarChart3 size={20} /> Data Analysis
                </button>

                <button 
                    onClick={() => onViewChange('ROR_VIEWER')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'ROR_VIEWER' ? 'bg-osmak-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <FileText size={20} /> ROR Viewer
                </button>

                <button 
                    onClick={onToggleSections}
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

export default Sidebar;
