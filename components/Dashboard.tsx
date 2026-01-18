
import React, { useState, useEffect } from 'react';
import { UserProfile, EnvironmentalData, RiskAnalysis, SymptomLog, MedicationReminder } from '../types';
import { getPersonalizedRisk } from '../services/geminiService';

interface DashboardProps {
  profile: UserProfile;
  envData: EnvironmentalData;
  logs: SymptomLog[];
  reminders: MedicationReminder[];
  onTakeMed: (id: string) => void;
  onRefresh: () => void;
  onEmergency: () => void;
  isGpsActive: boolean;
  onToggleGps: () => void;
  onLocationChange: (loc: string) => void;
  onOpenPremium: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, envData, logs, reminders, onTakeMed, onRefresh, onEmergency, 
  isGpsActive, onToggleGps, onLocationChange, onOpenPremium
}) => {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [searchLoc, setSearchLoc] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const activeReminders = reminders.filter(r => r.enabled).sort((a, b) => a.time.localeCompare(b.time));

  useEffect(() => {
    const runAnalysis = async () => {
      setLoading(true);
      const res = await getPersonalizedRisk(profile, envData, logs);
      setAnalysis(res);
      setLoading(false);
    };
    runAnalysis();
  }, [profile, envData]);

  const getAQIStatus = (val: number) => {
    if (val <= 50) return { 
      label: 'Không khí TỐT', sub: 'An toàn cho hoạt động ngoài trời', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', ring: 'ring-emerald-500'
    };
    if (val <= 150) return { 
      label: 'Hơi Ô NHIỄM', sub: 'Nhóm nhạy cảm cần chú ý', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', ring: 'ring-amber-500'
    };
    return { 
      label: 'Ô NHIỄM NẶNG', sub: 'Nguy hiểm cho sức khỏe!', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', ring: 'ring-rose-500'
    };
  };

  const status = getAQIStatus(envData.aqi);

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-32">
      {/* Search & Location Controls */}
      <section className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
           <i className="fas fa-search text-slate-300 text-xs ml-2"></i>
           <input 
             type="text" 
             placeholder="Nhập địa điểm (KCN, Quận, TP...)" 
             className="bg-transparent flex-1 text-xs font-bold text-slate-700 focus:outline-none"
             value={searchLoc}
             onChange={(e) => setSearchLoc(e.target.value)}
             onKeyPress={(e) => e.key === 'Enter' && onLocationChange(searchLoc)}
           />
           <button onClick={() => onLocationChange(searchLoc)} className="bg-blue-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg uppercase">Khóa vị trí</button>
        </div>
        <div className="flex justify-between items-center px-1">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isGpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isGpsActive ? 'Đang dùng GPS' : 'Chế độ thủ công'}</span>
           </div>
           <button onClick={onToggleGps} className={`text-[8px] font-black uppercase px-4 py-1.5 rounded-full border transition-all ${isGpsActive ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              {isGpsActive ? 'Dừng GPS' : 'Bật GPS Tự động'}
           </button>
        </div>
      </section>

      {/* Main BreatheSafe AQI Card */}
      <section className={`rounded-[3.5rem] p-8 border ${status.border} ${status.bg} shadow-2xl shadow-slate-200/50 transition-all duration-700 relative overflow-hidden text-center`}>
        <div className="relative inline-flex items-center justify-center mb-6">
           <div className={`w-44 h-44 rounded-full bg-white shadow-inner border-[10px] ${status.border} flex flex-col items-center justify-center relative z-10`}>
              <span className={`text-6xl font-black ${status.text} tracking-tighter leading-none`}>{envData.aqi}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">AQI</span>
           </div>
           <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${status.bg} scale-125`}></div>
        </div>

        <h2 className={`text-2xl font-black ${status.text} mb-1 tracking-tight`}>{status.label}</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-6">{status.sub}</p>

        {/* Mini Map Representation */}
        <div className="w-full h-24 bg-slate-200 rounded-[2rem] mb-6 relative overflow-hidden border border-white shadow-inner">
           <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/105.8,21.0,12/400x150?access_token=none')] bg-cover opacity-60"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                 <div className={`w-4 h-4 ${status.bg} rounded-full border-2 border-white shadow-lg animate-ping`}></div>
                 <div className={`absolute inset-0 w-4 h-4 ${status.text.replace('text-', 'bg-')} rounded-full border-2 border-white`}></div>
              </div>
           </div>
           <div className="absolute bottom-2 left-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white flex justify-between items-center">
              <span className="text-[8px] font-black text-slate-600 uppercase truncate">{envData.location}</span>
              <i className="fas fa-location-arrow text-[8px] text-blue-500"></i>
           </div>
        </div>

        {/* Checklist */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-5 text-left border border-white shadow-sm mb-6">
           <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg} ${status.text}`}>
                 <i className="fas fa-shield-heart text-lg"></i>
              </div>
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Lời khuyên hô hấp</h4>
           </div>
           <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 py-2"><div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div><span className="text-[8px] font-bold text-slate-400 uppercase">Đang phân tích...</span></div>
              ) : (
                analysis?.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                     <i className={`fas fa-check-circle ${status.text} mt-0.5 text-xs`}></i>
                     <p className="text-[11px] font-bold text-slate-600 leading-snug">{rec}</p>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
           <PollutantBox label="PM2.5" value={Math.floor(envData.aqi * 0.7)} unit="µg/m³" />
           <PollutantBox label="PM10" value={Math.floor(envData.aqi * 1.1)} unit="µg/m³" />
           <PollutantBox label="NO2" value={envData.no2} unit="ppb" />
        </div>
      </section>

      {/* SOS Quick Access (Next to profiles area logic) */}
      <section className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
               <i className="fas fa-phone-volume text-xl"></i>
            </div>
            <div>
               <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest leading-none mb-1">Cấp cứu 115</h4>
               <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tight">Gọi ngay khi khó thở cấp</p>
            </div>
         </div>
         <button onClick={() => window.location.href="tel:115"} className="bg-rose-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-rose-100 active:scale-95 transition-all">GỌI NGAY</button>
      </section>

      {/* Medication Quick List */}
      <section className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uống thuốc hôm nay</h3>
          <i className="fas fa-clock text-blue-500"></i>
        </div>
        <div className="space-y-3">
          {activeReminders.length > 0 ? (
            activeReminders.slice(0, 2).map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-50 shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-800">{r.time}</div>
                   <p className="text-xs font-bold text-slate-700 truncate w-32">{r.medicationName}</p>
                </div>
                <button onClick={() => onTakeMed(r.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${r.lastTakenDate === today ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-100 text-slate-300'}`}>
                  <i className={`fas ${r.lastTakenDate === today ? 'fa-check-double' : 'fa-check'}`}></i>
                </button>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-slate-300 italic text-center py-4">Chưa có lịch uống thuốc.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const PollutantBox: React.FC<{label: string, value: number, unit: string}> = ({ label, value, unit }) => (
  <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center border border-white">
     <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
     <span className="text-xs font-black text-slate-700 my-0.5">{value}</span>
     <span className="text-[7px] font-bold text-slate-400 uppercase">{unit}</span>
  </div>
);

export default Dashboard;
