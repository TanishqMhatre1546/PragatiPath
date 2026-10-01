import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { Header } from './components/Header';
import { TraineeView } from './components/TraineeView';
import { EmployerView } from './components/EmployerView';
import { GovernmentView } from './components/GovernmentView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { StubbedModal } from './components/StubbedModal';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('trainee');
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [stubFeature, setStubFeature] = useState<string | null>(null);
  const [isReseeding, setIsReseeding] = useState<boolean>(false);

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const res = await api.login(currentRole);
        if (res.access_token) {
          localStorage.setItem('pragatipath_token', res.access_token);
        }
      } catch (err) {
        console.warn('Backend notice: running in local mode.', err);
      }
    };
    syncAuth();
  }, [currentRole]);

  const handleReseed = async () => {
    if (!window.confirm('Reset database to initial Smart India Hackathon demo seed dataset?')) {
      return;
    }
    try {
      setIsReseeding(true);
      await api.reseedDatabase();
      window.location.reload();
    } catch (err: any) {
      alert(`Error reseeding database: ${err.message}`);
      setIsReseeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={role => setCurrentRole(role)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenStubModal={name => setStubFeature(name)}
        onReseed={handleReseed}
        isReseeding={isReseeding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {currentRole === 'trainee' && <TraineeView />}
        {currentRole === 'employer' && <EmployerView />}
        {currentRole === 'government' && <GovernmentView />}
      </main>

      {/* Factual Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-navy font-serif">PragatiPath (प्रगतीPath)</span>
            <span>| SIH 2026 Prototype, Govt. of Maharashtra</span>
          </div>
          <div className="text-[11px] text-slate-400">
            FastAPI + SQLite (PostgreSQL Compatible) | Local Scikit-Learn ML
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <StubbedModal
        isOpen={!!stubFeature}
        onClose={() => setStubFeature(null)}
        featureName={stubFeature || ''}
      />
    </div>
  );
};

export default App;
