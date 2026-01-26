
import React, { useState, useEffect } from 'react';
import { Campaign, AdGroup, Ad } from '../types';
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
  Settings2,
  TrendingUp,
  Sliders,
  Key,
  Globe,
  // Added missing Activity icon
  Activity
} from 'lucide-react';
import { optimizeBudgetAI, optimizeTargetingAI, optimizeCreativeAI } from '../services/geminiService';

interface SmartCampaignTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (updated: Campaign) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, type: 'campaign' | 'adgroup' | 'ad', parentId?: string) => void;
  initialLevel?: ViewLevel;
}

type ViewLevel = 'campaigns' | 'adgroups' | 'ads';

const SmartCampaignTable: React.FC<SmartCampaignTableProps> = ({ 
  campaigns, 
  onUpdateCampaign,
  onToggleStatus,
  onDelete,
  initialLevel = 'campaigns'
}) => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>(initialLevel);
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
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    setViewLevel(initialLevel);
    setSelectedCampaignId(null);
    setSelectedAdGroupId(null);
  }, [initialLevel]);

  useEffect(() => {
    if (editingItem) {
        setAiResult(null);
        setManualData(null);
        setIsAiLoading(false);
        setManualOverride(false);
        setCurrentModalInputs({...editingItem.data, objective: editingItem.context?.objective || 'Doanh Số'});
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

  const getAllAdGroups = () => campaigns.flatMap(c => (c.adGroups || []).map(ag => ({ ...ag, campaignName: c.name, platform: c.platform })));
  const getAllAds = () => campaigns.flatMap(c => (c.adGroups || []).flatMap(ag => (ag.ads || []).map(ad => ({ ...ad, adGroupName: ag.name, campaignName: c.name, platform: c.platform }))));

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const formatNumberInput = (val: string | number) => {
     if (!val) return '';
     const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : val;
     return isNaN(num) ? '' : num.toLocaleString('vi-VN');
  };

  const handleAiOptimize = async () => {
    if (!editingItem || !currentModalInputs) return;
    setIsAiLoading(true);
    setAiResult(null);
    setManualData(null);

    try {
      let result;
      if (editingItem.type === 'budget') {
         result = await optimizeBudgetAI(Number(currentModalInputs.budget), currentModalInputs.biddingStrategy, editingItem.context?.platform || 'facebook', currentModalInputs.objective);
         setManualData({ 
           budget: result.suggestedBudget, 
           biddingStrategy: result.suggestedBidding, 
           bidLimit: result.recommendedBidLimit,
           adjustmentBidding: result.bidAdjustments?.[0] || 'Optimize for Quality'
         });
      } else if (editingItem.type === 'targeting') {
         result = await optimizeTargetingAI(currentModalInputs.targeting);
         setManualData({ targeting: result.suggestedTargeting });
      } else if (editingItem.type === 'creative') {
         result = await optimizeCreativeAI(currentModalInputs.headline, currentModalInputs.content);
         setManualData({ headline: result.headline, content: result.content });
      }
      setAiResult(result);
    } finally { setIsAiLoading(false); }
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
        updatedCampaign.adGroups = updatedCampaign.adGroups?.map((ag: any) => ag.id === editingItem.id ? { ...ag, targeting: manualData.targeting } : ag);
    } else if (editingItem.type === 'creative') {
        updatedCampaign.adGroups = updatedCampaign.adGroups?.map((ag: any) => ({ ...ag, ads: ag.ads?.map((ad: any) => ad.id === editingItem.id ? { ...ad, headline: manualData.headline, content: manualData.content } : ad) }));
    }
    onUpdateCampaign(updatedCampaign);
    setEditingItem(null);
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      {status === 'active' ? 'Active' : 'Paused'}
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
          <button onClick={onToggle} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors">
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
        <button onClick={() => handleBreadcrumbClick('campaigns')} className={`hover:text-indigo-600 font-bold ${viewLevel === 'campaigns' && !selectedCampaignId ? 'text-indigo-600' : ''}`}>All Campaigns</button>
        {(selectedCampaignId || viewLevel === 'adgroups') && (
          <>
            <ChevronRight size={14} className="text-gray-300" />
            <button onClick={() => handleBreadcrumbClick('adgroups')} className={`hover:text-indigo-600 font-bold ${viewLevel === 'adgroups' && !selectedAdGroupId ? 'text-indigo-600' : ''}`}>
              {selectedCampaignId ? getCurrentCampaign()?.name : 'All Ad Groups'}
            </button>
          </>
        )}
        {(selectedAdGroupId || viewLevel === 'ads') && (
          <>
            <ChevronRight size={14} className="text-gray-300" />
            <span className={`font-bold ${viewLevel === 'ads' ? 'text-indigo-600' : ''}`}>{selectedAdGroupId ? getCurrentAdGroup()?.name : 'All Ads'}</span>
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
                    <button onClick={() => handleDrillDown(c.id)} className="text-sm font-bold text-gray-900 hover:text-indigo-600 text-left block transition-colors">{c.name}</button>
                    <div className="text-xs text-gray-400 mt-0.5">{c.objective} Strategy</div>
                 </div>
              </div>
           </div>
           <div className="col-span-3 relative cursor-pointer group/config" onClick={() => setEditingItem({ type: 'budget', id: c.id, data: {budget: c.budget, biddingStrategy: c.biddingStrategy}, context: {platform: c.platform, objective: c.objective} })}>
              <div className="flex flex-col gap-1">
                 <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                   {formatCurrency(c.budget)}
                   <Edit2 size={12} className="text-gray-300 opacity-0 group-hover/config:opacity-100 transition-opacity" />
                 </div>
                 <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md self-start border border-gray-100">
                   <Coins size={10} className="text-indigo-400" /> {c.biddingStrategy || 'Auto Bid'}
                 </div>
              </div>
           </div>
           <div className="col-span-3 flex justify-center text-sm font-bold">{c.ctr}% CTR</div>
           <div className="col-span-2 text-right text-sm font-bold">{formatCurrency(c.spent)}</div>
        </DataRow>
      ))}

      {viewLevel === 'adgroups' && (selectedCampaignId ? getCurrentCampaign()?.adGroups : getAllAdGroups())?.map((ag: any) => (
        <DataRow key={ag.id} status={ag.status} onToggle={() => onToggleStatus(ag.id, 'adgroup')}>
           <div className="col-span-4 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Folder size={20} /></div>
              <div>
                <PlatformIcon p={ag.platform || 'google'} />
                <button onClick={() => handleDrillDownAdGroup(ag.id)} className="text-sm font-bold text-gray-900 block hover:text-indigo-600">{ag.name}</button>
                {ag.campaignName && <div className="text-[10px] text-gray-400 uppercase font-bold">{ag.campaignName}</div>}
              </div>
           </div>
           <div className="col-span-3">
              {ag.platform === 'google' ? (
                <div className="flex flex-wrap gap-1">
                  {ag.keywords?.slice(0, 5).map((kw: string) => <span key={kw} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">{kw}</span>)}
                  {(ag.keywords?.length || 0) > 5 && <span className="text-[10px] text-gray-400">+{ag.keywords!.length - 5}</span>}
                </div>
              ) : (
                <div className="text-xs text-gray-500 line-clamp-1">{ag.targeting}</div>
              )}
           </div>
           <div className="col-span-3 text-center text-xs text-gray-400 font-bold">ACTIVE TARGETING</div>
           <div className="col-span-2"></div>
        </DataRow>
      ))}

      {viewLevel === 'ads' && (selectedAdGroupId ? getCurrentAdGroup()?.ads : getAllAds())?.map((ad: any) => (
        <DataRow key={ad.id} status={ad.status} onToggle={() => onToggleStatus(ad.id, 'ad')}>
           <div className="col-span-4 flex items-center gap-4">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><FileImage size={20} /></div>
              <div>
                <PlatformIcon p={ad.platform || 'google'} />
                <div className="text-sm font-bold text-gray-900">{ad.name}</div>
                {ad.adGroupName && <div className="text-[10px] text-gray-400 uppercase font-bold">{ad.adGroupName}</div>}
              </div>
           </div>
           <div className="col-span-3">
              {ad.platform === 'google' && ad.headlines ? (
                <div className="text-xs text-blue-600 font-bold hover:underline truncate cursor-pointer flex items-center gap-1">
                  <Globe size={10}/> RSA: {ad.headlines[0]}...
                </div>
              ) : (
                <div className="text-xs text-gray-600 line-clamp-1">{ad.content}</div>
              )}
           </div>
           <div className="col-span-3 text-center text-sm font-bold">{ad.ctr}% CTR</div>
           <div className="col-span-2 text-right text-sm font-bold">{formatCurrency(ad.spent || 0)}</div>
        </DataRow>
      ))}

       {editingItem && currentModalInputs && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-[1000px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
             <div className="px-10 py-8 border-b flex justify-between items-center bg-white">
                <h3 className="font-black text-2xl flex items-center gap-3 text-gray-900">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><Sparkles size={24}/></div>
                  AI Optimization
                </h3>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={28}/></button>
             </div>
             
             <div className="p-10 overflow-y-auto bg-white flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                   {/* Left: Current State */}
                   <div className="space-y-6">
                      <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">HIỆN TẠI</div>
                      <div className="bg-[#1a1a1a] p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl space-y-10 relative overflow-hidden group/current">
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/current:opacity-20 transition-opacity pointer-events-none">
                            <Activity size={120} className="text-white" />
                         </div>
                         {editingItem.type === 'budget' && (
                           <>
                              <div className="space-y-4 relative z-10">
                                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block opacity-70">NGÂN SÁCH CHIẾN DỊCH</label>
                                 <div className="flex items-center gap-4">
                                    <input 
                                      type="text" 
                                      value={formatNumberInput(currentModalInputs.budget)} 
                                      onChange={(e) => setCurrentModalInputs({...currentModalInputs, budget: e.target.value.replace(/\D/g, '')})}
                                      className="w-full bg-transparent border-none p-0 font-black text-white text-5xl outline-none focus:ring-0 tracking-tighter"
                                    />
                                    <span className="text-3xl font-black text-gray-600">đ</span>
                                 </div>
                                 <div className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                   <Sliders size={12} /> {currentModalInputs.biddingStrategy || 'AUTO BID STRATEGY'}
                                 </div>
                              </div>
                              <div className="space-y-4 pt-8 border-t border-gray-800 relative z-10">
                                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block opacity-70">MỤC TIÊU CHIẾN DỊCH</label>
                                 <select 
                                   value={currentModalInputs.objective}
                                   onChange={(e) => setCurrentModalInputs({...currentModalInputs, objective: e.target.value})}
                                   className="w-full bg-transparent border-none p-0 font-bold text-indigo-300 text-xl outline-none focus:ring-0 cursor-pointer hover:text-white transition-colors"
                                 >
                                    <option value="Doanh Số" className="bg-[#1a1a1a]">Tối đa hóa Doanh số</option>
                                    <option value="Khách hàng" className="bg-[#1a1a1a]">Thu thập Khách hàng</option>
                                    <option value="Lượt Truy cập" className="bg-[#1a1a1a]">Tăng lượt Truy cập</option>
                                    <option value="Brand Growth" className="bg-[#1a1a1a]">Mở rộng thương hiệu</option>
                                 </select>
                              </div>
                           </>
                         )}
                         {editingItem.type === 'creative' && (
                           <div className="space-y-4">
                              <div className="text-white text-base font-bold bg-white/5 p-4 rounded-xl border border-white/10">{currentModalInputs.headline}</div>
                              <textarea readOnly value={currentModalInputs.content} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-gray-300 text-sm h-48 outline-none resize-none leading-relaxed shadow-inner"/>
                           </div>
                         )}
                         {editingItem.type === 'targeting' && (
                            <div className="text-gray-300 text-base font-medium bg-white/5 p-8 rounded-3xl border border-white/10 leading-relaxed italic shadow-inner">
                              "{currentModalInputs.targeting}"
                            </div>
                         )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold italic leading-relaxed px-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        * Bạn có thể điều chỉnh ngân sách và mục tiêu ở đây để AI tính toán lại phương án tối ưu nhất.
                      </div>
                   </div>

                   {/* Right: AI Suggestion */}
                   <div className="space-y-6">
                      <div className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Sparkles size={14}/> GỢI Ý TỪ AI
                      </div>
                      <div className="bg-white border-2 border-indigo-400 border-dashed p-10 rounded-[2.5rem] min-h-[440px] relative transition-all flex flex-col shadow-sm">
                        {!manualData ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10 text-center">
                            <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse-soft shadow-inner">
                               <Sparkles size={56} />
                            </div>
                            <div>
                               <h4 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Tối ưu hóa ngay bây giờ</h4>
                               <p className="text-sm text-gray-500 max-w-[300px] leading-relaxed font-medium">AI Agent sẽ phân tích dữ liệu thực tế và đưa ra cấu hình tối ưu nhất cho bạn.</p>
                            </div>
                            <button 
                              onClick={handleAiOptimize} 
                              disabled={isAiLoading} 
                              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[1.75rem] font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                               {isAiLoading ? <Loader2 className="animate-spin" size={24}/> : <TrendingUp size={24}/>}
                               {isAiLoading ? 'ĐANG PHÂN TÍCH...' : 'OPTIMIZE NOW'}
                            </button>
                          </div>
                        ) : (
                          <div className="animate-fade-in space-y-8 flex-1 flex flex-col">
                            {editingItem.type === 'budget' && (
                              <div className="space-y-8">
                                <div className="space-y-3">
                                  <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">ĐỀ XUẤT NGÂN SÁCH MỚI</label>
                                  <div className="relative">
                                    <input 
                                      type="text" 
                                      value={formatNumberInput(manualData.budget)} 
                                      onChange={(e) => setManualData({...manualData, budget: e.target.value.replace(/\D/g, '')})}
                                      className="w-full bg-white border-2 border-indigo-100 p-6 rounded-2xl font-black text-indigo-600 text-4xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-300 font-bold text-2xl">đ</span>
                                  </div>
                                </div>

                                <div className="space-y-5 pt-6 border-t border-indigo-50">
                                   <div className="flex items-center justify-between">
                                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">ADJUSTMENT BIDDING</label>
                                      <button 
                                        onClick={() => setManualOverride(!manualOverride)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${manualOverride ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                      >
                                        {manualOverride ? 'Override On' : 'Manual Override'}
                                      </button>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Strategy</label>
                                        <select 
                                          value={manualData.biddingStrategy}
                                          onChange={(e) => setManualData({...manualData, biddingStrategy: e.target.value})}
                                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black text-gray-800 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
                                        >
                                          <option>Lowest Cost</option>
                                          <option>Cost Cap</option>
                                          <option>Bid Cap</option>
                                          <option>ROAS Control</option>
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bid Limit</label>
                                        <input 
                                          type="text"
                                          disabled={!manualOverride}
                                          value={formatNumberInput(manualData.bidLimit || 0)}
                                          onChange={(e) => setManualData({...manualData, bidLimit: e.target.value.replace(/\D/g, '')})}
                                          className={`w-full p-4 rounded-2xl text-xs font-black outline-none transition-all ${manualOverride ? 'bg-white border-2 border-indigo-200 text-gray-900 shadow-inner' : 'bg-gray-50 border border-gray-100 text-gray-400'}`}
                                          placeholder="Tự động"
                                        />
                                      </div>
                                   </div>
                                </div>
                              </div>
                            )}

                            {editingItem.type === 'creative' && (
                              <div className="space-y-6">
                                <div className="space-y-3">
                                  <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">TIÊU ĐỀ TỐI ƯU</label>
                                  <input 
                                    type="text" 
                                    value={manualData.headline} 
                                    onChange={(e) => setManualData({...manualData, headline: e.target.value})}
                                    className="w-full bg-white border-2 border-indigo-100 p-5 rounded-2xl font-black text-gray-900 text-base focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">NỘI DUNG TỐI ƯU</label>
                                  <textarea 
                                    value={manualData.content} 
                                    onChange={(e) => setManualData({...manualData, content: e.target.value})}
                                    className="w-full bg-white border-2 border-indigo-100 p-6 rounded-3xl text-gray-700 text-sm h-48 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed shadow-sm font-medium"
                                  />
                                </div>
                              </div>
                            )}

                            {editingItem.type === 'targeting' && (
                              <div className="space-y-6 flex-1 flex flex-col">
                                <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">ĐỀ XUẤT NHẮM MỤC TIÊU MỚI</label>
                                <textarea 
                                  value={manualData.targeting} 
                                  onChange={(e) => setManualData({...manualData, targeting: e.target.value})}
                                  className="w-full bg-white border-2 border-indigo-100 p-8 rounded-[2rem] text-gray-800 text-base flex-1 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed font-bold shadow-sm"
                                />
                              </div>
                            )}

                            {/* Reasoning Bubble */}
                            <div className="mt-auto bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative animate-slide-up border border-white/10">
                              <div className="absolute -top-3 left-12 w-6 h-6 bg-indigo-600 rotate-45"></div>
                              <div className="flex gap-4 items-start">
                                 <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shrink-0 mt-1">
                                    <Sparkles size={16} fill="white" />
                                 </div>
                                 <p className="text-[13px] font-medium leading-relaxed italic opacity-95">
                                   "{aiResult?.reason || 'Dựa trên mục tiêu chiến dịch, việc tập trung ngân sách vào tệp khách hàng có ý định mua hàng cao (Lower Funnel) sẽ giúp tối ưu hóa ROAS và giảm CPA hiệu quả hơn so với tệp khách hàng mới.'}"
                                 </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
             </div>

             {/* Footer */}
             <div className="px-10 py-10 bg-white border-t border-gray-50 flex justify-end items-center gap-12">
                <button onClick={() => setEditingItem(null)} className="text-gray-400 font-black text-base uppercase tracking-widest hover:text-gray-900 transition-colors">Hủy bỏ</button>
                <button 
                  onClick={handleApplyChange} 
                  disabled={!manualData}
                  className="px-16 py-6 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 text-white font-black rounded-[2.25rem] hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center gap-4 shadow-2xl shadow-indigo-100 transition-all text-lg uppercase tracking-[0.15em] border border-white/10"
                >
                  <Check size={32} strokeWidth={3} /> ÁP DỤNG NGAY
                </button>
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SmartCampaignTable;
