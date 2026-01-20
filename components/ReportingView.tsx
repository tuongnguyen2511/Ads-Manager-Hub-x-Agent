import React, { useState } from 'react';
import { Download, FileSpreadsheet, Filter, TrendingUp, DollarSign, MousePointer2 } from 'lucide-react';
import { Campaign } from '../types';

interface ReportingViewProps {
  campaigns: Campaign[];
}

const ReportingView: React.FC<ReportingViewProps> = ({ campaigns }) => {
  const [reportType, setReportType] = useState('campaign');
  const [dateRange, setDateRange] = useState('last_30_days');

  const handleDownload = (format: 'excel' | 'csv') => {
    alert(`Đang tải xuống báo cáo...`);
  };

  // Calculate totals for summary cards
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const avgCtr = (campaigns.reduce((acc, c) => acc + c.ctr, 0) / campaigns.length).toFixed(2);

  const SummaryCard = ({ label, value, icon: Icon, color }: any) => (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
             <Icon size={24} className={color.replace('bg-', 'text-')} />
          </div>
          <div>
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
             <h4 className="text-xl font-bold text-gray-900">{value}</h4>
          </div>
      </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard label="Tổng chi tiêu" value={`${totalSpent.toLocaleString()} đ`} icon={DollarSign} color="bg-red-500" />
          <SummaryCard label="Tổng Clicks" value={totalClicks.toLocaleString()} icon={MousePointer2} color="bg-blue-500" />
          <SummaryCard label="CTR Trung bình" value={`${avgCtr}%`} icon={TrendingUp} color="bg-green-500" />
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Xuất dữ liệu chi tiết</h2>
            <p className="text-sm text-gray-500 mt-1">Chọn định dạng và bộ lọc để tải xuống.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleDownload('csv')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <Download size={18} /> CSV
            </button>
            <button 
              onClick={() => handleDownload('excel')}
              className="px-4 py-2 bg-[#22C55E] text-white rounded-xl font-medium hover:bg-green-600 shadow-lg shadow-green-200 flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet size={18} /> Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Loại báo cáo</label>
             <select 
               value={reportType}
               onChange={(e) => setReportType(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-700"
             >
               <option value="campaign">Hiệu suất Chiến dịch</option>
               <option value="adgroup">Hiệu suất Nhóm quảng cáo</option>
               <option value="ads">Hiệu suất Quảng cáo (Creative)</option>
             </select>
          </div>
          {/* ... other filters ... */}
        </div>
      </div>

      {/* Preview Table (Styled matching SmartCampaignTable) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/30">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
             <Filter size={16} className="text-indigo-600" /> Data Preview
           </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4 text-right">Spent</th>
                <th className="px-6 py-4 text-right">Impressions</th>
                <th className="px-6 py-4 text-right">Clicks</th>
                <th className="px-6 py-4 text-right">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((camp, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-900">{camp.name}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        camp.platform === 'facebook' ? 'bg-blue-50 text-blue-600' :
                        camp.platform === 'google' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'
                     }`}>{camp.platform}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 font-mono">{camp.spent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600 font-mono">{camp.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600 font-mono">{camp.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{camp.ctr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportingView;