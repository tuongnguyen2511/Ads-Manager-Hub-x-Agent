import React, { useState } from 'react';
import { AlertTriangle, Zap, Activity, CheckCircle, RefreshCw, ChevronDown, ArrowRight, TrendingDown } from 'lucide-react';

interface AIMonitorWidgetProps {
  onFixIssue?: (issue: string) => void;
}

export const AIMonitorWidget: React.FC<AIMonitorWidgetProps> = ({ onFixIssue }) => {
    const [autoOptimize, setAutoOptimize] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanned, setScanned] = useState(false);

    // Mock Alerts with Impact prediction
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            metric: 'CR (Conversion Rate)',
            current: '0.8%',
            previous: '2.1%',
            drop: '62%',
            trend: 'decrease',
            campaign: 'Sale Mùa Hè 2024',
            severity: 'high',
            impactText: 'Dự báo: Mất ~15% doanh thu/tuần',
            impactLevel: 85
        },
        {
            id: 2,
            metric: 'GMV (Doanh thu)',
            current: '4.2tr',
            previous: '9.5tr',
            drop: '55%',
            trend: 'decrease',
            campaign: 'TikTok Brand Awareness',
            severity: 'high',
            impactText: 'Dự báo: ROAS giảm dưới 1.0',
            impactLevel: 75
        },
        {
            id: 3,
            metric: 'Cost per Conversion',
            current: '150k',
            previous: '65k',
            drop: '130%',
            trend: 'increase',
            campaign: 'Google Search - Giày Nam',
            severity: 'medium',
            impactText: 'Dự báo: Cạn ngân sách sớm',
            impactLevel: 50
        }
    ]);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setScanned(true);
        }, 1500);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            AI Giám sát & Cảnh báo
                            {scanned && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><CheckCircle size={10} /> Đã quét</span>}
                        </h3>
                        <p className="text-xs text-gray-500">Tự động phát hiện bất thường và dự báo ảnh hưởng.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                        <Zap size={14} className={autoOptimize ? "text-indigo-600" : "text-gray-400"} />
                        <span className="text-sm font-medium text-gray-700">Tự động tối ưu hóa</span>
                        <button 
                            onClick={() => setAutoOptimize(!autoOptimize)}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${autoOptimize ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${autoOptimize ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <button 
                        onClick={handleScan}
                        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all ${isScanning ? 'animate-spin' : ''}`}
                        title="Quét ngay"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="p-5">
                {scanned || alerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="border border-red-100 bg-red-50/50 rounded-xl p-4 relative group hover:shadow-md transition-all">
                                <div className="absolute top-3 right-3">
                                    <AlertTriangle size={16} className="text-red-500" />
                                </div>
                                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                   Cảnh báo nghiêm trọng
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">{alert.metric}</h4>
                                <div className="flex items-end gap-2 mb-3">
                                    <span className="text-2xl font-bold text-gray-900">{alert.current}</span>
                                    <span className="text-sm text-gray-500 mb-1 line-through">{alert.previous}</span>
                                </div>
                                <div className="text-xs text-red-600 font-medium bg-red-100 inline-block px-2 py-0.5 rounded mb-3">
                                    {alert.trend === 'increase' ? 'Tăng' : 'Giảm'} {alert.drop} so với 7 ngày trước
                                </div>

                                {/* Impact Visualization */}
                                <div className="bg-white/60 p-2 rounded-lg border border-red-100 mb-3">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                                            <TrendingDown size={12} className="text-orange-500"/> Dự báo ảnh hưởng
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-1.5 rounded-full mb-1">
                                        <div 
                                            className="h-1.5 rounded-full bg-red-500" 
                                            style={{width: `${alert.impactLevel}%`}}
                                        ></div>
                                    </div>
                                    <div className="text-[10px] text-gray-600 font-medium">
                                        {alert.impactText}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-red-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500 truncate max-w-[120px]">{alert.campaign}</span>
                                    <button 
                                        onClick={() => onFixIssue && onFixIssue(`Hãy phân tích và đưa ra giải pháp khắc phục vấn đề: ${alert.metric} đang ${alert.trend === 'decrease' ? 'giảm' : 'tăng'} ${alert.drop} đối với chiến dịch "${alert.campaign}". Dự báo ảnh hưởng: ${alert.impactText}`)}
                                        className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                                    >
                                        Xử lý ngay <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                        <p>Hệ thống hoạt động ổn định. Không phát hiện bất thường.</p>
                    </div>
                )}
            </div>
            
            {autoOptimize && (
                 <div className="bg-indigo-600 text-white text-xs py-2 px-5 flex justify-between items-center">
                    <span>AI đang tự động điều chỉnh giá thầu (Auto Bidding) và ngân sách để khắc phục sự cố...</span>
                    <span className="animate-pulse font-bold flex items-center gap-1"><Zap size={10} /> LIVE</span>
                 </div>
            )}
        </div>
    );
};