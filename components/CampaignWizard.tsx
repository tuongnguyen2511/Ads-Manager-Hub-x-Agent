import React, { useState } from 'react';
import { CampaignFormData, PlatformId } from '../types';
import { generateCampaignDraft } from '../services/geminiService';
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
  MapPin,
  Target,
  Globe,
  LayoutTemplate,
  Type,
  ImageIcon,
  Sparkles
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
  adHeadline: '',
  adContent: ''
};

const CampaignWizard: React.FC<CampaignWizardProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>(initialData);
  const [productDesc, setProductDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit characters to get raw number
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue))) {
        handleInputChange('dailyBudget', Number(rawValue));
    }
  };

  const formatCurrency = (value: number) => {
      return value.toLocaleString('en-US');
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
        targetAge: draft.targetAge || prev.targetAge
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const platforms: {id: PlatformId, name: string, icon: React.ReactNode, color: string}[] = [
    { id: 'facebook', name: 'Facebook Ads', icon: <Facebook />, color: 'bg-blue-600' },
    { id: 'google', name: 'Google Ads', icon: <Search />, color: 'bg-red-500' },
    { id: 'tiktok', name: 'TikTok Ads', icon: <Music />, color: 'bg-black' },
    { id: 'zalo', name: 'Zalo Ads', icon: <MessageCircle />, color: 'bg-blue-400' },
  ];

  const renderStep1_Platform = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Chọn nền tảng quảng cáo</h3>
      <div className="grid grid-cols-2 gap-4">
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => handleInputChange('platform', p.id)}
            className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
              formData.platform === p.id 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className={`p-3 rounded-full text-white ${p.color}`}>
              {p.icon}
            </div>
            <span className="font-medium text-gray-700">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2_Objective = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Thiết lập Mục tiêu & Ngân sách</h3>
          <p className="text-gray-500 text-sm">Xác định mục tiêu rõ ràng giúp AI tối ưu hóa chiến dịch hiệu quả hơn.</p>
      </div>
      
      {/* Campaign Name */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Tên chiến dịch</label>
        <div className="relative">
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ví dụ: Chiến dịch Sale Hè 2024..."
              className="w-full p-4 pl-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            />
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Mục tiêu chiến dịch</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { id: 'sales', label: 'Doanh số', icon: <ShoppingBag size={24} />, desc: 'Tăng lượng bán hàng & doanh thu' },
                { id: 'leads', label: 'Khách hàng', icon: <Users size={24} />, desc: 'Thu thập thông tin khách hàng tiềm năng' },
                { id: 'traffic', label: 'Lượt truy cập', icon: <MousePointer2 size={24} />, desc: 'Tăng lưu lượng truy cập vào website/app' },
            ].map((obj) => (
                <button
                    key={obj.id}
                    onClick={() => handleInputChange('objective', obj.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    formData.objective === obj.id 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-gray-100 bg-white hover:border-blue-200'
                    }`}
                >
                    <div className={`mb-3 w-10 h-10 rounded-full flex items-center justify-center ${formData.objective === obj.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {obj.icon}
                    </div>
                    <div className={`font-bold ${formData.objective === obj.id ? 'text-blue-700' : 'text-gray-800'}`}>{obj.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{obj.desc}</div>
                    {formData.objective === obj.id && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle size={18} /></div>}
                </button>
            ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Ngân sách hàng ngày</label>
        <div className="relative">
             <input 
                type="text" 
                value={formatCurrency(formData.dailyBudget)}
                onChange={handleBudgetChange}
                className="w-full p-4 pl-4 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                placeholder="Nhập số tiền..."
             />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">VNĐ</span>
        </div>
        <div className="flex gap-2 mt-2">
            {[200000, 500000, 1000000, 2000000].map(amt => (
                <button 
                    key={amt}
                    onClick={() => handleInputChange('dailyBudget', amt)}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-medium transition-colors"
                >
                    {amt.toLocaleString()} đ
                </button>
            ))}
        </div>
      </div>
    </div>
  );

  const renderStep3_AI_Targeting = () => (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-800">Tối ưu hóa bởi AI</h3>
        <span className="text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
          <Wand2 size={12} /> Gemini Powered
        </span>
      </div>

      {/* AI Prompt Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100 shadow-sm space-y-3">
        <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
             <Sparkles size={16} className="text-indigo-600" />
             Mô tả sản phẩm để AI thiết lập tự động:
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            placeholder="VD: Kem dưỡng da chống lão hóa, thành phần tự nhiên..."
            className="flex-1 p-3 bg-white text-gray-900 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm placeholder-gray-400"
          />
          <button 
            onClick={handleAIGenerate}
            disabled={isGenerating || !productDesc}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-bold shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Tạo Magic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* Left Column: Targeting */}
        <div className="space-y-4 bg-white p-5 border border-gray-200 rounded-2xl shadow-sm">
            <h4 className="font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                <Target size={18} className="text-blue-600" /> Nhắm mục tiêu (Targeting)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Users size={12} /> Độ tuổi</label>
                <input 
                    value={formData.targetAge}
                    onChange={(e) => handleInputChange('targetAge', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                    placeholder="VD: 18-35"
                />
                </div>
                <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><MapPin size={12} /> Vị trí</label>
                <input 
                    value={formData.targetLocation}
                    onChange={(e) => handleInputChange('targetLocation', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                    placeholder="VD: Ho Chi Minh"
                />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Globe size={12} /> Sở thích & Hành vi</label>
                <textarea 
                value={formData.targetInterests}
                onChange={(e) => handleInputChange('targetInterests', e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-32 resize-none focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="AI sẽ tự động điền các sở thích phù hợp..."
                />
            </div>
        </div>

        {/* Right Column: Creative & Preview */}
        <div className="space-y-4">
            <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
                 <h4 className="font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <LayoutTemplate size={18} className="text-purple-600" /> Nội dung quảng cáo
                </h4>
                
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Type size={12} /> Tiêu đề (Headline)</label>
                    <input 
                        value={formData.adHeadline}
                        onChange={(e) => handleInputChange('adHeadline', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none font-bold text-sm"
                        placeholder="Tiêu đề thu hút..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><LayoutTemplate size={12} /> Nội dung (Primary Text)</label>
                    <textarea 
                        value={formData.adContent}
                        onChange={(e) => handleInputChange('adContent', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-24 resize-none focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        placeholder="Nội dung chính..."
                    />
                </div>
            </div>

            {/* Live Preview Card (Simplified) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm opacity-90">
                <div className="text-[10px] uppercase font-bold text-gray-400 mb-2">Xem trước quảng cáo</div>
                <div className="flex gap-3">
                     <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                     <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          <div className="text-xs text-gray-800 line-clamp-2">{formData.adContent || "Nội dung quảng cáo sẽ hiển thị ở đây..."}</div>
                          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                               <ImageIcon size={24} />
                          </div>
                          <div className="bg-gray-50 p-2 rounded border border-gray-100 flex justify-between items-center">
                              <div className="text-xs font-bold text-gray-900">{formData.adHeadline || "Tiêu đề quảng cáo"}</div>
                              <div className="px-2 py-1 bg-gray-200 text-[10px] font-bold text-gray-600 rounded">MUA NGAY</div>
                          </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tạo Chiến Dịch Mới</h2>
            <div className="flex items-center gap-2 mt-1">
                 <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                 <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                 <div className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                 <span className="text-sm text-gray-500 ml-2">Bước {step} / 3</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F8FAFC]">
          <div className="max-w-3xl mx-auto h-full">
            {step === 1 && renderStep1_Platform()}
            {step === 2 && renderStep2_Objective()}
            {step === 3 && renderStep3_AI_Targeting()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 disabled:opacity-0 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {step < 3 ? (
            <button 
              onClick={() => setStep(s => Math.min(3, s + 1))}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              Tiếp tục <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onSave(formData)}
              className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-200"
            >
              <CheckCircle size={18} /> Hoàn tất & Đăng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;