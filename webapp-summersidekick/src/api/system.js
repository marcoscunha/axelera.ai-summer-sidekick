// REST API interaction for /api/system/start and /api/system/stop
// Uses react-query for mutation

const baseUrl = import.meta.env.VITE_API_BASE_URL;
import { useMutation } from '@tanstack/react-query';

export function useStartSystem() {
  return useMutation({
    mutationFn: async () => {
  const res = await fetch(`${baseUrl}/api/system/start`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start system');
      return res.json();
    },
  });
}

export function useStopSystem() {
  return useMutation({
    mutationFn: async () => {
  const res = await fetch(`${baseUrl}/api/system/stop`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to stop system');
      return res.json();
    },
  });
}
