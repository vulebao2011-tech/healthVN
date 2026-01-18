
import React, { useState } from 'react';
import { SymptomLog } from '../types';

interface SymptomDiaryProps {
  logs: SymptomLog[];
  setLogs: (logs: SymptomLog[]) => void;
  activeProfileId: string;
  isPremium: boolean;
  onOpenPremium: () => void;
}

const SymptomDiary: React.FC<SymptomDiaryProps> = ({ logs, setLogs, activeProfileId, isPremium, onOpenPremium }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [newLog, setNewLog] = useState<Partial<SymptomLog>>({ 
    symptoms: [], 
    intensity: 1, 
    activity: 'Nghỉ ngơi',
    note: '' 
  });

  const suggestions = ['Ho', 'Khò khè', 'Khó thở', 'Nặng ngực', 'Đờm', 'Mệt mỏi', 'Sổ mũi', 'Đau họng'];

  const handleSave = () => {
    const log: SymptomLog = {
      id: Date.now().toString(),
      userId: activeProfileId,
      date: new Date().toLocaleDateString('vi-VN'),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      symptoms: newLog.symptoms || [],
      intensity: newLog.intensity || 1,
      activity: newLog.activity || 'Nghỉ ngơi',
      note: newLog.note || ''
    };
    setLogs([log, ...logs]);
    setShowAdd(false);
    setNewLog({ symptoms: [], intensity: 1, activity: 'Nghỉ ngơi', note: '' });
  };

  const handleVoice = () => {
    if (!isPremium) {
      onOpenPremium();
      return;
    }
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setNewLog(prev => ({ 
        ...prev, 
        note: (prev.note ? prev.note + " " : "") + "Tôi cảm thấy hơi khó thở nhẹ sau khi leo 3 tầng lầu." 
      }));
    }, 1500);
  };

  const toggleSymptom = (s: string) => {
    setNewLog(prev => ({
      ...prev,
      symptoms: prev.symptoms?.includes(s) 
        ? prev.symptoms.filter(i => i !== s) 
        : [...(prev.symptoms || []), s]
    }));
  };

  const profileLogs = logs.filter(l => l.userId === activeProfileId);

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nhật ký sức khỏe</h2>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Ghi chép diễn biến của bạn</p>
        </div>
        <div className="flex gap-2">
          {isPremium && profileLogs.length > 0 && (
            <button className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[9px] font-black uppercase shadow-sm border border-indigo-100 flex items-center gap-2 active:scale-95 transition-all">
               <i className="fas fa-wand-magic-sparkles"></i> AI Tóm tắt tuần
            </button>
          )}
          <button 
            onClick={() => setShowAdd(true)} 
            className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-transform"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end animate-fadeIn">
          <div className="bg-white w-full rounded-t-[3rem] p-8 animate-slideUp max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-black text-slate-800 mb-6 text-center">Hôm nay bạn thấy thế nào?</h3>
            
            <div className="space-y-6 pb-10">
              {/* Chips Suggestions */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Chọn nhanh triệu chứng</label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      onClick={() => toggleSymptom(s)} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${newLog.symptoms?.includes(s) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Text Input */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ghi chép tự do</label>
                  <button 
                    onClick={handleVoice}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}
                  >
                    <i className="fas fa-microphone"></i> {isListening ? 'Đang nghe...' : (isPremium ? 'Ghi bằng giọng nói' : 'Voice-to-text (Premium)')}
                  </button>
                </div>
                <textarea 
                  placeholder="Mô tả chi tiết cảm nhận của bạn (VD: nhức đầu sau khi đi nắng, tức ngực nhẹ khi leo cầu thang...)"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-300 min-h-[120px] shadow-inner"
                  value={newLog.note}
                  onChange={e => setNewLog({...newLog, note: e.target.value})}
                ></textarea>
              </div>

              {/* Intensity Slider */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block tracking-widest text-center">Mức độ khó chịu (1-5)</label>
                <div className="flex justify-between items-center px-4">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button 
                      key={v} 
                      onClick={() => setNewLog({ ...newLog, intensity: v })} 
                      className={`w-11 h-11 rounded-full font-black text-sm transition-all flex items-center justify-center ${newLog.intensity === v ? 'bg-orange-500 text-white scale-125 shadow-lg shadow-orange-100' : 'bg-slate-50 text-slate-300'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-4 px-2">
                  <span className="text-[8px] font-black text-emerald-500 uppercase">Rất nhẹ</span>
                  <span className="text-[8px] font-black text-rose-500 uppercase">Rất nặng</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAdd(false)} 
                  className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest"
                >
                  Bỏ qua
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all"
                >
                  Lưu nhật ký
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List display */}
      <div className="space-y-4">
        {profileLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
             <i className="fas fa-edit text-3xl text-slate-200 mb-3"></i>
             <p className="text-xs text-slate-400 font-medium px-10">Bạn chưa có ghi chép nào. Hãy theo dõi sức khỏe mỗi ngày.</p>
          </div>
        ) : (
          profileLogs.map(log => (
            <div key={log.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${log.intensity >= 4 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <span className="text-[8px] font-black leading-none mb-0.5 uppercase">Mức</span>
                  <span className="text-lg font-black leading-none">{log.intensity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">{log.date} • {log.time}</p>
                  
                  {log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {log.symptoms.map(s => (
                        <span key={s} className="bg-slate-50 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded border border-slate-100 uppercase">{s}</span>
                      ))}
                    </div>
                  )}

                  {log.note && (
                    <p className="text-xs font-medium text-slate-600 leading-relaxed bg-blue-50/20 p-3 rounded-xl border border-blue-50/50">
                      {log.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SymptomDiary;
