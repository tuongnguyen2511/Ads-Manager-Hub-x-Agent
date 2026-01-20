import React, { useState } from 'react';
import { 
  Campaign, AdGroup, Ad 
} from '../types';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileImage, 
  Layout, 
  Edit2, 
  Sparkles, 
  ArrowLeft,
  PauseCircle,
  PlayCircle,
  Trash2,
  Copy,
  Save,
  X,
  Loader2,
  Coins,
  Target
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
  onDuplicate,
  onDelete,
  onToggleStatus
}) => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string | null>(null);
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState<{type: 'budget' | 'targeting' | 'creative', id: string, data: any} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  // --- Navigation Helpers ---
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
  const getCurrentAdGroup = () => getCurrentCampaign()?.adGroups?.find(ag => ag.id === selectedAdGroupId);

  // --- Helpers ---
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editingItem) return;
      const rawValue = e.target.value.replace(/,/g, '');
      if (!isNaN(Number(rawValue))) {
          setEditingItem({...editingItem, data: {...editingItem.data, budget: Number(rawValue)}});
      }
  };

  // --- AI Actions ---
  const handleAiOptimize = async () => {
    if (!editingItem) return;
    setIsAiLoading(true);
    setAiSuggestion(null);

    try {
      let result;
      if (editingItem.type === 'budget') {
        const campaign = campaigns.find(c => c.id === editingItem.id);
        if (campaign) result = await optimizeBudgetAI(editingItem.data.budget, editingItem.data.biddingStrategy, campaign.platform, campaign.objective);
      } else if (editingItem.type === 'targeting') {
        result = await optimizeTargetingAI(editingItem.data.targeting);
      } else if (editingItem.type === 'creative') {
        result = await optimizeCreativeAI(editingItem.data.headline, editingItem.data.content);
      }
      setAiSuggestion(result);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!editingItem || !aiSuggestion) return;
    
    // Update local form data in the modal
    if (editingItem.type === 'budget') {
      setEditingItem({
          ...editingItem, 
          data: { 
              ...editingItem.data, 
              budget: aiSuggestion.suggestedBudget,
              biddingStrategy: aiSuggestion.suggestedBidding
          }
      });
    } else if (editingItem.type === 'targeting') {
       setEditingItem({...editingItem, data: { ...editingItem.data, targeting: aiSuggestion.suggestedTargeting }});
    } else if (editingItem.type === 'creative') {
       setEditingItem({...editingItem, data: { ...editingItem.data, headline: aiSuggestion.headline, content: aiSuggestion.content }});
    }
    setAiSuggestion(null); // Clear suggestion after applying
  };

  const saveEdit = () => {
    if (!editingItem) return;
    
    console.log("Saving", editingItem);
    
    // Mock update for UI feedback
    if (editingItem.type === 'budget' && selectedCampaignId === null) {
        // We are at campaign root list, finding campaign to update locally for demo
        const c = campaigns.find(x => x.id === editingItem.id);
        if (c) onUpdateCampaign({
            ...c, 
            budget: editingItem.data.budget,
            biddingStrategy: editingItem.data.biddingStrategy 
        });
    }
    
    setEditingItem(null);
  };

  // --- Renderers ---
  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      <button 
        onClick={() => handleBreadcrumbClick('campaigns')}
        className={`hover:text-indigo-600 font-medium ${viewLevel === 'campaigns' ? 'text-indigo-600' : ''}`}
      >
        Tất cả chiến dịch
      </button>
      {selectedCampaignId && (
        <>
          <ChevronRight size={16} />
          <button 
            onClick={() => handleBreadcrumbClick('adgroups')}
            className={`hover:text-indigo-600 font-medium ${viewLevel === 'adgroups' ? 'text-indigo-600' : ''}`}
          >
            {getCurrentCampaign()?.name}
          </button>
        </>
      )}
      {selectedAdGroupId && (
        <>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium">{getCurrentAdGroup()?.name}</span>
        </>
      )}
    </div>
  );

  const renderStatus = (status: string) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
      status === 'active' ? 'bg-green-100 text-green-700' : 
      status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'active' ? 'bg-green-500' : 
        status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
      }`}></span>
      {status === 'active' ? 'Đang chạy' : status === 'paused' ? 'Tạm dừng' : 'Bản nháp'}
    </span>
  );

  const PlatformBadge = ({p}: {p: string}) => {
    const styles: any = {
      facebook: 'bg-blue-100 text-blue-700',
      google: 'bg-red-100 text-red-700',
      tiktok: 'bg-black text-white',
      zalo: 'bg-blue-50 text-blue-500 border border-blue-200',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[p]}`}>{p}</span>
  };

  const editingCampaign = editingItem ? campaigns.find(c => c.id === editingItem.id) : null;

  return (
    <div className="space-y-4">
      {renderBreadcrumbs()}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase">
          <div className="col-span-4">Tên {viewLevel === 'campaigns' ? 'Chiến dịch' : viewLevel === 'adgroups' ? 'Nhóm QC' : 'Quảng cáo'}</div>
          <div className="col-span-2 text-center">Trạng thái</div>
          <div className="col-span-3">
             {viewLevel === 'campaigns' ? 'Ngân sách & Bidding' : viewLevel === 'adgroups' ? 'Targeting' : 'Creative'}
          </div>
          <div className="col-span-2 text-center">Hiệu quả (CTR)</div>
          <div className="col-span-1 text-right">Hành động</div>
        </div>

        {/* Campaign Level List */}
        {viewLevel === 'campaigns' && campaigns.map(c => (
          <div key={c.id} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors grid grid-cols-12 gap-4 p-4 items-center group">
            <div className="col-span-4">
              <div className="flex items-center gap-3">
                 <button onClick={() => handleDrillDown(c.id)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                    <Layout size={18} />
                 </button>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <PlatformBadge p={c.platform} />
                       <span 
                         onClick={() => handleDrillDown(c.id)}
                         className="font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer text-sm"
                       >
                         {c.name}
                       </span>
                    </div>
                    <div className="text-xs text-gray-400">{c.objective} • {c.startDate}</div>
                 </div>
              </div>
            </div>
            <div className="col-span-2 text-center">{renderStatus(c.status)}</div>
            <div className="col-span-3">
               <div className="flex flex-col gap-1 group/edit">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{c.budget.toLocaleString()} đ</span>
                    <button 
                        onClick={() => setEditingItem({type: 'budget', id: c.id, data: {budget: c.budget, biddingStrategy: c.biddingStrategy || 'Auto'}})}
                        className="opacity-0 group-hover/edit:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600"
                        title="Chỉnh sửa"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => setEditingItem({type: 'budget', id: c.id, data: {budget: c.budget, biddingStrategy: c.biddingStrategy || 'Auto'}})}
                        className="opacity-0 group-hover/edit:opacity-100 p-1 hover:bg-purple-100 rounded text-purple-500 hover:text-purple-700"
                        title="Tối ưu Ngân sách & Bidding với AI"
                    >
                        <Sparkles size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Coins size={10} /> Bid: {c.biddingStrategy || 'Auto'}
                  </div>
               </div>
            </div>
            <div className="col-span-2 text-center">
               <span className="font-bold text-gray-700">{c.ctr}%</span>
            </div>
            <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onToggleStatus(c.id, 'campaign')} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                    {c.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                </button>
                <button onClick={() => onDelete(c.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}

        {/* AdGroup Level List */}
        {viewLevel === 'adgroups' && getCurrentCampaign()?.adGroups?.map(ag => (
          <div key={ag.id} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors grid grid-cols-12 gap-4 p-4 items-center group">
            <div className="col-span-4 pl-4">
              <div className="flex items-center gap-3">
                 <button onClick={() => handleDrillDownAdGroup(ag.id)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                    <Folder size={18} />
                 </button>
                 <div>
                    <span 
                        onClick={() => handleDrillDownAdGroup(ag.id)}
                        className="font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer text-sm"
                    >
                        {ag.name}
                    </span>
                 </div>
              </div>
            </div>
            <div className="col-span-2 text-center">{renderStatus(ag.status)}</div>
            <div className="col-span-3">
               <div className="flex items-center gap-2 group/edit">
                  <span className="text-xs text-gray-600 truncate max-w-[150px]" title={ag.targeting}>{ag.targeting}</span>
                  <button 
                    onClick={() => setEditingItem({type: 'targeting', id: ag.id, data: {targeting: ag.targeting}})}
                    className="opacity-0 group-hover/edit:opacity-100 p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600"
                  >
                    <Edit2 size={14} />
                  </button>
               </div>
            </div>
            <div className="col-span-2 text-center text-gray-400 text-xs italic">
               (Theo quảng cáo)
            </div>
            <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onToggleStatus(ag.id, 'adgroup', selectedCampaignId!)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                    {ag.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                </button>
            </div>
          </div>
        ))}

        {/* Ad Level List */}
        {viewLevel === 'ads' && getCurrentAdGroup()?.ads?.map(ad => (
          <div key={ad.id} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors grid grid-cols-12 gap-4 p-4 items-center group">
             <div className="col-span-4 pl-8">
              <div className="flex items-center gap-3">
                 <div className="text-gray-400">
                    <FileImage size={18} />
                 </div>
                 <div>
                    <span className="font-semibold text-gray-800 text-sm block">{ad.name}</span>
                    <span className="text-xs text-gray-400 block truncate max-w-[200px]">{ad.headline}</span>
                 </div>
              </div>
            </div>
            <div className="col-span-2 text-center">{renderStatus(ad.status)}</div>
            <div className="col-span-3">
               <div className="flex items-center gap-2 group/edit">
                  <span className="text-xs text-gray-600 truncate max-w-[150px]">{ad.content}</span>
                  <button 
                    onClick={() => setEditingItem({type: 'creative', id: ad.id, data: {headline: ad.headline, content: ad.content}})}
                    className="opacity-0 group-hover/edit:opacity-100 p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600"
                    title="Chỉnh sửa nội dung"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setEditingItem({type: 'creative', id: ad.id, data: {headline: ad.headline, content: ad.content}})}
                    className="opacity-0 group-hover/edit:opacity-100 p-1.5 hover:bg-purple-100 rounded text-purple-500 hover:text-purple-700"
                    title="Tối ưu Creative với AI"
                  >
                    <Sparkles size={14} />
                  </button>
               </div>
            </div>
             <div className="col-span-2 text-center">
               <span className="font-bold text-gray-700">{ad.ctr}%</span>
            </div>
            <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                    {ad.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Edit Modal with AI */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                 {editingItem.type === 'budget' && 'Chỉnh sửa Ngân sách & Bidding'}
                 {editingItem.type === 'targeting' && 'Chỉnh sửa Targeting'}
                 {editingItem.type === 'creative' && 'Chỉnh sửa Nội dung'}
                 <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">AI Powered</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Context Preview */}
              <div className="text-sm text-gray-500 mb-2">
                Hãy sử dụng AI để tối ưu hóa dữ liệu hiện tại của bạn một cách tự động.
              </div>

              {/* Form Fields */}
              {editingItem.type === 'budget' && (
                <div className="space-y-4">
                   {editingCampaign && (
                     <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600 mt-0.5">
                           <Target size={16} />
                        </div>
                        <div>
                           <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">Mục tiêu hiện tại</div>
                           <div className="font-bold text-gray-800">{editingCampaign.objective}</div>
                           <div className="text-[10px] text-blue-500 mt-1">AI sẽ phân tích hiệu quả dựa trên mục tiêu này.</div>
                        </div>
                     </div>
                   )}
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Ngân sách (VNĐ)</label>
                       <input 
                         type="text" 
                         value={formatCurrency(editingItem.data.budget)}
                         onChange={handleBudgetChange}
                         className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Chiến lược giá thầu (Bidding)</label>
                       <select
                         value={editingItem.data.biddingStrategy}
                         onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, biddingStrategy: e.target.value}})}
                         className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                       >
                           <option value="Auto">Tự động (Lowest Cost)</option>
                           <option value="Cost Cap">Giới hạn chi phí (Cost Cap)</option>
                           <option value="Bid Cap">Giới hạn giá thầu (Bid Cap)</option>
                           <option value="Target Cost">Mục tiêu chi phí (Target Cost)</option>
                       </select>
                       <p className="text-xs text-gray-400 mt-1">AI sẽ gợi ý chiến lược phù hợp nhất với mục tiêu của bạn.</p>
                   </div>
                </div>
              )}
              
              {editingItem.type === 'targeting' && (
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Targeting</label>
                   <textarea 
                     value={editingItem.data.targeting} 
                     onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, targeting: e.target.value}})}
                     className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24"
                   />
                </div>
              )}

              {editingItem.type === 'creative' && (
                <div className="space-y-3">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                      <input 
                        value={editingItem.data.headline} 
                        onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, headline: e.target.value}})}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                      <textarea 
                        value={editingItem.data.content} 
                        onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, content: e.target.value}})}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24"
                      />
                   </div>
                </div>
              )}

              {/* AI Suggestion Box */}
              {aiSuggestion && (
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mt-4 animate-fade-in">
                    <h4 className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-2">
                       <Sparkles size={14} /> Gợi ý từ AI
                    </h4>
                    <div className="text-sm text-gray-700 space-y-2">
                       {editingItem.type === 'budget' && (
                          <div className="space-y-1">
                             <div className="flex justify-between items-center">
                                <span>Mức ngân sách đề xuất: <b>{aiSuggestion.suggestedBudget?.toLocaleString()} đ</b></span>
                             </div>
                             <div className="flex justify-between items-center text-indigo-700">
                                <span>Chiến lược Bidding: <b>{aiSuggestion.suggestedBidding}</b></span>
                             </div>
                          </div>
                       )}
                       {editingItem.type === 'targeting' && (
                          <p className="italic">"{aiSuggestion.suggestedTargeting}"</p>
                       )}
                       {editingItem.type === 'creative' && (
                          <div>
                             <p className="font-medium">{aiSuggestion.headline}</p>
                             <p className="text-gray-600 mt-1">{aiSuggestion.content}</p>
                          </div>
                       )}
                       <p className="text-xs text-indigo-600 mt-2 pt-2 border-t border-indigo-200">
                          Lý do: {aiSuggestion.reason}
                       </p>
                    </div>
                    <button 
                       onClick={applyAiSuggestion}
                       className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                       Áp dụng gợi ý này
                    </button>
                 </div>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-between">
              <button 
                onClick={handleAiOptimize}
                disabled={isAiLoading}
                className="flex items-center gap-2 text-indigo-600 font-medium hover:bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors"
              >
                {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Tối ưu bằng AI
              </button>
              <div className="flex gap-2">
                 <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg">Hủy</button>
                 <button onClick={saveEdit} className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 flex items-center gap-2">
                    <Save size={18} /> Lưu
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCampaignTable;