
import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, X, Wallet, QrCode } from 'lucide-react';

interface TopUpModalProps {
  onClose: () => void;
  onConfirm: (amount: number, method: string) => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ onClose, onConfirm }) => {
  const [amount, setAmount] = useState<number>(2000000); // Defaulting to 2,000,000 as per screenshot
  const [method, setMethod] = useState<string>('credit_card');
  const [step, setStep] = useState(1);

  const predefinedAmounts = [500000, 1000000, 2000000, 5000000, 10000000];

  const handlePayment = () => {
    setStep(2); // Simulate processing
    setTimeout(() => {
      onConfirm(amount, method);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-[500px] shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-2xl transition-all z-10"
        >
          <X size={24} />
        </button>

        {step === 1 ? (
          <>
            <div className="p-8 border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Wallet size={20} />
                </div>
                Nạp tiền vào tài khoản
              </h2>
            </div>

            <div className="p-8 space-y-8 bg-white">
              {/* Amount Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">CHỌN SỐ TIỀN NẠP (VNĐ)</label>
                <div className="grid grid-cols-3 gap-3">
                  {predefinedAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-3.5 px-1 text-sm font-black rounded-2xl border transition-all ${
                        amount === amt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                
                {/* Dark Custom Amount Display */}
                <div className="bg-[#333] p-8 rounded-3xl border border-gray-700 shadow-inner mt-6 flex items-center justify-start">
                   <div className="text-white text-3xl font-black tracking-tighter">
                     {amount.toLocaleString().replace(/,/g, '')}
                   </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">PHƯƠNG THỨC THANH TOÁN</label>
                <div className="space-y-3">
                  <button
                    onClick={() => setMethod('credit_card')}
                    className={`w-full p-4 rounded-[1.75rem] border-2 flex items-center gap-4 transition-all group ${
                      method === 'credit_card' 
                        ? 'border-blue-500 bg-blue-50/20' 
                        : 'border-gray-50 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="bg-gray-100 p-3 rounded-2xl group-hover:bg-gray-200 transition-colors">
                      <CreditCard size={24} className="text-gray-700" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-gray-900 text-[15px]">Thẻ Quốc tế (Visa/Master/JCB)</div>
                      <div className="text-[11px] font-bold text-gray-400">Phí giao dịch: 2% + 2.000đ</div>
                    </div>
                    {method === 'credit_card' && (
                      <div className="text-blue-500">
                        <CheckCircle size={24} fill="white" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setMethod('momo')}
                    className={`w-full p-4 rounded-[1.75rem] border-2 flex items-center gap-4 transition-all group ${
                      method === 'momo' 
                        ? 'border-blue-500 bg-blue-50/20' 
                        : 'border-gray-50 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="bg-pink-50 p-3 rounded-2xl group-hover:bg-pink-100 transition-colors">
                      <Smartphone size={24} className="text-pink-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-gray-900 text-[15px]">Ví Momo</div>
                      <div className="text-[11px] font-bold text-gray-400">Miễn phí giao dịch</div>
                    </div>
                    {method === 'momo' && (
                      <div className="text-blue-500">
                        <CheckCircle size={24} fill="white" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setMethod('bank_transfer')}
                    className={`w-full p-4 rounded-[1.75rem] border-2 flex items-center gap-4 transition-all group ${
                      method === 'bank_transfer' 
                        ? 'border-blue-500 bg-blue-50/20' 
                        : 'border-gray-50 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="bg-green-50 p-3 rounded-2xl group-hover:bg-green-100 transition-colors">
                      <QrCode size={24} className="text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-gray-900 text-[15px]">Chuyển khoản Ngân hàng (QR)</div>
                      <div className="text-[11px] font-bold text-gray-400">Tự động xác nhận 24/7</div>
                    </div>
                    {method === 'bank_transfer' && (
                      <div className="text-blue-500">
                        <CheckCircle size={24} fill="white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-[2.5rem]">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">TỔNG THANH TOÁN:</span>
                <div className="text-2xl font-black text-blue-600 tracking-tight">{amount.toLocaleString()} đ</div>
              </div>
              <button
                onClick={handlePayment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_25px_rgba(37,99,235,0.3)]"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-6 bg-white">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Wallet size={24} className="text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Đang xử lý giao dịch...</h3>
              <p className="text-gray-500 font-medium text-sm max-w-[280px]">Hệ thống đang kết nối với cổng thanh toán. Vui lòng không tắt trình duyệt.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUpModal;
