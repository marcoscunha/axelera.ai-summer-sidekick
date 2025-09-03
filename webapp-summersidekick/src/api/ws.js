// WebSocket interaction for /ws endpoint
// Provides a hook for real-time system status

import React, { useRef, useState } from 'react';
import { useMqttPublish } from './useMqttPublish';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function useSystemStatusWS() {
  const [status, setStatus] = useState(null);
  const [frame0, setFrame0] = useState(null);
  const [frame1, setFrame1] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  // const [relayStatus, setRelayStatus] = useState({
  //   relay1: "OFF",
  //   relay2: "OFF"
  // });
  const wsRef = useRef(null);
  const { publishMessage } = useMqttPublish();

  const toggleRelay = async (relayNumber) => {
    try {
      const topic = `cmnd/4CHPRO/POWER${relayNumber}`;
      const currentState = relayStatus[`relay${relayNumber}`];
      const newState = currentState === "ON" ? "OFF" : "ON";
      await publishMessage(topic, newState);
    } catch (error) {
      console.error('Error toggling relay:', error);
    }
  };

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
          console.log('Received status update via WebSocket:', msg.data);
          setStatus(msg.data);
        } else if (msg.type === 'frame_update_cam0' && msg.data) {
          setFrame0(msg.data.image);
        } else if (msg.type === 'frame_update_cam1' && msg.data) {
          setFrame1(msg.data.image);
        }
        // } else if (msg.type === 'mqtt_message') {
        //   // Handle direct power state updates
        //   if (msg.topic === 'stat/4CHPRO/POWER1') {
        //     setRelayStatus(prev => ({
        //       ...prev,
        //       relay1: msg.payload
        //     }));
        //   } else if (msg.topic === 'stat/4CHPRO/POWER2') {
        //     console.log('Received POWER2 message:', msg.payload);
        //     setRelayStatus(prev => ({
        //       ...prev,
        //       relay2: msg.payload
        //     }));
        //   }
          // Handle RESULT messages which contain power state updates
        //   else if (msg.topic === 'stat/4CHPRO/RESULT') {
        //     try {
        //       const result = JSON.parse(msg.payload);
        //       if (result.POWER1) {
        //         setRelayStatus(prev => ({
        //           ...prev,
        //           relay1: result.POWER1
        //         }));
        //       }
        //       if (result.POWER2) {
        //         setRelayStatus(prev => ({
        //           ...prev,
        //           relay2: result.POWER2
        //         }));
        //       }
        //     } catch (e) {
        //       console.error('Error parsing MQTT RESULT message:', e);
        //     }
        //   }
        // }
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

  return {
    status,
    frame0,
    frame1,
    wsConnected,
    reconnect: connectWebSocket,
    // relayStatus,
    // toggleRelay
  };
}
