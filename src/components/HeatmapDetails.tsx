import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer2,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { HeatmapCanvas } from './HeatmapCanvas';
import { useHeatmapData } from '../api/heatmap';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className='flex flex-col bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm min-w-[110px]'>
      <span className='text-[10px] font-semibold uppercase tracking-widest text-slate-400'>
        {label}
      </span>
      <span className='text-xl font-bold text-slate-900 mt-0.5 leading-tight'>{value}</span>
      {sub && <span className='text-[11px] text-slate-400 mt-0.5'>{sub}</span>}
    </div>
  );
}

export default function HeatmapDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url') ?? '';
  const { data = [], isLoading, isError } = useHeatmapData(url);
  const [zoom, setZoom] = useState(1.04);

  const stats = useMemo(() => {
    const widths = data
      .map((d) => d.viewportWidth)
      .filter((w): w is number => typeof w === 'number');
    const avg = widths.length ? Math.round(widths.reduce((a, b) => a + b, 0) / widths.length) : 0;
    const mobile = widths.filter((w) => w < 768).length;
    const desktop = widths.filter((w) => w >= 768).length;
    return {
      totalClicks: data.length,
      avgViewport: avg,
      mobileCount: mobile,
      desktopCount: desktop,
    };
  }, [data]);

  let displayPath = url;
  try {
    displayPath = new URL(url).pathname || url;
  } catch {
    /* invalid url */
  }

  const bump = (delta: number) =>
    setZoom((z) => Math.max(0.2, Math.min(1.5, +(z + delta).toFixed(2))));

  return (
    <div className='flex flex-col h-full bg-slate-50'>
      {/* Header */}
      <header className='bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm'>
        <div className='flex items-start gap-3 mb-4'>
          <button
            onClick={() => navigate('/heatmap')}
            className='p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors mt-0.5 shrink-0'
            aria-label='Back'>
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <MousePointer2 className='w-4 h-4 text-indigo-500 shrink-0' />
              <h1 className='text-lg font-bold text-slate-900'>Heatmap</h1>
              <span className='text-lg font-bold text-indigo-600 truncate max-w-xs'>
                {displayPath}
              </span>
            </div>
            <p className='text-xs font-mono text-slate-400 truncate mt-0.5 ml-6'>{url}</p>
          </div>
        </div>

        {/* Stats + Controls row */}
        <div className='flex items-center gap-3 ml-6 flex-wrap'>
          <StatCard
            label='Total Clicks'
            value={isLoading ? '—' : stats.totalClicks.toLocaleString()}
          />

          {stats.avgViewport > 0 && (
            <StatCard label='Avg Viewport' value={`${stats.avgViewport}px`} sub='recorded width' />
          )}

          {(stats.mobileCount > 0 || stats.desktopCount > 0) && (
            <div className='flex flex-col bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm min-w-[130px]'>
              <span className='text-[10px] font-semibold uppercase tracking-widest text-slate-400'>
                Devices
              </span>
              <div className='flex items-center gap-3 mt-1.5'>
                <span className='flex items-center gap-1.5 text-sm font-semibold text-slate-700'>
                  <Monitor className='w-3.5 h-3.5 text-slate-400' />
                  {stats.desktopCount}
                </span>
                <span className='flex items-center gap-1.5 text-sm font-semibold text-slate-700'>
                  <Smartphone className='w-3.5 h-3.5 text-slate-400' />
                  {stats.mobileCount}
                </span>
              </div>
            </div>
          )}

          <div className='flex-1' />

          {/* Zoom controls */}
          <div className='flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1'>
            <button
              onClick={() => bump(-0.1)}
              className='p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-600 hover:text-slate-900 transition-all'
              title='Zoom out'>
              <ZoomOut className='w-4 h-4' />
            </button>
            <span className='text-xs font-mono text-slate-600 w-10 text-center select-none'>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => bump(0.1)}
              className='p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-600 hover:text-slate-900 transition-all'
              title='Zoom in'>
              <ZoomIn className='w-4 h-4' />
            </button>
            <div className='w-px h-4 bg-slate-300 mx-0.5' />
            <button
              onClick={() => setZoom(0.65)}
              className='p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-900 transition-all'
              title='Reset zoom'>
              <RotateCcw className='w-4 h-4' />
            </button>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className='flex-1 overflow-hidden p-4'>
        <HeatmapCanvas
          data={data}
          isLoading={isLoading}
          isError={isError}
          targetUrl={url}
          zoom={zoom}
        />
      </div>
    </div>
  );
}
