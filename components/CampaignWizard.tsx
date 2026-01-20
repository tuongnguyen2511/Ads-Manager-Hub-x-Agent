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
  MousePointer2
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
                type="number" 
                value={formData.dailyBudget}
                onChange={(e) => handleInputChange('dailyBudget', parseInt(e.target.value))}
                className="w-full p-4 pl-4 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Targeting & Creative (AI)</h3>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
          <Wand2 size={12} /> Powered by Gemini
        </span>
      </div>

      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-3">
        <label className="text-sm font-bold text-purple-900">Mô tả sản phẩm của bạn để AI tự động điền:</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            placeholder="Ví dụ: Giày thể thao nam siêu nhẹ, thoáng khí..."
            className="flex-1 p-3 bg-[#333333] text-white border-none rounded-xl focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
          />
          <button 
            onClick={handleAIGenerate}
            disabled={isGenerating || !productDesc}
            className="bg-[#C084FC] text-white px-5 py-2 rounded-xl hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md transition-all"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Tạo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Độ tuổi</label>
          <input 
            value={formData.targetAge}
            onChange={(e) => handleInputChange('targetAge', e.target.value)}
            className="w-full p-3 bg-[#333333] text-white border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Vị trí</label>
          <input 
            value={formData.targetLocation}
            onChange={(e) => handleInputChange('targetLocation', e.target.value)}
            className="w-full p-3 bg-[#333333] text-white border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Sở thích / Hành vi</label>
        <textarea 
          value={formData.targetInterests}
          onChange={(e) => handleInputChange('targetInterests', e.target.value)}
          className="w-full p-3 bg-[#333333] text-white border-none rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500"
          placeholder="AI sẽ gợi ý các sở thích phù hợp..."
        />
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tiêu đề quảng cáo</label>
          <input 
            value={formData.adHeadline}
            onChange={(e) => handleInputChange('adHeadline', e.target.value)}
            className="w-full p-3 bg-[#333333] text-white border-none rounded-lg font-bold focus:ring-2 focus:ring-indigo-500"
            placeholder="Tiêu đề thu hút..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nội dung quảng cáo</label>
          <textarea 
            value={formData.adContent}
            onChange={(e) => handleInputChange('adContent', e.target.value)}
            className="w-full p-3 bg-[#333333] text-white border-none rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nội dung chính..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tạo Chiến Dịch Mới</h2>
            <p className="text-sm text-gray-500">Bước {step} / 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && renderStep1_Platform()}
          {step === 2 && renderStep2_Objective()}
          {step === 3 && renderStep3_AI_Targeting()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-200 disabled:opacity-0 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {step < 3 ? (
            <button 
              onClick={() => setStep(s => Math.min(3, s + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              Tiếp tục <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onSave(formData)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
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