import { useQuery } from '@tanstack/react-query';

export interface ClickData {
  x: number;
  y: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

export interface HeatmapUrl {
  _id: string;
  clickCount: number;
  lastActive: string;
}

export interface HeatmapSummary {
  url: string;
  totalClicks: number;
  lastActive: string;
}

export const fetchUrls = async (): Promise<HeatmapSummary[]> => {
  const res = await fetch('/api/urls');
  if (!res.ok) throw new Error('Failed to fetch URLs');
  const data = await res.json();
  return data.map((d: HeatmapUrl) => ({
    url: d._id,
    totalClicks: d.clickCount,
    lastActive: d.lastActive,
  }));
};

export function useUrls() {
  return useQuery({
    queryKey: ['heatmap-urls'],
    queryFn: fetchUrls,
  });
}

export const fetchHeatmapData = async (url: string): Promise<ClickData[]> => {
  if (!url) return [];
  const res = await fetch(`/api/heatmap?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch heatmap data');
  return await res.json();
};

export function useHeatmapUrls() {
  return useQuery({
    queryKey: ['heatmap-urls'],
    queryFn: fetchUrls,
  });
}

export function useHeatmapData(url: string) {
  return useQuery({
    queryKey: ['heatmap-data', url],
    queryFn: () => fetchHeatmapData(url),
    enabled: !!url,
  });
}
