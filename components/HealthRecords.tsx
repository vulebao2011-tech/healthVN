
import React, { useState } from 'react';
import { HealthRecord } from '../types';

interface HealthRecordsProps {
  records: HealthRecord[];
  setRecords: (records: HealthRecord[]) => void;
  onSetupReminders: (record: HealthRecord) => void;
  // Added activeProfileId to props to link records to users
  activeProfileId: string;
}

const HealthRecords: React.FC<HealthRecordsProps> = ({ records, setRecords, onSetupReminders, activeProfileId }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    type: 'Prescription',
    title: '',
    notes: ''
  });

  const handleSave = () => {
    // Fixed: Added userId property which was missing and causing a type error
    const record: HealthRecord = {
      id: Date.now().toString(),
      userId: activeProfileId,
      date: new Date().toLocaleDateString('vi-VN'),
      type: newRecord.type as any,
      title: newRecord.title || 'Hồ sơ mới',
      notes: newRecord.notes || '',
    };
    setRecords([record, ...records]);
    setShowAdd(false);
    setNewRecord({ type: 'Prescription', title: '', notes: '' });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'Prescription': return 'fa-file-prescription text-blue-500';
      case 'TestResult': return 'fa-microscope text-purple-500';
      default: return 'fa-user-md text-emerald-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'Prescription': return 'Đơn thuốc';
      case 'TestResult': return 'Xét nghiệm';
      default: return 'Lời dặn BS';
    }
  };

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hồ sơ y tế</h2>
          <p className="text-[10px] text-slate-400 font-medium">Lưu trữ ảnh đơn thuốc & xét nghiệm</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200"
        >
          <i className="fas fa-upload"></i>
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white w-full rounded-[2.5rem] p-6 animate-scaleIn shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Thêm hồ sơ mới</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Prescription', 'TestResult', 'DoctorNote'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setNewRecord({ ...newRecord, type: t as any })}
                    className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-2 transition-all ${newRecord.type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                  >
                    <i className={`fas ${getIcon(t)}`}></i>
                    {getTypeLabel(t)}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Tiêu đề hồ sơ (VD: Đơn thuốc BV Chợ Rẫy)" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 font-medium"
                value={newRecord.title}
                onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
              />
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <i className="fas fa-camera text-2xl text-slate-300"></i>
                <span className="text-xs text-slate-400 font-medium">Chụp ảnh / Tải lên tài liệu</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 text-slate-500 font-bold">Hủy</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Lưu hồ sơ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <i className="fas fa-folder-open text-4xl text-slate-200 mb-4"></i>
             <p className="text-slate-400 text-sm">Chưa có hồ sơ nào được lưu.</p>
          </div>
        ) : (
          records.map(record => (
            <div key={record.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <i className={`fas ${getIcon(record.type)} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.date}</p>
                  <h4 className="text-sm font-bold text-slate-800 truncate">{record.title}</h4>
                </div>
                <div className="bg-slate-50 px-2 py-1 rounded-lg">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">{getTypeLabel(record.type)}</span>
                </div>
              </div>
              
              {record.type === 'Prescription' && (
                <div className="bg-indigo-50/50 p-3 flex justify-between items-center border-t border-indigo-50">
                  <p className="text-[10px] text-indigo-600 font-bold italic">Sử dụng đơn thuốc này để tạo báo thức</p>
                  <button 
                    onClick={() => onSetupReminders(record)}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-md shadow-indigo-100 flex items-center gap-2"
                  >
                    <i className="fas fa-clock"></i>
                    LẬP LỊCH NHẮC
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-8 bg-blue-50 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <i className="fas fa-hospital-user"></i>
        </div>
        <div>
          <p className="text-[10px] font-black text-blue-800 uppercase">Dành cho bác sĩ</p>
          <p className="text-[10px] text-blue-600 leading-tight">Khi đi khám, hãy trình danh sách hồ sơ này để bác sĩ xem lại lịch sử điều trị của bạn.</p>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
