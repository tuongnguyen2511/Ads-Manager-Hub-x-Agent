
import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { 
  ChevronRight, 
  Folder, 
  FileImage, 
  Layout, 
  Edit2, 
  Sparkles, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  X, 
  Loader2, 
  Coins, 
  Target,
  ArrowRight,
  Check,
  RefreshCw,
  Info,
  Type,
  AlignLeft,
  Settings2
} from 'lucide-react';
import { optimizeBudgetAI, optimizeTargetingAI, optimizeCreativeAI } from '../services/geminiService';

interface SmartCampaignTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (updated: Campaign) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, type: 'campaign' | 'adgroup' | 'ad', parentId?: string) => void;
}

type ViewLevel = 'campaigns' | 'adgroups' | 'ads';

const SmartCampaignTable: React.FC<SmartCampaignTableProps> = ({ 
  campaigns, 
  onUpdateCampaign,
  onToggleStatus,
  onDelete
}) => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string | null>(null);
  
  const [editingItem, setEditingItem] = useState<{
    type: 'budget' | 'targeting' | 'creative', 
    id: string, 
    data: any,
    context?: any
  } | null>(null);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [manualData, setManualData] = useState<any>(null);
  const [currentModalInputs, setCurrentModalInputs] = useState<any>(null);

  useEffect(() => {
    if (editingItem) {
        setAiResult(null);
        setManualData(null);
        setIsAiLoading(false);
        setCurrentModalInputs({...editingItem.data, objective: editingItem.context?.objective || 'Doanh Số'});
    } else {
        setCurrentModalInputs(null);
    }
  }, [editingItem]);

  const handleDrillDown = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setViewLevel('adgroups');
  };
  const handleDrillDownAdGroup = (adGroupId: string) => {
    setSelectedAdGroupId(adGroupId);
    setViewLevel('ads');
  };
  const handleBreadcrumbClick = (level: ViewLevel) => {
    if (level === 'campaigns') {
      setSelectedCampaignId(null);
      setSelectedAdGroupId(null);
      setViewLevel('campaigns');
    } else if (level === 'adgroups') {
      setSelectedAdGroupId(null);
      setViewLevel('adgroups');
    }
  };

  const getCurrentCampaign = () => campaigns.find(c => c.id === selectedCampaignId);
  const getCurrentAdGroup = () => {
    const campaign = getCurrentCampaign();
    return campaign?.adGroups?.find(ag => ag.id === selectedAdGroupId);
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const handleAiOptimize = async () => {
    if (!editingItem || !currentModalInputs) return;
    setIsAiLoading(true);
    setAiResult(null);
    setManualData(null);

    try {
      let result;
      if (editingItem.type === 'budget') {
         result = await optimizeBudgetAI(
             Number(currentModalInputs.budget), 
             currentModalInputs.biddingStrategy, 
             editingItem.context?.platform || 'facebook', 
             currentModalInputs.objective
         );
         setManualData({
             budget: result.suggestedBudget,
             biddingStrategy: result.suggestedBidding
         });
      } else if (editingItem.type === 'targeting') {
         result = await optimizeTargetingAI(currentModalInputs.targeting);
         setManualData({
             targeting: result.suggestedTargeting
         });
      } else if (editingItem.type === 'creative') {
         result = await optimizeCreativeAI(currentModalInputs.headline, currentModalInputs.content);
         setManualData({
             headline: result.headline,
             content: result.content
         });
      }
      setAiResult(result);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyChange = () => {
    if (!editingItem || !manualData) return;
    
    let campaignToUpdate = campaigns.find(c => {
        if (editingItem.type === 'budget') return c.id === editingItem.id;
        if (editingItem.type === 'targeting') return c.adGroups?.some(ag => ag.id === editingItem.id);
        if (editingItem.type === 'creative') return c.adGroups?.some(ag => ag.ads?.some(ad => ad.id === editingItem.id));
        return false;
    });

    if (!campaignToUpdate) return;
    
    const updatedCampaign = JSON.parse(JSON.stringify(campaignToUpdate));

    if (editingItem.type === 'budget') {
        updatedCampaign.budget = Number(manualData.budget);
        updatedCampaign.biddingStrategy = manualData.biddingStrategy;
        updatedCampaign.objective = currentModalInputs.objective;
    } else if (editingItem.type === 'targeting') {
        updatedCampaign.adGroups = updatedCampaign.adGroups?.map((ag: any) => 
            ag.id === editingItem.id ? { ...ag, targeting: manualData.targeting } : ag
        );
    } else if (editingItem.type === 'creative') {
        updatedCampaign.adGroups = updatedCampaign.adGroups?.map((ag: any) => ({
            ...ag,
            ads: ag.ads?.map((ad: any) => 
                ad.id === editingItem.id ? { ...ad, headline: manualData.headline, content: manualData.content } : ad
            )
        }));
    }

    onUpdateCampaign(updatedCampaign);
    setEditingItem(null);
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
      status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
      status === 'paused' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : status === 'paused' ? 'bg-gray-400' : 'bg-yellow-500'}`}></div>
      {status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Draft'}
    </div>
  );

  const PlatformIcon = ({ p }: { p: string }) => {
     const colors: any = { facebook: 'text-blue-600', google: 'text-red-500', tiktok: 'text-black', zalo: 'text-blue-400' };
     return <span className={`text-[10px] font-bold uppercase tracking-wider ${colors[p]}`}>{p}</span>
  };

  const DataRow: React.FC<{ children: React.ReactNode, status: string, onToggle: () => void }> = ({ children, status, onToggle }) => (
    <div className="group relative bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-100 transition-all duration-300 p-5 flex items-center gap-6 mb-3">
       <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
       {children}
       
       <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 bg-white pl-4 shadow-[-10px_0_20px_white] z-10">
          <button onClick={onToggle} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors" title="Toggle Status">
             {status === 'active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
          </button>
          <button onClick={() => onDelete('id')} className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
             <Trash2 size={18} />
          </button>
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white py-3 px-4 rounded-xl border border-gray-100 shadow-sm inline-flex">
        <button onClick={() => handleBreadcrumbClick('campaigns')} className={`hover:text-indigo-600 font-bold ${viewLevel === 'campaigns' ? 'text-indigo-600' : ''}`}>All Campaigns</button>
        {selectedCampaignId && (
          <>
            <ChevronRight size={14} className="text-gray-300" />
            <button onClick={() => handleBreadcrumbClick('adgroups')} className={`hover:text-indigo-600 font-bold ${viewLevel === 'adgroups' ? 'text-indigo-600' : ''}`}>{getCurrentCampaign()?.name}</button>
          </>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
         <div className="col-span-4">Tên & Trạng thái</div>
         <div className="col-span-3">Cấu hình (Budget/Target)</div>
         <div className="col-span-3 text-center">Hiệu suất</div>
         <div className="col-span-2 text-right">Chi tiêu</div>
      </div>

      {viewLevel === 'campaigns' && campaigns.map(c => (
        <DataRow key={c.id} status={c.status} onToggle={() => onToggleStatus(c.id, 'campaign')}>
           <div className="col-span-4 flex-1">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-xl ${c.platform === 'facebook' ? 'bg-blue-50 text-blue-600' : c.platform === 'google' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'}`}>
                    <Layout size={20} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <PlatformIcon p={c.platform} />
                       <StatusBadge status={c.status} />
                    </div>
                    <button onClick={() => handleDrillDown(c.id)} className="text-sm font-bold text-gray-900 hover:text-indigo-600 text-left block transition-colors">
                       {c.name}
                    </button>
                    <div className="text-xs text-gray-400 mt-0.5">{c.objective} Strategy</div>
                 </div>
              </div>
           </div>

           <div className="col-span-3 w-48 relative">
              <div className="flex flex-col gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors group/edit cursor-pointer border border-transparent hover:border-indigo-100"
                   onClick={() => setEditingItem({
                        type: 'budget', 
                        id: c.id, 
                        data: {budget: c.budget, biddingStrategy: c.biddingStrategy},
                        context: {platform: c.platform, objective: c.objective}
                    })}
              >
                 <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    {formatCurrency(c.budget)}
                 </div>
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Coins size={12} /> {c.biddingStrategy || 'Auto Bid'}
                 </div>
                 <span className="absolute top-2 right-2 text-indigo-500 opacity-0 group-hover/edit:opacity-100 transition-all bg-white rounded-full p-1 shadow-sm">
                    <Edit2 size={12} />
                 </span>
              </div>
           </div>

           <div className="col-span-3 flex-1 flex justify-center gap-8">
              <div className="text-center">
                 <div className="text-sm font-bold text-gray-900">{c.ctr}%</div>
                 <div className="text-[10px] text-gray-400 uppercase">CTR</div>
              </div>
           </div>

           <div className="col-span-2 w-32 text-right">
              <div className="text-sm font-bold text-gray-900">{formatCurrency(c.spent)}</div>
           </div>
        </DataRow>
      ))}

      {viewLevel === 'adgroups' && getCurrentCampaign()?.adGroups?.map(ag => (
        <DataRow key={ag.id} status={ag.status} onToggle={() => onToggleStatus(ag.id, 'adgroup')}>
           <div className="col-span-4 flex-1">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                    <Folder size={20} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <StatusBadge status={ag.status} />
                    </div>
                    <button onClick={() => handleDrillDownAdGroup(ag.id)} className="text-sm font-bold text-gray-900 hover:text-indigo-600 text-left block transition-colors">
                       {ag.name}
                    </button>
                 </div>
              </div>
           </div>
           <div className="col-span-3 w-64">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 group/edit relative hover:border-indigo-200 transition-colors cursor-pointer"
                   onClick={() => setEditingItem({type: 'targeting', id: ag.id, data: {targeting: ag.targeting}})}
              >
                 <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{ag.targeting}</div>
                 <button className="absolute top-1 right-1 p-1.5 bg-white shadow-sm rounded-md border border-gray-100 opacity-0 group-hover/edit:opacity-100 text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Sparkles size={12} />
                 </button>
              </div>
           </div>
           <div className="col-span-3"></div>
           <div className="col-span-2"></div>
        </DataRow>
      ))}

      {viewLevel === 'ads' && getCurrentAdGroup()?.ads?.map(ad => (
        <DataRow key={ad.id} status={ad.status} onToggle={() => onToggleStatus(ad.id, 'ad')}>
           <div className="col-span-4 flex-1">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-xl bg-pink-50 text-pink-600">
                    <FileImage size={20} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <StatusBadge status={ad.status} />
                    </div>
                    <div className="text-sm font-bold text-gray-900">{ad.name}</div>
                 </div>
              </div>
           </div>

           <div className="col-span-3 w-64">
              <div 
                className="bg-gray-50 p-3 rounded-lg border border-gray-100 group/edit relative hover:border-indigo-200 transition-colors cursor-pointer"
                onClick={() => setEditingItem({type: 'creative', id: ad.id, data: {headline: ad.headline, content: ad.content}})}
              >
                 <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{ad.content}</div>
                 <button className="absolute top-1 right-1 p-1.5 bg-white shadow-sm rounded-md border border-gray-100 opacity-0 group-hover/edit:opacity-100 text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Sparkles size={12} />
                 </button>
              </div>
           </div>

           <div className="col-span-3 text-center text-sm font-bold text-gray-900">
               {ad.ctr}%
           </div>
           <div className="col-span-2"></div>
        </DataRow>
      ))}

       {editingItem && currentModalInputs && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[1000px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             {/* Header */}
             <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[1.25rem]">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-2xl text-gray-900">AI Optimization</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
                            {editingItem.type === 'budget' ? 'BUDGET & BIDDING STRATEGY' : 
                             editingItem.type === 'targeting' ? 'AUDIENCE TARGETING' : 'CREATIVE CONTENT'}
                        </p>
                    </div>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
             </div>

             {/* Body */}
             <div className="p-12 overflow-y-auto bg-white flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
                    
                    {/* Left: Hiện tại */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                             <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">HIỆN TẠI</span>
                        </div>
                        <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 space-y-8 min-h-[450px]">
                            {editingItem.type === 'budget' && (
                                <>
                                    <div>
                                        <label className="text-[11px] text-gray-500 font-bold uppercase mb-4 block tracking-wider">NGÂN SÁCH (VNĐ)</label>
                                        <div className="relative">
                                            {/* Fix: Wrapped setManualData(null) and setCurrentModalInputs in a block to avoid 'void' truthiness check */}
                                            <input 
                                                type="text"
                                                value={currentModalInputs.budget}
                                                onChange={(e) => { setManualData(null); setCurrentModalInputs({...currentModalInputs, budget: e.target.value}); }}
                                                className="w-full p-5 pr-12 bg-white border border-gray-100 rounded-2xl font-bold text-gray-900 text-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-gray-500 font-bold uppercase mb-4 block tracking-wider">MỤC TIÊU CHIẾN DỊCH</label>
                                        {/* Fix: Wrapped setManualData(null) and setCurrentModalInputs in a block to avoid 'void' truthiness check */}
                                        <select
                                            value={currentModalInputs.objective}
                                            onChange={(e) => { setManualData(null); setCurrentModalInputs({...currentModalInputs, objective: e.target.value}); }}
                                            className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="Doanh Số">Doanh Số</option>
                                            <option value="Khách hàng">Khách hàng</option>
                                            <option value="Lượt Truy Cập (Traffic)">Lượt Truy Cập (Traffic)</option>
                                            <option value="Maximize GMV">Maximize GMV</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {editingItem.type === 'targeting' && (
                                <div className="h-full flex flex-col">
                                    <label className="text-[11px] text-gray-500 font-bold uppercase mb-4 block tracking-wider">TARGETING</label>
                                    {/* Fix: Wrapped setManualData(null) and setCurrentModalInputs in a block to avoid 'void' truthiness check */}
                                    <textarea 
                                        value={currentModalInputs.targeting}
                                        onChange={(e) => { setManualData(null); setCurrentModalInputs({...currentModalInputs, targeting: e.target.value}); }}
                                        placeholder="Nhập mô tả sản phẩm của bạn..."
                                        className="w-full p-6 bg-white border border-gray-100 rounded-3xl text-sm text-gray-700 leading-relaxed flex-1 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    />
                                </div>
                            )}
                            {editingItem.type === 'creative' && (
                                <>
                                    <div>
                                        <label className="text-[11px] text-gray-500 font-bold uppercase mb-4 block tracking-wider">HEADLINE</label>
                                        {/* Fix: Wrapped setManualData(null) and setCurrentModalInputs in a block to avoid 'void' truthiness check */}
                                        <input 
                                            type="text"
                                            value={currentModalInputs.headline}
                                            onChange={(e) => { setManualData(null); setCurrentModalInputs({...currentModalInputs, headline: e.target.value}); }}
                                            className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-900 text-sm shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-gray-500 font-bold uppercase mb-4 block tracking-wider">CONTENT</label>
                                        {/* Fix: Wrapped setManualData(null) and setCurrentModalInputs in a block to avoid 'void' truthiness check */}
                                        <textarea 
                                            value={currentModalInputs.content}
                                            onChange={(e) => { setManualData(null); setCurrentModalInputs({...currentModalInputs, content: e.target.value}); }}
                                            className="w-full p-5 bg-white border border-gray-100 rounded-2xl text-sm text-gray-700 leading-relaxed min-h-[140px] shadow-sm resize-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Arrow Middle */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                        <div className="bg-gray-100 p-4 rounded-full text-gray-300 shadow-sm">
                            <ArrowRight size={32} />
                        </div>
                    </div>

                    {/* Right: AI Suggestion */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                             <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={16} /> GEMINI SUGGESTION & EDIT
                             </span>
                             {manualData && <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Ready</span>}
                        </div>
                        
                        <div className={`bg-white p-10 rounded-[3rem] border-2 border-indigo-400 border-dashed min-h-[450px] relative transition-all`}>
                            {!manualData ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                    {isAiLoading ? (
                                        <>
                                            <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
                                            <p className="text-lg font-bold text-indigo-900">Đang tối ưu hóa...</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
                                                <Sparkles className="text-indigo-600" size={44} />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-xl mb-3">Yêu cầu AI tối ưu hóa</h4>
                                            <p className="text-sm text-gray-400 mb-10 max-w-[280px]">Gemini sẽ đề xuất cấu hình tốt nhất dựa trên mục tiêu hiện tại.</p>
                                            <button 
                                                onClick={handleAiOptimize}
                                                className="px-12 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white rounded-3xl font-bold shadow-[0_12px_40px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                            >
                                                <Sparkles size={22} /> Generate Suggestion
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="animate-fade-in space-y-8 h-full flex flex-col">
                                    <div className="flex-1 space-y-8">
                                        {editingItem.type === 'budget' && (
                                            <>
                                                <div>
                                                    <label className="text-[11px] text-indigo-600 font-bold uppercase mb-4 block tracking-wider">ĐỀ XUẤT NGÂN SÁCH</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text"
                                                            value={manualData.budget}
                                                            onChange={(e) => setManualData({...manualData, budget: e.target.value})}
                                                            className="w-full p-5 pr-12 bg-white border border-indigo-100 rounded-2xl font-bold text-indigo-900 text-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">đ</span>
                                                        <RefreshCw size={16} className="absolute -top-7 right-0 text-indigo-300 cursor-pointer" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[11px] text-indigo-600 font-bold uppercase mb-4 block tracking-wider">ĐỀ XUẤT GIÁ THẦU (ADJUSTMENT)</label>
                                                    <div className="relative">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400">
                                                            <Coins size={20} />
                                                        </div>
                                                        <select
                                                            value={manualData.biddingStrategy}
                                                            onChange={(e) => setManualData({...manualData, biddingStrategy: e.target.value})}
                                                            className="w-full p-5 pl-14 bg-white border border-indigo-100 rounded-2xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                                        >
                                                            <option>Lowest Cost (Auto)</option>
                                                            <option>Highest Value</option>
                                                            <option>Cost Cap</option>
                                                            <option>Bid Cap</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {editingItem.type === 'targeting' && (
                                            <div className="h-full flex flex-col">
                                                <label className="text-[11px] text-indigo-600 font-bold uppercase mb-4 block tracking-wider">TARGETING GỢI Ý</label>
                                                <textarea 
                                                    value={manualData.targeting}
                                                    onChange={(e) => setManualData({...manualData, targeting: e.target.value})}
                                                    className="w-full p-6 bg-white border border-indigo-100 rounded-3xl text-sm text-indigo-900 leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none flex-1 font-medium"
                                                />
                                            </div>
                                        )}
                                        {editingItem.type === 'creative' && (
                                            <>
                                                <div>
                                                    <label className="text-[11px] text-indigo-600 font-bold uppercase mb-4 block tracking-wider">NEW HEADLINE</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text"
                                                            value={manualData.headline}
                                                            onChange={(e) => setManualData({...manualData, headline: e.target.value})}
                                                            className="w-full p-5 bg-white border border-indigo-100 rounded-2xl font-bold text-indigo-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                        <RefreshCw size={16} className="absolute -top-7 right-0 text-indigo-300 cursor-pointer" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[11px] text-indigo-600 font-bold uppercase mb-4 block tracking-wider">NEW CONTENT</label>
                                                    <textarea 
                                                        value={manualData.content}
                                                        onChange={(e) => setManualData({...manualData, content: e.target.value})}
                                                        className="w-full p-5 bg-white border border-indigo-100 rounded-2xl text-sm text-indigo-900 leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-40 font-medium"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Reasoning Bubble */}
                                    {aiResult?.reason && (
                                        <div className="mt-6 bg-[#3d38b5] p-6 rounded-[2rem] text-white shadow-2xl relative animate-slide-up group/bubble">
                                            <div className="absolute -top-2 left-10 w-4 h-4 bg-[#3d38b5] transform rotate-45"></div>
                                            <p className="text-xs leading-relaxed font-medium">
                                                "{aiResult.reason}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             </div>

             {/* Footer */}
             <div className="px-12 py-10 bg-white flex justify-end items-center gap-10 border-t border-gray-50">
                <button 
                    onClick={() => setEditingItem(null)} 
                    className="text-gray-400 font-bold text-lg hover:text-gray-600 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={handleApplyChange} 
                    disabled={!manualData}
                    className="px-14 py-5 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold rounded-3xl hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-[0_15px_45px_rgba(99,102,241,0.25)] transition-all text-lg"
                >
                    <Check size={26} strokeWidth={3} /> Áp dụng thay đổi
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCampaignTable;
