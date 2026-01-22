import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Zap, PieChart, Target, PenTool, Layers, Check, Palette } from 'lucide-react';
import { chatWithAgent, suggestCampaignStructure } from '../services/geminiService';
import { AIMessage } from '../types';

interface AIAssistantProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  triggerMessage?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen: controlledOpen, onToggle, triggerMessage }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'model', content: 'Xin chào! Tôi là AI Agent của Tường Nguyễn. Hãy chọn một công cụ bên dưới hoặc hỏi tôi bất cứ điều gì về quảng cáo.', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevTriggerRef = useRef<string | undefined>(undefined);

  // Determine effective open state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const toggleOpen = (value: boolean) => {
    if (onToggle) {
      onToggle(value);
    } else {
      setInternalOpen(value);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle external trigger messages
  useEffect(() => {
    if (triggerMessage && triggerMessage !== prevTriggerRef.current && isOpen) {
      handleSend(triggerMessage);
      prevTriggerRef.current = triggerMessage;
    }
  }, [triggerMessage, isOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: AIMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
    history.push({ role: 'user', parts: [{ text: userMsg.content }] });

    const responseText = await chatWithAgent(text, history);
    
    setMessages(prev => [...prev, { role: 'model', content: responseText, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const handleStructureSuggestion = async (objective: 'conversion' | 'gmv') => {
      const label = objective === 'conversion' ? 'Tối ưu chuyển đổi' : 'Tối đa hóa GMV';
      const userMsg: AIMessage = { role: 'user', content: `Gợi ý cấu trúc chiến dịch cho mục tiêu: ${label}`, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      const suggestion = await suggestCampaignStructure(objective);
      
      setMessages(prev => [...prev, { role: 'model', content: suggestion, timestamp: new Date() }]);
      setIsLoading(false);
  };

  const quickActions = [
    { 
      icon: <Layers size={14} />, 
      label: "Cấu trúc (Max Conversion)", 
      action: () => handleStructureSuggestion('conversion')
    },
    { 
      icon: <Layers size={14} />, 
      label: "Cấu trúc (Max GMV)", 
      action: () => handleStructureSuggestion('gmv')
    },
    { 
      icon: <Target size={14} />, 
      label: "Gợi ý Target", 
      prompt: "Hãy gợi ý chiến lược audience targeting cho sản phẩm thời trang nữ độ tuổi 20-30 trên Facebook." 
    },
    { 
      icon: <PenTool size={14} />, 
      label: "Viết Content Ads", 
      prompt: "Viết 3 mẫu nội dung quảng cáo ngắn gọn, hấp dẫn cho chiến dịch giảm giá 50%." 
    },
    { 
      icon: <Palette size={14} />, 
      label: "Tối ưu Creative", 
      prompt: "Tôi muốn làm mới hình ảnh và nội dung quảng cáo. Hãy gợi ý 3 ý tưởng creative mới lạ, bắt trend để tăng CTR." 
    },
    { 
      icon: <PieChart size={14} />, 
      label: "Phân bổ Ngân sách", 
      prompt: "Tôi có 10 triệu VND. Hãy gợi ý cách phân bổ ngân sách giữa Facebook và TikTok để tối ưu chuyển đổi." 
    },
    { 
      icon: <Zap size={14} />, 
      label: "Phân tích Xu hướng", 
      prompt: "Hiện tại xu hướng quảng cáo nào đang hiệu quả nhất cho ngành bán lẻ?" 
    }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => toggleOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all z-50 flex items-center gap-3 group animate-bounce-in"
        title="Mở TN Agent Support"
      >
        <div className="relative">
             <Bot size={24} />
             <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
            </span>
        </div>
        <span className="font-bold text-sm tracking-wide hidden md:inline-block">TN Agent Support</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 flex flex-col ${isMinimized ? 'w-72 h-16' : 'w-[400px] h-[650px]'}`}>
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl flex justify-between items-center text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
             <Bot size={20} />
          </div>
          <div>
            <div className="font-bold text-base">TN Agent Support</div>
            <div className="text-[11px] text-indigo-100 flex items-center gap-1.5 opacity-90">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Sẵn sàng hỗ trợ
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => toggleOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'model' && <Sparkles size={14} className="mb-1 text-purple-500 mr-2 inline-block" />}
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white border p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Panel - Horizontal Scroll */}
          <div className="bg-white border-t border-gray-100 p-2">
             <div className="flex gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide snap-x">
                 {quickActions.map((action, idx) => (
                   <button
                     key={idx}
                     onClick={() => action.action ? action.action() : handleSend(action.prompt)}
                     className="snap-start shrink-0 flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-full border border-indigo-100 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 transition-all whitespace-nowrap active:scale-95"
                   >
                     {action.icon}
                     <span>{action.label}</span>
                   </button>
                 ))}
             </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white rounded-b-2xl border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-gray-100 text-gray-900 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all placeholder-gray-400"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;