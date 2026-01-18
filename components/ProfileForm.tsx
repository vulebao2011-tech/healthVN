
import React, { useState } from 'react';
import { UserProfile, AsthmaSeverity, UserType } from '../types';

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, setProfile }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [newTrigger, setNewTrigger] = useState('');

  const handleSave = () => {
    setProfile(formData);
    setEditing(false);
  };

  const addTrigger = () => {
    if (newTrigger.trim() && !formData.triggers.includes(newTrigger.trim())) {
      setFormData({
        ...formData,
        triggers: [...formData.triggers, newTrigger.trim()]
      });
      setNewTrigger('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.filter(t => t !== trigger)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrigger();
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Cài đặt cá nhân</h2>
        <button 
          onClick={editing ? handleSave : () => {
            setFormData(profile); // Reset form data to current profile when starting edit
            setEditing(true);
          }}
          className={`px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all ${editing ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-100'}`}
        >
          {editing ? 'Lưu' : 'Chỉnh sửa'}
        </button>
      </div>

      {/* User Mode Selector */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-widest text-center">Chế độ sử dụng</label>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl">
            <button 
              disabled={!editing}
              onClick={() => setFormData({...formData, userType: 'GENERAL', severity: AsthmaSeverity.NONE})}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${formData.userType === 'GENERAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 opacity-50'}`}
            >
              NGƯỜI BÌNH THƯỜNG
            </button>
            <button 
              disabled={!editing}
              onClick={() => setFormData({...formData, userType: 'SENSITIVE'})}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${formData.userType === 'SENSITIVE' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 opacity-50'}`}
            >
              NGƯỜI NHẠY CẢM
            </button>
          </div>
          <p className="text-[9px] text-center text-slate-400 mt-3 font-medium italic">
            Chế độ {formData.userType === 'SENSITIVE' ? '"Nhạy cảm"' : '"Bình thường"'} sẽ thay đổi thuật toán cảnh báo của AI.
          </p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Họ và tên</label>
          {editing ? (
            <input 
              type="text" 
              className="w-full bg-slate-50 p-4 rounded-xl focus:outline-none border border-slate-100 font-bold text-slate-700"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          ) : <p className="text-lg font-bold text-slate-800">{profile.name}</p>}
        </div>

        {formData.userType === 'SENSITIVE' && (
          <div className="grid grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Ngưỡng AQI lo ngại</label>
              {editing ? (
                <input 
                  type="number" 
                  className="w-full bg-slate-50 p-4 rounded-xl focus:outline-none border border-slate-100 font-bold text-slate-700"
                  value={formData.thresholdAQI}
                  onChange={e => setFormData({...formData, thresholdAQI: parseInt(e.target.value) || 0})}
                />
              ) : (
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-rose-500">{profile.thresholdAQI}</p>
                  <span className="text-xs text-slate-400 font-bold">AQI</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Mức độ hen</label>
              {editing ? (
                <select 
                  className="w-full bg-slate-50 p-4 rounded-xl focus:outline-none border border-slate-100 text-[10px] font-black text-slate-700"
                  value={formData.severity}
                  onChange={e => setFormData({...formData, severity: e.target.value as any})}
                >
                  {Object.values(AsthmaSeverity).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : <p className="text-xs font-bold text-slate-700">{profile.severity}</p>}
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Yếu tố gây kích ứng</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {(editing ? formData.triggers : profile.triggers).map(t => (
              <span 
                key={t} 
                className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200 flex items-center gap-2 group"
              >
                {t}
                {editing && (
                  <button 
                    onClick={() => removeTrigger(t)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <i className="fas fa-times-circle"></i>
                  </button>
                )}
              </span>
            ))}
            {!editing && profile.triggers.length === 0 && (
              <p className="text-[11px] text-slate-400 italic">Chưa thiết lập yếu tố kích ứng.</p>
            )}
          </div>

          {editing && (
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Thêm yếu tố mới..."
                className="flex-1 bg-slate-50 px-4 py-2.5 rounded-xl focus:outline-none border border-slate-100 text-[11px] font-bold"
                value={newTrigger}
                onChange={e => setNewTrigger(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button 
                onClick={addTrigger}
                className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs shadow-sm hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-[2rem] border transition-colors ${formData.userType === 'SENSITIVE' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
        <h3 className={`font-black text-[10px] uppercase mb-2 flex items-center gap-2 ${formData.userType === 'SENSITIVE' ? 'text-rose-800' : 'text-emerald-800'}`}>
          <i className={`fas ${formData.userType === 'SENSITIVE' ? 'fa-user-shield' : 'fa-heart-pulse'}`}></i>
          {formData.userType === 'SENSITIVE' ? 'Chế độ Bảo vệ tối đa' : 'Chế độ Sống khỏe chủ động'}
        </h3>
        <p className={`text-[11px] leading-relaxed font-medium ${formData.userType === 'SENSITIVE' ? 'text-rose-700' : 'text-emerald-700'}`}>
          {formData.userType === 'SENSITIVE' 
            ? 'Cảnh báo sẽ tập trung vào việc ngăn chặn cơn hen kịch phát dựa trên tiền sử cá nhân và các yếu tố kích ứng bạn đã nhập.' 
            : 'AI sẽ phân tích các yếu tố gây hại lâu dài cho phổi như Ozone, bụi mịn PM2.5 và thời tiết nồm ẩm để khuyên bạn cách phòng bệnh hô hấp cộng đồng.'}
        </p>
      </div>
    </div>
  );
};

export default ProfileForm;
