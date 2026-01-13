
import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onViewToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewToggle, isDarkMode, onThemeToggle }) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 z-50 relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-xl">hub</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">核心物流</span>
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <span className="hover:text-primary cursor-pointer transition-colors">7G 分区</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 dark:text-white">
            {currentView === ViewType.LOGISTICS ? '主电网' : '百科全书'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-lg">bolt</span>
            <span className="font-bold">14.2k MW</span>
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-600"></div>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <span className="material-symbols-outlined text-lg">diamond</span>
            <span className="font-bold">850</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button 
            onClick={onViewToggle}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">
              {currentView === ViewType.LOGISTICS ? 'auto_awesome' : 'account_tree'}
            </span>
          </button>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            部署模拟
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
