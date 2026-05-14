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
}

const RENDER_WIDTH = 1440;
const MIN_HEIGHT = 900;
const CLUSTER_RADIUS = 25;

export function HeatmapCanvas({ data, isLoading, isError, targetUrl }: HeatmapCanvasProps) {
  const heatPoints = useMemo(() => {
    if (!data?.length) return [];

    // Scale X proportionally to RENDER_WIDTH so clicks from different viewport widths
    // all land at the correct relative position. Y stays as raw pageY (absolute page coords).
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

    return Object.values(clusters).map((c) => ({
      x: c.x,
      y: c.y,
      origX: c.origX,
      origY: c.origY,
      density: Math.max(1, Math.min(5, Math.ceil((c.count / maxCount) * 5))),
    }));
  }, [data]);

  // Make the canvas tall enough to show all recorded clicks
  const canvasHeight = useMemo(() => {
    if (!heatPoints.length) return MIN_HEIGHT;
    return Math.max(MIN_HEIGHT, ...heatPoints.map((p) => p.y + 120));
  }, [heatPoints]);

  return (
    <div className="flex-1 w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-14 bg-slate-800/50 border-b border-slate-700/50 flex items-center px-6 gap-4 shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <MousePointer2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-slate-200 font-semibold text-sm">Interaction Surface</h3>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-400 font-mono shadow-inner">
          Tracked Page: <span className="text-indigo-400 font-bold">{targetUrl || 'N/A'}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 w-full overflow-auto bg-slate-900 custom-scrollbar">
        <div className="relative mx-auto" style={{ width: RENDER_WIDTH, minHeight: canvasHeight }}>

          {/* Actual page as faded backdrop */}
          <iframe
            src={targetUrl}
            name="causalfunnel-heatmap"
            title="Page Preview"
            className="absolute inset-0 border-0 pointer-events-none"
            style={{ width: RENDER_WIDTH, height: canvasHeight, opacity: 0.45, filter: 'grayscale(0.6)' }}
          />

          {/* Subtle dark tint so dots pop */}
          <div className="absolute inset-0 bg-slate-900/15 pointer-events-none" />

          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-30">
              <div className="flex flex-col items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-2xl">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-slate-300 font-medium text-sm animate-pulse">Loading click data...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-slate-800/90 px-8 py-6 rounded-2xl shadow-2xl border border-rose-500/20 flex flex-col items-center max-w-sm text-center">
                <AlertCircle className="w-8 h-8 text-rose-400 mb-4" />
                <h3 className="text-slate-200 font-bold mb-2">Failed to load click data</h3>
                <p className="text-slate-400 text-sm">Unable to retrieve data from the tracking server.</p>
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && heatPoints.length === 0 && targetUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <div className="bg-slate-800/80 backdrop-blur px-8 py-6 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center text-center max-w-sm">
                <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 border border-slate-600">
                  <MousePointer2 className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-slate-200 font-bold mb-2">No clicks recorded</h3>
                <p className="text-slate-400 text-sm">No click interactions have been recorded for this page yet.</p>
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
                  density={point.density}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="h-14 bg-slate-800/90 border-t border-slate-700/50 flex items-center justify-between px-6 shrink-0 text-sm text-slate-400 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-medium">Interaction Density:</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Sparse</span>
            <div className="w-32 h-1.5 rounded-full bg-linear-to-r from-blue-500 via-yellow-500 to-red-500 shadow-inner" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Dense</span>
          </div>
        </div>
        <div className="flex gap-4 font-mono text-xs">
          <span>Clusters: <strong className="text-slate-200">{heatPoints.length}</strong></span>
          <span>Raw Events: <strong className="text-slate-200">{data?.length ?? 0}</strong></span>
        </div>
      </div>
    </div>
  );
}
