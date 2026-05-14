import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionEvents } from '../api/sessions';
import { Loader2, AlertCircle, ArrowLeft, Flame } from 'lucide-react';

export default function SessionDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: events, isLoading, isError } = useSessionEvents(sessionId ?? '');

  // Unique page URLs visited in this session (insertion-order preserved)
  const visitedUrls = useMemo(() => {
    if (!events) return [];
    const seen = new Set<string>();
    return events.map(e => e.url).filter(url => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [events]);

  const getPath = (url: string) => {
    try { return new URL(url).pathname || '/'; } catch { return url; }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <header className="mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/sessions')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors mt-1 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Session Timeline</h2>
            <p className="text-sm font-mono text-indigo-600 mt-1 truncate">{sessionId}</p>

            {/* Visited pages + heatmap shortcuts */}
            {visitedUrls.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider self-center mr-1">
                  Pages visited:
                </span>
                {visitedUrls.map(url => (
                  <button
                    key={url}
                    onClick={() => navigate(`/heatmap?url=${encodeURIComponent(url)}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 transition-colors"
                    title={url}
                  >
                    <Flame className="w-3 h-3" />
                    {getPath(url)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <p>Loading session timeline...</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load session events.</p>
        </div>
      )}

      {!isLoading && !isError && events && (
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-8">
          {events.map(e => (
            <div key={e._id} className="relative pl-8">
              <div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 uppercase tracking-wide">
                    {e.event_type}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm text-gray-600 mt-3 space-y-1">
                  <p><span className="font-medium text-gray-900">URL:</span> {e.url}</p>
                  {e.event_type === 'click' && e.x !== undefined && e.y !== undefined && (
                    <p><span className="font-medium text-gray-900">Coordinates:</span> ({e.x}, {e.y})</p>
                  )}
                  {e.event_type === 'click' && e.viewportWidth !== undefined && (
                    <p><span className="font-medium text-gray-900">Viewport:</span> {e.viewportWidth}×{e.viewportHeight}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="pl-8 text-gray-500 italic">No events found for this session.</div>
          )}
        </div>
      )}
    </div>
  );
}
