import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface HeatPointProps {
  x: number;
  y: number;
  origX: number;
  origY: number;
  count: number;
  total: number;
  density?: number;
}

const DENSITY_CONFIGS = [
  { label: 'Low',       color: 'bg-blue-400',   glow: 'shadow-[0_0_10px_5px_rgba(96,165,250,0.4)]',   dot: 'bg-blue-400',   size: 'w-4 h-4' },
  { label: 'Moderate',  color: 'bg-emerald-400', glow: 'shadow-[0_0_14px_7px_rgba(52,211,153,0.5)]',   dot: 'bg-emerald-400',size: 'w-5 h-5' },
  { label: 'Active',    color: 'bg-yellow-400',  glow: 'shadow-[0_0_18px_9px_rgba(250,204,21,0.6)]',   dot: 'bg-yellow-400', size: 'w-6 h-6' },
  { label: 'High',      color: 'bg-orange-500',  glow: 'shadow-[0_0_24px_12px_rgba(249,115,22,0.7)]',  dot: 'bg-orange-500', size: 'w-7 h-7' },
  { label: 'Hot Spot',  color: 'bg-red-500',     glow: 'shadow-[0_0_30px_15px_rgba(239,68,68,0.8)]',   dot: 'bg-red-500',    size: 'w-8 h-8' },
];

export function HeatPoint({ x, y, origX, origY, count, total, density = 1 }: HeatPointProps) {
  const cfg = DENSITY_CONFIGS[Math.min(Math.max(density, 1), 5) - 1];
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.75, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={twMerge(
        clsx(
          'absolute rounded-full mix-blend-screen pointer-events-auto cursor-crosshair group z-10 hover:z-50 blur-[1.5px] hover:blur-none transition-[filter] duration-150',
          cfg.color,
          cfg.glow,
          cfg.size,
        ),
      )}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {/* Tooltip */}
      <div className="absolute hidden group-hover:flex flex-col top-[-72px] left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-3 py-2 gap-1">
        {/* Header row */}
        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-700/60">
          <div className={clsx('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
          <span className="text-[11px] font-semibold text-slate-200">{cfg.label}</span>
        </div>
        {/* Stats */}
        <span className="text-[10px] font-mono text-slate-400">
          Clicks: <span className="text-white font-bold">{count}</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Share: <span className="text-indigo-300 font-bold">{pct}%</span>
        </span>
        <span className="text-[9px] font-mono text-slate-500">
          ({Math.round(origX)}, {Math.round(origY)})
        </span>
        {/* Arrow */}
        <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
      </div>
    </motion.div>
  );
}
