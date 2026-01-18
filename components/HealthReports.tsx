
import React from 'react';
import { SymptomLog, MedicationReminder, UserProfile } from '../types';

interface HealthReportsProps {
  logs: SymptomLog[];
  reminders: MedicationReminder[];
  profile: UserProfile;
  onBack: () => void;
}

const HealthReports: React.FC<HealthReportsProps> = ({ logs, reminders, profile, onBack }) => {
  const avgIntensity = logs.length > 0 ? (logs.reduce((acc, l) => acc + l.intensity, 0) / logs.length).toFixed(1) : 0;
  const takenMeds = reminders.filter(r => r.lastTakenDate === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800">Báo cáo sức khỏe</h2>
        <div className="flex gap-2">
           <button className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-sm"><i className="fas fa-share-alt"></i></button>
           <button className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100"><i className="fas fa-file-pdf"></i></button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Điểm tổng quát</p>
          <div className="w-32 h-32 rounded-full border-[8px] border-emerald-500 flex flex-col items-center justify-center mx-auto shadow-xl shadow-emerald-50">
             <span className="text-4xl font-black text-slate-800">8.5</span>
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Rất tốt</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-50 p-5 rounded-3xl text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Khó chịu TB</p>
              <p className="text-xl font-black text-slate-700">{avgIntensity}/5</p>
           </div>
           <div className="bg-slate-50 p-5 rounded-3xl text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Uống thuốc</p>
              <p className="text-xl font-black text-slate-700">{takenMeds}/{reminders.length}</p>
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Gần đây</h3>
           {logs.slice(0, 3).map(l => (
             <div key={l.id} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-slate-800">{l.symptoms.join(', ') || 'Ghi chú thường'}</p>
                   <p className="text-[8px] text-slate-400 font-medium uppercase">{l.date}</p>
                </div>
                <span className={`text-[10px] font-black ${l.intensity > 3 ? 'text-rose-500' : 'text-emerald-500'}`}>Mức {l.intensity}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
         <div className="relative z-10">
            <h4 className="text-sm font-black uppercase mb-2">Lời khuyên của AI</h4>
            <p className="text-xs font-medium leading-relaxed opacity-90">"Gần đây nhịp tim bạn có xu hướng tăng khi AQI trên 100. Hãy chú ý nghỉ ngơi nhiều hơn vào các buổi chiều ô nhiễm."</p>
         </div>
         <i className="fas fa-stethoscope absolute -right-4 -bottom-4 text-7xl opacity-10"></i>
      </div>
    </div>
  );
};
export default HealthReports;
