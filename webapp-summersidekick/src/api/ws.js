// WebSocket interaction for /ws endpoint
// Provides a hook for real-time system status

import React, { useRef, useState } from 'react';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function useSystemStatusWS() {
  const [status, setStatus] = useState(null);
  const [frame, setFrame] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  const connectWebSocket = React.useCallback(() => {
    let wsUrl;
    try {
      const urlObj = new URL(baseUrl);
      wsUrl = `${urlObj.protocol === 'https:' ? 'wss' : 'ws'}://${urlObj.host}/ws/status`;
    } catch {
      wsUrl = `ws://${window.location.host}/ws/status`;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = new window.WebSocket(wsUrl);
    wsRef.current.onopen = () => {
      setWsConnected(true);
    };
    wsRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'status_update' && msg.data) {
          setStatus(msg.data);
        } else if (msg.type === 'frame_update' && msg.data) {
          setFrame(msg.data.image);
        }
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };
    wsRef.current.onerror = (err) => {
      setWsConnected(false);
      console.error('WebSocket error:', err);
    };
    wsRef.current.onclose = () => {
      setWsConnected(false);
    };
  }, []);

  React.useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current && wsRef.current.close();
    };
  }, [connectWebSocket]);

  // Fallback: If no status received, fetch via GET /api/status
  React.useEffect(() => {
    if (status === null) {
      fetch(`${baseUrl}/api/status`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setStatus(data);
        })
        .catch(() => {});
    }
  }, [status]);

  return { status, frame, wsConnected, reconnect: connectWebSocket };
}
