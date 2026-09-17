import React from 'react';

export interface FeatureHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const FeatureHeader: React.FC<FeatureHeaderProps> = ({
  title,
  subtitle,
  description,
  icon,
  badge,
  action,
  children,
  className = '',
}) => {
  const displaySub = subtitle || description;

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              {badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  {badge}
                </span>
              )}
              {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
            </div>
            {displaySub && <p className="text-xs text-slate-500 mt-0.5">{displaySub}</p>}
          </div>
        </div>
        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>
      {children && <div className="mt-4 pt-4 border-t border-slate-100">{children}</div>}
    </div>
  );
};

export default FeatureHeader;
