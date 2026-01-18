
import React from 'react';
import { SubscriptionTier } from '../types';

interface PremiumPaywallProps {
  onUpgrade: (tier: SubscriptionTier) => void;
  onBack: () => void;
}

const PremiumPaywall: React.FC<PremiumPaywallProps> = ({ onUpgrade, onBack }) => {
  const plans = [
    { id: 'PREMIUM_MONTH', name: 'Gói Cá Nhân', price: '30.000đ', period: '/tháng', desc: 'Dành cho người mới bắt đầu', icon: 'fa-user-check', color: 'bg-blue-600' },
    { id: 'FAMILY', name: 'Gói Gia Đình', price: '100.000đ', period: '/vĩnh viễn', desc: 'Tối đa 6 người, không giới hạn thời gian', icon: 'fa-users', color: 'bg-amber-500', popular: true },
    { id: 'PREMIUM_YEAR', name: 'Gói Tiết Kiệm', price: '299.000đ', period: '/năm', desc: 'Dành cho người dùng dài hạn', icon: 'fa-gem', color: 'bg-indigo-600' }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-fadeIn">
      <div className="p-6 pb-20">
        <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-8">
           <i className="fas fa-arrow-left text-slate-500"></i>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Nâng cấp Premium</h2>
          <p className="text-xs font-medium text-slate-400 px-10">Mở khóa toàn bộ tính năng bảo vệ sức khỏe AI thông minh nhất</p>
        </div>

        <div className="space-y-4 mb-10">
          {plans.map((plan: any) => (
            <div 
              key={plan.id}
              onClick={() => onUpgrade(plan.id)}
              className={`relative p-6 rounded-[2.5rem] border-2 transition-all active:scale-95 ${plan.popular ? 'border-amber-500 bg-amber-50 shadow-xl shadow-amber-100' : 'border-slate-100 bg-white'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase">Gói hời nhất</div>
              )}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ${plan.color}`}>
                  <i className={`fas ${plan.icon}`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase">{plan.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{plan.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-800 leading-none">{plan.price}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{plan.period}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 border border-slate-100">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest text-center mb-4">Lợi ích đặc quyền</h3>
           <Benefit icon="fa-robot" text="Dr. AI Tư vấn không giới hạn" />
           <Benefit icon="fa-map-location-dot" text="Theo dõi lộ trình di chuyển thời gian thực" />
           <Benefit icon="fa-users" text="Quản lý tới 6 hồ sơ người thân" />
           <Benefit icon="fa-file-pdf" text="Xuất báo cáo PDF chuyên nghiệp" />
           <Benefit icon="fa-shield-halved" text="Cảnh báo môi trường đa điểm" />
        </div>

        <div className="mt-10 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-4">Thanh toán một lần, bảo vệ cả đời cho gia đình</p>
          <button className="text-[10px] font-black text-indigo-500 uppercase">Xem điều khoản bảo mật</button>
        </div>
      </div>
    </div>
  );
};

const Benefit: React.FC<{icon: string, text: string}> = ({ icon, text }) => (
  <div className="flex items-center gap-4">
    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
      <i className={`fas ${icon} text-sm`}></i>
    </div>
    <span className="text-xs font-bold text-slate-600">{text}</span>
  </div>
);

export default PremiumPaywall;
