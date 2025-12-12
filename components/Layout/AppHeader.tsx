
import React from 'react';
import { X } from 'lucide-react';

export const AppHeader = ({ title, subtitle, centered = false, small = false }: { title: string, subtitle: string, centered?: boolean, small?: boolean }) => (
  <header className={`sticky ${small ? 'h-16 px-4' : 'h-20 px-7'} top-0 z-50 flex items-center gap-3 bg-osmak-green text-white py-3 shadow-header w-full ${centered ? 'justify-center' : ''}`}>
    <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="OsMak Logo" className={`${small ? 'h-10' : 'h-14'} w-auto object-contain`} />
    <div className="flex flex-col justify-center">
      <h1 className={`text-white ${small ? 'text-xs' : 'text-xl'} font-extrabold tracking-wide uppercase leading-tight`}>{title}</h1>
      <span className={`text-white ${small ? 'text-[0.65rem]' : 'text-sm'} opacity-90 tracking-wider`}>{subtitle}</span>
    </div>
  </header>
);

export const SidebarHeader = ({ onClose }: { onClose: () => void }) => (
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
        <button onClick={onClose} className="md:hidden text-white p-1 hover:bg-green-700 rounded-full transition-colors">
            <X size={24} />
        </button>
    </header>
);
