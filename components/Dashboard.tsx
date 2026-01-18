
import React, { useState, useEffect } from 'react';
import { UserProfile, EnvironmentalData, RiskAnalysis, SymptomLog, MedicationReminder } from '../types';
import { getPersonalizedRisk } from '../services/geminiService';

interface DashboardProps {
  profile: UserProfile;
  envData: EnvironmentalData | null;
  logs: SymptomLog[];
  reminders: MedicationReminder[];
  onTakeMed: (id: string) => void;
  onRefresh: () => void;
  onEmergency: () => void;
  isGpsActive: boolean;
  onToggleGps: () => void;
  onLocationChange: (loc: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, envData, logs, reminders, onTakeMed, onRefresh, onEmergency, 
  isGpsActive, onToggleGps, onLocationChange 
}) => {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLocInput, setShowLocInput] = useState(false);
  const [tempLoc, setTempLoc] = useState('');

  useEffect(() => {
    if (profile && envData) {
      const runAnalysis = async () => {
        setLoading(true);
        const res = await getPersonalizedRisk(profile, envData, logs);
        setAnalysis(res);
        setLoading(false);
      };
      runAnalysis();
    }
  }, [profile, envData, logs]);

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'LOW': return 'bg-gradient-to-br from-emerald-400 to-teal-600';
      case 'MEDIUM': return 'bg-gradient-to-br from-blue-400 to-indigo-600';
      case 'HIGH': return 'bg-gradient-to-br from-orange-400 to-amber-600';
      case 'EXTREME': return 'bg-gradient-to-br from-rose-500 to-red-700';
      default: return 'bg-slate-400';
    }
  };

  const handleLocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempLoc.trim()) {
      onLocationChange(tempLoc.trim());
      setShowLocInput(false);
      setTempLoc('');
    }
  };

  if (!envData) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Đang tải dữ liệu vị trí...</p>
    </div>
  );

  const isSensitive = profile.userType === 'SENSITIVE';
  const displayRisk = isSensitive ? (envData.aqi > profile.thresholdAQI ? 'HIGH' : analysis?.riskLevel) : analysis?.riskLevel;

  // URL cho bản đồ: Ưu tiên tọa độ, sau đó là tên địa điểm
  const mapUrl = envData.coordinates 
    ? `https://maps.google.com/maps?q=${envData.coordinates.lat},${envData.coordinates.lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(envData.location)}&z=14&output=embed`;

  return (
    <div className="p-4 space-y-5 animate-fadeIn pb-10">
      {/* Location Control Card with Map */}
      <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isGpsActive ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                <i className={`fas ${isGpsActive ? 'fa-crosshairs' : 'fa-location-dot'}`}></i>
              </div>
              <div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Dõi theo tại</h3>
                <p className="text-sm font-black text-slate-800 leading-tight">
                  {isGpsActive ? 'Vị trí hiện tại (GPS)' : envData.location}
                </p>
                {envData.coordinates && (
                  <p className="text-[9px] font-bold text-blue-500 mt-1">
                    {envData.coordinates.lat.toFixed(4)}, {envData.coordinates.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowLocInput(!showLocInput)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showLocInput ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}
              >
                <i className="fas fa-search-location"></i>
              </button>
              <button 
                onClick={onToggleGps}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isGpsActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}
                title="Sử dụng GPS"
              >
                <i className="fas fa-satellite"></i>
              </button>
            </div>
          </div>

          {showLocInput && (
            <form onSubmit={handleLocSubmit} className="mb-4 animate-slideDown">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nhập phường, quận, thành phố..." 
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-400"
                  value={tempLoc}
                  onChange={e => setTempLoc(e.target.value)}
                  autoFocus
                />
                <button className="bg-blue-600 text-white px-4 rounded-xl text-[10px] font-black uppercase">ĐỔI</button>
              </div>
            </form>
          )}

          {/* Map Preview */}
          <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group mb-3">
            <iframe
              title="Vị trí hiện tại"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
              className="grayscale-[0.2] contrast-[1.1]"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border-2 border-white/50 rounded-2xl"></div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${envData.coordinates ? `${envData.coordinates.lat},${envData.coordinates.lng}` : encodeURIComponent(envData.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-600 shadow-sm border border-slate-200 pointer-events-auto flex items-center gap-1.5"
            >
              <i className="fas fa-external-link-alt"></i>
              MỞ BẢN ĐỒ
            </a>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <span className={`flex h-2 w-2 rounded-full ${isGpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            {isGpsActive ? 'Dữ liệu thời gian thực theo hướng đi' : 'Khóa vị trí theo dõi thủ công'}
          </div>
        </div>
      </section>

      {/* SOS/Emergency Card - Only for Sensitive */}
      {isSensitive && (
        <section 
          onClick={onEmergency}
          className="bg-rose-600 rounded-3xl p-4 flex items-center justify-between shadow-xl shadow-rose-100 cursor-pointer active:scale-95 transition-all border-2 border-rose-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <i className="fas fa-phone-alt text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-black text-sm">CẤP CỨU HÔ HẤP</h3>
              <p className="text-white/80 text-[10px] font-bold uppercase">Nhấn nếu thấy khó thở cấp</p>
            </div>
          </div>
          <i className="fas fa-chevron-right text-white/50"></i>
        </section>
      )}

      {/* Main Analysis Banner */}
      <section className={`rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden transition-all duration-700 ${getRiskColor(displayRisk)}`}>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-black/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              {isSensitive ? 'Cảnh báo bệnh nền' : 'Tư vấn sống khỏe'}
            </span>
            <button onClick={onRefresh} className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:rotate-180 transition-transform">
              <i className={`fas fa-sync-alt text-xs ${loading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
          
          <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
            {loading ? '...' : (displayRisk === 'LOW' || displayRisk === 'MEDIUM' ? 'An toàn' : 'Lưu ý')}
            <i className={`fas ${displayRisk === 'LOW' || displayRisk === 'MEDIUM' ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-2xl`}></i>
          </h2>
          <p className="text-sm font-medium opacity-95 leading-snug mb-6">
            {loading ? 'AI đang cập nhật tại địa điểm mới...' : analysis?.message}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {(isSensitive ? analysis?.recommendations : analysis?.preventionTips)?.slice(0, 2).map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                <i className="fas fa-lightbulb text-[10px] mt-1 text-yellow-300"></i>
                <span className="text-xs font-bold leading-tight">{tip}</span>
              </div>
            ))}
          </div>
        </div>
        <i className="fas fa-cloud-sun absolute -right-6 -top-6 text-[10rem] opacity-10 -rotate-12"></i>
      </section>

      {/* Weather Matrix */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-smog"></i>
            </div>
            <div>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">AQI Tại chỗ</h3>
              <p className={`text-3xl font-black leading-none ${envData.aqi > 100 ? 'text-orange-500' : 'text-emerald-500'}`}>{envData.aqi}</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-slate-300 uppercase">Chất lượng</span>
             <p className="text-xs font-bold text-slate-700">{envData.aqi < 50 ? 'Rất tốt' : envData.aqi < 100 ? 'Vừa phải' : 'Có hại'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <EnvMetric icon="fa-temperature-high" color="text-orange-500" label="Nhiệt độ" value={`${envData.temp}°C`} />
          <EnvMetric icon="fa-tint" color="text-blue-500" label="Độ ẩm" value={`${envData.humidity}%`} />
          <EnvMetric icon="fa-wind" color="text-slate-400" label="Gió" value={`${envData.windSpeed} km/h`} />
          <EnvMetric icon="fa-sun" color="text-rose-500" label="UV Index" value={envData.uvIndex.toString()} />
          <EnvMetric icon="fa-seedling" color="text-emerald-500" label="Phấn hoa" value={envData.pollenLevel} />
          <EnvMetric icon="fa-cloud" color="text-purple-500" label="Khí chính" value={envData.mainPollutant} />
        </div>
      </section>
    </div>
  );
};

const EnvMetric: React.FC<{icon: string, color: string, label: string, value: string}> = ({ icon, color, label, value }) => (
  <div className="flex flex-col items-center text-center p-3 bg-slate-50/50 rounded-2xl border border-white hover:bg-white hover:shadow-sm transition-all">
    <i className={`fas ${icon} ${color} mb-2 text-sm`}></i>
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</span>
    <span className="text-[11px] font-black text-slate-800">{value}</span>
  </div>
);

export default Dashboard;
