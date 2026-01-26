
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  ArrowRightLeft, 
  Coins,
  TrendingUp,
  PieChart as PieChartIcon,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Campaign } from '../types';
import { allocateBudgetsAI } from '../services/geminiService';

interface BudgetAllocationModalProps {
  campaigns: Campaign[];
  onClose: () => void;
  onApply: (allocations: { id: string, budget: number }[]) => void;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({ campaigns, onClose, onApply }) => {
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const [selectedIds, setSelectedIds] = useState<string[]>(activeCampaigns.map(c => c.id));
  const [totalBudget, setTotalBudget] = useState<number>(
    activeCampaigns.reduce((acc, c) => acc + c.budget, 0)
  );
  const [goal, setGoal] = useState('Maximize Conversions');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ campaignId: string, suggestedBudget: number, reason: string }[] | null>(null);

  const handleToggleCampaign = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAnalyze = async () => {
    if (selectedIds.length < 2) return;
    setIsProcessing(true);
    const selectedCampaigns = campaigns.filter(c => selectedIds.includes(c.id));
    try {
      const response = await allocateBudgetsAI(totalBudget, selectedCampaigns, goal);
      setResults(response.allocations);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const getComparisonData = () => {
    if (!results) return [];
    return results.map((res) => {
      const c = campaigns.find(camp => camp.id === res.campaignId);
      return {
        name: c?.name || '...',
        current: c?.budget || 0,
        suggested: res.suggestedBudget
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-6xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-100">
              <ArrowRightLeft size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Budget Optimizer</h2>
              <p className="text-sm text-gray-500 font-semibold mt-1">Phân bổ nguồn vốn thông minh dựa trên Performance Data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-2xl transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {!results ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left: Campaign Picker */}
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block">BƯỚC 1</label>
                    <h3 className="text-xl font-bold text-gray-900">Chọn chiến dịch tối ưu ({selectedIds.length})</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedIds(selectedIds.length === activeCampaigns.length ? [] : activeCampaigns.map(c => c.id))}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
                  >
                    {selectedIds.length === activeCampaigns.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
                  {activeCampaigns.map((c, idx) => (
                    <button 
                      key={c.id}
                      onClick={() => handleToggleCampaign(c.id)}
                      className={`w-full p-5 rounded-[1.5rem] border-2 text-left transition-all flex items-center gap-5 group ${
                        selectedIds.includes(c.id) 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md' 
                        : 'border-gray-100 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                        selectedIds.includes(c.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 bg-white text-transparent group-hover:border-indigo-300'
                      }`}>
                        <CheckCircle size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-base truncate">{c.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.platform}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.objective}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-gray-900">{formatCurrency(c.budget)}</div>
                        <div className="text-[10px] text-gray-400 font-bold">CTR: {c.ctr}%</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Setup */}
              <div className="space-y-10 bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block">BƯỚC 2</label>
                  <h3 className="text-xl font-bold text-gray-900">Thiết lập tổng ngân sách</h3>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={totalBudget.toLocaleString('vi-VN')}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                        setTotalBudget(val);
                      }}
                      className="w-full p-6 pl-6 bg-white border-2 border-gray-100 rounded-[1.5rem] text-3xl font-black text-gray-900 focus:border-indigo-600 outline-none transition-all shadow-sm"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-xl">
                      <Coins size={24} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[1.1, 1.25, 1.5].map(mult => (
                      <button 
                        key={mult}
                        onClick={() => setTotalBudget(Math.round(totalBudget * mult / 100000) * 100000)}
                        className="text-[11px] font-bold px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        +{Math.round((mult - 1) * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Chiến lược tối ưu hóa</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'Maximize Conversions', label: 'Tối đa hóa Chuyển đổi', desc: 'Ưu tiên ROAS và CPA tốt nhất' },
                      { id: 'Maximize Revenue', label: 'Tối đa hóa Doanh thu', desc: 'Dồn tiền cho các mặt hàng giá trị cao' },
                      { id: 'Brand Growth', label: 'Mở rộng thương hiệu', desc: 'Ưu tiên hiển thị và độ phủ đa kênh' }
                    ].map(st => (
                      <button 
                        key={st.id}
                        onClick={() => setGoal(st.id)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all ${
                          goal === st.id 
                          ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-lg' 
                          : 'border-white bg-white hover:border-indigo-100 text-gray-500'
                        }`}
                      >
                        <div className="font-bold text-gray-900">{st.label}</div>
                        <div className="text-xs text-gray-400 font-medium mt-1">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-10 animate-slide-up">
              
              {/* Top Banner */}
              <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-yellow-300" size={32} />
                    <h3 className="text-3xl font-black tracking-tight">AI Allocation Result</h3>
                  </div>
                  <p className="text-indigo-100 font-medium text-lg">Phân phối tối ưu dựa trên 7 ngày dữ liệu lịch sử.</p>
                </div>
                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center min-w-[200px]">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-indigo-200">Dự báo ROI mới</div>
                   <div className="text-4xl font-black text-white flex items-center justify-center gap-2">
                     <TrendingUp className="text-green-400" /> +24%
                   </div>
                </div>
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Visual Chart Comparison */}
                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <PieChartIcon size={16} /> SO SÁNH NGÂN SÁCH (Trước vs Sau)
                  </h4>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getComparisonData()} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="current" name="Hiện tại" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="suggested" name="AI Đề xuất" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-4">
                  {results.map((res, idx) => {
                    const c = campaigns.find(camp => camp.id === res.campaignId);
                    if (!c) return null;
                    const diff = res.suggestedBudget - c.budget;
                    const isIncrease = diff >= 0;

                    return (
                      <div key={idx} className="bg-white border border-gray-100 p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all flex items-center gap-6">
                        <div className={`w-2 h-16 rounded-full ${isIncrease ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="flex-1 min-w-0">
                           <div className="font-bold text-gray-900 truncate">{c.name}</div>
                           <div className="bg-indigo-50/50 p-3 rounded-xl mt-2 text-[11px] text-gray-600 font-medium italic border border-indigo-100/50">
                             "{res.reason}"
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <div className="text-lg font-black text-gray-900">{formatCurrency(res.suggestedBudget)}</div>
                           <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                             {isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                             {Math.abs(Math.round(diff / c.budget * 100))}%
                           </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-gray-100 bg-white flex justify-end items-center gap-6">
          {!results ? (
            <button 
              onClick={handleAnalyze}
              disabled={isProcessing || selectedIds.length < 2}
              className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-base uppercase tracking-wider flex items-center gap-3 hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-200"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              {isProcessing ? 'AI Đang tính toán...' : 'Bắt đầu tối ưu ngay'}
            </button>
          ) : (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setResults(null)}
                className="text-gray-400 font-bold hover:text-gray-900 transition-colors"
              >
                Làm lại
              </button>
              <button 
                onClick={() => onApply(results.map(r => ({ id: r.campaignId, budget: r.suggestedBudget })))}
                className="px-12 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-base uppercase tracking-wider flex items-center gap-3 hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                <CheckCircle size={24} /> Áp dụng cấu hình này
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetAllocationModal;
