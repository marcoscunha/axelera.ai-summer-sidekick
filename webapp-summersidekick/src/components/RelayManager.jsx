import { useEffect, useState } from 'react';
import { useMqttPublish } from '../api/useMqttPublish';
import { useMqttStatus } from '../api/useMqttStatus';
import { RelayControl } from './RelayControl';

export default function RelayManager() {
  const [relayStatus, setRelayStatus] = useState({ relay1: 'OFF', relay2: 'OFF' });
  const [isLoading, setIsLoading] = useState(false);
  const { publishMessage } = useMqttPublish();
  const { mqttData, mqttConnected } = useMqttStatus();

  // console.log('MQTT Data:', mqttData);

  // Update relay status when MQTT data changes
  useEffect(() => {
    // Handle direct power messages (ON/OFF)
    const power1 = mqttData['stat/4CHPRO/POWER1'];
    const power2 = mqttData['stat/4CHPRO/POWER2'];

    console.log('Power1 message:', power1);
    console.log('Power2 message:', power2);

    if (power1) {
      setRelayStatus(prev => ({ ...prev, relay1: power1 }));
    }

    if (power2) {
      setRelayStatus(prev => ({ ...prev, relay2: power2 }));
    }

    // Handle RESULT messages
    const result = mqttData['stat/4CHPRO/RESULT'];
    if (result) {
      try {
        console.log('RESULT message:', result);
        const data = JSON.parse(result);
        if (data.POWER1) {
          setRelayStatus(prev => ({ ...prev, relay1: data.POWER1 }));
        }
        if (data.POWER2) {
          setRelayStatus(prev => ({ ...prev, relay2: data.POWER2 }));
        }
      } catch (error) {
        console.error('Error parsing MQTT RESULT:', error);
      }
    }
  }, [mqttData]); const toggleRelay = async (relayNumber) => {
    if (!mqttConnected) {
      console.error('MQTT is not connected');
      return;
    }

    setIsLoading(true);
    const currentState = relayNumber === 1 ? relayStatus.relay1 : relayStatus.relay2;
    const newState = currentState === 'ON' ? 'OFF' : 'ON';
    const topic = `cmnd/4CHPRO/POWER${relayNumber}`;
    console.log(`[RelayManager] Publishing to topic: ${topic} with payload: ${newState}`);
    try {
      await publishMessage(topic, newState);
    } catch (error) {
      console.error(`Error toggling relay ${relayNumber}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Query initial state only once when MQTT connects
  useEffect(() => {
    if (!mqttConnected) return;
    setIsLoading(true);
    publishMessage('cmnd/4CHPRO/POWER', '')
      .catch(error => {
        console.error('Error querying relay states:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
    // Only run when mqttConnected changes to true
  }, [mqttConnected]);

  return (
    <RelayControl
      relayStatus={relayStatus}
      toggleRelay={toggleRelay}
      disabled={isLoading || !mqttConnected}
    />
  );
}
