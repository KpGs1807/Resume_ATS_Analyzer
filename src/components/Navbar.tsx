import React from 'react';
import { Sparkles, Trash2, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onLoadSample: () => void;
  onClearAll: () => void;
  hasContent: boolean;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  onClearAll,
  hasContent,
  isAnalyzing,
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Resume & Job Description Analyzer
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                ATS & Interview Prep
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Upload or type job descriptions, upload resumes, with instant deletion controls & AI scoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-load-sample"
            type="button"
            onClick={onLoadSample}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-indigo-600 transition-colors disabled:opacity-50"
            title="Populate realistic Job Description and matching Resume to test quickly"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden xs:inline">Load Sample</span>
          </button>

          {hasContent && (
            <button
              id="btn-clear-all"
              type="button"
              onClick={onClearAll}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors disabled:opacity-50"
              title="Delete both Job Description and Resume"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
