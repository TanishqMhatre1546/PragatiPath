import React, { useState, useEffect } from 'react';
import { 
  AnalyticsSummary, 
  VerificationQuality, 
  SkillGapResponse, 
  AttritionRiskResponse,
  OutboundMessage
} from '../types';
import { api } from '../services/api';
import { 
  TrendingUp, 
  Users, 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  BrainCircuit, 
  BarChart3, 
  CheckCircle2, 
  MessageSquare, 
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const GovernmentView: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [quality, setQuality] = useState<VerificationQuality | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGapResponse | null>(null);
  const [attritionRisk, setAttritionRisk] = useState<AttritionRiskResponse | null>(null);
  const [messagesData, setMessagesData] = useState<{ engine: string; total_messages_logged: number; messages: OutboundMessage[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [riskFilter, setRiskFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [sum, qual, sg, ar, msg] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getVerificationQuality(),
        api.getSkillGaps(),
        api.getAttritionRisk(),
        api.getOutboundMessages()
      ]);
      setSummary(sum);
      setQuality(qual);
      setSkillGaps(sg);
      setAttritionRisk(ar);
      setMessagesData(msg);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary || !quality || !skillGaps || !attritionRisk) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="text-center font-sans">
          <div className="w-8 h-8 border-2 border-navy border-t-marigold rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-navy">
            Running local scikit-learn analytics and aggregating outcomes...
          </p>
        </div>
      </div>
    );
  }

  const STATUS_COLORS = ['#1B3A5C', '#387BBA', '#F5A623', '#94A3B8'];

  const filteredPredictions = riskFilter === 'all'
    ? attritionRisk.predictions
    : attritionRisk.predictions.filter(p => p.risk_level === riskFilter);

  return (
    <div className="space-y-5 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-navy-800 bg-cardbg border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Feature 3
            </span>
            <span className="text-[11px] text-slate-500">Government Directorate Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-navy mt-1 font-serif">
            Statewide Longitudinal Outcome and AI Analytics
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Local scikit-learn machine learning for curriculum skill-gap quantification and attrition risk signals.
          </p>
        </div>

        {/* Engine Status Tag */}
        <div className="bg-cardbg px-3 py-1.5 rounded border border-slate-300 flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-navy text-marigold flex items-center justify-center">
            <BrainCircuit className="w-3 h-3" />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-bold uppercase text-slate-500">Local ML Engine</div>
            <div className="text-xs font-bold text-navy">TF-IDF & Logistic Regression Active</div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded p-3.5 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cohort Size</span>
            <div className="w-5 h-5 rounded-full bg-navy-50 flex items-center justify-center text-navy">
              <Users className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy mt-1 font-serif">{summary.total_trainees}</div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Pune, Nashik, and Nagpur districts
          </span>
        </div>

        <div className="bg-white rounded p-3.5 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Placement Rate</span>
            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Award className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800 mt-1 font-serif">{summary.overall_employment_rate}%</div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Employed, self-employed, or apprentice
          </span>
        </div>

        <div className="bg-white rounded p-3.5 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">12M Average Wage Gain</span>
            <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center text-marigold">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy mt-1 font-serif">
            +₹{(summary.current_avg_wage_12m - summary.baseline_wage_3m).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            +{summary.wage_growth_rate}% from 3-month baseline
          </span>
        </div>

        <div className="bg-white rounded p-3.5 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verification Assurance</span>
            <div className="w-5 h-5 rounded-full bg-navy-50 flex items-center justify-center text-navy">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy mt-1 font-serif">{quality.confidence_index}%</div>
          <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
            {quality.confidence_grade}
          </span>
        </div>
      </div>

      {/* Visual Charts: Longitudinal Progression & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Longitudinal Trajectory Chart */}
        <div className="lg:col-span-2 bg-white rounded p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-navy font-serif">
                Longitudinal Retention and Wage Progression
              </h3>
              <p className="text-[11px] text-slate-500">
                Retention rate and average wage across Month 3, 6, and 12 checkpoints
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={summary.longitudinal_progression} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month_mark" tick={{ fontSize: 11, fill: '#1B3A5C', fontWeight: 600 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={val => `${val}%`}
                  domain={[0, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={val => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'Retention Rate (%)' ? `${value}%` : `₹${Number(value).toLocaleString('en-IN')}`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#1B3A5C', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="retention_rate"
                  name="Retention Rate (%)"
                  fill="#1B3A5C"
                  barSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="average_wage"
                  name="Average Wage (₹)"
                  stroke="#F5A623"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#F5A623', stroke: '#1B3A5C', strokeWidth: 1 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-white rounded p-4 border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-navy font-serif">
              Status Distribution
            </h3>
            <p className="text-[11px] text-slate-500">Current cohort status breakdown</p>
          </div>

          <div className="h-40 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.status_split}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  innerRadius={30}
                  paddingAngle={2}
                >
                  {summary.status_split.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Candidates`, 'Count']}
                  contentStyle={{ backgroundColor: '#1B3A5C', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {summary.status_split.map((s, idx) => (
              <div key={s.status} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[idx] }}></span>
                <span className="text-slate-600 text-[11px] truncate">{s.status}:</span>
                <span className="font-bold text-navy text-[11px]">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District & Course Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* District Matrix */}
        <div className="bg-white rounded p-4 border border-slate-200">
          <h3 className="font-bold text-sm text-navy font-serif mb-2">
            District Performance Breakdown
          </h3>
          <div className="space-y-2.5">
            {summary.district_breakdown.map(d => (
              <div key={d.district} className="bg-cardbg rounded p-2.5 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy">{d.district}</span>
                  <span className="font-bold text-navy">{d.placement_rate}% Retained</span>
                </div>
                <div className="w-full bg-slate-200 rounded h-1.5 overflow-hidden">
                  <div className="bg-navy h-1.5 rounded" style={{ width: `${d.placement_rate}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[10px] pt-0.5">
                  <span>{d.total_trainees} Candidates ({d.employed_count} active)</span>
                  <span>Avg Wage: ₹{d.average_wage.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Matrix */}
        <div className="bg-white rounded p-4 border border-slate-200">
          <h3 className="font-bold text-sm text-navy font-serif mb-2">
            Course Performance Breakdown
          </h3>
          <div className="space-y-2.5">
            {summary.course_breakdown.map(c => (
              <div key={c.course_id} className="bg-cardbg rounded p-2.5 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy truncate max-w-[200px]" title={c.course_name}>
                    {c.course_name}
                  </span>
                  <span className="font-bold text-navy">{c.placement_rate}% Placed</span>
                </div>
                <div className="w-full bg-slate-200 rounded h-1.5 overflow-hidden">
                  <div className="bg-navy h-1.5 rounded" style={{ width: `${c.placement_rate}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[10px] pt-0.5">
                  <span>{c.total_trainees} Candidates ({c.employed_count} active)</span>
                  <span>Avg Wage: ₹{c.average_wage.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURE 3: Real Scikit-Learn Skill-Gap Analysis Card */}
      <div className="bg-white rounded p-4 border border-slate-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-navy text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                Scikit-Learn ML
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">
                TF-IDF Vectorizer + Cosine Similarity
              </span>
            </div>
            <h3 className="text-base font-bold text-navy mt-0.5 font-serif">
              Curriculum vs Employer Skill-Gap Analysis
            </h3>
            <p className="text-xs text-slate-600">
              Vectorizes taught curriculum against active employer demand. Flagged if similarity score is below 50%.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Flagged Courses</span>
            <span className="text-lg font-bold text-rose-700 font-serif">
              {skillGaps.flagged_courses_count} of {skillGaps.total_courses_analyzed}
            </span>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {skillGaps.courses.map(course => {
            const isExpanded = expandedCourseId === course.course_id;
            return (
              <div
                key={course.course_id}
                className={`rounded p-3 border ${
                  course.is_flagged ? 'bg-rose-50/40 border-rose-200' : 'bg-cardbg border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-navy font-serif">{course.course_name}</h4>
                    <span className="text-[10px] text-slate-500 block">
                      {course.skills_taught_count} Taught, {course.skills_demanded_count} Demanded
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    course.is_flagged
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {course.similarity_score}% Match
                  </span>
                </div>

                <div className="mt-2">
                  <div className="w-full bg-slate-200 rounded h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded ${course.is_flagged ? 'bg-rose-600' : 'bg-navy'}`}
                      style={{ width: `${course.similarity_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={`text-[11px] font-semibold ${course.is_flagged ? 'text-rose-800' : 'text-emerald-800'}`}>
                    {course.gap_status}
                  </span>

                  <button
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.course_id)}
                    className="text-navy hover:underline font-semibold text-[11px] flex items-center space-x-0.5"
                  >
                    <span>{isExpanded ? 'Hide Skills' : 'Inspect Delta'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-900 block text-[10px]">Overlapping Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {course.matching_skills.map(s => (
                          <span key={s} className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-rose-900 block text-[10px]">Missing Industry Demands:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {course.missing_skills.map(s => (
                          <span key={s} className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.2 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-1.5 rounded border border-slate-200 text-[10px] text-navy">
                      Action: {course.recommendation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 3: Real Scikit-Learn Attrition Risk Predictor Card */}
      <div className="bg-white rounded p-4 border border-slate-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-navy text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                Scikit-Learn ML
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">
                Logistic Regression Pipeline
              </span>
            </div>
            <h3 className="text-base font-bold text-navy mt-0.5 font-serif">
              Attrition Risk Signals
            </h3>
            {/* Explicit Ethical Decision-Support Label */}
            <div className="mt-1 flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] px-2.5 py-0.5 rounded">
              <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span>{attritionRisk.mandatory_disclaimer}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {(['all', 'High', 'Medium', 'Low'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  riskFilter === lvl
                    ? 'bg-navy text-white'
                    : 'bg-cardbg text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {lvl === 'all' ? 'All Trainees' : `${lvl} Risk`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cardbg border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2 px-3">Candidate</th>
                <th className="py-2 px-3">Course and District</th>
                <th className="py-2 px-3">Latest Wage</th>
                <th className="py-2 px-3">Risk Score</th>
                <th className="py-2 px-3">Risk Band</th>
                <th className="py-2 px-3">Decision-Support Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPredictions.slice(0, 10).map(pred => (
                <tr key={pred.trainee_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-navy">
                    {pred.name}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    <div>{pred.course_name}</div>
                    <span className="text-[10px] text-slate-400">{pred.district}</span>
                  </td>
                  <td className="py-2 px-3 font-bold text-navy">
                    {pred.latest_wage ? `₹${pred.latest_wage.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-bold text-navy">{pred.attrition_risk_score}%</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                      pred.risk_level === 'High'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : pred.risk_level === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {pred.risk_level}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    {pred.recommended_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified vs Reported Quality & Communication Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Verification Quality Stat Card */}
        <div className="bg-white rounded p-4 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy font-serif">
                Verified vs Reported Quality Assurance
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Grade A Integrity
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison between self-reported candidate checkpoints and employer verifications
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 my-3">
            <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200 text-center">
              <div className="text-xl font-bold text-emerald-800 font-serif">{quality.verified_count}</div>
              <span className="text-[10px] font-semibold text-emerald-900 block mt-0.5">Verified ({quality.verified_percentage}%)</span>
            </div>

            <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-center">
              <div className="text-xl font-bold text-amber-800 font-serif">{quality.pending_count}</div>
              <span className="text-[10px] font-semibold text-amber-900 block mt-0.5">Pending ({quality.pending_percentage}%)</span>
            </div>

            <div className="bg-rose-50 p-2.5 rounded border border-rose-200 text-center">
              <div className="text-xl font-bold text-rose-800 font-serif">{quality.disputed_count}</div>
              <span className="text-[10px] font-semibold text-rose-900 block mt-0.5">Disputed ({quality.disputed_percentage}%)</span>
            </div>
          </div>

          <div className="bg-cardbg p-2.5 rounded border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-navy text-[11px] block">Dispute Reconciliation:</span>
            <p className="text-[10px] leading-relaxed text-slate-600">
              Disputed records trigger audit workflows for Maharashtra District Skill Development Officers (DSDO) before state disbursement subsidy release.
            </p>
          </div>
        </div>

        {/* Outbound Communication Engine Log */}
        <div className="bg-white rounded p-4 border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-sm text-navy font-serif">
                Outbound Message Engine Log
              </h3>
              <p className="text-[11px] text-slate-500">Live feed of simulated WhatsApp and SMS dispatches</p>
            </div>
            <span className="text-[10px] bg-cardbg text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 font-semibold">
              Simulated
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-52 space-y-2 pr-1">
            {messagesData && messagesData.messages.length > 0 ? (
              messagesData.messages.slice(0, 12).map(msg => (
                <div
                  key={msg.id}
                  className="bg-cardbg rounded p-2 border border-slate-200 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center space-x-1.5 font-semibold">
                      <span className={`px-1 py-0.2 rounded uppercase ${
                        msg.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {msg.channel}
                      </span>
                      <span className="text-navy">{msg.trainee_name} ({msg.district})</span>
                    </div>
                    <span className="text-slate-400">
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleDateString('en-IN') : 'Recent'}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-normal">
                    {msg.message_text}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No outbound notifications logged.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
