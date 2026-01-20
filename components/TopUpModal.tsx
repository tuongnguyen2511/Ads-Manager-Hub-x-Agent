import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, X, Wallet } from 'lucide-react';

interface TopUpModalProps {
  onClose: () => void;
  onConfirm: (amount: number, method: string) => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ onClose, onConfirm }) => {
  const [amount, setAmount] = useState<number>(1000000);
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        {step === 1 ? (
          <>
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-blue-600" /> Nạp tiền vào tài khoản
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Chọn số tiền nạp (VNĐ)</label>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2 px-1 text-sm rounded-lg border transition-all ${
                        amount === amt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                  placeholder="Nhập số tiền khác..."
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Phương thức thanh toán</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setMethod('credit_card')}
                    className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      method === 'credit_card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="bg-white p-2 rounded-full shadow-sm"><CreditCard size={20} className="text-gray-700" /></div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Thẻ Quốc tế (Visa/Master/JCB)</div>
                      <div className="text-xs text-gray-500">Phí giao dịch: 2% + 2.000đ</div>
                    </div>
                    {method === 'credit_card' && <CheckCircle size={20} className="ml-auto text-blue-600" />}
                  </button>

                  <button
                    onClick={() => setMethod('momo')}
                    className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      method === 'momo' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="bg-pink-100 p-2 rounded-full"><Smartphone size={20} className="text-pink-600" /></div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Ví Momo</div>
                      <div className="text-xs text-gray-500">Miễn phí giao dịch</div>
                    </div>
                    {method === 'momo' && <CheckCircle size={20} className="ml-auto text-pink-600" />}
                  </button>
                  
                  <button
                    onClick={() => setMethod('bank_transfer')}
                    className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      method === 'bank_transfer' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="bg-green-100 p-2 rounded-full"><Wallet size={20} className="text-green-600" /></div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Chuyển khoản Ngân hàng (QR)</div>
                      <div className="text-xs text-gray-500">Tự động xác nhận 24/7</div>
                    </div>
                    {method === 'bank_transfer' && <CheckCircle size={20} className="ml-auto text-green-600" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Tổng thanh toán:</span>
                <div className="text-xl font-bold text-blue-600">{amount.toLocaleString()} đ</div>
              </div>
              <button
                onClick={handlePayment}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-lg font-bold text-gray-800">Đang xử lý giao dịch...</h3>
            <p className="text-gray-500 text-sm">Vui lòng không tắt trình duyệt.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUpModal;