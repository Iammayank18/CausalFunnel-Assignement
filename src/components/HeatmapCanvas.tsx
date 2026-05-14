import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HeatPoint } from './HeatPoint';
import { AlertCircle, Loader2, MousePointer2 } from 'lucide-react';
import type { ClickData } from '../api/heatmap';

export type { ClickData };

interface HeatmapCanvasProps {
  data: ClickData[];
  isLoading: boolean;
  isError: boolean;
  targetUrl: string;
  zoom?: number;
}

const RENDER_WIDTH = 1440;
const MIN_HEIGHT = 900;
const CLUSTER_RADIUS = 25;

export function HeatmapCanvas({ data, isLoading, isError, targetUrl, zoom = 0.65 }: HeatmapCanvasProps) {
  const { heatPoints, total } = useMemo(() => {
    if (!data?.length) return { heatPoints: [], total: 0 };

    const clusters: Record<string, { x: number; y: number; origX: number; origY: number; count: number }> = {};

    data.forEach((click) => {
      const vw = click.viewportWidth || RENDER_WIDTH;
      const scaledX = Math.round((click.x / vw) * RENDER_WIDTH);
      const scaledY = Math.round(click.y);
      const gridX = Math.round(scaledX / CLUSTER_RADIUS) * CLUSTER_RADIUS;
      const gridY = Math.round(scaledY / CLUSTER_RADIUS) * CLUSTER_RADIUS;
      const key = `${gridX},${gridY}`;

      if (clusters[key]) {
        clusters[key].count += 1;
      } else {
        clusters[key] = { x: scaledX, y: scaledY, origX: click.x, origY: click.y, count: 1 };
      }
    });

    const maxCount = Math.max(...Object.values(clusters).map((c) => c.count), 1);
    const points = Object.values(clusters).map((c) => ({
      x: c.x,
      y: c.y,
      origX: c.origX,
      origY: c.origY,
      count: c.count,
      density: Math.max(1, Math.min(5, Math.ceil((c.count / maxCount) * 5))),
    }));

    return { heatPoints: points, total: data.length };
  }, [data]);

  const canvasHeight = useMemo(() => {
    if (!heatPoints.length) return MIN_HEIGHT;
    return Math.max(MIN_HEIGHT, ...heatPoints.map((p) => p.y + 120));
  }, [heatPoints]);

  const scaledWidth = Math.round(RENDER_WIDTH * zoom);
  const scaledHeight = Math.round(canvasHeight * zoom);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">

      {/* Browser chrome */}
      <div className="bg-[#2d2d2f] border-b border-slate-700/80 px-4 py-2.5 flex items-center gap-3 shrink-0">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-slate-800/70 border border-slate-600/50 rounded-md px-3 py-1 flex items-center gap-2 min-w-0">
          <svg className="w-3 h-3 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
          </svg>
          <span className="text-xs text-slate-400 truncate font-mono">{targetUrl || 'about:blank'}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-10 bg-slate-800/50 border-b border-slate-700/40 flex items-center px-4 gap-4 shrink-0 justify-between">
        <div className="flex items-center gap-2.5">
          <MousePointer2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-300 text-xs font-semibold">Click Heatmap</span>
          <div className="w-px h-3 bg-slate-600" />
          <span className="text-slate-500 text-xs">
            {heatPoints.length} clusters · {total.toLocaleString()} events
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Sparse</span>
          <div className="w-28 h-1.5 rounded-full bg-linear-to-r from-blue-500 via-yellow-400 to-red-500 shadow-inner" />
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Dense</span>
        </div>
      </div>

      {/* Scrollable canvas */}
      <div className="flex-1 overflow-auto bg-slate-950">
        {/* Outer div sets scroll extent based on zoom */}
        <div style={{ width: scaledWidth, minHeight: scaledHeight }} className="relative">
          {/* Inner div is full-size canvas, scaled via CSS transform */}
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{ width: RENDER_WIDTH, height: canvasHeight, transform: `scale(${zoom})` }}
          >
            {/* Actual page as faded backdrop */}
            <iframe
              src={targetUrl}
              title="Page Preview"
              className="absolute inset-0 border-0 pointer-events-none"
              style={{ width: RENDER_WIDTH, height: canvasHeight, opacity: 0.45, filter: 'grayscale(0.6)' }}
            />

            {/* Dark overlay so dots pop */}
            <div className="absolute inset-0 bg-slate-900/15 pointer-events-none" />

            {/* Loading */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-30">
                <div className="flex flex-col items-center gap-3 bg-slate-800/90 px-8 py-6 rounded-2xl border border-slate-700 shadow-2xl">
                  <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                  <p className="text-slate-300 text-sm font-medium">Loading click data…</p>
                </div>
              </div>
            )}

            {/* Error */}
            {isError && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-slate-800/90 px-8 py-6 rounded-2xl border border-rose-500/20 shadow-2xl flex flex-col items-center text-center max-w-sm">
                  <AlertCircle className="w-8 h-8 text-rose-400 mb-3" />
                  <h3 className="text-slate-200 font-bold mb-1">Failed to load</h3>
                  <p className="text-slate-400 text-sm">Unable to retrieve click data.</p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && heatPoints.length === 0 && targetUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <div className="bg-slate-800/80 backdrop-blur px-8 py-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center text-center max-w-sm">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 border border-slate-600">
                    <MousePointer2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-slate-200 font-bold mb-2">No clicks recorded</h3>
                  <p className="text-slate-400 text-sm">No click events have been captured for this page yet.</p>
                </div>
              </motion.div>
            )}

            {/* Heat dots */}
            {!isLoading && !isError && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {heatPoints.map((point, i) => (
                  <HeatPoint
                    key={i}
                    x={point.x}
                    y={point.y}
                    origX={point.origX}
                    origY={point.origY}
                    count={point.count}
                    total={total}
                    density={point.density}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
