
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  TrendingUp,
  CreditCard,
  Users,
  Wallet,
  Calendar,
  Layers,
  HelpCircle,
  Folder,
  FileImage,
  ShoppingBag,
  DollarSign,
  BarChart2,
  Activity,
  FileSpreadsheet,
  BrainCircuit,
  ArrowRightLeft,
  ChevronRight,
  LogOut,
  Bell,
  Target,
  Sparkles,
  Filter,
  Settings2,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import CampaignWizard from './components/CampaignWizard';
import AIAssistant from './components/AIAssistant';
import TopUpModal from './components/TopUpModal';
import SmartCampaignTable from './components/SmartCampaignTable';
import ReportingView from './components/ReportingView';
import PlanningView from './components/PlanningView'; 
import BudgetAllocationModal from './components/BudgetAllocationModal';
import { AIMonitorWidget } from './components/AIMonitorWidget';
import { Campaign, CampaignFormData, Transaction } from './types';

// Mock Data
const MOCK_CAMPAIGNS: Campaign[] = [
  { 
    id: '1', 
    name: 'Sale Mùa Hè 2024', 
    platform: 'facebook', 
    status: 'active', 
    objective: 'Sales', 
    budget: 5000000, 
    spent: 1200000, 
    impressions: 45000, 
    clicks: 1200, 
    ctr: 2.6, 
    startDate: '2024-05-01',
    adGroups: [
      {
        id: 'ag1',
        name: 'Nhóm 1 - Nữ 18-24',
        status: 'active',
        targeting: 'Female, 18-24, Fashion Interest',
        ads: [
          { id: 'ad1', name: 'Mẫu áo hè 1', headline: 'Áo thun mát lạnh', content: 'Giảm 50% cho đơn hàng đầu tiên', status: 'active', impressions: 20000, clicks: 600, ctr: 3.0 },
          { id: 'ad2', name: 'Mẫu váy 2', headline: 'Váy đi biển cực xinh', content: 'BST mới nhất 2024', status: 'paused', impressions: 5000, clicks: 100, ctr: 2.0 }
        ]
      }
    ]
  },
  { 
    id: '3', 
    name: 'Google Search - Giày Nam', 
    platform: 'google', 
    status: 'active', 
    objective: 'Traffic', 
    budget: 10000000, 
    spent: 4500000, 
    impressions: 30000, 
    clicks: 3500, 
    ctr: 11.5, 
    startDate: '2024-05-10',
    adGroups: [
      {
        id: 'ag2',
        name: 'Nhóm Từ Khóa Chính',
        status: 'active',
        targeting: 'Keywords: "giày nam", "giày da", "giày công sở"',
        keywords: ['giày nam', 'giày da', 'giày công sở'],
        ads: [
          { 
            id: 'ad3', 
            name: 'RSA Ad 1', 
            headline: 'Giày Nam Cao Cấp', 
            content: 'Da thật 100%, bảo hành 12 tháng.', 
            headlines: ['Giày Nam Cao Cấp', 'Mua Ngay Giảm 20%', 'Da Thật 100%'],
            descriptions: ['Mẫu giày nam mới nhất 2024, thiết kế sang trọng lịch lãm.', 'Bảo hành 12 tháng, đổi trả trong 7 ngày.'],
            status: 'active', 
            impressions: 15000, 
            clicks: 2000, 
            ctr: 13.3 
          }
        ]
      }
    ]
  },
  { 
    id: '2', 
    name: 'TikTok - Brand Awareness', 
    platform: 'tiktok', 
    status: 'active', 
    objective: 'Awareness', 
    budget: 3000000, 
    spent: 2800000, 
    impressions: 150000, 
    clicks: 800, 
    ctr: 0.53, 
    startDate: '2024-05-05',
    adGroups: [
      {
        id: 'ag3',
        name: 'Gen Z Target',
        status: 'active',
        targeting: 'Age: 18-24, Interest: Entertainment',
        ads: [
           { id: 'ad4', name: 'Viral Challenge', headline: 'Thử thách biến hình', content: 'Tham gia ngay hashtag challenge.', status: 'active', impressions: 100000, clicks: 600, ctr: 0.6 }
        ]
      }
    ] 
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN001', date: '2024-05-20', amount: 5000000, type: 'deposit', method: 'Momo', status: 'completed' },
  { id: 'TXN002', date: '2024-05-18', amount: 1200000, type: 'spend', status: 'completed' },
  { id: 'TXN003', date: '2024-05-15', amount: 10000000, type: 'deposit', method: 'Bank Transfer', status: 'completed' },
];

const DATA_STATS = [
  { name: 'T2', spend: 4000, clicks: 240 },
  { name: 'T3', spend: 3000, clicks: 139 },
  { name: 'T4', spend: 2000, clicks: 980 },
  { name: 'T5', spend: 2780, clicks: 390 },
  { name: 'T6', spend: 1890, clicks: 480 },
  { name: 'T7', spend: 2390, clicks: 380 },
  { name: 'CN', spend: 3490, clicks: 430 },
];

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'adgroups' | 'ads' | 'wallet' | 'settings' | 'reporting' | 'planning'>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [showWizard, setShowWizard] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showBudgetAllocation, setShowBudgetAllocation] = useState(false);
  const [balance, setBalance] = useState(15450000);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTriggerMessage, setAiTriggerMessage] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateCampaign = (data: CampaignFormData) => {
    const isGoogle = data.platform === 'google';
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: data.name,
      platform: data.platform,
      status: 'active',
      objective: data.objective,
      budget: data.dailyBudget * 30, 
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      startDate: new Date().toLocaleDateString('vi-VN'),
      adGroups: [
        {
          id: `ag_${Date.now()}`,
          name: isGoogle ? 'Nhóm Từ khóa Chính' : 'Nhóm Mục tiêu mới',
          status: 'active',
          targeting: isGoogle ? `Từ khóa: ${data.keywords.slice(0, 3).join(', ')}...` : `${data.targetAge}, ${data.targetLocation}, ${data.targetInterests}`,
          keywords: isGoogle ? data.keywords : [],
          ads: [
             {
                id: `ad_${Date.now()}`,
                name: 'Ad 1',
                headline: isGoogle ? data.headlines[0] : data.adHeadline,
                content: isGoogle ? data.descriptions[0] : data.adContent,
                headlines: isGoogle ? data.headlines : [],
                descriptions: isGoogle ? data.descriptions : [],
                status: 'active',
                impressions: 0,
                clicks: 0,
                ctr: 0
             }
          ]
        }
      ]
    };
    setCampaigns([newCampaign, ...campaigns]);
    setShowWizard(false);
    setActiveTab('campaigns');
    showToast('Đã kích hoạt chiến dịch thành công!');
  };

  const handleTopUp = (amount: number, method: string) => {
    setBalance(prev => prev + amount);
    const newTxn: Transaction = {
      id: `TXN${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      type: 'deposit',
      method: method,
      status: 'completed'
    };
    setTransactions([newTxn, ...transactions]);
    showToast(`Đã nạp ${amount.toLocaleString()} đ thành công vào ví!`);
  };

  const handleUpdateCampaign = (updated: Campaign) => {
    setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
  };

  const handleApplyBudgets = (allocations: { id: string, budget: number }[]) => {
      const updatedCampaigns = campaigns.map(c => {
          const allocation = allocations.find(a => a.id === c.id);
          return allocation ? { ...c, budget: allocation.budget } : c;
      });
      setCampaigns(updatedCampaigns);
      setShowBudgetAllocation(false);
      showToast('AI đã hoàn tất việc tái phân bổ ngân sách cho tài khoản của bạn!', 'success');
  };

  const handleToggleStatus = (id: string, type: 'campaign' | 'adgroup' | 'ad', parentId?: string) => {
    if (type === 'campaign') {
         setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
    }
  };
  
  const handleFixIssue = (issue: string) => {
     setAiTriggerMessage(issue);
     setAiOpen(true);
  };

  const SidebarItem = ({ id, icon: Icon, label, active, count }: { id: string, icon: any, label: string, active: boolean, count?: number }) => (
    <button 
      onClick={() => setActiveTab(id as any)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium mb-1 group relative ${
        active 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
          : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
      }`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full"></div>}
      <Icon size={20} className={`transition-colors ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span>{label}</span>
      {count !== undefined && <span className="ml-auto bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>}
    </button>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Số dư ví', value: `${balance.toLocaleString()} đ`, change: '+Nạp ngay', icon: Wallet, color: 'text-white', bg: 'bg-gradient-to-br from-indigo-500 to-purple-600', isPrimary: true },
          { label: 'Chi tiêu tháng này', value: '4.500.000 đ', change: '+12%', icon: CreditCard, color: 'text-blue-600', bg: 'bg-white' },
          { label: 'Tổng hiển thị', value: '195k', change: '-2%', icon: Users, color: 'text-purple-600', bg: 'bg-white' },
          { label: 'Doanh thu (GMV)', value: '45.2tr đ', change: '+8%', icon: DollarSign, color: 'text-teal-600', bg: 'bg-white' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${stat.isPrimary ? 'bg-white/20' : 'bg-gray-50'}`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.isPrimary ? 'bg-white/20 text-white' : stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${stat.isPrimary ? 'text-indigo-100' : 'text-gray-500'}`}>{stat.label}</p>
                <h3 className={`text-2xl font-bold ${stat.isPrimary ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
              </div>
            </div>
            {stat.isPrimary && (
                 <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            )}
             {stat.label === 'Số dư ví' && (
                 <button onClick={() => setShowTopUp(true)} className="absolute inset-0 w-full h-full z-20 cursor-pointer"></button>
             )}
          </div>
        ))}
      </div>

      <AIMonitorWidget onFixIssue={handleFixIssue} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Hiệu suất tổng quan</h3>
              <p className="text-xs text-gray-500">So sánh Click và Chi tiêu theo thời gian</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA_STATS}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                    cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                <Line type="monotone" dataKey="spend" stroke="#e11d48" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bổ ngân sách</h3>
          <div className="flex-1 flex items-center justify-center relative">
             <div className="relative w-56 h-56 rounded-full border-[24px] border-indigo-50 border-l-indigo-600 border-t-purple-500 border-r-gray-200 transform rotate-45 transition-all hover:scale-105">
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-bold text-gray-800">8.5tr</span>
                   <span className="text-xs text-gray-500 font-medium">Tổng chi tiêu</span>
            </div>
          </div>
          <div className="space-y-4 mt-6">
             {[
                 { label: 'Facebook Ads', color: 'bg-indigo-600', val: '45%' },
                 { label: 'Google Ads', color: 'bg-purple-500', val: '30%' },
                 { label: 'TikTok Ads', color: 'bg-gray-800', val: '25%' }
             ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center text-sm group cursor-pointer">
                    <span className="flex items-center gap-3 text-gray-600 font-medium group-hover:text-gray-900">
                        <div className={`w-3 h-3 ${item.color} rounded-full`}></div> {item.label}
                    </span> 
                    <span className="font-bold text-gray-800">{item.val}</span>
                 </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-down border ${
          notification.type === 'success' ? 'bg-green-600 border-green-500' : 'bg-red-600 border-red-500'
        } text-white`}>
          <CheckCircle size={20} />
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
             <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-gray-900">TN Ads Manager Hub</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by Gemini</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-2 overflow-y-auto space-y-1">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overview</div>
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Tổng quan" active={activeTab === 'dashboard'} />
          <SidebarItem id="reporting" icon={FileSpreadsheet} label="Báo cáo & Audit" active={activeTab === 'reporting'} />
          
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-1">Campaigns</div>
          <SidebarItem id="campaigns" icon={Layers} label="Chiến dịch" active={activeTab === 'campaigns'} count={campaigns.length} />
          <SidebarItem id="adgroups" icon={Folder} label="Nhóm quảng cáo" active={activeTab === 'adgroups'} />
          <SidebarItem id="ads" icon={FileImage} label="Quảng cáo" active={activeTab === 'ads'} />
          <SidebarItem id="planning" icon={Target} label="Lập kế hoạch" active={activeTab === 'planning'} />
          
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-1">Finance & Settings</div>
          <SidebarItem id="wallet" icon={Wallet} label="Ví & Thanh toán" active={activeTab === 'wallet'} />
          <SidebarItem id="settings" icon={Settings2} label="Cài đặt" active={activeTab === 'settings'} />
        </div>

        <div className="p-4 border-t border-gray-100">
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium">
              <LogOut size={20} />
              <span>Đăng xuất</span>
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-10">
           <div>
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab === 'dashboard' ? 'Tổng quan tài khoản' : 
                 activeTab === 'campaigns' ? 'Quản lý chiến dịch' :
                 activeTab === 'adgroups' ? 'Quản lý nhóm quảng cáo' :
                 activeTab === 'ads' ? 'Quản lý quảng cáo' :
                 activeTab === 'reporting' ? 'Báo cáo hiệu suất' :
                 activeTab === 'planning' ? 'Lập kế hoạch quảng cáo' :
                 activeTab === 'wallet' ? 'Ví & Thanh toán' : 'Cài đặt'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
           </div>

           <div className="flex items-center gap-4">
              <button 
                 onClick={() => setAiOpen(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm hover:bg-indigo-100 transition-colors"
              >
                  <Sparkles size={16} />
                  Hỏi AI Agent
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative hover:bg-gray-200 transition-colors cursor-pointer">
                 <Bell size={20} className="text-gray-600" />
                 <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-white shadow-md cursor-pointer"></div>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
           <div className="max-w-7xl mx-auto h-full">
              {activeTab === 'dashboard' && renderDashboard()}
              
              {(activeTab === 'campaigns' || activeTab === 'adgroups' || activeTab === 'ads') && (
                <div className="animate-fade-in space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                             <Filter size={16} /> Filter
                          </button>
                          <button 
                             onClick={() => setShowBudgetAllocation(true)}
                             className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                          >
                             <ArrowRightLeft size={16} /> AI Phân bổ ngân sách
                          </button>
                      </div>
                      <button 
                        onClick={() => setShowWizard(true)}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                      >
                        <Plus size={18} /> Tạo chiến dịch
                      </button>
                   </div>
                   
                   <SmartCampaignTable 
                      campaigns={campaigns} 
                      onUpdateCampaign={handleUpdateCampaign}
                      onDuplicate={(id) => {}}
                      onDelete={(id) => {}}
                      onToggleStatus={handleToggleStatus}
                      initialLevel={activeTab === 'adgroups' ? 'adgroups' : activeTab === 'ads' ? 'ads' : 'campaigns'}
                   />
                </div>
              )}

              {activeTab === 'reporting' && <ReportingView campaigns={campaigns} />}
              
              {activeTab === 'planning' && <PlanningView />}

              {activeTab === 'wallet' && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-gray-400 font-medium mb-1 text-sm uppercase tracking-widest">Số dư khả dụng</p>
                                <h2 className="text-5xl font-black tracking-tighter mb-6">{balance.toLocaleString()} <span className="text-2xl font-bold text-gray-400">VNĐ</span></h2>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowTopUp(true)} className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                                        <Wallet size={18} /> Nạp tiền
                                    </button>
                                    <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10">
                                        Lịch sử giao dịch
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
                                    <CreditCard size={32} />
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Lịch sử giao dịch</h3>
                            <button className="text-indigo-600 text-sm font-bold hover:underline">Xem tất cả</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Mã GD</th>
                                        <th className="px-6 py-3">Ngày</th>
                                        <th className="px-6 py-3">Loại</th>
                                        <th className="px-6 py-3">Phương thức</th>
                                        <th className="px-6 py-3 text-right">Số tiền</th>
                                        <th className="px-6 py-3 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono font-medium text-gray-600">#{tx.id}</td>
                                            <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {tx.type === 'deposit' ? 'Nạp tiền' : 'Chi tiêu'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{tx.method || '-'}</td>
                                            <td className={`px-6 py-4 text-right font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} đ
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-green-600 font-bold text-xs flex items-center justify-center gap-1">
                                                    <CheckCircle size={12} /> Thành công
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
              )}
           </div>
        </main>
      </div>

      {showWizard && <CampaignWizard onClose={() => setShowWizard(false)} onSave={handleCreateCampaign} />}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onConfirm={handleTopUp} />}
      {showBudgetAllocation && <BudgetAllocationModal campaigns={campaigns} onClose={() => setShowBudgetAllocation(false)} onApply={handleApplyBudgets} />}
      
      <AIAssistant isOpen={aiOpen} onToggle={setAiOpen} triggerMessage={aiTriggerMessage} />
    </div>
  );
}

export default App;
