import { useQuery } from '@tanstack/react-query';
import type { Session, Event } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const fetchSessions = async (page = 1, limit = 20): Promise<Session[]> => {
  const res = await fetch(`${API_BASE}/api/sessions?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return await res.json();
};

export const fetchSessionEvents = async (sessionId: string): Promise<Event[]> => {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/events`);
  if (!res.ok) throw new Error('Failed to fetch session events');
  return await res.json();
};

export function useSessions(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['sessions', page, limit],
    queryFn: () => fetchSessions(page, limit),
  });
}

export function useSessionEvents(sessionId: string) {
  return useQuery({
    queryKey: ['session-events', sessionId],
    queryFn: () => fetchSessionEvents(sessionId),
    enabled: !!sessionId,
  });
}
