
import React, { useState, useEffect } from 'react';
import { MedicationReminder, AlarmSoundType } from '../types';

interface RemindersProps {
  reminders: MedicationReminder[];
  setReminders: (reminders: MedicationReminder[]) => void;
  medications: string[];
  prefillName: string | null;
  onClearPrefill: () => void;
}

const Reminders: React.FC<RemindersProps> = ({ reminders, setReminders, medications, prefillName, onClearPrefill }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<MedicationReminder>>({
    medicationName: medications[0] || '',
    time: '08:00',
    enabled: true,
    alarmSound: 'default'
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (prefillName) {
      setNewReminder(prev => ({ ...prev, medicationName: prefillName }));
      setShowAdd(true);
      onClearPrefill();
    }
  }, [prefillName, onClearPrefill]);

  const handleAdd = () => {
    const reminder: MedicationReminder = {
      id: Date.now().toString(),
      medicationName: newReminder.medicationName || medications[0] || 'Thuốc mới',
      time: newReminder.time || '08:00',
      enabled: true,
      alarmSound: newReminder.alarmSound || 'default'
    };
    setReminders([...reminders, reminder]);
    setShowAdd(false);
  };

  const addQuickSlot = (time: string) => {
    const reminder: MedicationReminder = {
      id: Date.now().toString() + Math.random(),
      medicationName: newReminder.medicationName || medications[0] || 'Thuốc mới',
      time,
      enabled: true,
      alarmSound: newReminder.alarmSound || 'default'
    };
    setReminders([...reminders, reminder]);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const toggleTaken = (id: string) => {
    setReminders(reminders.map(r => {
      if (r.id === id) {
        const isTaken = r.lastTakenDate === today;
        return { ...r, lastTakenDate: isTaken ? undefined : today };
      }
      return r;
    }));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 11) return 'fa-sun text-amber-500';
    if (hour >= 11 && hour < 17) return 'fa-cloud-sun text-orange-500';
    if (hour >= 17 && hour < 21) return 'fa-moon text-indigo-500';
    return 'fa-star text-blue-900';
  };

  const getSoundIcon = (sound: AlarmSoundType) => {
    switch (sound) {
      case 'voice': return 'fa-comment-dots';
      case 'gentle': return 'fa-leaf';
      case 'energetic': return 'fa-bolt';
      default: return 'fa-bell';
    }
  };

  const quickSlots = [
    { label: 'Sáng', time: '08:00' },
    { label: 'Trưa', time: '12:00' },
    { label: 'Chiều', time: '17:00' },
    { label: 'Tối', time: '21:00' }
  ];

  const soundOptions: { label: string, value: AlarmSoundType }[] = [
    { label: 'Mặc định', value: 'default' },
    { label: 'Nhẹ nhàng', value: 'gentle' },
    { label: 'Sôi nổi', value: 'energetic' },
    { label: 'Giọng nói', value: 'voice' }
  ];

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lịch nhắc thuốc</h2>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Kiểm soát cơn hen chủ động</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-blue-200"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end animate-fadeIn">
          <div className="bg-white w-full rounded-t-[3rem] p-8 animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-black text-slate-800 mb-6 text-center">Tùy chỉnh báo thức</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Tên thuốc</label>
                <input 
                  type="text"
                  placeholder="Nhập tên thuốc..."
                  className="w-full bg-slate-50 p-4 rounded-2xl focus:outline-none border border-slate-100 text-sm font-bold text-slate-700"
                  value={newReminder.medicationName}
                  onChange={e => setNewReminder({ ...newReminder, medicationName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Âm báo thức</label>
                <div className="grid grid-cols-2 gap-2">
                  {soundOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setNewReminder({...newReminder, alarmSound: opt.value})}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${newReminder.alarmSound === opt.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                    >
                      <i className={`fas ${getSoundIcon(opt.value)} text-sm`}></i>
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block tracking-widest text-center">Chọn nhanh buổi uống</label>
                <div className="grid grid-cols-4 gap-3">
                  {quickSlots.map(slot => (
                    <button 
                      key={slot.label}
                      onClick={() => addQuickSlot(slot.time)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95"
                    >
                      <i className={`fas ${getTimeIcon(slot.time)} text-lg`}></i>
                      <span className="text-[9px] font-black uppercase text-slate-500">{slot.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{slot.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-50 pt-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest text-center">Hoặc chọn giờ tùy chỉnh</label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <input 
                    type="time" 
                    className="bg-transparent flex-1 text-2xl font-black text-center focus:outline-none text-slate-700"
                    value={newReminder.time}
                    onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                  />
                  <button 
                    onClick={handleAdd}
                    className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 active:scale-95 transition-all"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowAdd(false)}
                className="w-full py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <i className="fas fa-bell-slash text-4xl text-slate-200 mb-4"></i>
             <p className="text-sm text-slate-400 px-10 leading-relaxed">Bạn chưa có báo thức nào.</p>
          </div>
        ) : (
          reminders.sort((a,b) => a.time.localeCompare(b.time)).map(r => {
            const isTaken = r.lastTakenDate === today;
            return (
              <div key={r.id} className={`p-4 rounded-[2rem] border transition-all flex flex-col gap-3 ${!r.enabled ? 'bg-slate-50 border-transparent opacity-60' : isTaken ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isTaken ? 'bg-white text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                      <i className={`fas ${getTimeIcon(r.time)} text-lg`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black text-slate-800 tracking-tighter">{r.time}</h4>
                        <i className={`fas ${getSoundIcon(r.alarmSound || 'default')} text-[10px] text-slate-300`}></i>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{r.medicationName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleReminder(r.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${r.enabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${r.enabled ? 'left-5.5' : 'left-0.5'}`}></div>
                    </button>
                    <button 
                      onClick={() => deleteReminder(r.id)}
                      className="text-slate-300 hover:text-rose-500 p-2"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    disabled={!r.enabled}
                    onClick={() => toggleTaken(r.id)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!r.enabled ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : isTaken ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    {isTaken ? (
                      <><i className="fas fa-check-double"></i> ĐÃ UỐNG</>
                    ) : (
                      <><i className="fas fa-hand-holding-medical"></i> ĐÁNH DẤU ĐÃ UỐNG</>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-3xl p-5 border border-indigo-100">
        <h4 className="text-[10px] font-black text-indigo-900 uppercase mb-2">Thông tin âm báo</h4>
        <p className="text-[10px] text-indigo-700 leading-tight">
          Hệ thống sẽ tự động sử dụng <strong>Giọng nói AI</strong> để đọc tên thuốc khi đến giờ báo thức nếu bạn chọn kiểu chuông "Giọng nói".
        </p>
      </div>
    </div>
  );
};

export default Reminders;
