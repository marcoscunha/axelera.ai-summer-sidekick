import { FormControlLabel, Switch, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useMqttPublish } from '../api/useMqttPublish';
import { useMqttStatus } from '../api/useMqttStatus';
import { formatDateTime, formatSecondsAdaptive } from '../utils/formatters';

export function WaterMonitoring({ petStatus }) {
    const [relayStatus, setRelayStatus] = useState('OFF');
    const [isLoading, setIsLoading] = useState(false);
    const { publishMessage } = useMqttPublish();
    const { mqttData, mqttConnected } = useMqttStatus();

    // Update relay status when MQTT data changes
    useEffect(() => {
        // Handle direct power messages (ON/OFF)
        const power2 = mqttData['stat/4CHPRO/POWER2'];

        console.log('Power2 message:', power2);

        if (power2) {
            setRelayStatus(power2);
        }

        // Handle RESULT messages
        const result = mqttData['stat/4CHPRO/RESULT'];
        if (result) {
            try {
                console.log('RESULT message:', result);
                const data = JSON.parse(result);
                if (data.POWER2) {
                    setRelayStatus(data.POWER2);
                }
            } catch (error) {
                console.error('Error parsing MQTT RESULT:', error);
            }
        }
    }, [mqttData]);

    const toggleRelay = async (relayNumber) => {
        if (!mqttConnected) {
            console.error('MQTT is not connected');
            return;
        }

        setIsLoading(true);
        const currentState = relayStatus;
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


    return (
        <div className="dashboard-item">
            <h2>Pet Fountain Monitoring</h2>
            <ul>
                <li>Level: <span className={petStatus.fountain_label === "fountain_middle" ? "status-green" :
                    petStatus.fountain_label == "fountain_low" ? "status-yellow" :
                        "status-gray"}>{petStatus.fountain_label ?? 'N/A'}</span></li>
                <li>Last Detection: {petStatus.fountain_last_detection !== undefined ?
                    formatDateTime(petStatus.fountain_last_detection) : 'N/A'
                }</li>
                <li>Duration: {petStatus.fountain_since_detection !== undefined
                    ? formatSecondsAdaptive(petStatus.fountain_since_detection)
                    : 'N/A'
                }</li>
            </ul>
            <h2>Water Control</h2>
            <ul>
                <li>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={relayStatus === "ON"}
                                onChange={() => toggleRelay(2)}
                                disabled={isLoading || !mqttConnected}
                            />
                        }
                        label={
                            <Typography sx={{
                                color: '#4a5568',
                                fontWeight: 500
                            }}>
                                Pet Fountain :
                                {/* <span style={{
                                        color: relayStatus === "ON" ? '#48bb78' : '#f56565',
                                        fontWeight: 600
                                    }}>{relayStatus}</span> */}
                            </Typography>
                        }
                        labelPlacement="start" />
                </li>
            </ul>
        </div >
    );
}
