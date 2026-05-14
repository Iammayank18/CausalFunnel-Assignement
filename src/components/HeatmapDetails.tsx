import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HeatmapCanvas } from './HeatmapCanvas';
import { useHeatmapData } from '../api/heatmap';

export default function HeatmapDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url') ?? '';
  const { data = [], isLoading, isError } = useHeatmapData(url);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm z-10">
        <button
          onClick={() => navigate('/heatmap')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Back to Overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Heatmap Analytics</h1>
          <p className="text-sm font-mono text-indigo-600 mt-0.5">{url}</p>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <HeatmapCanvas data={data} isLoading={isLoading} isError={isError} targetUrl={url} />
      </div>
    </div>
  );
}
