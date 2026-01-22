import React, { useState } from 'react';
import { Download, FileSpreadsheet, Filter, TrendingUp, DollarSign, MousePointer2, ShieldCheck, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { Campaign } from '../types';
import { auditCampaignsAI } from '../services/geminiService';

interface ReportingViewProps {
  campaigns: Campaign[];
}

const ReportingView: React.FC<ReportingViewProps> = ({ campaigns }) => {
  const [reportType, setReportType] = useState('campaign');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ overallScore: number, summary: string, recommendations: string[] } | null>(null);

  const handleDownload = (format: 'excel' | 'csv') => {
    alert(`Đang tải xuống báo cáo...`);
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    const result = await auditCampaignsAI(campaigns);
    setAuditResult(result);
    setIsAuditing(false);
  };

  const getQualityScore = (c: Campaign) => {
    let score = 50; // Base score
    const benchmarks: Record<string, number> = { facebook: 1.5, google: 3.0, tiktok: 0.8, zalo: 0.5 };
    const benchmark = benchmarks[c.platform] || 1.0;
    const ctrRatio = c.ctr / benchmark;
    
    if (ctrRatio > 2) score += 20;
    else if (ctrRatio > 1.2) score += 10;
    else if (ctrRatio < 0.5) score -= 10;
    else if (ctrRatio < 0.2) score -= 20;

    if (c.objective === 'Sales') {
        if (c.ctr > 1.0 && c.spent > c.budget * 0.5) score += 15;
        else if (c.spent < c.budget * 0.1) score += 0;
        else if (c.ctr < 0.5) score -= 10;
    } 
    else if (c.objective === 'Traffic') {
        if (c.ctr > 2.0) score += 20;
        else if (c.ctr < 1.0) score -= 10;
    }
    else if (c.objective === 'Awareness') {
        if (c.impressions > 50000) score += 15;
    }

    if (c.status === 'active') score += 10;
    if (c.status === 'paused' && c.ctr < 1.0) score += 5;

    return Math.max(0, Math.min(100, Math.floor(score)));
  };

  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const avgCtr = (campaigns.reduce((acc, c) => acc + c.ctr, 0) / campaigns.length).toFixed(2);

  const SummaryCard = ({ label, value, icon: Icon, iconColor, bgColor }: any) => (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-5 flex-1 hover:shadow-md transition-shadow">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor}`}>
             <Icon size={26} className={iconColor} />
          </div>
          <div>
             <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
             <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
          </div>
      </div>
  );

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Redesigned AI Audit Section - Exactly Matching the Premium Layout */}
      <div className="bg-gradient-to-br from-[#4318FF] via-[#5D38FF] to-[#3A14D1] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 border border-white/10">
        
        {auditResult ? (
            <div className="flex flex-col lg:flex-row gap-10 items-stretch w-full relative z-10">
                {/* Left: Info & Gauge */}
                <div className="flex-1 flex flex-col items-start justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
                            <ShieldCheck size={24} className="text-green-400" />
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight">AI Campaign Audit</h2>
                    </div>
                    
                    <p className="text-indigo-100 text-sm mb-10 leading-relaxed opacity-90 max-w-lg">
                        Hệ thống sẽ quét toàn bộ dữ liệu lịch sử, so sánh với Benchmark ngành và đưa ra điểm chất lượng (Quality Score) cùng các đề xuất tối ưu.
                    </p>
                    
                    <div className="flex items-center gap-8">
                         {/* High-Contrast Score Circle Gauge */}
                         <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <defs>
                                  <linearGradient id="auditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4ade80" />
                                    <stop offset="100%" stopColor="#22d3ee" />
                                  </linearGradient>
                                </defs>
                                <circle 
                                    cx="56" cy="56" r="48" 
                                    stroke="currentColor" strokeWidth="10" 
                                    fill="transparent" className="text-indigo-950/40" 
                                />
                                <circle 
                                    cx="56" cy="56" r="48" 
                                    stroke="url(#auditGradient)" strokeWidth="10" 
                                    fill="transparent" 
                                    strokeDasharray={301.6} 
                                    strokeDashoffset={301.6 * (1 - auditResult.overallScore / 100)} 
                                    strokeLinecap="round" 
                                    className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white">{auditResult.overallScore}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                             <div className="text-xl font-extrabold text-white">Overall Score</div>
                             <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest opacity-80">Based on Obj. & Metrics</div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary Box with structured layout */}
                <div className="lg:w-[540px] bg-indigo-950/40 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl flex flex-col shadow-inner">
                     <div className="flex items-center gap-2 mb-4 text-yellow-300 font-bold text-xs uppercase tracking-[0.2em]">
                         <Zap size={14} fill="currentColor" /> AI SUMMARY
                     </div>
                     
                     <p className="text-sm text-white/90 mb-6 leading-relaxed font-medium">
                         {auditResult.summary}
                     </p>
                     
                     <div className="space-y-3.5 mt-auto">
                         {auditResult.recommendations.map((rec, i) => (
                             <div key={i} className="flex gap-4 text-xs font-medium text-white/80 bg-black/30 p-4 rounded-2xl border border-white/5 hover:bg-black/40 transition-colors items-start">
                                 <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/10">
                                     <AlertCircle size={14} className="text-orange-400" />
                                 </div>
                                 <span className="leading-relaxed">{rec}</span>
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        ) : (
            /* Non-Audited Initial State */
            <div className="flex flex-col items-start relative z-10 py-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/10">
                        <ShieldCheck size={24} className="text-green-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">AI Campaign Audit</h2>
                 </div>
                 <p className="text-indigo-100 text-sm max-w-xl leading-relaxed mb-10 opacity-80">
                    Hệ thống sẽ quét toàn bộ dữ liệu lịch sử, so sánh với Benchmark ngành và đưa ra điểm chất lượng (Quality Score) cùng các đề xuất tối ưu dựa trên mục tiêu chiến dịch.
                 </p>
                 <button 
                    onClick={handleAudit}
                    disabled={isAuditing}
                    className="bg-white text-[#4318FF] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 shadow-2xl"
                 >
                    {isAuditing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    {isAuditing ? 'Đang thực thi Audit...' : 'Audit Ngay'}
                 </button>
            </div>
        )}
        
        {/* Background Visual Accents for a more premium look */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full -mr-32 -mt-48 pointer-events-none blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400 opacity-10 rounded-full -ml-20 -mb-20 pointer-events-none blur-[80px]"></div>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-col md:flex-row gap-6">
          <SummaryCard 
            label="TỔNG CHI TIÊU" 
            value={`${totalSpent.toLocaleString()} đ`} 
            icon={DollarSign} 
            bgColor="bg-red-50"
            iconColor="text-red-500" 
          />
          <SummaryCard 
            label="TỔNG CLICKS" 
            value={totalClicks.toLocaleString()} 
            icon={MousePointer2} 
            bgColor="bg-blue-50"
            iconColor="text-blue-500" 
          />
          <SummaryCard 
            label="CTR TRUNG BÌNH" 
            value={`${avgCtr}%`} 
            icon={TrendingUp} 
            bgColor="bg-green-50"
            iconColor="text-green-500" 
          />
      </div>

      {/* Export Section */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Xuất dữ liệu chi tiết</h2>
        <p className="text-sm text-gray-500 mb-8">Chọn định dạng và bộ lọc để tải xuống báo cáo tổng hợp.</p>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
             <div className="w-full md:w-1/3">
                 <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 block">LOẠI BÁO CÁO</label>
                 <select 
                   value={reportType}
                   onChange={(e) => setReportType(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none shadow-sm"
                 >
                   <option value="campaign">Hiệu suất Chiến dịch</option>
                   <option value="adgroup">Hiệu suất Nhóm quảng cáo</option>
                   <option value="ads">Hiệu suất Quảng cáo (Creative)</option>
                 </select>
             </div>
             
             <div className="flex gap-4">
                <button 
                  onClick={() => handleDownload('csv')}
                  className="px-6 py-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 flex items-center gap-3 transition-all shadow-sm"
                >
                  <Download size={18} /> CSV
                </button>
                <button 
                  onClick={() => handleDownload('excel')}
                  className="px-6 py-4 bg-[#10b981] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] shadow-xl shadow-green-100 flex items-center gap-3 transition-all"
                >
                  <FileSpreadsheet size={18} /> Excel
                </button>
             </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/20">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
             <Filter size={16} className="text-indigo-600" /> Data Preview
           </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Campaign Name</th>
                <th className="px-8 py-5">Platform</th>
                <th className="px-8 py-5 text-center">AI Quality Score</th>
                <th className="px-8 py-5 text-right">Spent</th>
                <th className="px-8 py-5 text-right">Impressions</th>
                <th className="px-8 py-5 text-right">Clicks</th>
                <th className="px-8 py-5 text-right">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((camp, idx) => {
                const score = getQualityScore(camp);
                return (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5 font-bold text-gray-900">{camp.name}</td>
                    <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            camp.platform === 'facebook' ? 'bg-blue-100 text-blue-700' :
                            camp.platform === 'google' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-800'
                        }`}>{camp.platform}</span>
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-24 bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    style={{width: `${score}%`}}
                                ></div>
                            </div>
                            <span className={`text-xs font-black w-8 text-right ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {score}
                            </span>
                        </div>
                    </td>
                    <td className="px-8 py-5 text-right text-gray-600 font-mono font-bold">{camp.spent.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right text-gray-600 font-mono font-bold">{camp.impressions.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right text-gray-600 font-mono font-bold">{camp.clicks.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-black text-gray-900">{camp.ctr}%</td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportingView;
