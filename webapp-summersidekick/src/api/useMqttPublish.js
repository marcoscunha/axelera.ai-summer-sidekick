import mqtt from 'mqtt';

export function useMqttPublish() {
  const publishMessage = async (topic, message) => {
    return new Promise((resolve, reject) => {
      const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://192.168.1.100:9001';
      const client = mqtt.connect(MQTT_BROKER_URL);

      const timeout = setTimeout(() => {
        client.end();
        reject(new Error('MQTT publish timeout'));
      }, 5000);

      client.on('connect', () => {
        client.publish(topic, message, {}, (error) => {
          clearTimeout(timeout);
          client.end();
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      client.on('error', (error) => {
        clearTimeout(timeout);
        client.end();
        reject(error);
      });
    });
  };

  return { publishMessage };
}
