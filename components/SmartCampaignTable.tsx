import React, { useState } from 'react';
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
  BarChart,
  MoreHorizontal
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
  const [editingItem, setEditingItem] = useState<{type: 'budget' | 'targeting' | 'creative', id: string, data: any} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  // Navigation
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
  const formatCurrency = (val: number) => val.toLocaleString('en-US');

  // AI Logic (Simplified for View)
  const handleAiOptimize = async () => {
    if (!editingItem) return;
    setIsAiLoading(true);
    try {
      let result;
      if (editingItem.type === 'budget') {
         // Mock logic wrapper
         result = await optimizeBudgetAI(editingItem.data.budget, editingItem.data.biddingStrategy, 'platform', 'objective');
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

  // Components
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

  // Generic Row Component for "Floating" Look
  const DataRow: React.FC<{ children: React.ReactNode, status: string, onToggle: () => void }> = ({ children, status, onToggle }) => (
    <div className="group relative bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-100 transition-all duration-300 p-5 flex items-center gap-6 mb-3">
       <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
       {children}
       
       {/* Hover Actions */}
       <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 bg-white pl-4 shadow-[-10px_0_20px_white]">
          <button onClick={onToggle} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors" title="Toggle Status">
             {status === 'active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
          </button>
          <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
             <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete('id')} className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
             <Trash2 size={18} />
          </button>
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white py-3 px-4 rounded-xl border border-gray-100 shadow-sm inline-flex">
        <button onClick={() => handleBreadcrumbClick('campaigns')} className={`hover:text-indigo-600 font-bold ${viewLevel === 'campaigns' ? 'text-indigo-600' : ''}`}>All Campaigns</button>
        {selectedCampaignId && (
          <>
            <ChevronRight size={14} className="text-gray-300" />
            <button onClick={() => handleBreadcrumbClick('adgroups')} className={`hover:text-indigo-600 font-bold ${viewLevel === 'adgroups' ? 'text-indigo-600' : ''}`}>{getCurrentCampaign()?.name}</button>
          </>
        )}
        {selectedAdGroupId && (
          <>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="font-bold text-gray-900">{getCurrentAdGroup()?.name}</span>
          </>
        )}
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-12 gap-6 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
         <div className="col-span-4">Tên & Trạng thái</div>
         <div className="col-span-3">Cấu hình (Budget/Target)</div>
         <div className="col-span-3 text-center">Hiệu suất (CTR/Clicks)</div>
         <div className="col-span-2 text-right">Chi tiêu</div>
      </div>

      {/* Campaign List */}
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

           <div className="col-span-3 w-48">
              <div className="flex flex-col gap-1">
                 <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    {c.budget.toLocaleString()} đ
                    <button 
                        onClick={() => setEditingItem({type: 'budget', id: c.id, data: {budget: c.budget, biddingStrategy: c.biddingStrategy}})}
                        className="text-indigo-500 hover:bg-indigo-50 p-1 rounded transition-colors"
                    >
                        <Sparkles size={14} />
                    </button>
                 </div>
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Coins size={12} /> {c.biddingStrategy || 'Auto Bid'}
                 </div>
              </div>
           </div>

           <div className="col-span-3 flex-1 flex justify-center gap-8">
              <div className="text-center">
                 <div className="text-sm font-bold text-gray-900">{c.ctr}%</div>
                 <div className="text-[10px] text-gray-400 uppercase">CTR</div>
              </div>
              <div className="text-center">
                 <div className="text-sm font-bold text-gray-900">{c.clicks.toLocaleString()}</div>
                 <div className="text-[10px] text-gray-400 uppercase">Clicks</div>
              </div>
           </div>

           <div className="col-span-2 w-32 text-right">
              <div className="text-sm font-bold text-gray-900">{c.spent.toLocaleString()} đ</div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                 <div className="bg-indigo-500 h-full rounded-full" style={{width: `${Math.min((c.spent / c.budget) * 100, 100)}%`}}></div>
              </div>
           </div>
        </DataRow>
      ))}

      {/* AdGroup List */}
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
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 group/edit relative">
                 <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{ag.targeting}</div>
                 <button 
                    onClick={() => setEditingItem({type: 'targeting', id: ag.id, data: {targeting: ag.targeting}})}
                    className="absolute top-1 right-1 p-1 bg-white shadow-sm rounded border border-gray-100 opacity-0 group-hover/edit:opacity-100 hover:text-indigo-600 transition-all"
                 >
                    <Edit2 size={12} />
                 </button>
              </div>
           </div>

           <div className="col-span-3 flex-1 flex justify-center text-gray-400 text-xs italic">
              Inherits Campaign Data
           </div>
             <div className="col-span-2 w-32 text-right"> - </div>
        </DataRow>
      ))}

      {/* Ads List */}
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
                    <div className="text-xs text-gray-500 truncate w-48">{ad.headline}</div>
                 </div>
              </div>
           </div>

           <div className="col-span-3 w-64">
               <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 truncate flex-1">{ad.content}</span>
                   <button 
                     onClick={() => setEditingItem({type: 'creative', id: ad.id, data: {headline: ad.headline, content: ad.content}})}
                     className="text-purple-600 bg-purple-50 p-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                   >
                       <Sparkles size={14} />
                   </button>
               </div>
           </div>

           <div className="col-span-3 flex-1 flex justify-center gap-8">
               <div className="text-center">
                 <div className="text-sm font-bold text-gray-900">{ad.ctr}%</div>
                 <div className="text-[10px] text-gray-400 uppercase">CTR</div>
              </div>
           </div>
           <div className="col-span-2 w-32 text-right"> - </div>
        </DataRow>
      ))}

       {/* Edit Modal (Keeping existing logic but slightly cleaner UI) */}
       {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">AI Optimization</h3>
                <button onClick={() => setEditingItem(null)}><X size={20} className="text-gray-400" /></button>
             </div>
             <div className="p-6">
                {/* Simplified Input for Demo */}
                <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100 flex gap-3">
                    <Sparkles className="text-indigo-600 shrink-0" size={20} />
                    <p className="text-sm text-indigo-800">Sử dụng AI để phân tích và đề xuất phương án tối ưu nhất cho {editingItem.type}.</p>
                </div>
                
                {editingItem.type === 'budget' && (
                     <div className="space-y-3">
                         <label className="text-sm font-bold text-gray-700">Ngân sách hiện tại</label>
                         <input type="number" className="w-full p-3 border rounded-xl" defaultValue={editingItem.data.budget} />
                     </div>
                )}
                {/* ... (Other inputs similar to previous version) ... */}
                
                {aiSuggestion && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                        <p className="text-sm text-green-800 font-medium">{aiSuggestion.reason || "Đề xuất đã sẵn sàng."}</p>
                    </div>
                )}
             </div>
             <div className="p-6 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg">Cancel</button>
                <button 
                    onClick={handleAiOptimize} 
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                    {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    Optimize
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCampaignTable;