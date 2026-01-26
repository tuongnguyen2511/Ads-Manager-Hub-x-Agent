
import React, { useState } from 'react';
import { CampaignFormData, PlatformId } from '../types';
import { generateCampaignDraft, generateTargetingAlternatives, suggestKeywordsAI } from '../services/geminiService';
import { 
  Facebook, 
  Search, 
  Music, 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft, 
  Wand2, 
  CheckCircle,
  Loader2,
  ShoppingBag,
  Users,
  MousePointer2,
  Target,
  Globe,
  LayoutTemplate,
  ImageIcon,
  Sparkles,
  Plus,
  X,
  Key,
  // Fix: Added missing Zap icon import from lucide-react
  Zap
} from 'lucide-react';

interface CampaignWizardProps {
  onClose: () => void;
  onSave: (data: CampaignFormData) => void;
}

const initialData: CampaignFormData = {
  name: '',
  platform: 'facebook',
  objective: 'sales',
  dailyBudget: 200000,
  targetLocation: 'Vietnam',
  targetAge: '18-45',
  targetInterests: '',
  keywords: [],
  headlines: ['', '', ''],
  descriptions: ['', ''],
  adHeadline: '',
  adContent: ''
};

const CampaignWizard: React.FC<CampaignWizardProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>(initialData);
  const [productDesc, setProductDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIGenerate = async () => {
    if (!productDesc.trim()) return;
    setIsGenerating(true);
    try {
      const draft = await generateCampaignDraft(productDesc, formData.platform);
      setFormData(prev => ({
        ...prev,
        adHeadline: draft.adHeadline || prev.adHeadline,
        adContent: draft.adContent || prev.adContent,
        targetInterests: draft.targetInterests || prev.targetInterests,
        targetAge: draft.targetAge || prev.targetAge,
        headlines: draft.headlines || prev.headlines,
        descriptions: draft.descriptions || prev.descriptions
      }));
      
      if (formData.platform === 'google') {
        const kws = await suggestKeywordsAI(productDesc);
        handleInputChange('keywords', [...new Set([...formData.keywords, ...kws])]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestKeywords = async () => {
    if (!productDesc.trim()) return;
    setIsSuggestingKeywords(true);
    try {
      const kws = await suggestKeywordsAI(productDesc);
      handleInputChange('keywords', [...new Set([...formData.keywords, ...kws])]);
    } finally {
      setIsSuggestingKeywords(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      handleInputChange('keywords', [...formData.keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    handleInputChange('keywords', formData.keywords.filter(k => k !== kw));
  };

  const platforms: {id: PlatformId, name: string, icon: React.ReactNode, color: string}[] = [
    { id: 'facebook', name: 'Facebook Ads', icon: <Facebook />, color: 'bg-blue-600' },
    { id: 'google', name: 'Google Search', icon: <Search />, color: 'bg-red-500' },
    { id: 'tiktok', name: 'TikTok Ads', icon: <Music />, color: 'bg-black' },
    { id: 'zalo', name: 'Zalo Ads', icon: <MessageCircle />, color: 'bg-blue-400' },
  ];

  const renderStep2_BasicSetup = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Column: Input Fields */}
        <div className="flex-1 space-y-8">
          <h3 className="text-xl font-bold text-gray-800">Thiết lập cơ bản</h3>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">TÊN CHIẾN DỊCH</label>
              <input 
                value={formData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                placeholder="Nhập tên chiến dịch..."
                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-gray-900 transition-all shadow-sm"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">NGÂN SÁCH HÀNG NGÀY</label>
              <div className="relative">
                <input 
                  type="number"
                  value={formData.dailyBudget}
                  onChange={(e) => handleInputChange('dailyBudget', parseInt(e.target.value) || 0)}
                  className="w-full p-5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-black text-gray-900 text-2xl transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Objective Cards */}
        <div className="flex-1 space-y-8">
          <h3 className="text-xl font-bold text-gray-800">MỤC TIÊU CHIẾN DỊCH</h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'sales', label: 'Tối đa hóa Doanh số', icon: <ShoppingBag size={24}/>, desc: 'Ưu tiên ROAS và các hành vi mua hàng' },
              { id: 'leads', label: 'Thu thập Khách hàng', icon: <Users size={24}/>, desc: 'Tìm kiếm người dùng tiềm năng quan tâm' },
              { id: 'traffic', label: 'Tăng lượt Truy cập', icon: <MousePointer2 size={24}/>, desc: 'Thu hút traffic chất lượng về website' }
            ].map(obj => (
              <button 
                key={obj.id}
                onClick={() => handleInputChange('objective', obj.id)}
                className={`p-6 rounded-[1.5rem] border-2 flex items-center gap-5 transition-all text-left group ${
                  formData.objective === obj.id 
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50' 
                    : 'border-gray-100 bg-white hover:border-blue-200'
                }`}
              >
                <div className={`p-4 rounded-2xl transition-colors ${formData.objective === obj.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>{obj.icon}</div>
                <div>
                  <span className="font-bold text-gray-900 block text-lg">{obj.label}</span>
                  <span className="text-xs text-gray-500 font-medium">{obj.desc}</span>
                </div>
                {formData.objective === obj.id && (
                  <div className="ml-auto">
                    <CheckCircle size={24} className="text-blue-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3_TargetingAndCreative = () => {
    const isGoogle = formData.platform === 'google';

    return (
      <div className="space-y-6 h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-gray-900">{isGoogle ? 'Thiết lập Từ khóa & Quảng cáo' : 'Thiết lập Nhắm mục tiêu & Creative'}</h3>
          <span className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100">
            <Sparkles size={14} fill="currentColor" /> TN Agent Powered
          </span>
        </div>

        {/* AI Prompt Section - Centered Focus */}
        <div className="bg-indigo-50/30 p-6 rounded-3xl border-2 border-indigo-100 shadow-sm space-y-4">
          <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
            <Wand2 size={18} className="text-indigo-600" />
            Mô tả sản phẩm để AI thiết lập tự động:
          </label>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              placeholder="VD: Kem dưỡng da chống lão hóa, Ô tô Sorento 7 chỗ..."
              className="flex-1 p-4 bg-white text-gray-900 border border-indigo-200 rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-medium"
            />
            <button 
              onClick={handleAIGenerate}
              disabled={isGenerating || !productDesc}
              className="bg-indigo-600 text-white px-8 py-4 rounded-[1.25rem] hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-3 font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              Tự động điền
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-2 pb-6">
          {/* Left Column: Targeting or Keywords */}
          <div className="space-y-4">
            {isGoogle ? (
              <div className="bg-white p-6 border border-gray-100 rounded-[2rem] shadow-sm space-y-5 h-full">
                <h4 className="font-black text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-50 uppercase text-xs tracking-widest">
                  <Key size={18} className="text-blue-600" /> Từ khóa mục tiêu
                </h4>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                      placeholder="Thêm từ khóa mới..."
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleAddKeyword} 
                    className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                  >
                    <Plus size={24}/>
                  </button>
                </div>
                
                <div className="min-h-[160px] p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-wrap gap-2 content-start">
                  {formData.keywords.length === 0 && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2 py-8">
                      <Key size={32} strokeWidth={1} />
                      <p className="text-[11px] font-bold uppercase tracking-widest">Chưa có từ khóa nào</p>
                    </div>
                  )}
                  {formData.keywords.map(kw => (
                    <span key={kw} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100 shadow-sm hover:border-blue-300 transition-all group">
                      {kw} 
                      <button 
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X size={14}/>
                      </button>
                    </span>
                  ))}
                </div>

                <button 
                  onClick={handleSuggestKeywords}
                  disabled={isSuggestingKeywords || !productDesc}
                  className="w-full py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center gap-3 transition-all"
                >
                  {isSuggestingKeywords ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  AI gợi ý từ khóa phù hợp
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 border border-gray-100 rounded-[2rem] shadow-sm space-y-6 h-full">
                <h4 className="font-black text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-50 uppercase text-xs tracking-widest">
                  <Target size={18} className="text-blue-600" /> Nhắm mục tiêu
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Độ tuổi</label>
                    <input value={formData.targetAge} onChange={(e) => handleInputChange('targetAge', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí</label>
                    <input value={formData.targetLocation} onChange={(e) => handleInputChange('targetLocation', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sở thích & Hành vi</label>
                  <textarea value={formData.targetInterests} onChange={(e) => handleInputChange('targetInterests', e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-44 resize-none text-sm leading-relaxed" />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ad Creative */}
          <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-100 rounded-[2rem] shadow-sm space-y-6">
              <h4 className="font-black text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-50 uppercase text-xs tracking-widest">
                <LayoutTemplate size={18} className="text-purple-600" /> {isGoogle ? 'Mẫu quảng cáo RSA' : 'Nội dung quảng cáo'}
              </h4>
              
              {isGoogle ? (
                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                         TIÊU ĐỀ (RSA) <span className="text-blue-600">{formData.headlines.filter(h => h).length}/15</span>
                      </label>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                        {formData.headlines.map((h, i) => (
                          <input 
                            key={i}
                            value={h}
                            onChange={(e) => {
                              const newH = [...formData.headlines];
                              newH[i] = e.target.value;
                              handleInputChange('headlines', newH);
                            }}
                            placeholder={`Tiêu đề ${i + 1}`}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                          />
                        ))}
                      </div>
                      <button 
                        onClick={() => handleInputChange('headlines', [...formData.headlines, ''])}
                        className="text-xs text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-800 flex items-center gap-2"
                      >
                        <Plus size={14} strokeWidth={3}/> Thêm tiêu đề
                      </button>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                        MÔ TẢ (RSA) <span className="text-blue-600">{formData.descriptions.filter(d => d).length}/4</span>
                      </label>
                      <div className="space-y-2">
                        {formData.descriptions.map((d, i) => (
                          <textarea 
                            key={i}
                            value={d}
                            onChange={(e) => {
                              const newD = [...formData.descriptions];
                              newD[i] = e.target.value;
                              handleInputChange('descriptions', newD);
                            }}
                            placeholder={`Mô tả ${i + 1}`}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm h-20 resize-none font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                          />
                        ))}
                      </div>
                      <button 
                        onClick={() => handleInputChange('descriptions', [...formData.descriptions, ''])}
                        className="text-xs text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-800 flex items-center gap-2"
                      >
                        <Plus size={14} strokeWidth={3}/> Thêm mô tả
                      </button>
                   </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TIÊU ĐỀ QUẢNG CÁO</label>
                    <input value={formData.adHeadline} onChange={(e) => handleInputChange('adHeadline', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NỘI DUNG CHÍNH</label>
                    <textarea value={formData.adContent} onChange={(e) => handleInputChange('adContent', e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-44 resize-none text-sm leading-relaxed" />
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                <div className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-4">Mô phỏng hiển thị</div>
                {isGoogle ? (
                   <div className="space-y-3 bg-white p-5 border border-gray-100 rounded-2xl">
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                         <Globe size={14} className="text-gray-400" /> https://www.tn-ads.hub/quang-cao
                      </div>
                      <div className="text-blue-700 text-xl font-bold hover:underline cursor-pointer leading-tight">
                        {formData.headlines[0] || 'Tiêu đề quảng cáo hấp dẫn sẽ xuất hiện ở đây'}
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {formData.descriptions[0] || 'Phần mô tả chi tiết giúp khách hàng hiểu rõ giá trị sản phẩm và dịch vụ của bạn trên Google.'}
                      </div>
                   </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0"><ImageIcon size={24} className="text-gray-300"/></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
                      <div className="text-sm text-gray-800 leading-relaxed line-clamp-3">{formData.adContent || "Nội dung quảng cáo sẽ được hiển thị cho khách hàng tại đây..."}</div>
                      <div className="aspect-video bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-300 border border-gray-100">
                        <ImageIcon size={48} strokeWidth={1} />
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Hình ảnh quảng cáo</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[3rem] w-full max-w-6xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] flex flex-col h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Thiết lập chiến dịch đa kênh</h2>
            <div className="flex items-center gap-4 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
              ))}
              <span className="text-xs font-black text-gray-400 ml-4 uppercase tracking-[0.2em]">BƯỚC {step} / 3</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-4 hover:bg-gray-100 rounded-full transition-all hover:rotate-90">
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-10 overflow-y-auto flex-1 bg-white">
          <div className="max-w-5xl mx-auto h-full">
            {step === 1 && (
              <div className="space-y-10 animate-fade-in">
                <h3 className="text-2xl font-black text-gray-900">Chọn nền tảng quảng cáo</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleInputChange('platform', p.id)}
                      className={`p-10 rounded-[2.5rem] border-2 flex flex-col items-center gap-6 transition-all group ${
                        formData.platform === p.id 
                          ? 'border-blue-600 bg-blue-50/50 shadow-2xl shadow-blue-100 scale-105' 
                          : 'border-gray-50 bg-white hover:border-blue-200 hover:scale-102'
                      }`}
                    >
                      <div className={`w-20 h-20 rounded-[2rem] text-white flex items-center justify-center shadow-xl transition-transform group-hover:rotate-6 ${p.color}`}>
                        {React.cloneElement(p.icon as React.ReactElement, { size: 36 })}
                      </div>
                      <span className="font-black text-gray-900 text-lg">{p.name}</span>
                      {formData.platform === p.id && <CheckCircle className="text-blue-600" size={32} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && renderStep2_BasicSetup()}

            {step === 3 && renderStep3_TargetingAndCreative()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-gray-50 bg-white flex justify-between shrink-0">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`px-10 py-5 rounded-2xl text-gray-500 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3 ${step === 1 ? 'opacity-0' : 'opacity-100'}`}
          >
            <ArrowLeft size={20} strokeWidth={3} /> Quay lại
          </button>
          
          <button 
            onClick={() => step === 3 ? onSave(formData) : setStep(s => s + 1)}
            className={`px-12 py-5 rounded-[1.75rem] text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 ${
              step === 3 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200 hover:brightness-110' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:brightness-110'
            }`}
          >
            {step === 3 ? 'Kích hoạt chiến dịch' : 'Tiếp theo'} <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
