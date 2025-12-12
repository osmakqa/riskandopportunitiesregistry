
import React from 'react';
import { Menu } from 'lucide-react';

export const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <header className="md:hidden sticky top-0 left-0 right-0 h-16 bg-[#009a3e] flex items-center justify-between px-4 z-40 shadow-md">
    <div className="flex items-center gap-3">
      <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="h-10 w-10 object-contain" />
      <div>
        <h1 className="text-sm font-extrabold tracking-wide uppercase leading-tight">OSPITAL NG MAKATI</h1>
        <span className="text-[0.65rem] font-medium tracking-wider text-green-50 opacity-90 block">Risk & Opportunities Registry</span>
      </div>
    </div>
    <button 
      onClick={onMenuClick}
      className="p-1.5 border-2 border-green-400 rounded hover:bg-green-700 transition text-white"
    >
      <Menu size={24} />
    </button>
  </header>
);
