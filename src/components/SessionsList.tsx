import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../api/sessions';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SessionsList() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data: sessions, isLoading, isError } = useSessions(page, 20);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">User Sessions</h2>
          <p className="text-gray-500 mt-2">Overview of tracked user journeys</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!sessions || sessions.length < 20}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Session ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Events</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading sessions...</p>
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 font-medium">Failed to load sessions.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && sessions && sessions.map(s => (
              <tr
                key={s._id}
                onClick={() => navigate(`/sessions/${s._id}`)}
                className="hover:bg-indigo-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-indigo-600 font-medium group-hover:text-indigo-700">{s._id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{s.totalEvents}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.firstEvent).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.lastEvent).toLocaleString()}</td>
              </tr>
            ))}

            {!isLoading && !isError && sessions?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                  No sessions found. Try interacting with the demo page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
