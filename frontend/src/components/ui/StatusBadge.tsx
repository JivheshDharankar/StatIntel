import React from 'react';

export type StatusBadgeVariant = 
  | 'critical' 
  | 'moderate' 
  | 'proficient' 
  | 'mastery'
  | 'statistical'
  | 'technical'
  | 'digital'
  | 'behavioural'
  | 'igot'
  | 'nssta'
  | 'tpac'
  | 'mospi'
  | 'neutral'
  | 'gold';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ 
  variant, 
  children, 
  size = 'md', 
  pulse = false,
  className = '' 
}: StatusBadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case 'critical':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80';
      case 'moderate':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80';
      case 'proficient':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80';
      case 'mastery':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80';
      case 'statistical':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80';
      case 'technical':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80';
      case 'digital':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/80';
      case 'behavioural':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80';
      case 'nssta':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'igot':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'tpac':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'mospi':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'gold':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-midnight-700';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[10px]';
      case 'lg':
        return 'px-3 py-1 text-xs';
      default:
        return 'px-2.5 py-0.5 text-[11px]';
    }
  };

  return (
    <span className={`inline-flex items-center space-x-1.5 font-bold rounded-full border shadow-sm ${getStyles()} ${getSize()} ${className}`}>
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping opacity-75 mr-0.5" />
      )}
      <span>{children}</span>
    </span>
  );
}

export function getProviderBadgeVariant(source: string): StatusBadgeVariant {
  const s = source.toLowerCase();
  if (s.includes('nssta')) return 'nssta';
  if (s.includes('igot')) return 'igot';
  if (s.includes('tpac')) return 'tpac';
  if (s.includes('mospi')) return 'mospi';
  return 'neutral';
}

export function getCategoryBadgeVariant(category: string): StatusBadgeVariant {
  const c = category.toLowerCase();
  if (c.includes('stat')) return 'statistical';
  if (c.includes('tech')) return 'technical';
  if (c.includes('digital') || c.includes('govern')) return 'digital';
  if (c.includes('behav') || c.includes('manag')) return 'behavioural';
  return 'neutral';
}
