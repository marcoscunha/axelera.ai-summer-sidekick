// REST API interaction for /api/stream
// Uses react-query for query

const baseUrl = import.meta.env.VITE_API_BASE_URL;
import { useQuery } from '@tanstack/react-query';

export function useCameraStream() {
  return useQuery({
    queryKey: ['camera-stream'],
    queryFn: async () => {
  const res = await fetch(`${baseUrl}/api/stream`);
      if (!res.ok) throw new Error('Failed to fetch camera stream');
      return res.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
