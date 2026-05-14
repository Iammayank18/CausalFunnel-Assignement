import { useState, useEffect, useMemo } from 'react';

export default function Heatmap() {
  const [urlInput, setUrlInput] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [clicks, setClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [availableUrls, setAvailableUrls] = useState<any[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/urls')
      .then(r => r.json())
      .then(data => setAvailableUrls(data || []))
      .catch(console.error);
  }, [hasSearched]);

  const domains = useMemo(() => {
    const acc: Record<string, any> = {};
    availableUrls.forEach(curr => {
      let origin = curr._id;
      try { origin = new URL(curr._id).origin; } catch(e) {}
      if (!acc[origin]) {
        acc[origin] = { origin, totalClicks: 0, lastActive: curr.lastActive, paths: [] };
      }
      acc[origin].totalClicks += curr.clickCount;
      if (new Date(curr.lastActive) > new Date(acc[origin].lastActive)) {
        acc[origin].lastActive = curr.lastActive;
      }
      acc[origin].paths.push(curr);
    });
    return Object.values(acc).sort((a: any, b: any) => b.totalClicks - a.totalClicks);
  }, [availableUrls]);

  const loadHeatmap = async (targetUrl: string) => {
    if (!targetUrl) return;
    setUrlInput(targetUrl);
    setActiveUrl(targetUrl);
    
    try {
      const origin = new URL(targetUrl).origin;
      setActiveDomain(origin);
    } catch(e) {}

    setLoading(true);
    try {
      const res = await fetch(`/api/heatmap?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      setClicks(data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasSearched) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Click Heatmaps</h2>
          <p className="text-gray-500 mt-2 text-lg">Select a unique page below to visualize where users are interacting the most.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tracked Pages</h3>
          
          {availableUrls.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              <p className="text-lg font-medium text-gray-900">No data recorded yet</p>
              <p className="mt-1">Navigate to your tracked pages to generate heatmaps.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {domains.map((domainObj: any, idx: number) => {
                const maxClicks = domains[0]?.totalClicks || 1;
                const heatPercentage = Math.max(5, Math.round((domainObj.totalClicks / maxClicks) * 100));
                
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActiveDomain(domainObj.origin);
                      loadHeatmap(domainObj.paths[0]._id);
                    }}
                    className="group relative flex flex-col p-5 rounded-2xl border border-gray-200 hover:border-indigo-400 hover:shadow-lg cursor-pointer transition-all duration-300 bg-white overflow-hidden transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4 z-10">
                      <div className="flex items-center gap-4 overflow-hidden pr-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 font-bold text-lg border border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0 shadow-sm">
                          #{idx + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                            {domainObj.origin.replace(/^https?:\/\//, '')}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{domainObj.paths.length} unique page{domainObj.paths.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {domainObj.totalClicks}
                        </span>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-2 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-sm"></span>
                          {new Date(domainObj.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Heat indicator bar */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-auto z-10 shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ 
                          width: `${heatPercentage}%`,
                          background: `linear-gradient(90deg, #818cf8 0%, ${heatPercentage > 70 ? '#ef4444' : '#6366f1'} 100%)`
                        }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white opacity-30"></div>
                      </div>
                    </div>
                    
                    {/* Subtle background glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:to-indigo-50/50 transition-colors duration-500"></div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Or manually enter a URL:</p>
            <div className="flex gap-3">
              <input 
                type="url" 
                placeholder="https://example.com/page" 
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadHeatmap(urlInput)}
              />
              <button 
                onClick={() => loadHeatmap(urlInput)}
                disabled={loading || !urlInput}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 w-full max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setHasSearched(false)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all"
              title="Back to pages"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Heatmap Analysis</h2>
          </div>
          <div className="mt-3 ml-12 flex items-center gap-3">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg font-mono text-sm shadow-sm hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                value={activeUrl}
                onChange={(e) => loadHeatmap(e.target.value)}
              >
                {domains.find((d: any) => d.origin === activeDomain)?.paths.map((u: any) => {
                  let path = u._id;
                  try { path = new URL(u._id).pathname; } catch(e) {}
                  return <option key={u._id} value={u._id}>{path} ({u.clickCount} clicks)</option>
                })}
                {!domains.find((d: any) => d.origin === activeDomain)?.paths.find((u: any) => u._id === activeUrl) && (
                  <option value={activeUrl}>{activeUrl}</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {(() => {
              try {
                const u = new URL(activeUrl);
                return (
                  <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    <span className="opacity-60 mr-1">Domain:</span> {u.hostname}
                  </span>
                );
              } catch(e) { return null; }
            })()}
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center px-4 border-r border-gray-100">
            <span className="block text-3xl font-extrabold text-indigo-600 leading-none">{clicks.length}</span>
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-1 block">Total Clicks</span>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <div className="w-4 h-4 rounded-full bg-red-500 opacity-70 blur-[1px]"></div>
            <span className="text-sm font-semibold text-gray-700">Interaction</span>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col min-h-[700px]">
        <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-500/20"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500/20"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-green-400 border border-green-500/20"></div>
          </div>
          <div className="mx-auto bg-white border border-gray-200 shadow-sm rounded-md px-4 py-1.5 text-sm text-gray-600 font-mono w-1/2 text-center truncate flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            {(() => {
              try {
                const u = new URL(activeUrl);
                return <><span className="text-gray-400">{u.origin}</span><span className="font-semibold text-gray-800">{u.pathname}</span></>;
              } catch(e) { return activeUrl; }
            })()}
          </div>
        </div>
        
        <div className="relative flex-1 w-full overflow-hidden bg-gray-50" style={{ minHeight: '800px' }}>
          <iframe 
            src={activeUrl} 
            name="causalfunnel-heatmap"
            className="absolute inset-0 w-full h-full border-0 opacity-40 grayscale pointer-events-none"
            title="Page Background"
          />
          
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {clicks.map((click, i) => (
              <div 
                key={i} 
                className="absolute w-10 h-10 bg-red-500 rounded-full mix-blend-multiply blur-[2px]" 
                style={{ 
                  left: click.x, 
                  top: click.y, 
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.5,
                  boxShadow: '0 0 30px 12px rgba(239, 68, 68, 0.6)'
                }}
              ></div>
            ))}
          </div>
          
          {clicks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-white/95 px-8 py-5 rounded-2xl shadow-xl text-gray-700 font-medium border border-gray-200 flex flex-col items-center">
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <p className="text-lg">No clicks recorded for this exact page yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

