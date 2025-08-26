// REST API interaction for /api/status
// Uses react-query for query

const baseUrl = import.meta.env.VITE_API_BASE_URL;
import { useQuery } from '@tanstack/react-query';

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
  const res = await fetch(`${baseUrl}/api/status`);
      if (!res.ok) throw new Error('Failed to fetch system status');
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
