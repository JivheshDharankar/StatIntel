import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  icon
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-midnight-800/80">
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-midnight-800 border border-blue-200 dark:border-midnight-700 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex items-center space-x-2.5 self-end sm:self-auto flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
