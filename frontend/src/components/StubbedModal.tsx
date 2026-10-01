import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface StubbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const StubbedModal: React.FC<StubbedModalProps> = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-navy-950/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded max-w-md w-full p-5 border border-slate-300 font-sans">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded uppercase">
              Phase 2 Roadmap: Planned
            </span>
            <h3 className="text-base font-bold text-navy mt-0.5 font-serif">{featureName}</h3>
          </div>
        </div>

        <div className="mt-3 bg-cardbg p-3 rounded border border-slate-200 text-xs text-slate-600 space-y-2">
          <p className="leading-relaxed">
            Per the <strong>40-50% functional prototype scope</strong> submitted for Smart India Hackathon, this module is transparently stubbed.
          </p>
          <div className="space-y-1 pt-1">
            <div className="font-bold text-navy text-[11px]">Fully functional in current prototype:</div>
            <div className="text-[11px] text-emerald-800 flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              <span>Trainee Longitudinal Timeline and &lt;15s Check-In</span>
            </div>
            <div className="text-[11px] text-emerald-800 flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              <span>Employer 1-Tap Verification Feed</span>
            </div>
            <div className="text-[11px] text-emerald-800 flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              <span>Real Scikit-Learn TF-IDF and Logistic Regression Models</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-navy hover:bg-navy-900 text-white font-bold px-3.5 py-1.5 rounded text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
