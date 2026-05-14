import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUrls } from '../api/heatmap';
import type { HeatmapSummary } from '../api/heatmap';
import { Loader2, AlertCircle, LayoutDashboard, Clock, MousePointer2, Globe, ArrowRight } from 'lucide-react';

interface DomainGroup {
  origin: string;
  totalClicks: number;
  lastActive: string;
  pages: HeatmapSummary[];
}

export default function HeatmapsOverview() {
  const navigate = useNavigate();
  const { data: urls, isLoading, isError } = useUrls();

  const domains = useMemo<DomainGroup[]>(() => {
    if (!urls) return [];
    const acc: Record<string, DomainGroup> = {};
    urls.forEach((u) => {
      let origin = u.url;
      try { origin = new URL(u.url).origin; } catch { /* non-standard URL, use as-is */ }
      if (!acc[origin]) {
        acc[origin] = { origin, totalClicks: 0, lastActive: u.lastActive, pages: [] };
      }
      acc[origin].totalClicks += u.totalClicks;
      if (new Date(u.lastActive) > new Date(acc[origin].lastActive)) {
        acc[origin].lastActive = u.lastActive;
      }
      acc[origin].pages.push(u);
    });
    return Object.values(acc).sort((a, b) => b.totalClicks - a.totalClicks);
  }, [urls]);

  const goToHeatmap = (url: string) => navigate(`/heatmap?url=${encodeURIComponent(url)}`);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-indigo-500" />
          Heatmap Analytics
        </h2>
        <p className="text-gray-500 mt-2">Analyze user interactions across your tracked domains and pages.</p>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p>Loading heatmaps overview...</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-white border border-gray-200 rounded-xl shadow-sm">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <p className="font-medium">Failed to load heatmaps.</p>
        </div>
      )}

      {!isLoading && !isError && domains.length === 0 && (
        <div className="py-20 text-center text-gray-500 italic bg-white border border-gray-200 rounded-xl shadow-sm">
          No tracked pages found. Try interacting with the demo page.
        </div>
      )}

      {!isLoading && !isError && domains.length > 0 && (
        <div className="space-y-5">
          {domains.map((domain) => (
            <div key={domain.origin} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Domain header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{domain.origin}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {domain.pages.length} page{domain.pages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 ml-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MousePointer2 className="w-4 h-4" />
                    <span className="font-semibold text-gray-900">{domain.totalClicks.toLocaleString()}</span>
                    <span>total clicks</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(domain.lastActive).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pages */}
              <div className="divide-y divide-gray-100">
                {domain.pages
                  .slice()
                  .sort((a, b) => b.totalClicks - a.totalClicks)
                  .map((page) => {
                    let path = page.url;
                    try { path = new URL(page.url).pathname || '/'; } catch { /* use full URL */ }
                    return (
                      <div
                        key={page.url}
                        className="px-6 py-4 flex items-center justify-between hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="font-mono text-sm text-gray-800 truncate">{path}</span>
                          <span className="hidden md:inline text-xs text-gray-400">
                            {new Date(page.lastActive).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-4">
                          <span className="text-sm font-medium text-gray-600">
                            {page.totalClicks.toLocaleString()} clicks
                          </span>
                          <button
                            onClick={() => goToHeatmap(page.url)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg font-medium text-sm transition-colors"
                          >
                            View Heatmap
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
