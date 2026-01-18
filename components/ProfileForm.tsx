
import React, { useState } from 'react';
import { UserProfile, AsthmaSeverity, Gender, UserType } from '../types';

interface ProfileFormProps {
  profiles: UserProfile[];
  setProfiles: (p: UserProfile[]) => void;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  onOpenPremium: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profiles, setProfiles, activeProfileId, setActiveProfileId, onOpenPremium }) => {
  const [editing, setEditing] = useState(false);
  const currentProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [formData, setFormData] = useState<UserProfile>(currentProfile);
  const [tempTag, setTempTag] = useState({ allergy: '', avoid: '', trigger: '' });

  const maxProfilesFree = 2;
  const isLimitReached = !currentProfile.isPremium && profiles.length >= maxProfilesFree;

  const handleSave = () => {
    setProfiles(profiles.map(p => p.id === activeProfileId ? formData : p));
    setEditing(false);
  };

  const addTag = (field: 'allergies' | 'thingsToAvoid' | 'triggers', value: string) => {
    if (!value.trim()) return;
    setFormData({
      ...formData,
      [field]: [...formData[field], value.trim()]
    });
    setTempTag({ ...tempTag, [field === 'allergies' ? 'allergy' : field === 'thingsToAvoid' ? 'avoid' : 'trigger']: '' });
  };

  const removeTag = (field: 'allergies' | 'thingsToAvoid' | 'triggers', index: number) => {
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData({ ...formData, [field]: newList });
  };

  const addNewProfile = () => {
    if (isLimitReached) {
      onOpenPremium();
      return;
    }
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name: 'Thành viên mới',
      age: 0,
      gender: 'Khác',
      userType: 'GENERAL',
      severity: AsthmaSeverity.NONE,
      triggers: [],
      allergies: [],
      thingsToAvoid: [],
      lastAttackDate: '',
      medications: [],
      thresholdAQI: 150,
      isPremium: currentProfile.isPremium,
      subscriptionTier: currentProfile.subscriptionTier,
      aiUsageCount: 0
    };
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newProfile.id);
    setFormData(newProfile);
    setEditing(true);
  };

  return (
    <div className="p-4 space-y-6 pb-32">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gia đình</h3>
          <button 
            onClick={addNewProfile} 
            className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${isLimitReached ? 'text-amber-500' : 'text-blue-600'}`}
          >
            {isLimitReached && <i className="fas fa-crown"></i>}
            THÊM NGƯỜI THÂN
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar">
          {profiles.map(p => (
            <button 
              key={p.id}
              onClick={() => { setActiveProfileId(p.id); setFormData(p); setEditing(false); }}
              className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-[2rem] border transition-all ${p.id === activeProfileId ? 'bg-white border-blue-500 shadow-xl scale-105' : 'bg-slate-50 border-transparent opacity-60'}`}
            >
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} className="w-12 h-12 rounded-full bg-slate-100" alt="avatar" />
                {p.isPremium && <i className="fas fa-crown absolute -top-1 -right-1 text-amber-400 text-[10px] drop-shadow-sm"></i>}
              </div>
              <span className="text-[10px] font-black text-slate-800 uppercase truncate w-20 text-center">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8">
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
           <h2 className="text-xl font-black text-slate-800 tracking-tight">Hồ sơ sức khỏe</h2>
           <button 
             onClick={editing ? handleSave : () => setEditing(true)}
             className={`px-6 py-2 rounded-full text-[10px] font-black transition-all ${editing ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-blue-600'}`}
           >
             {editing ? 'LƯU LẠI' : 'CHỈNH SỬA'}
           </button>
        </div>

        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Họ tên</label>
              <input 
                disabled={!editing}
                className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 border border-slate-100 focus:outline-none focus:border-blue-300 disabled:bg-transparent disabled:border-transparent"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Tuổi</label>
              <input 
                type="number"
                disabled={!editing}
                className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 border border-slate-100 disabled:bg-transparent"
                value={formData.age}
                onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Giới tính</label>
              <select 
                disabled={!editing}
                className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 border border-slate-100 disabled:bg-transparent appearance-none"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-6 space-y-6">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-4">Chi tiết bệnh lý & Dị ứng</label>
            
            {/* Tình trạng hô hấp */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Mức độ hô hấp / Hen</label>
              <select 
                disabled={!editing}
                className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 border border-slate-100 disabled:bg-transparent appearance-none"
                value={formData.severity}
                onChange={e => setFormData({...formData, severity: e.target.value as AsthmaSeverity, userType: e.target.value === AsthmaSeverity.NONE ? 'GENERAL' : 'SENSITIVE'})}
              >
                {Object.values(AsthmaSeverity).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Mục DỊ ỨNG */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Dị ứng (Thuốc, thực phẩm...)</label>
              {editing && (
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    placeholder="VD: Paracetamol, Tôm, Đậu phộng..."
                    className="flex-1 bg-slate-50 p-3 rounded-xl text-xs font-bold border border-slate-100"
                    value={tempTag.allergy}
                    onChange={e => setTempTag({...tempTag, allergy: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && addTag('allergies', tempTag.allergy)}
                  />
                  <button onClick={() => addTag('allergies', tempTag.allergy)} className="bg-rose-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((tag, i) => (
                  <span key={i} className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1.5 rounded-lg border border-rose-100 flex items-center gap-2">
                    {tag}
                    {editing && <i onClick={() => removeTag('allergies', i)} className="fas fa-times cursor-pointer"></i>}
                  </span>
                ))}
                {formData.allergies.length === 0 && !editing && <p className="text-[10px] text-slate-300 font-bold italic">Không có dữ liệu dị ứng</p>}
              </div>
            </div>

            {/* Mục CẦN TRÁNH */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Những thứ cần tránh (Lời dặn BS)</label>
              {editing && (
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    placeholder="VD: Nước đá, Máy lạnh dưới 20 độ..."
                    className="flex-1 bg-slate-50 p-3 rounded-xl text-xs font-bold border border-slate-100"
                    value={tempTag.avoid}
                    onChange={e => setTempTag({...tempTag, avoid: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && addTag('thingsToAvoid', tempTag.avoid)}
                  />
                  <button onClick={() => addTag('thingsToAvoid', tempTag.avoid)} className="bg-amber-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.thingsToAvoid.map((tag, i) => (
                  <span key={i} className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-2">
                    {tag}
                    {editing && <i onClick={() => removeTag('thingsToAvoid', i)} className="fas fa-times cursor-pointer"></i>}
                  </span>
                ))}
                {formData.thingsToAvoid.length === 0 && !editing && <p className="text-[10px] text-slate-300 font-bold italic">Không có dữ liệu cần tránh</p>}
              </div>
            </div>

            {/* Mục YẾU TỐ KÍCH PHÁT HÔ HẤP */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Yếu tố gây khó thở (Triggers)</label>
              {editing && (
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    placeholder="VD: Khói thuốc, Bụi nhà, Gắng sức..."
                    className="flex-1 bg-slate-50 p-3 rounded-xl text-xs font-bold border border-slate-100"
                    value={tempTag.trigger}
                    onChange={e => setTempTag({...tempTag, trigger: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && addTag('triggers', tempTag.trigger)}
                  />
                  <button onClick={() => addTag('triggers', tempTag.trigger)} className="bg-blue-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.triggers.map((tag, i) => (
                  <span key={i} className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2">
                    {tag}
                    {editing && <i onClick={() => removeTag('triggers', i)} className="fas fa-times cursor-pointer"></i>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {!currentProfile.isPremium && (
        <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 text-center">
           <h4 className="text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">Bảo vệ gia đình trọn vẹn</h4>
           <p className="text-[10px] text-indigo-600 mb-4 font-medium px-4">Gói Gia Đình 100k vĩnh viễn giúp quản lý tới 6 người thân và mở khóa AI chẩn đoán sâu.</p>
           <button onClick={onOpenPremium} className="bg-indigo-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase shadow-lg shadow-indigo-100 active:scale-95 transition-all">Nâng cấp Premium</button>
        </div>
      )}
    </div>
  );
};
export default ProfileForm;
