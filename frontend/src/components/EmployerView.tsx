import React, { useState, useEffect } from 'react';
import { VerificationItem } from '../types';
import { api } from '../services/api';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  X
} from 'lucide-react';

export const EmployerView: React.FC = () => {
  const [pendingItems, setPendingItems] = useState<VerificationItem[]>([]);
  const [allItems, setAllItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedEmployerFilter, setSelectedEmployerFilter] = useState<string>('All');
  const [actionFeedback, setActionFeedback] = useState<{ id: number; message: string; type: 'confirm' | 'deny' } | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const [pending, all] = await Promise.all([
        api.getPendingVerifications(),
        api.getAllVerifications()
      ]);
      setPendingItems(pending);
      setAllItems(all);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number, traineeName: string, employerName: string) => {
    try {
      await api.confirmVerification(id);
      setActionFeedback({
        id,
        message: `Verified employment for ${traineeName} at ${employerName}. Outbound WhatsApp alert dispatched.`,
        type: 'confirm'
      });
      await loadVerifications();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    }
  };

  const handleDeny = async (id: number, traineeName: string) => {
    try {
      await api.denyVerification(id);
      setActionFeedback({
        id,
        message: `Marked record for ${traineeName} as Disputed. Flagged for District Officer reconciliation.`,
        type: 'deny'
      });
      await loadVerifications();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      alert(`Dispute error: ${err.message}`);
    }
  };

  const employerNames = ['All', ...Array.from(new Set(allItems.map(i => i.employer_name)))];

  const filteredPending = selectedEmployerFilter === 'All'
    ? pendingItems
    : pendingItems.filter(i => i.employer_name === selectedEmployerFilter);

  const filteredHistory = selectedEmployerFilter === 'All'
    ? allItems
    : allItems.filter(i => i.employer_name === selectedEmployerFilter);

  return (
    <div className="space-y-5 font-sans">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className={`px-4 py-2.5 rounded border flex items-center justify-between text-xs ${
          actionFeedback.type === 'confirm'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center space-x-2 font-medium">
            {actionFeedback.type === 'confirm' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
            Audit Log Updated
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-navy-800 bg-cardbg border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Feature 2
            </span>
            <span className="text-[11px] text-slate-500">One-Tap Employer Verification</span>
          </div>
          <h2 className="text-xl font-bold text-navy mt-1 font-serif">
            Employer Verification Queue
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Authenticate candidate employment and wage milestones without complex logins or paperwork.
          </p>
        </div>

        {/* 3-Tier Legend & Employer Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3-Tier Badge Legend */}
          <div className="bg-cardbg px-2.5 py-1 rounded border border-slate-200 flex items-center space-x-2 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Legend:</span>
            <span className="inline-flex items-center space-x-1 text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300 text-[10px]">
              <span>Verified</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 text-[10px]">
              <span>Pending</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-rose-800 font-semibold bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300 text-[10px]">
              <span>Disputed</span>
            </span>
          </div>

          {/* Filter dropdown */}
          <select
            value={selectedEmployerFilter}
            onChange={e => setSelectedEmployerFilter(e.target.value)}
            className="bg-white text-navy font-semibold text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none"
          >
            {employerNames.map(emp => (
              <option key={emp} value={emp}>
                {emp === 'All' ? 'Filter: All Employers' : emp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded p-3.5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Awaiting Verification</span>
            <div className="text-2xl font-bold text-amber-700 mt-1 font-serif">{pendingItems.length}</div>
            <span className="text-[10px] text-slate-500">Requires 1-tap confirmation</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded p-3.5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verified Authentications</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">
              {allItems.filter(i => i.status === 'verified').length}
            </div>
            <span className="text-[10px] text-slate-500">Confirmed by employers</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded p-3.5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Flagged Discrepancies</span>
            <div className="text-2xl font-bold text-rose-700 mt-1 font-serif">
              {allItems.filter(i => i.status === 'disputed').length}
            </div>
            <span className="text-[10px] text-slate-500">Queued for reconciliation</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-navy text-navy'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verifications ({filteredPending.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-navy text-navy'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Master Audit Log ({filteredHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Requests Feed */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded p-8 text-center text-slate-400 text-xs">
              Loading pending verification queue...
            </div>
          ) : filteredPending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPending.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded p-4 border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold bg-navy text-white px-2 py-0.5 rounded">
                        Month {item.month_mark} Checkpoint
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        <span>PENDING</span>
                      </span>
                    </div>

                    {/* Candidate Name & Course */}
                    <div>
                      <h3 className="text-base font-bold text-navy font-serif">{item.trainee_name}</h3>
                      <p className="text-xs text-slate-600">{item.course_name}</p>
                    </div>

                    {/* Details Box */}
                    <div className="bg-cardbg rounded p-2.5 border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Employer Named:</span>
                        <span className="font-semibold text-navy">{item.employer_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">District:</span>
                        <span className="text-slate-700">{item.district}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Reported Monthly Wage:</span>
                        <span className="font-bold text-navy">
                          {item.reported_wage ? `₹${item.reported_wage.toLocaleString('en-IN')}/mo` : 'Unspecified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                    <button
                      onClick={() => handleConfirm(item.id, item.trainee_name, item.employer_name)}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 px-3 rounded text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm (Verify)</span>
                    </button>

                    <button
                      onClick={() => handleDeny(item.id, item.trainee_name)}
                      className="flex-1 bg-white hover:bg-rose-50 text-rose-700 font-semibold py-1.5 px-3 rounded text-xs border border-rose-300 flex items-center justify-center space-x-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Deny / Dispute</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded p-8 text-center border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-navy font-serif">All Pending Verifications Cleared</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Every candidate milestone for the selected filter has been resolved.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Full Audit History Table */}
      {activeTab === 'history' && (
        <div className="bg-white rounded border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cardbg border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Candidate</th>
                  <th className="py-2.5 px-3.5">Course and District</th>
                  <th className="py-2.5 px-3.5">Employer</th>
                  <th className="py-2.5 px-3.5">Milestone</th>
                  <th className="py-2.5 px-3.5">Reported Wage</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 font-bold text-navy">
                      {item.trainee_name}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">
                      <div>{item.course_name}</div>
                      <span className="text-[10px] text-slate-400">{item.district}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700">
                      {item.employer_name}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-navy">
                      Month {item.month_mark}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-navy">
                      {item.reported_wage ? `₹${item.reported_wage.toLocaleString('en-IN')}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.2 rounded uppercase ${
                        item.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {item.status === 'verified' ? 'Verified' : item.status === 'pending' ? 'Pending' : 'Disputed'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 text-[10px]">
                      {item.resolved_at
                        ? new Date(item.resolved_at).toLocaleDateString('en-IN')
                        : item.requested_at
                        ? new Date(item.requested_at).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
