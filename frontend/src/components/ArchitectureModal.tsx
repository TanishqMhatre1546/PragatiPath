import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const methodologySteps = [
    {
      num: '1',
      title: 'Consent & Onboarding',
      desc: 'Explicit candidate consent recorded during skilling registration. Role-based demo authentication.',
      status: 'Functional (Demo Auth)'
    },
    {
      num: '2',
      title: 'Identity & Record Linkage',
      desc: 'Relational mapping connecting candidates, courses, districts, and longitudinal milestones.',
      status: 'Fully Functional'
    },
    {
      num: '3',
      title: 'Outcome Data Collection',
      desc: 'Low-burden conversational check-in under 15 seconds capturing employment status and wages.',
      status: 'Fully Functional'
    },
    {
      num: '4',
      title: '3-Tier Verification Layer',
      desc: 'One-tap employer confirmation feed with Verified, Disputed, and Pending status reconciliation.',
      status: 'Fully Functional'
    },
    {
      num: '5',
      title: 'Analysis & Insights (Local AI)',
      desc: 'Real scikit-learn TF-IDF Skill-Gap Analysis and Logistic Regression Attrition Risk Predictor.',
      status: 'Fully Functional (Real ML)'
    },
    {
      num: '6',
      title: 'Action & Reporting',
      desc: 'State directorate dashboard, district-level breakdown, and simulated outbound message logs.',
      status: 'Fully Functional'
    }
  ];

  return (
    <div className="fixed inset-0 bg-navy-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded max-w-3xl w-full p-6 border border-slate-300 my-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-navy text-marigold flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy font-serif">Architecture Blueprint</h3>
              <p className="text-xs text-slate-500">
                1:1 Mapping with the Technical Approach Slide (Smart India Hackathon 2026)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-navy text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* 6-Stage Flow Grid */}
        <div className="mt-4 space-y-2.5">
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Methodology Flow Implementation (40-50% Functional Scope)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {methodologySteps.map(step => (
              <div key={step.num} className="bg-cardbg p-3 rounded border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded bg-navy text-white font-bold text-[10px] flex items-center justify-center">
                      {step.num}
                    </span>
                    <span className="font-bold text-xs text-navy font-serif">{step.title}</span>
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    step.status.includes('Fully')
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal pl-6">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Honest Disclosure Box */}
        <div className="mt-4 bg-slate-50 rounded p-3 border border-slate-200 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-navy mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Honest Technical Scope</span>
          </div>
          <ul className="space-y-1 text-slate-600 text-[11px]">
            <li className="flex items-start space-x-1.5">
              <span className="text-emerald-700 font-bold">•</span>
              <span><strong>Zero-Cost Local Stack:</strong> No paid APIs or hosted database bills. Local FastAPI with scikit-learn.</span>
            </li>
            <li className="flex items-start space-x-1.5">
              <span className="text-emerald-700 font-bold">•</span>
              <span><strong>PostgreSQL Compatibility:</strong> SQLite locally. Changing DATABASE_URL to PostgreSQL is a one-line config for production.</span>
            </li>
            <li className="flex items-start space-x-1.5">
              <span className="text-emerald-700 font-bold">•</span>
              <span><strong>Real Machine Learning:</strong> TF-IDF Vectorizer and Logistic Regression models run directly on the local backend.</span>
            </li>
            <li className="flex items-start space-x-1.5">
              <span className="text-amber-800 font-bold">•</span>
              <span><strong>Simulated Notifications:</strong> Outbound WhatsApp and SMS are simulated in the in-app audit log.</span>
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-navy hover:bg-navy-900 text-white font-bold px-4 py-1.5 rounded text-xs transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
