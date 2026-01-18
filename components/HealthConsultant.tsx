
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, SymptomLog, ChatMessage } from '../types';
import { getHealthConsultation } from '../services/geminiService';

interface HealthConsultantProps {
  profile: UserProfile;
  logs: SymptomLog[];
  onUseAI: () => void;
  onOpenPremium: () => void;
}

const HealthConsultant: React.FC<HealthConsultantProps> = ({ profile, logs, onUseAI, onOpenPremium }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Chào ${profile.name}! Tôi là Dr. Health VN. Dựa trên hồ sơ của bạn, tôi có thể tư vấn gì về sức khỏe hôm nay?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const maxFreeMessages = 10;
  const currentUsage = profile.aiUsageCount || 0;
  const isOutOfMessages = !profile.isPremium && currentUsage >= maxFreeMessages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || isOutOfMessages) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    onUseAI();

    try {
      const response = await getHealthConsultation(profile, logs, [...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Tôi gặp chút trục trặc, hãy thử lại nhé.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, tôi không thể kết nối lúc này.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Dr. Health AI</h2>
            <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
               <span className="text-[9px] font-bold text-emerald-600">AI Tư vấn Sức khỏe</span>
            </div>
          </div>
        </div>
        {!profile.isPremium && (
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase">Miễn phí</p>
            <p className="text-[10px] font-black text-blue-600">{currentUsage}/{maxFreeMessages} Câu hỏi</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isOutOfMessages && (
          <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 text-center animate-bounce">
             <i className="fas fa-lock text-amber-500 mb-2"></i>
             <p className="text-xs font-bold text-amber-900 mb-3">Bạn đã dùng hết {maxFreeMessages} câu hỏi miễn phí.</p>
             <button onClick={onOpenPremium} className="bg-amber-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase shadow-lg shadow-amber-100">Nâng cấp để hỏi tiếp</button>
          </div>
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 flex gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100 pb-28">
        <div className={`bg-slate-50 p-2 rounded-2xl flex items-center gap-2 border border-slate-100 transition-opacity ${isOutOfMessages ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <input 
            type="text" 
            disabled={isOutOfMessages}
            placeholder="Hỏi Dr. AI về tình trạng sức khỏe..." 
            className="flex-1 bg-transparent px-3 py-2 text-xs font-medium focus:outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || isOutOfMessages}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthConsultant;
