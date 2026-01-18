
import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  AsthmaSeverity, 
  EnvironmentalData, 
  SymptomLog, 
  HealthRecord,
  MedicationReminder
} from './types';
import Dashboard from './components/Dashboard';
import ProfileForm from './components/ProfileForm';
import SymptomDiary from './components/SymptomDiary';
import HealthRecords from './components/HealthRecords';
import Reminders from './components/Reminders';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Trần Minh Tâm',
  age: 25,
  userType: 'GENERAL',
  severity: AsthmaSeverity.NONE,
  triggers: [],
  lastAttackDate: '',
  medications: [],
  thresholdAQI: 150 
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diary' | 'records' | 'profile' | 'reminders'>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('health_vn_profile_v1');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });
  
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [manualLocation, setManualLocation] = useState<string>(() => {
    return localStorage.getItem('health_vn_manual_loc') || 'Hà Nội';
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const saved = localStorage.getItem('health_vn_logs_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [records, setRecords] = useState<HealthRecord[]>(() => {
    const saved = localStorage.getItem('health_vn_records_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [reminders, setReminders] = useState<MedicationReminder[]>(() => {
    const saved = localStorage.getItem('health_vn_reminders_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [prefilledReminderName, setPrefilledReminderName] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('health_vn_profile_v1', JSON.stringify(profile));
    localStorage.setItem('health_vn_logs_v1', JSON.stringify(symptomLogs));
    localStorage.setItem('health_vn_records_v1', JSON.stringify(records));
    localStorage.setItem('health_vn_reminders_v1', JSON.stringify(reminders));
    localStorage.setItem('health_vn_manual_loc', manualLocation);
  }, [profile, symptomLogs, records, reminders, manualLocation]);

  const fetchEnvironment = useCallback(async (locationStr?: string, lat?: number, lng?: number) => {
    // Giả lập gọi API thời tiết/AQI dựa trên tọa độ hoặc tên địa điểm
    setTimeout(() => {
      setEnvData({
        aqi: Math.floor(Math.random() * 100) + 50,
        temp: 28 + Math.floor(Math.random() * 5),
        humidity: 60 + Math.floor(Math.random() * 20),
        mainPollutant: 'PM2.5',
        location: locationStr || (lat ? `Tọa độ: ${lat.toFixed(2)}, ${lng?.toFixed(2)}` : 'Đang xác định...'),
        pollenLevel: 'Low',
        windSpeed: 10,
        uvIndex: 8,
        so2: 5,
        no2: 25,
        coordinates: lat ? { lat, lng: lng! } : undefined
      });
    }, 800);
  }, []);

  const handleToggleGps = () => {
    if (!isGpsActive) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setIsGpsActive(true);
            fetchEnvironment(undefined, pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            alert("Không thể truy cập GPS. Vui lòng kiểm tra quyền ứng dụng.");
          }
        );
      }
    } else {
      setIsGpsActive(false);
      fetchEnvironment(manualLocation);
    }
  };

  const handleChangeManualLocation = (newLoc: string) => {
    setManualLocation(newLoc);
    setIsGpsActive(false);
    fetchEnvironment(newLoc);
  };

  useEffect(() => {
    if (!isGpsActive) {
      fetchEnvironment(manualLocation);
    }
  }, [fetchEnvironment, isGpsActive, manualLocation]);

  const handleTakeMedication = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, lastTakenDate: today } : r
    ));
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance("Xác nhận đã uống thuốc thành công.");
    utterance.lang = 'vi-VN';
    synth.speak(utterance);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            profile={profile} 
            envData={envData} 
            logs={symptomLogs} 
            reminders={reminders} 
            onTakeMed={handleTakeMedication} 
            onRefresh={() => isGpsActive ? handleToggleGps() : fetchEnvironment(manualLocation)} 
            onEmergency={() => window.location.href = 'tel:112'}
            isGpsActive={isGpsActive}
            onToggleGps={handleToggleGps}
            onLocationChange={handleChangeManualLocation}
          />
        );
      case 'diary':
        return <SymptomDiary logs={symptomLogs} setLogs={setSymptomLogs} />;
      case 'records':
        return <HealthRecords records={records} setRecords={setRecords} onSetupReminders={(r) => { setPrefilledReminderName(r.title); setActiveTab('reminders'); }} />;
      case 'profile':
        return <ProfileForm profile={profile} setProfile={setProfile} />;
      case 'reminders':
        return <Reminders reminders={reminders} setReminders={setReminders} medications={profile.medications} prefillName={prefilledReminderName} onClearPrefill={() => setPrefilledReminderName(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 border-x border-slate-200 shadow-2xl">
      <header className="bg-white/90 backdrop-blur-lg p-4 sticky top-0 z-50 flex items-center justify-between border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-user-doctor text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-blue-900 tracking-tight text-xl">Health VN</h1>
            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Vì sức khỏe Việt
            </p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden"
        >
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
            className="w-8 h-8 rounded-full" 
            alt="avatar" 
          />
        </button>
      </header>

      <main className="flex-1 pb-28 overflow-y-auto">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-4 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 rounded-t-[2.5rem]">
        <NavItem active={activeTab === 'dashboard'} icon="fas fa-shield-heart" label="Sức khỏe" onClick={() => setActiveTab('dashboard')} />
        <NavItem active={activeTab === 'diary'} icon="fas fa-notes-medical" label="Ghi chép" onClick={() => setActiveTab('diary')} />
        <NavItem active={activeTab === 'records'} icon="fas fa-file-medical" label="Hồ sơ" onClick={() => setActiveTab('records')} />
        <NavItem active={activeTab === 'reminders'} icon="fas fa-clock" label="Nhắc lịch" onClick={() => setActiveTab('reminders')} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{active: boolean, icon: string, label: string, onClick: () => void}> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 flex-1 transition-all duration-300 ${active ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
    <i className={`${icon} text-lg`}></i>
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
