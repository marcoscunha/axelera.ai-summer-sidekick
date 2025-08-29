import mqtt from 'mqtt';

const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://192.168.1.100:9001';
const TOPIC = 'axelera.ai/feed_control/02/feed_dispenser';

export function publishFeedDispenser(portions) {
  if (typeof portions !== 'string') portions = String(portions);
  const client = mqtt.connect(MQTT_BROKER_URL);
  client.on('connect', () => {
    client.publish(TOPIC, portions, {}, () => {
      client.end();
    });
  });
}

// React hook for UI integration
import { useCallback } from 'react';
export function useFeedDispenserPublisher() {
  return useCallback((portions) => {
    publishFeedDispenser(portions);
  }, []);
}