import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Zap, PieChart, Target, PenTool, Layers, Check } from 'lucide-react';
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
      icon: <Layers size={16} />, 
      label: "Cấu trúc (Max Conversion)", 
      action: () => handleStructureSuggestion('conversion')
    },
    { 
      icon: <Layers size={16} />, 
      label: "Cấu trúc (Max GMV)", 
      action: () => handleStructureSuggestion('gmv')
    },
    { 
      icon: <Target size={16} />, 
      label: "Gợi ý Target", 
      prompt: "Hãy gợi ý chiến lược audience targeting cho sản phẩm thời trang nữ độ tuổi 20-30 trên Facebook." 
    },
    { 
      icon: <PenTool size={16} />, 
      label: "Viết Content Ads", 
      prompt: "Viết 3 mẫu nội dung quảng cáo ngắn gọn, hấp dẫn cho chiến dịch giảm giá 50%." 
    },
    { 
      icon: <PieChart size={16} />, 
      label: "Phân bổ Ngân sách", 
      prompt: "Tôi có 10 triệu VND. Hãy gợi ý cách phân bổ ngân sách giữa Facebook và TikTok để tối ưu chuyển đổi." 
    },
    { 
      icon: <Zap size={16} />, 
      label: "Phân tích Xu hướng", 
      prompt: "Hiện tại xu hướng quảng cáo nào đang hiệu quả nhất cho ngành bán lẻ?" 
    }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => toggleOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40 flex items-center justify-center relative group"
        title="TN Agent Support"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
        </span>
        <Bot size={20} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 flex flex-col ${isMinimized ? 'w-72 h-16' : 'w-[400px] h-[650px]'}`}>
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
             <Bot size={20} />
          </div>
          <div>
            <div className="font-bold text-sm">AI Agent của Tường Nguyễn</div>
            <div className="text-[10px] text-indigo-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-1 rounded transition-colors">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => toggleOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions Panel */}
          <div className="bg-indigo-50 p-3 grid grid-cols-2 gap-2 border-b border-indigo-100 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200">
             {quickActions.map((action, idx) => (
               <button
                 key={idx}
                 onClick={() => action.action ? action.action() : handleSend(action.prompt)}
                 className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100 shadow-sm text-xs font-medium text-indigo-800 hover:bg-indigo-100 hover:shadow transition-all text-left"
               >
                 <span className="text-indigo-500 flex-shrink-0">{action.icon}</span>
                 <span className="truncate">{action.label}</span>
               </button>
             ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' && <Sparkles size={14} className="mb-1 text-purple-500 mr-1 inline-block" />}
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white border p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-gray-700 text-white border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;