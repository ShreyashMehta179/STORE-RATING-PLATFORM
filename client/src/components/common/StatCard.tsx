import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  color?: 'brand' | 'emerald' | 'amber' | 'indigo' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'positive',
  description,
  color = 'brand',
}) => {
  const colorStyles = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border-brand-200 dark:border-brand-900',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    amber: 'bg-accent-softGold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="premium-card p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-surface-muted">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${colorStyles[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight">
          {value}
        </h3>
        {change && (
          <span
            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
              changeType === 'positive'
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300'
                : changeType === 'negative'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-surface-muted mt-2 font-medium">
          {description}
        </p>
      )}
    </motion.div>
  );
};
