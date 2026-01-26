import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Search, 
  MapPin, 
  Target, 
  Calendar, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle,
  MessageCircle,
  HelpCircle,
  Music
} from 'lucide-react';
import { PlatformId, ForecastResult } from '../types';
import { generatePerformanceForecast } from '../services/geminiService';

const PlanningView = () => {
  // Input State
  const [budget, setBudget] = useState(20000000);
  const [keywords, setKeywords] = useState('');
  const [objective, setObjective] = useState('Sales & Leads');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['facebook', 'zalo']);
  
  // Output State
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);

  const platforms: {id: PlatformId, name: string, icon: any, color: string}[] = [
    { id: 'facebook', name: 'Facebook', icon: Users, color: '#3b82f6' },
    { id: 'google', name: 'Google', icon: Search, color: '#ef4444' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: '#000000' },
    { id: 'zalo', name: 'Zalo Ads', icon: MessageCircle, color: '#0068ff' }, // Zalo Brand Color
  ];

  const togglePlatform = (id: PlatformId) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleForecast = async () => {
    if (!keywords || selectedPlatforms.length === 0) return;
    setIsForecasting(true);
    setForecast(null);
    try {
      const data = await generatePerformanceForecast(budget, selectedPlatforms, keywords, objective);
      setForecast(data);
    } finally {
      setIsForecasting(false);
    }
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in">
      
      {/* LEFT: Configuration Panel */}
      <div className="w-full lg:w-96 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-y-auto h-full flex flex-col">
        <div className="mb-6 pb-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <Target className="text-indigo-600" /> Lập kế hoạch
           </h2>
           <p className="text-sm text-gray-500 mt-1">Dự báo hiệu suất dựa trên AI & Keyword Planner</p>
        </div>

        <div className="space-y-6 flex-1">
          {/* Budget */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">1. Tổng ngân sách (30 ngày)</label>
            <div className="relative">
              <input 
                type="text" 
                value={budget.toLocaleString('vi-VN')} 
                onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    setBudget(rawValue ? parseInt(rawValue, 10) : 0);
                }}
                className="w-full p-4 pl-4 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-white bg-gray-800 text-lg shadow-inner"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">VNĐ</span>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[10000000, 20000000, 50000000].map(b => (
                <button key={b} onClick={() => setBudget(b)} className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200">
                  {(b/1000000)}tr
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">2. Kênh quảng cáo</label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map(p => (
                <button 
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                    selectedPlatforms.includes(p.id) 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p.icon size={18} className={selectedPlatforms.includes(p.id) ? 'text-indigo-600' : p.id === 'zalo' ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="text-sm font-semibold">{p.name}</span>
                  {selectedPlatforms.includes(p.id) && <CheckCircle size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords / Product */}
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">3. Sản phẩm / Từ khóa</label>
             <textarea 
               value={keywords}
               onChange={(e) => setKeywords(e.target.value)}
               placeholder="VD: Bất động sản cao cấp, Giày da nam, Khóa học tiếng Anh..."
               className="w-full p-4 border border-gray-700 rounded-xl h-24 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-800 text-white placeholder-gray-400 shadow-inner"
             />
          </div>

          {/* Objective */}
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">4. Mục tiêu</label>
             <select 
               value={objective}
               onChange={(e) => setObjective(e.target.value)}
               className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none text-sm"
             >
               <option>Sales & Leads (Doanh số)</option>
               <option>Brand Awareness (Nhận diện)</option>
               <option>Website Traffic (Truy cập)</option>
               <option>Zalo Form / Message</option>
             </select>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 mt-6">
          <button 
            onClick={handleForecast}
            disabled={isForecasting || !keywords || selectedPlatforms.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
          >
            {isForecasting ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isForecasting ? 'Đang phân tích...' : 'Lập kế hoạch AI'}
          </button>
        </div>
      </div>

      {/* RIGHT: Results Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 overflow-y-auto h-full">
        {!forecast ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4 opacity-60">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <Target size={48} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-800">Chưa có dữ liệu dự báo</h3>
               <p className="max-w-xs mx-auto">Nhập thông tin sản phẩm và chọn kênh (đừng quên thử Zalo Ads) để AI phân tích tiềm năng thị trường.</p>
             </div>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
             {/* Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tiếp cận ước tính', val: forecast.summary.totalReach.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Chuyển đổi dự kiến', val: forecast.summary.totalConversions.toLocaleString(), icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'CPA Trung bình', val: formatCurrency(forecast.summary.avgCpa), icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { label: 'ROI Dự báo (ROAS)', val: `${forecast.summary.roiPrediction}x`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                     <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                        <item.icon size={20} />
                     </div>
                     <div>
                        <div className="text-xs text-gray-500 font-bold uppercase">{item.label}</div>
                        <div className="text-lg font-bold text-gray-900">{item.val}</div>
                     </div>
                  </div>
                ))}
             </div>

             {/* AI Analysis */}
             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-2">
                   <Sparkles size={16} className="text-indigo-600" /> Phân tích chiến lược từ AI
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                   {forecast.aiAnalysis}
                </p>
             </div>

             {/* Charts Area */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-2 space-y-4">
                   <h3 className="font-bold text-gray-800">Xu hướng hiệu suất (30 ngày tới)</h3>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={forecast.dailyData}>
                            <defs>
                               <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend />
                            <Area type="monotone" dataKey="conversions" name="Chuyển đổi" stroke="#4f46e5" fillOpacity={1} fill="url(#colorConv)" strokeWidth={2} />
                            <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="4 4" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Budget Allocation Pie */}
                <div className="space-y-4">
                   <h3 className="font-bold text-gray-800">Phân bổ ngân sách đề xuất</h3>
                   <div className="h-64 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                               data={forecast.channelBreakdown}
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="suggestedBudget"
                            >
                               {forecast.channelBreakdown.map((entry, index) => {
                                  const platform = platforms.find(p => p.id === entry.platform);
                                  return <Cell key={`cell-${index}`} fill={platform?.color || '#ccc'} />;
                               })}
                            </Pie>
                            <Tooltip />
                         </PieChart>
                      </ResponsiveContainer>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="text-center">
                            <div className="text-xs text-gray-400 font-bold uppercase">Budget</div>
                            <div className="font-bold text-gray-900">100%</div>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      {forecast.channelBreakdown.map(channel => {
                         const platform = platforms.find(p => p.id === channel.platform);
                         return (
                            <div key={channel.platform} className="flex justify-between items-center text-xs">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: platform?.color || '#9ca3af'}}></div>
                                  <span className="font-medium text-gray-600">{platform?.name || channel.platform}</span>
                               </div>
                               <span className="font-bold text-gray-900">{formatCurrency(channel.suggestedBudget)}</span>
                            </div>
                         )
                      })}
                   </div>
                </div>
             </div>

             {/* Detailed Breakdown Table */}
             <div>
                <h3 className="font-bold text-gray-800 mb-4">Chi tiết từng kênh</h3>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                   <table className="w-full text-sm text-left">
                      <thead className="text-gray-500 font-bold text-xs uppercase bg-gray-100">
                         <tr>
                            <th className="px-6 py-3">Platform</th>
                            <th className="px-6 py-3 text-right">Est. Reach</th>
                            <th className="px-6 py-3 text-right">Est. CPC</th>
                            <th className="px-6 py-3 text-right">Conv. Rate</th>
                            <th className="px-6 py-3 text-right">Budget</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                         {forecast.channelBreakdown.map((row) => {
                            const platform = platforms.find(p => p.id === row.platform);
                            const PlatformIcon = platform?.icon || HelpCircle;
                            const platformColor = platform?.color || '#9ca3af';
                            const platformName = platform?.name || row.platform;

                            return (
                               <tr key={row.platform} className="hover:bg-white transition-colors">
                                  <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-900">
                                     <PlatformIcon size={16} style={{color: platformColor}} />
                                     {platformName}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">{row.estimatedReach.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">{row.estimatedCpc.toLocaleString()} đ</td>
                                  <td className="px-6 py-4 text-right text-green-600 font-bold">{(row.estimatedConversionRate * 100).toFixed(1)}%</td>
                                  <td className="px-6 py-4 text-right font-bold text-indigo-600">{formatCurrency(row.suggestedBudget)}</td>
                               </tr>
                            )
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningView;