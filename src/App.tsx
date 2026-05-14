import { Routes, Route, Navigate, NavLink, useSearchParams } from 'react-router-dom';
import SessionsList from './components/SessionsList';
import SessionDetails from './components/SessionDetails';
import HeatmapsOverview from './components/HeatmapsOverview';
import HeatmapDetails from './components/HeatmapDetails';

function HeatmapSection() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  return url ? (
    <HeatmapDetails />
  ) : (
    <div className='max-w-6xl mx-auto w-full p-10'>
      <HeatmapsOverview />
    </div>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`;

function App() {
  return (
    <div className='flex h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900'>
      {/* Sidebar */}
      <aside className='w-64 bg-slate-900 text-white flex flex-col shrink-0'>
        <div className='p-6 border-b border-slate-800'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <h1 className='text-xl font-bold tracking-tight'>CausalFunnel</h1>
          </div>
        </div>

        <nav className='flex-1 p-4 space-y-1'>
          <NavLink to='/sessions' className={navLinkClass}>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            User Sessions
          </NavLink>
          <NavLink to='/heatmap' className={navLinkClass}>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
            Click Heatmap
          </NavLink>
        </nav>

        <div className='p-4 border-t border-slate-800'>
          <a
            href='/demo.html'
            target='_blank'
            className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 shadow-sm'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
              />
            </svg>
            Open Demo Page
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 flex flex-col overflow-hidden'>
        <Routes>
          <Route path='/' element={<Navigate to='/sessions' replace />} />
          <Route
            path='/sessions'
            element={
              <div className='flex-1 p-10 overflow-y-auto max-w-6xl mx-auto w-full'>
                <SessionsList />
              </div>
            }
          />
          <Route
            path='/sessions/:sessionId'
            element={
              <div className='flex-1 p-10 overflow-y-auto max-w-6xl mx-auto w-full'>
                <SessionDetails />
              </div>
            }
          />
          <Route path='/heatmap' element={<HeatmapSection />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
