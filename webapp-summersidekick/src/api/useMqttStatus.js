import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://192.168.1.100:9001';
const TOPICS = [
  'axelera.ai/moisture/01/adc',
  'axelera.ai/moisture/01/gpio',
  'axelera.ai/moisture/01/health',
  'axelera.ai/feed_control/02/health',
  'stat/4CHPRO/POWER1',
  'stat/4CHPRO/POWER2',
  'stat/4CHPRO/RESULT'
];

export function useMqttStatus() {
  const [mqttConnected, setMqttConnected] = useState(false);
  const [mqttData, setMqttData] = useState({});
  const clientRef = useRef(null);

  const connectMqtt = () => {
    if (clientRef.current) {
      clientRef.current.end(true);
    }
    const client = mqtt.connect(MQTT_BROKER_URL);
    clientRef.current = client;

    client.on('connect', () => {
      setMqttConnected(true);
      TOPICS.forEach(topic => client.subscribe(topic));
    });

    client.on('message', (topic, message) => {
      const messageStr = message.toString().trim();
      console.log(`[MQTT] ${topic}: ${messageStr}`);

      if (topic === 'stat/4CHPRO/POWER1' || topic === 'stat/4CHPRO/POWER2') {
        // Handle simple ON/OFF messages
        setMqttData(prev => ({
          ...prev,
          [topic]: messageStr
        }));
      } else if (topic === 'stat/4CHPRO/RESULT') {
        try {
          // Try to parse as JSON for RESULT messages
          const jsonData = JSON.parse(messageStr);
          setMqttData(prev => ({
            ...prev,
            [topic]: JSON.stringify(jsonData)
          }));
        } catch (e) {
          console.error('Error parsing MQTT RESULT message:', e);
        }
      } else {
        // Handle other messages
        setMqttData(prev => ({
          ...prev,
          [topic]: messageStr
        }));
      }
    });

    client.on('close', () => setMqttConnected(false));
    client.on('offline', () => setMqttConnected(false));
    client.on('error', () => setMqttConnected(false));
  };

  useEffect(() => {
    connectMqtt();
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
      }
    };
  }, []);

  return { mqttConnected, mqttData, reconnectMqtt: connectMqtt };
}
