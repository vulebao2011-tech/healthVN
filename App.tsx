
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
import HealthConsultant from './components/HealthConsultant';
import PremiumPaywall from './components/PremiumPaywall';

const DEFAULT_PROFILES: UserProfile[] = [{
  id: '1',
  name: 'Trần Minh Tâm',
  age: 25,
  gender: 'Nam',
  userType: 'GENERAL',
  severity: AsthmaSeverity.NONE,
  triggers: [],
  allergies: [],
  thingsToAvoid: [],
  lastAttackDate: '',
  medications: [],
  thresholdAQI: 120,
  isPremium: false,
  subscriptionTier: 'FREE',
  aiUsageCount: 0
}];

const INITIAL_ENV: EnvironmentalData = {
  aqi: 42,
  temp: 29,
  humidity: 72,
  mainPollutant: 'PM2.5',
  location: 'Thanh Xuân, Hà Nội',
  pollenLevel: 'Low',
  windSpeed: 8,
  uvIndex: 4,
  so2: 5,
  no2: 18,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diary' | 'records' | 'profile' | 'reminders' | 'ai' | 'premium'>('dashboard');
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('health_vn_profiles_v4');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
  });
  const [activeProfileId, setActiveProfileId] = useState(() => localStorage.getItem('health_vn_active_id') || '1');

  const profile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  
  const [envData, setEnvData] = useState<EnvironmentalData>(INITIAL_ENV);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [manualLocation, setManualLocation] = useState<string>(() => localStorage.getItem('health_vn_manual_loc') || 'Thanh Xuân, Hà Nội');

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
    localStorage.setItem('health_vn_profiles_v4', JSON.stringify(profiles));
    localStorage.setItem('health_vn_active_id', activeProfileId);
    localStorage.setItem('health_vn_logs_v1', JSON.stringify(symptomLogs));
    localStorage.setItem('health_vn_records_v1', JSON.stringify(records));
    localStorage.setItem('health_vn_reminders_v1', JSON.stringify(reminders));
    localStorage.setItem('health_vn_manual_loc', manualLocation);
  }, [profiles, activeProfileId, symptomLogs, records, reminders, manualLocation]);

  const fetchEnvironment = useCallback(async (locationStr: string) => {
    // Giả lập dữ liệu môi trường thay đổi theo vị trí
    setEnvData(prev => ({
      ...prev,
      aqi: Math.floor(Math.random() * 220), 
      temp: 22 + Math.floor(Math.random() * 10),
      location: locationStr,
    }));
  }, []);

  useEffect(() => {
    let watchId: number;
    if (isGpsActive) {
      watchId = navigator.geolocation.watchPosition((pos) => {
        const loc = `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)} (GPS)`;
        setEnvData(prev => ({ ...prev, location: loc, coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
        fetchEnvironment(loc);
      }, (err) => {
        setIsGpsActive(false);
        console.error("GPS Error:", err);
      }, { enableHighAccuracy: true });
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [isGpsActive, fetchEnvironment]);

  const handleTakeMed = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setReminders(prev => prev.map(r => r.id === id ? { ...r, lastTakenDate: r.lastTakenDate === today ? undefined : today } : r));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          profile={profile} envData={envData} logs={symptomLogs.filter(l => l.userId === activeProfileId)} reminders={reminders} 
          onTakeMed={handleTakeMed} onRefresh={() => fetchEnvironment(envData.location)} 
          onEmergency={() => {}} isGpsActive={isGpsActive}
          onToggleGps={() => setIsGpsActive(!isGpsActive)} 
          onLocationChange={(loc) => { setIsGpsActive(false); setManualLocation(loc); fetchEnvironment(loc); }}
          onOpenPremium={() => setActiveTab('premium')}
        />;
      case 'reminders':
        return <Reminders reminders={reminders} setReminders={setReminders} medications={profile.medications} prefillName={prefilledReminderName} onClearPrefill={() => setPrefilledReminderName(null)} />;
      case 'diary':
        return <SymptomDiary logs={symptomLogs} setLogs={setSymptomLogs} activeProfileId={activeProfileId} isPremium={profile.isPremium} onOpenPremium={() => setActiveTab('premium')} />;
      case 'ai':
        return <HealthConsultant profile={profile} logs={symptomLogs.filter(l => l.userId === activeProfileId)} onUseAI={() => setProfiles(profiles.map(p => p.id === activeProfileId ? {...p, aiUsageCount: (p.aiUsageCount || 0) + 1} : p))} onOpenPremium={() => setActiveTab('premium')} />;
      case 'profile':
        return <ProfileForm profiles={profiles} setProfiles={setProfiles} activeProfileId={activeProfileId} setActiveProfileId={setActiveProfileId} onOpenPremium={() => setActiveTab('premium')} />;
      case 'premium':
        return <PremiumPaywall onUpgrade={(tier) => { setProfiles(profiles.map(p => ({...p, isPremium: true, subscriptionTier: tier}))); setActiveTab('dashboard'); }} onBack={() => setActiveTab('dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white border-x border-slate-100 shadow-2xl relative overflow-hidden text-slate-900">
      <header className="bg-white p-4 sticky top-0 z-[60] flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <i className="fas fa-lungs"></i>
          </div>
          <h1 className="font-black text-blue-900 text-sm tracking-tight uppercase">BreatheSafe VN</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href="tel:115"} className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center animate-pulse">
            <i className="fas fa-phone-alt text-xs"></i>
          </button>
          <button onClick={() => setActiveTab('profile')} className="relative">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} className="w-8 h-8 rounded-full bg-slate-50 border border-white shadow-sm" alt="avatar" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-32 overflow-y-auto no-scrollbar">{renderContent()}</main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 px-2 py-3 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-50 rounded-t-[2.5rem]">
        <NavItem active={activeTab === 'dashboard'} icon="fa-house" label="Trang chủ" onClick={() => setActiveTab('dashboard')} />
        <NavItem active={activeTab === 'ai'} icon="fa-robot" label="Dr. AI" onClick={() => setActiveTab('ai')} />
        <NavItem active={activeTab === 'reminders'} icon="fa-clock" label="Nhắc thuốc" onClick={() => setActiveTab('reminders')} />
        <NavItem active={activeTab === 'diary'} icon="fa-book-medical" label="Nhật ký" onClick={() => setActiveTab('diary')} />
        <NavItem active={activeTab === 'profile'} icon="fa-user-gear" label="Hồ sơ" onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{active: boolean, icon: string, label: string, onClick: () => void}> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-300'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[7px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
