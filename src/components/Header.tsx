import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  activeSection: 'calculator' | 'ledger' | 'simulator' | 'thresholds';
  onNavigate: (section: 'calculator' | 'ledger' | 'simulator' | 'thresholds') => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, onExportCsv }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-14">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#calculator"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('calculator');
          }}
          className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0"
        >
          attendance75
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a
            href="#calculator"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('calculator');
            }}
            className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'calculator'
                ? 'text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-100'
                : 'border-transparent'
            }`}
          >
            Calculator
          </a>
          <a
            href="#simulator"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('simulator');
            }}
            className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'simulator'
                ? 'text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-100'
                : 'border-transparent'
            }`}
          >
            What-If Planner
          </a>
          <a
            href="#thresholds"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('thresholds');
            }}
            className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'thresholds'
                ? 'text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-100'
                : 'border-transparent'
            }`}
          >
            Thresholds
          </a>
          <a
            href="#ledger"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('ledger');
            }}
            className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'ledger'
                ? 'text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-100'
                : 'border-transparent'
            }`}
          >
            Course Ledger
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
