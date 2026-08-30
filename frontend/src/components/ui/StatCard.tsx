import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'critical';
  icon?: React.ReactNode;
  variant?: 'default' | 'cyan' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  trendType = 'neutral',
  icon,
  variant = 'default',
  onClick
}: StatCardProps) {
  const getGlow = () => {
    switch (variant) {
      case 'cyan':
        return 'hover:border-cyan-500/50 hover:shadow-glow-cyan';
      case 'blue':
        return 'hover:border-blue-500/50 hover:shadow-glow-blue';
      case 'indigo':
        return 'hover:border-indigo-500/50 hover:shadow-glow-indigo';
      case 'emerald':
        return 'hover:border-emerald-500/50 hover:shadow-glow-emerald';
      case 'amber':
        return 'hover:border-amber-500/50 hover:shadow-glow-amber';
      case 'rose':
        return 'hover:border-rose-500/50 hover:shadow-glow-rose';
      default:
        return 'hover:border-slate-400 dark:hover:border-midnight-600';
    }
  };

  const getIconBackground = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-midnight-700';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 ${getGlow()} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${getIconBackground()}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {subValue}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-midnight-800/80 flex items-center justify-between text-[11px]">
          <span className={`font-semibold ${
            trendType === 'positive' 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : trendType === 'critical'
              ? 'text-rose-600 dark:text-rose-400'
              : trendType === 'negative'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
