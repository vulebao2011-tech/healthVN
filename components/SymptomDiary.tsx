
import React, { useState } from 'react';
import { SymptomLog } from '../types';

interface SymptomDiaryProps {
  logs: SymptomLog[];
  setLogs: (logs: SymptomLog[]) => void;
}

const SymptomDiary: React.FC<SymptomDiaryProps> = ({ logs, setLogs }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newLog, setNewLog] = useState<Partial<SymptomLog>>({
    symptoms: [],
    intensity: 1,
    activity: 'Nghỉ ngơi'
  });

  const symptomsList = ['Ho', 'Khò khè', 'Khó thở', 'Nặng ngực', 'Đờm'];
  const activities = ['Nghỉ ngơi', 'Vận động mạnh', 'Đi ngoài trời', 'Làm việc'];

  const toggleSymptom = (s: string) => {
    const current = newLog.symptoms || [];
    if (current.includes(s)) {
      setNewLog({ ...newLog, symptoms: current.filter(i => i !== s) });
    } else {
      setNewLog({ ...newLog, symptoms: [...current, s] });
    }
  };

  const handleSave = () => {
    const log: SymptomLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('vi-VN'),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      symptoms: newLog.symptoms || [],
      intensity: newLog.intensity || 1,
      activity: newLog.activity || 'Nghỉ ngơi',
      note: newLog.note || ''
    };
    setLogs([log, ...logs]);
    setShowAdd(false);
    setNewLog({ symptoms: [], intensity: 1, activity: 'Nghỉ ngơi' });
  };

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Nhật ký của bạn</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-blue-200"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end animate-fadeIn">
          <div className="bg-white w-full rounded-t-[2.5rem] p-6 animate-slideUp">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Ghi nhận triệu chứng</h3>
            
            <div className="space-y-6 overflow-y-auto max-h-[70vh] pb-8">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Bạn cảm thấy thế nào?</label>
                <div className="flex flex-wrap gap-2">
                  {symptomsList.map(s => (
                    <button 
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${newLog.symptoms?.includes(s) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Mức độ khó chịu (1-5)</label>
                <div className="flex justify-between px-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button 
                      key={v}
                      onClick={() => setNewLog({ ...newLog, intensity: v })}
                      className={`w-10 h-10 rounded-full font-black text-sm transition-all ${newLog.intensity === v ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Đang làm gì?</label>
                <div className="grid grid-cols-2 gap-2">
                  {activities.map(a => (
                    <button 
                      key={a}
                      onClick={() => setNewLog({ ...newLog, activity: a })}
                      className={`py-2 rounded-xl text-xs font-bold ${newLog.activity === a ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-4 text-slate-500 font-bold"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100"
                >
                  Lưu nhật ký
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <i className="fas fa-feather text-4xl text-slate-200 mb-4"></i>
            <p className="text-sm text-slate-400">Chưa có nhật ký nào.<br/>Hãy ghi nhận khi thấy khó chịu.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${log.intensity >= 4 ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                <span className="text-xs font-black">{log.intensity}</span>
                <span className="text-[8px] font-bold uppercase">Mức độ</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{log.date} • {log.time}</p>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 rounded-full">{log.activity}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {log.symptoms.join(', ') || 'Không có triệu chứng rõ rệt'}
                </p>
                {log.note && <p className="text-xs text-slate-500 mt-1">{log.note}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SymptomDiary;
