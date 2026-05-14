import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface HeatPointProps {
  x: number;
  y: number;
  origX: number;
  origY: number;
  density?: number;
}

export function HeatPoint({ x, y, origX, origY, density = 1 }: HeatPointProps) {
  const getDensityStyles = (d: number) => {
    switch (Math.min(Math.max(d, 1), 5)) {
      case 5:
        return 'bg-red-500 shadow-[0_0_30px_15px_rgba(239,68,68,0.8)] blur-[2px] w-8 h-8';
      case 4:
        return 'bg-orange-500 shadow-[0_0_24px_12px_rgba(249,115,22,0.7)] blur-[2px] w-7 h-7';
      case 3:
        return 'bg-yellow-400 shadow-[0_0_18px_9px_rgba(250,204,21,0.6)] blur-[1.5px] w-6 h-6';
      case 2:
        return 'bg-emerald-400 shadow-[0_0_14px_7px_rgba(52,211,153,0.5)] blur-[1px] w-5 h-5';
      default:
        return 'bg-blue-400 shadow-[0_0_10px_5px_rgba(96,165,250,0.4)] blur-[1px] w-4 h-4';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.7, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={twMerge(
        clsx(
          'absolute rounded-full mix-blend-screen pointer-events-auto cursor-crosshair group z-10 hover:z-50',
          getDensityStyles(density),
        ),
      )}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <div className='absolute hidden group-hover:flex flex-col -top-14 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] px-3 py-1.5 rounded-lg shadow-2xl z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none'>
        <span className='text-slate-400 mb-0.5 uppercase tracking-wider text-[8px]'>
          Coordinates
        </span>
        <span>X: {Math.round(origX)}px</span>
        <span>Y: {Math.round(origY)}px</span>
      </div>
    </motion.div>
  );
}
