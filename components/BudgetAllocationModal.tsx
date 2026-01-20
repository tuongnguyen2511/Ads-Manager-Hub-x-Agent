import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  ArrowRightLeft, 
  Coins,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Campaign } from '../types';
import { allocateBudgetsAI } from '../services/geminiService';

interface BudgetAllocationModalProps {
  campaigns: Campaign[];
  onClose: () => void;
  onApply: (allocations: { id: string, budget: number }[]) => void;
}

const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({ campaigns, onClose, onApply }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(campaigns.filter(c => c.status === 'active').map(c => c.id));
  const [totalBudget, setTotalBudget] = useState<number>(
    campaigns.filter(c => c.status === 'active').reduce((acc, c) => acc + c.budget, 0)
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
    const response = await allocateBudgetsAI(totalBudget, selectedCampaigns, goal);
    setResults(response.allocations);
    setIsProcessing(false);
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <ArrowRightLeft size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Budget Allocation</h2>
              <p className="text-sm text-gray-500 font-medium">Tự động phân bổ ngân sách tối ưu dựa trên dữ liệu.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {!results ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Campaign Selection */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">1. Chọn chiến dịch ({selectedIds.length})</label>
                   <button className="text-xs font-bold text-indigo-600 hover:underline">Select All</button>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {campaigns.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => handleToggleCampaign(c.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 group ${
                        selectedIds.includes(c.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedIds.includes(c.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 group-hover:border-indigo-300'}`}>
                        {selectedIds.includes(c.id) && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate">{c.name}</div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">{c.platform}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(c.budget)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Settings */}
              <div className="space-y-8 bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">2. Tổng ngân sách (VNĐ)</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={totalBudget.toLocaleString()} 
                      onChange={(e) => setTotalBudget(Number(e.target.value.replace(/\D/g, '')))}
                      className="w-full p-4 pl-12 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none text-2xl font-bold text-gray-900 shadow-sm transition-all group-hover:border-indigo-200"
                    />
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={24} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">3. Mục tiêu tối ưu</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Maximize Conversions', 'Maximize Revenue (GMV)', 'Minimize Cost Per Acquisition'].map(g => (
                      <button 
                        key={g} 
                        onClick={() => setGoal(g)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          goal === g ? 'border-indigo-600 bg-white shadow-md ring-1 ring-indigo-600' : 'border-gray-200 bg-white hover:border-indigo-300 text-gray-500'
                        }`}
                      >
                         <div className={`font-bold text-sm ${goal === g ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {g === 'Maximize Conversions' ? 'Tối ưu Chuyển đổi' : g === 'Maximize Revenue (GMV)' ? 'Tối đa hóa Doanh thu' : 'Giảm chi phí CPA'}
                         </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-8 animate-slide-up">
              <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-3xl font-bold flex items-center gap-3">
                     <Sparkles className="text-yellow-300" /> Kết quả phân bổ
                   </h3>
                   <p className="text-indigo-100 mt-2 font-medium opacity-90">AI đã phân tích dữ liệu và đề xuất phương án tối ưu nhất.</p>
                </div>
                <div className="relative z-10 text-right">
                   <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Dự báo hiệu quả</div>
                   <div className="text-3xl font-bold text-white flex items-center gap-2 justify-end">
                      <TrendingUp className="text-green-400" /> +18.5%
                   </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-32 pointer-events-none"></div>
              </div>

              <div className="space-y-4">
                 {results.map(res => {
                    const campaign = campaigns.find(c => c.id === res.campaignId);
                    if (!campaign) return null;
                    const diff = res.suggestedBudget - campaign.budget;
                    const percentChange = ((diff / campaign.budget) * 100).toFixed(1);
                    
                    return (
                       <div key={res.campaignId} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
                           <div className="w-64 shrink-0">
                               <div className="font-bold text-gray-900 text-lg truncate">{campaign.name}</div>
                               <div className="text-xs font-bold text-gray-400 uppercase mt-1">{campaign.platform}</div>
                           </div>
                           
                           <div className="flex-1 grid grid-cols-2 gap-8 items-center">
                               <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase">
                                     <span>Current</span>
                                     <span>New Budget</span>
                                  </div>
                                  <div className="h-4 bg-gray-100 rounded-full relative overflow-hidden">
                                      {/* Current Bar (Gray) */}
                                      <div className="absolute top-0 left-0 h-full bg-gray-300 rounded-full" style={{width: '50%'}}></div> {/* Mock visual */}
                                      {/* New Bar (Colored) */}
                                      <div 
                                        className={`absolute top-0 left-0 h-full rounded-full opacity-80 ${diff >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                        style={{width: diff >= 0 ? '65%' : '35%'}} 
                                      ></div>
                                  </div>
                               </div>
                               
                               <div className="flex justify-between items-center">
                                   <div>
                                       <div className="text-2xl font-bold text-indigo-600">{formatCurrency(res.suggestedBudget)}</div>
                                       <div className={`text-xs font-bold flex items-center gap-1 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                           {diff >= 0 ? '+' : ''}{percentChange}% 
                                           <span className="text-gray-400 font-normal">({formatCurrency(diff)})</span>
                                       </div>
                                   </div>
                                   <div className="bg-gray-50 p-3 rounded-xl max-w-[200px] text-xs text-gray-600 italic border border-gray-100">
                                       "{res.reason}"
                                   </div>
                               </div>
                           </div>
                       </div>
                    )
                 })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-end items-center gap-4">
          {results ? (
            <>
              <button 
                onClick={() => setResults(null)}
                className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-all"
              >
                Back
              </button>
              <button 
                onClick={() => onApply(results.map(r => ({ id: r.campaignId, budget: r.suggestedBudget })))}
                className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
              >
                <CheckCircle size={20} /> Apply Allocation
              </button>
            </>
          ) : (
            <button 
              onClick={handleAnalyze}
              disabled={isProcessing || selectedIds.length < 2}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-[0_4px_14px_rgba(79,70,229,0.4)] disabled:opacity-50 flex items-center gap-2 w-full md:w-auto justify-center"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {isProcessing ? 'Analyzing Data...' : 'Start AI Optimization'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetAllocationModal;