
import React from 'react';
import { Menu, X } from 'lucide-react';

const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#009a3e] flex items-center justify-between px-4 z-50 shadow-md">
    <div className="flex items-center gap-3">
      <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="Logo" className="h-10 w-10 object-contain" />
      <div>
        <h1 className="text-white font-extrabold text-sm tracking-wide leading-none">OSPITAL NG MAKATI</h1>
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

export default MobileHeader;
