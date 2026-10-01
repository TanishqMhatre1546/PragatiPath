import React from 'react';
import { UserRole } from '../types';
import { 
  GraduationCap, 
  Building2, 
  Landmark, 
  BookOpen, 
  TrendingUp, 
  RotateCcw, 
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenArchitecture: () => void;
  onOpenStubModal: (featureName: string) => void;
  onReseed: () => void;
  isReseeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  onOpenArchitecture,
  onOpenStubModal,
  onReseed,
  isReseeding
}) => {
  return (
    <header className="bg-navy text-white sticky top-0 z-40 border-b border-navy-700">
      {/* Top Govt Status Bar */}
      <div className="bg-[#13283F] px-4 py-1.5 text-xs text-slate-300 flex justify-between items-center border-b border-navy-900 font-sans">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-slate-200">Smart India Hackathon 2026 Prototype</span>
          <span className="text-slate-500">|</span>
          <span>Government of Maharashtra Skilling Analytics</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenArchitecture}
            className="text-marigold hover:underline flex items-center space-x-1 font-medium text-xs"
          >
            <div className="w-4 h-4 rounded-full bg-navy-800 flex items-center justify-center border border-navy-700">
              <Layers className="w-2.5 h-2.5 text-marigold" />
            </div>
            <span>Architecture Blueprint</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onReseed}
            disabled={isReseeding}
            className="text-slate-300 hover:text-white flex items-center space-x-1 text-xs"
            title="Reset database to initial state"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>{isReseeding ? 'Resetting DB...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-marigold flex items-center justify-center text-navy font-bold text-base font-serif">
            प्र
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-serif">
                PragatiPath
              </h1>
              <span className="text-xs text-marigold font-serif font-bold">
                (प्रगतीPath)
              </span>
              <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider border border-slate-600 px-1.5 py-0.2 rounded">
                Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Longitudinal Skilling-Outcome Tracking Platform
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex flex-wrap items-center bg-navy-900 p-1 rounded border border-navy-700 font-sans">
          <span className="text-[11px] text-slate-400 px-2 py-1 hidden sm:inline-block">
            Demo mode: switch role:
          </span>

          {/* Active View 1: Trainee */}
          <button
            onClick={() => onSelectRole('trainee')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              currentRole === 'trainee'
                ? 'bg-marigold text-navy'
                : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${currentRole === 'trainee' ? 'bg-navy text-marigold' : 'bg-navy-800 text-slate-300'}`}>
              <GraduationCap className="w-2.5 h-2.5" />
            </div>
            <span>Trainee View</span>
          </button>

          {/* Active View 2: Employer */}
          <button
            onClick={() => onSelectRole('employer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              currentRole === 'employer'
                ? 'bg-marigold text-navy'
                : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${currentRole === 'employer' ? 'bg-navy text-marigold' : 'bg-navy-800 text-slate-300'}`}>
              <Building2 className="w-2.5 h-2.5" />
            </div>
            <span>Employer View</span>
          </button>

          {/* Active View 3: Government Official */}
          <button
            onClick={() => onSelectRole('government')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              currentRole === 'government'
                ? 'bg-marigold text-navy'
                : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${currentRole === 'government' ? 'bg-navy text-marigold' : 'bg-navy-800 text-slate-300'}`}>
              <Landmark className="w-2.5 h-2.5" />
            </div>
            <span>Government View</span>
          </button>

          {/* Stubbed View: Training Provider */}
          <button
            onClick={() => onOpenStubModal('Training Provider Portal')}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors opacity-75 hover:opacity-100"
            title="Training Provider Portal: Planned in Phase 2"
          >
            <div className="w-4 h-4 rounded-full bg-navy-800 flex items-center justify-center">
              <BookOpen className="w-2.5 h-2.5 text-slate-400" />
            </div>
            <span className="hidden md:inline">Provider</span>
            <span className="text-[9px] bg-navy-800 text-slate-400 px-1 py-0.2 rounded border border-navy-700">Stub</span>
          </button>

          {/* Stubbed View: Policymaker */}
          <button
            onClick={() => onOpenStubModal('Policymaker Macro Simulator')}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors opacity-75 hover:opacity-100"
            title="Policymaker Macro Forecasting: Planned in Phase 2"
          >
            <div className="w-4 h-4 rounded-full bg-navy-800 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-slate-400" />
            </div>
            <span className="hidden md:inline">Policymaker</span>
            <span className="text-[9px] bg-navy-800 text-slate-400 px-1 py-0.2 rounded border border-navy-700">Stub</span>
          </button>
        </div>
      </div>
    </header>
  );
};
