import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'rose' | 'slate';
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-50 text-slate-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-start space-x-4">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
  );
};