import React, { useState } from 'react';
import { Download, FileSpreadsheet, Calendar, Filter, Share2 } from 'lucide-react';
import { Campaign } from '../types';

interface ReportingViewProps {
  campaigns: Campaign[];
}

const ReportingView: React.FC<ReportingViewProps> = ({ campaigns }) => {
  const [reportType, setReportType] = useState('campaign');
  const [dateRange, setDateRange] = useState('last_30_days');

  const handleDownload = (format: 'excel' | 'csv') => {
    // Mock download
    const fileName = `report_${reportType}_${dateRange}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    alert(`Đang tải xuống báo cáo: ${fileName}`);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Báo cáo & Xuất dữ liệu</h2>
            <p className="text-sm text-gray-500 mt-1">Tải xuống dữ liệu hiệu suất chi tiết để phân tích offline.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleDownload('csv')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <Download size={18} /> Xuất CSV
            </button>
            <button 
              onClick={() => handleDownload('excel')}
              className="px-4 py-2 bg-[#22C55E] text-white rounded-lg font-medium hover:bg-green-600 shadow-lg shadow-green-200 flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet size={18} /> Xuất Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Loại báo cáo</label>
             <select 
               value={reportType}
               onChange={(e) => setReportType(e.target.value)}
               className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-gray-700"
             >
               <option value="campaign">Hiệu suất Chiến dịch</option>
               <option value="adgroup">Hiệu suất Nhóm quảng cáo</option>
               <option value="ads">Hiệu suất Quảng cáo (Creative)</option>
               <option value="daily">Báo cáo theo ngày</option>
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Khoảng thời gian</label>
             <select 
               value={dateRange}
               onChange={(e) => setDateRange(e.target.value)}
               className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-gray-700"
             >
               <option value="today">Hôm nay</option>
               <option value="yesterday">Hôm qua</option>
               <option value="last_7_days">7 ngày qua</option>
               <option value="last_30_days">30 ngày qua</option>
               <option value="this_month">Tháng này</option>
               <option value="last_month">Tháng trước</option>
             </select>
          </div>
           <div className="space-y-2">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nền tảng</label>
             <select 
               className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-gray-700"
             >
               <option value="all">Tất cả nền tảng</option>
               <option value="facebook">Facebook Ads</option>
               <option value="google">Google Ads</option>
               <option value="tiktok">TikTok Ads</option>
             </select>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
             <Filter size={16} className="text-indigo-600" /> Xem trước dữ liệu
           </h3>
           <span className="text-xs text-gray-400">Hiển thị 5 dòng đầu tiên</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Ngày</th>
                <th className="px-6 py-4 font-bold">Tên chiến dịch</th>
                <th className="px-6 py-4 font-bold">Nền tảng</th>
                <th className="px-6 py-4 text-right font-bold">Chi tiêu</th>
                <th className="px-6 py-4 text-right font-bold">Hiển thị</th>
                <th className="px-6 py-4 text-right font-bold">Clicks</th>
                <th className="px-6 py-4 text-right font-bold">CTR</th>
                <th className="px-6 py-4 text-right font-bold">Chuyển đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((camp, idx) => {
                // Determine conversions based on mock logic
                const conversions = Math.floor(camp.clicks * (camp.ctr/100) * 0.1); 
                return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 text-xs">20/1/2026</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{camp.name}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        camp.platform === 'facebook' ? 'bg-[#DBEAFE] text-[#1D4ED8]' :
                        camp.platform === 'google' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                        camp.platform === 'tiktok' ? 'bg-black text-white' : 'bg-blue-50 text-blue-500'
                     }`}>{camp.platform}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">{camp.spent.toLocaleString()} đ</td>
                  <td className="px-6 py-4 text-right text-gray-600">{camp.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{camp.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{camp.ctr}%</td>
                  <td className="px-6 py-4 text-right font-bold text-[#22C55E]">{conversions}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportingView;