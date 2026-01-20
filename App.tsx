import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Settings, 
  Plus, 
  TrendingUp,
  CreditCard,
  Users,
  Wallet,
  Calendar,
  Layers,
  HelpCircle,
  MoreVertical,
  Folder,
  FileImage,
  ShoppingBag,
  DollarSign,
  BarChart2,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import CampaignWizard from './components/CampaignWizard';
import AIAssistant from './components/AIAssistant';
import TopUpModal from './components/TopUpModal';
import SmartCampaignTable from './components/SmartCampaignTable';
import ReportingView from './components/ReportingView';
import { AIMonitorWidget } from './components/AIMonitorWidget';
import { Campaign, CampaignFormData, Transaction, PlatformId } from './types';

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
        ads: [
          { id: 'ad3', name: 'Text Ad 1', headline: 'Giày Nam Cao Cấp', content: 'Da thật 100%, bảo hành 12 tháng.', status: 'active', impressions: 15000, clicks: 2000, ctr: 13.3 }
        ]
      }
    ]
  },
  { 
    id: '2', 
    name: 'Brand Awareness Q2', 
    platform: 'tiktok', 
    status: 'paused', 
    objective: 'Awareness', 
    budget: 3000000, 
    spent: 2800000, 
    impressions: 120000, 
    clicks: 800, 
    ctr: 0.6, 
    startDate: '2024-04-15',
    adGroups: [] 
  },
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'adgroups' | 'ads' | 'wallet' | 'settings' | 'reporting'>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [showWizard, setShowWizard] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [balance, setBalance] = useState(15450000);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  
  // AI Agent Control State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTriggerMessage, setAiTriggerMessage] = useState('');

  const handleCreateCampaign = (data: CampaignFormData) => {
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
          name: 'New Ad Group',
          status: 'active',
          targeting: `${data.targetAge}, ${data.targetLocation}, ${data.targetInterests}`,
          ads: [
             {
                id: `ad_${Date.now()}`,
                name: 'Ad 1',
                headline: data.adHeadline,
                content: data.adContent,
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
  };

  const handleUpdateCampaign = (updated: Campaign) => {
    setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
  };

  const handleToggleStatus = (id: string, type: string, parentId?: string) => {
    console.log(`Toggle status for ${type} ${id}`);
    if (type === 'campaign') {
         setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
    }
  };
  
  const handleFixIssue = (issue: string) => {
     setAiTriggerMessage(issue);
     setAiOpen(true);
  };

  // ----- RENDER FUNCTIONS -----

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Số dư ví', value: `${balance.toLocaleString()} đ`, change: '+Nạp ngay', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Chi tiêu tháng này', value: '4.500.000 đ', change: '+12%', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tổng hiển thị', value: '195k', change: '-2%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'CTR Trung bình', value: '2.8%', change: '+0.4%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          // New metrics rows
          { label: 'Chuyển đổi', value: '154', change: '+15%', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Doanh thu', value: '45.2tr đ', change: '+8%', icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'ROAS', value: '3.8', change: '-0.1', icon: BarChart2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { label: 'AOV (TB đơn)', value: '450k đ', change: '+5%', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <span className={`text-xs font-semibold ${stat.label === 'Số dư ví' ? 'text-indigo-600 cursor-pointer hover:underline' : stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} onClick={stat.label === 'Số dư ví' ? () => setShowTopUp(true) : undefined}>
                {stat.change}
              </span>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Inserted AI Monitor Widget with fix handler */}
      <AIMonitorWidget onFixIssue={handleFixIssue} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Hiệu suất tổng quan</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg text-sm p-2 outline-none">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATA_STATS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} />
                <Line type="monotone" dataKey="spend" stroke="#e11d48" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bổ ngân sách</h3>
          <div className="flex-1 flex items-center justify-center">
             {/* Mock Pie Chart Representation */}
             <div className="relative w-48 h-48 rounded-full border-[16px] border-indigo-100 border-l-indigo-600 border-t-purple-500 border-r-blue-400">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-bold text-gray-800">8.5tr</span>
                   <span className="text-xs text-gray-500">Tổng chi tiêu</span>
                </div>
             </div>
          </div>
          <div className="space-y-3 mt-4">
             <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div> Facebook</span> <span className="font-semibold">45%</span></div>
             <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div> Google</span> <span className="font-semibold">30%</span></div>
             <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded-full"></div> Tiktok</span> <span className="font-semibold">25%</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="animate-fade-in space-y-6">
       <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div>
                <p className="text-indigo-100 font-medium mb-1">Số dư khả dụng</p>
                <h2 className="text-4xl font-bold">{balance.toLocaleString()} VNĐ</h2>
                <p className="text-sm text-indigo-200 mt-2 flex items-center gap-2">
                   <CreditCard size={16} /> **** **** **** 4289
                </p>
             </div>
             <button 
               onClick={() => setShowTopUp(true)}
               className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 shadow-md transition-transform hover:scale-105 flex items-center gap-2"
             >
                <Plus size={20} /> Nạp tiền ngay
             </button>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-800">Lịch sử giao dịch</h3>
          </div>
          <table className="w-full text-left">
             <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                   <th className="p-4">Mã GD</th>
                   <th className="p-4">Ngày</th>
                   <th className="p-4">Loại</th>
                   <th className="p-4">Phương thức</th>
                   <th className="p-4">Số tiền</th>
                   <th className="p-4 text-right">Trạng thái</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                   <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm text-gray-600">{tx.id}</td>
                      <td className="p-4 text-sm text-gray-700">{tx.date}</td>
                      <td className="p-4">
                         <span className={`text-xs px-2 py-1 rounded-md font-medium ${tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {tx.type === 'deposit' ? 'Nạp tiền' : 'Chi tiêu'}
                         </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{tx.method || '-'}</td>
                      <td className={`p-4 font-medium ${tx.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                         {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} đ
                      </td>
                      <td className="p-4 text-right">
                         <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Hoàn thành</span>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-indigo-200 shadow-lg shrink-0">T</div>
          <div className="flex flex-col">
             <span className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1">
               TN-Ads<span className="text-blue-600"> Manager Hub</span>
             </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Quản lý</div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard size={18} /> Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'campaigns' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Layers size={18} /> Chiến dịch
          </button>
          
          {/* Split Menu Items */}
          <button 
            onClick={() => setActiveTab('adgroups')} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'adgroups' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Folder size={18} /> Nhóm quảng cáo
          </button>
          <button 
            onClick={() => setActiveTab('ads')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'ads' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileImage size={18} /> Quảng cáo (Ads)
          </button>

          <div className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Tài chính & Công cụ</div>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'wallet' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Wallet size={18} /> Nạp tiền & Ví
          </button>
          <button 
            onClick={() => setActiveTab('reporting')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'reporting' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet size={18} /> Báo cáo & Xuất dữ liệu
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
             <Calendar size={18} /> Lập kế hoạch
          </button>

          <div className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Hệ thống</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <Settings size={18} /> Cài đặt tài khoản
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
           <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">AD</div>
              <div className="text-left">
                 <div className="text-sm font-bold text-gray-800">Admin User</div>
                 <div className="text-xs text-gray-500">Premium Plan</div>
              </div>
              <MoreVertical size={16} className="ml-auto text-gray-400" />
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-full">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {activeTab === 'dashboard' ? 'Tổng quan tài khoản' : 
               activeTab === 'campaigns' ? 'Quản lý chiến dịch' : 
               activeTab === 'adgroups' ? 'Quản lý nhóm quảng cáo' :
               activeTab === 'ads' ? 'Quản lý quảng cáo' :
               activeTab === 'wallet' ? 'Ví & Thanh toán' :
               activeTab === 'reporting' ? 'Báo cáo & Xuất dữ liệu' :
               'Cài đặt'}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Cập nhật lúc: {new Date().toLocaleTimeString()} • <span className="text-green-600 font-medium cursor-pointer">Làm mới dữ liệu</span></p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                <select className="bg-transparent outline-none text-sm cursor-pointer">
                   <option>7 ngày qua</option>
                   <option>30 ngày qua</option>
                   <option>Tháng này</option>
                   <option>Tháng trước</option>
                </select>
             </div>
             <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all">
                <HelpCircle size={18} /> Hướng dẫn
             </button>
             <button 
               onClick={() => setShowWizard(true)}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all hover:translate-y-[-1px]"
             >
               <Plus size={20} /> Tạo chiến dịch
             </button>
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        
        {(activeTab === 'campaigns' || activeTab === 'adgroups' || activeTab === 'ads') && (
          <div className="animate-fade-in flex flex-col h-full">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-blue-700 flex items-start gap-2">
                 <div className="mt-0.5"><Layers size={16} /></div>
                 <p>Sử dụng trình quản lý bên dưới để xem và chỉnh sửa {activeTab === 'campaigns' ? 'chiến dịch' : activeTab === 'adgroups' ? 'nhóm quảng cáo' : 'mẫu quảng cáo'} của bạn. Bạn có thể sử dụng AI để tối ưu hóa nhanh.</p>
             </div>
             <SmartCampaignTable 
                campaigns={campaigns}
                onUpdateCampaign={handleUpdateCampaign}
                onDelete={() => {}}
                onDuplicate={() => {}}
                onToggleStatus={handleToggleStatus}
             />
          </div>
        )}

        {activeTab === 'wallet' && renderWallet()}
        {activeTab === 'reporting' && <ReportingView campaigns={campaigns} />}
      </main>

      {/* Campaign Creation Wizard Modal */}
      {showWizard && (
        <CampaignWizard 
          onClose={() => setShowWizard(false)}
          onSave={handleCreateCampaign}
        />
      )}
      
      {/* Top Up Modal */}
      {showTopUp && (
        <TopUpModal 
          onClose={() => setShowTopUp(false)}
          onConfirm={handleTopUp}
        />
      )}

      {/* Floating AI Agent - Controlled */}
      <AIAssistant 
         isOpen={aiOpen} 
         onToggle={setAiOpen} 
         triggerMessage={aiTriggerMessage} 
      />
    </div>
  );
}

export default App;