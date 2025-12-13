
import React from 'react';

const AppHeader = ({ title, subtitle, centered = false, small = false }: { title: string, subtitle: string, centered?: boolean, small?: boolean }) => (
  <header className={`sticky ${small ? 'h-16 px-4' : 'h-20 px-7'} top-0 z-50 flex items-center gap-3 bg-osmak-green text-white py-3 shadow-header w-full ${centered ? 'justify-center' : ''}`}>
    <img src="https://maxterrenal-hash.github.io/justculture/osmak-logo.png" alt="OsMak Logo" className={`${small ? 'h-10' : 'h-14'} w-auto object-contain`} />
    <div className="flex flex-col justify-center">
      <h1 className={`text-white ${small ? 'text-xs' : 'text-xl'} font-extrabold tracking-wide uppercase leading-tight`}>{title}</h1>
      <span className={`text-white ${small ? 'text-[0.65rem]' : 'text-sm'} opacity-90 tracking-wider`}>{subtitle}</span>
    </div>
  </header>
);

export default AppHeader;
