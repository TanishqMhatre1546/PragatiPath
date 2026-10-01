import React, { useState, useEffect } from 'react';
import { TraineeSummary, TraineeDetail } from '../types';
import { api } from '../services/api';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  Award, 
  IndianRupee, 
  MessageSquare, 
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

export const TraineeView: React.FC = () => {
  const [trainees, setTrainees] = useState<TraineeSummary[]>([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
  const [traineeDetail, setTraineeDetail] = useState<TraineeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Checkin form state
  const [checkinStatus, setCheckinStatus] = useState<string>('employed');
  const [checkinEmployer, setCheckinEmployer] = useState<string>('');
  const [checkinWage, setCheckinWage] = useState<number>(16500);
  const [checkinSameEmployer, setCheckinSameEmployer] = useState<boolean>(true);

  // Load trainees list on mount
  useEffect(() => {
    loadTrainees();
  }, []);

  const loadTrainees = async () => {
    try {
      setLoading(true);
      const data = await api.getTrainees();
      setTrainees(data);
      if (data.length > 0) {
        const rohan = data.find(t => t.name.includes('Rohan Patil'));
        const defaultId = rohan ? rohan.id : data[0].id;
        setSelectedTraineeId(defaultId);
        loadTraineeDetail(defaultId);
      }
    } catch (err) {
      console.error('Error fetching trainees:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTraineeDetail = async (id: number) => {
    try {
      const detail = await api.getTraineeDetail(id);
      setTraineeDetail(detail);
      const latestCp = detail.checkpoints[detail.checkpoints.length - 1];
      if (latestCp) {
        setCheckinEmployer(latestCp.employer_name || 'Tata Motors Ltd Pune');
        setCheckinWage((latestCp.wage || 14000) + 1500);
      }
    } catch (err) {
      console.error('Error loading trainee detail:', err);
    }
  };

  const handleSelectTrainee = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedTraineeId(id);
    loadTraineeDetail(id);
  };

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraineeId) return;

    try {
      setIsSubmitting(true);
      const res = await api.submitCheckin(selectedTraineeId, {
        status: checkinStatus,
        employer_name: checkinStatus === 'employed' || checkinStatus === 'apprentice' ? checkinEmployer : undefined,
        wage: checkinStatus !== 'unemployed' ? Number(checkinWage) : undefined,
        same_employer: checkinSameEmployer
      });

      setShowCheckinModal(false);
      setSuccessToast(res.message);
      setTimeout(() => setSuccessToast(null), 5000);

      await loadTraineeDetail(selectedTraineeId);
      const updatedList = await api.getTrainees();
      setTrainees(updatedList);
    } catch (err: any) {
      alert(`Check-in error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !traineeDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center font-sans">
          <div className="w-8 h-8 border-2 border-navy border-t-marigold rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-navy">Loading trainee records...</p>
        </div>
      </div>
    );
  }

  const wageChartData = traineeDetail?.checkpoints.map(cp => ({
    milestone: `Month ${cp.month_mark}`,
    wage: cp.wage || 0,
    status: cp.status,
    employer: cp.employer_name || 'N/A'
  })) || [];

  return (
    <div className="space-y-5 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
            Simulated WhatsApp Logged
          </span>
        </div>
      )}

      {/* Trainee View Header and Selector */}
      <div className="bg-white rounded p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-navy-800 bg-cardbg border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Feature 1
            </span>
            <span className="text-[11px] text-slate-500">Candidate Consent Recorded</span>
          </div>
          <h2 className="text-xl font-bold text-navy mt-1 font-serif">
            Trainee Timeline and Milestone Check-In
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Longitudinal skilling outcome records at 3, 6, and 12-month post-training checkpoints.
          </p>
        </div>

        {/* Trainee Dropdown Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="bg-cardbg p-1 rounded border border-slate-300 flex items-center space-x-2">
            <label className="text-xs font-semibold text-navy px-1.5 whitespace-nowrap">
              Select Trainee:
            </label>
            <select
              value={selectedTraineeId || ''}
              onChange={handleSelectTrainee}
              className="bg-white text-navy font-semibold text-xs py-1 px-2.5 rounded border border-slate-200 focus:outline-none"
            >
              {trainees.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.course_name}, {t.district})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCheckinModal(true)}
            className="bg-marigold text-navy font-bold px-3.5 py-1.5 rounded text-xs flex items-center justify-center space-x-1.5 hover:bg-marigold-500 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-navy" />
            <span>Simulate Next Check-In</span>
          </button>
        </div>
      </div>

      {traineeDetail && (
        <>
          {/* Trainee Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Name</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">
                  {traineeDetail.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy font-serif">{traineeDetail.name}</h3>
                  <span className="text-[11px] text-slate-500">{traineeDetail.district}, Maharashtra</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Course</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <div className="w-5 h-5 rounded-full bg-navy-50 flex items-center justify-center text-navy">
                  <Award className="w-3 h-3 text-navy" />
                </div>
                <span className="font-bold text-xs text-navy truncate" title={traineeDetail.course_name}>
                  {traineeDetail.course_name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Enrolled: {traineeDetail.enrollment_date}
              </span>
            </div>

            <div className="bg-white rounded p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Status</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                  traineeDetail.current_status === 'employed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : traineeDetail.current_status === 'self-employed'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : traineeDetail.current_status === 'apprentice'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {traineeDetail.current_status.replace('-', ' ')}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1 truncate">
                {traineeDetail.latest_employer ? `Employer: ${traineeDetail.latest_employer}` : 'No active employer on record'}
              </span>
            </div>

            <div className="bg-white rounded p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Latest Wage</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-lg font-bold text-navy font-serif">
                  {traineeDetail.latest_wage ? `₹${traineeDetail.latest_wage.toLocaleString('en-IN')}` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500">/ month</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {traineeDetail.checkpoints.length} recorded milestones
              </span>
            </div>
          </div>

          {/* Longitudinal Visual Timeline */}
          <div className="bg-white rounded p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-navy font-serif">
                  Longitudinal Skilling Timeline
                </h3>
                <p className="text-xs text-slate-500">
                  Sequential progression from course completion to 12-month post-training outcomes.
                </p>
              </div>
            </div>

            {/* Step Progression Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Step 1: Training */}
              <div className="bg-cardbg rounded p-3 border border-slate-200 text-center flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-navy text-marigold flex items-center justify-center text-xs mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-navy">Training Completed</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{traineeDetail.enrollment_date}</span>
                <span className="mt-1.5 text-[9px] bg-white text-navy font-semibold px-1.5 py-0.2 rounded border border-slate-200">
                  Passed Curriculum
                </span>
              </div>

              {/* Step 2: Certification */}
              <div className="bg-cardbg rounded p-3 border border-slate-200 text-center flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-navy text-marigold flex items-center justify-center text-xs mb-1.5">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-navy">Govt Certification</span>
                <span className="text-[10px] text-slate-500 mt-0.5">NCVET Level-4</span>
                <span className="mt-1.5 text-[9px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                  Certified
                </span>
              </div>

              {/* Step 3: Month 3 */}
              {(() => {
                const cp3 = traineeDetail.checkpoints.find(c => c.month_mark === 3);
                return (
                  <div className={`rounded p-3 border text-center flex flex-col items-center ${
                    cp3 ? 'bg-cardbg border-slate-200' : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      cp3 ? 'bg-navy text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      3M
                    </div>
                    <span className="text-xs font-bold text-navy">Month 3 Checkpoint</span>
                    {cp3 ? (
                      <>
                        <span className="text-[11px] font-bold text-navy mt-0.5">
                          {cp3.wage ? `₹${cp3.wage.toLocaleString('en-IN')}` : cp3.status}
                        </span>
                        <span className="text-[10px] text-slate-600 truncate max-w-[120px]" title={cp3.employer_name || ''}>
                          {cp3.employer_name || 'Self-Employed'}
                        </span>
                        {cp3.verification && (
                          <span className={`mt-1.5 text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                            cp3.verification.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : cp3.verification.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {cp3.verification.status.toUpperCase()}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-1">Pending</span>
                    )}
                  </div>
                );
              })()}

              {/* Step 4: Month 6 */}
              {(() => {
                const cp6 = traineeDetail.checkpoints.find(c => c.month_mark === 6);
                return (
                  <div className={`rounded p-3 border text-center flex flex-col items-center ${
                    cp6 ? 'bg-cardbg border-slate-200' : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      cp6 ? 'bg-navy text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      6M
                    </div>
                    <span className="text-xs font-bold text-navy">Month 6 Checkpoint</span>
                    {cp6 ? (
                      <>
                        <span className="text-[11px] font-bold text-navy mt-0.5">
                          {cp6.wage ? `₹${cp6.wage.toLocaleString('en-IN')}` : cp6.status}
                        </span>
                        <span className="text-[10px] text-slate-600 truncate max-w-[120px]" title={cp6.employer_name || ''}>
                          {cp6.employer_name || 'Self-Employed'}
                        </span>
                        {cp6.verification && (
                          <span className={`mt-1.5 text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                            cp6.verification.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : cp6.verification.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {cp6.verification.status.toUpperCase()}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-1">Pending</span>
                    )}
                  </div>
                );
              })()}

              {/* Step 5: Month 12 */}
              {(() => {
                const cp12 = traineeDetail.checkpoints.find(c => c.month_mark === 12);
                return (
                  <div className={`rounded p-3 border text-center flex flex-col items-center ${
                    cp12 ? 'bg-cardbg border-slate-200' : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      cp12 ? 'bg-navy text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      12M
                    </div>
                    <span className="text-xs font-bold text-navy">Month 12 Checkpoint</span>
                    {cp12 ? (
                      <>
                        <span className="text-[11px] font-bold text-navy mt-0.5">
                          {cp12.wage ? `₹${cp12.wage.toLocaleString('en-IN')}` : cp12.status}
                        </span>
                        <span className="text-[10px] text-slate-600 truncate max-w-[120px]" title={cp12.employer_name || ''}>
                          {cp12.employer_name || 'Self-Employed'}
                        </span>
                        {cp12.verification && (
                          <span className={`mt-1.5 text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                            cp12.verification.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : cp12.verification.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {cp12.verification.status.toUpperCase()}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-1">Pending</span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Wage Chart & Outbound Message Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Wage Chart */}
            <div className="bg-white rounded p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-navy font-serif">
                    Wage Progression Curve
                  </h3>
                  <p className="text-[11px] text-slate-500">Reported monthly salary across checkpoints</p>
                </div>
                {wageChartData.length > 1 && (
                  <span className="text-[11px] bg-slate-50 text-navy font-semibold px-2 py-0.5 rounded border border-slate-200">
                    Growth: +₹{(wageChartData[wageChartData.length - 1].wage - wageChartData[0].wage).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {wageChartData.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={wageChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="milestone" tick={{ fontSize: 11, fill: '#1B3A5C' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        tickFormatter={val => `₹${val / 1000}k`}
                      />
                      <Tooltip
                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Monthly Wage']}
                        contentStyle={{ backgroundColor: '#1B3A5C', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="wage"
                        stroke="#1B3A5C"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#F5A623', stroke: '#1B3A5C', strokeWidth: 1.5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                  No wage checkpoints logged yet.
                </div>
              )}
            </div>

            {/* Outbound Communication Log */}
            <div className="bg-white rounded p-4 border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-navy font-serif">
                    Outbound Message Log
                  </h3>
                  <p className="text-[11px] text-slate-500">Simulated WhatsApp and SMS notification history</p>
                </div>
                <span className="text-[10px] bg-cardbg text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 font-semibold">
                  Simulated
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-56 space-y-2 pr-1">
                {traineeDetail.outbound_messages.length > 0 ? (
                  traineeDetail.outbound_messages.map(msg => (
                    <div
                      key={msg.id}
                      className="bg-cardbg rounded p-2.5 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-bold px-1.5 py-0.2 rounded uppercase ${
                          msg.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {msg.channel}
                        </span>
                        <span className="text-slate-400">
                          {msg.sent_at ? new Date(msg.sent_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </div>
                      <p className="text-navy font-medium text-[11px] leading-relaxed">
                        {msg.message_text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No outbound messages dispatched yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Low-Burden Check-In Modal (<15 seconds flow) */}
      {showCheckinModal && traineeDetail && (
        <div className="fixed inset-0 bg-navy-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full p-5 border border-slate-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase text-navy bg-cardbg border border-slate-200 px-1.5 py-0.2 rounded">
                  Low-Burden Check-In: Under 15 Seconds
                </span>
                <h3 className="text-base font-bold text-navy mt-1 font-serif">
                  Check-In for {traineeDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setShowCheckinModal(false)}
                className="text-slate-400 hover:text-navy text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Conversational Check-In Form */}
            <form onSubmit={handleCheckinSubmit} className="mt-3.5 space-y-3 font-sans">
              {/* Question 1 */}
              <div className="bg-cardbg p-3 rounded border border-slate-200 space-y-2">
                <label className="text-xs font-semibold text-navy flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded bg-navy text-white text-[10px] flex items-center justify-center">1</span>
                  <span>What is your current work status?</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { val: 'employed', label: 'Employed (Salary)' },
                    { val: 'self-employed', label: 'Self-Employed' },
                    { val: 'apprentice', label: 'Apprenticeship' },
                    { val: 'unemployed', label: 'Seeking Work' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setCheckinStatus(opt.val)}
                      className={`py-1.5 px-2.5 rounded text-xs font-semibold text-left border ${
                        checkinStatus === opt.val
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-navy border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Employer */}
              {checkinStatus !== 'unemployed' && (
                <div className="bg-cardbg p-3 rounded border border-slate-200 space-y-2">
                  <label className="text-xs font-semibold text-navy flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded bg-navy text-white text-[10px] flex items-center justify-center">2</span>
                    <span>Employer Details and Continuity</span>
                  </label>

                  <div>
                    <span className="text-[11px] text-slate-600 block mb-1">Employer / Enterprise Name:</span>
                    <input
                      type="text"
                      value={checkinEmployer}
                      onChange={e => setCheckinEmployer(e.target.value)}
                      placeholder="e.g. Tata Motors Ltd Pune"
                      required={checkinStatus === 'employed'}
                      className="w-full bg-white text-navy text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-navy"
                    />
                  </div>

                  <div className="flex items-center space-x-4 pt-1">
                    <span className="text-[11px] font-semibold text-navy">Same employer as previous checkpoint?</span>
                    <div className="flex items-center space-x-3 text-xs">
                      <label className="flex items-center space-x-1 text-navy cursor-pointer">
                        <input
                          type="radio"
                          name="sameEmp"
                          checked={checkinSameEmployer === true}
                          onChange={() => setCheckinSameEmployer(true)}
                          className="text-navy"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-1 text-navy cursor-pointer">
                        <input
                          type="radio"
                          name="sameEmp"
                          checked={checkinSameEmployer === false}
                          onChange={() => setCheckinSameEmployer(false)}
                          className="text-navy"
                        />
                        <span>No (New Job)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Question 3: Wage */}
              {checkinStatus !== 'unemployed' && (
                <div className="bg-cardbg p-3 rounded border border-slate-200 space-y-1.5">
                  <label className="text-xs font-semibold text-navy flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded bg-navy text-white text-[10px] flex items-center justify-center">3</span>
                    <span>Current Monthly In-Hand Wage (₹)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={checkinWage}
                      onChange={e => setCheckinWage(Number(e.target.value))}
                      placeholder="16500"
                      className="w-full bg-white text-navy text-xs font-bold pl-7 pr-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCheckinModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-navy text-white font-bold px-4 py-1.5 rounded text-xs hover:bg-navy-900 transition-colors"
                >
                  {isSubmitting ? 'Recording...' : 'Submit Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
