import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useMqttPublish } from '../api/useMqttPublish';
import { useMqttStatus } from '../api/useMqttStatus';
import { formatDateTime, formatSecondsAdaptive } from '../utils/formatters';

export function PlantHealth({ petStatus }) {
    const PlantMap = {
        healthy_plant: { label: "Healthy", className: "status-green" },
        unhealthy_plant: { label: "Unhealthy", className: "status-yellow" },
        undefined: { label: "N/A", className: "status-gray" }
    };

    const [relayStatus, setRelayStatus] = useState('OFF');
    const [isLoading, setIsLoading] = useState(false);
    const { publishMessage } = useMqttPublish();
    const { mqttData, mqttConnected } = useMqttStatus();

    // Update relay status when MQTT data changes
    useEffect(() => {
        // Handle direct power messages (ON/OFF)
        const power1 = mqttData['stat/4CHPRO/POWER1'];

        console.log('Power1 message:', power1);

        if (power1) {
            setRelayStatus(power1);
        }

        // Handle RESULT messages
        const result = mqttData['stat/4CHPRO/RESULT'];
        if (result) {
            try {
                console.log('RESULT message:', result);
                const data = JSON.parse(result);
                if (data.POWER1) {
                    setRelayStatus(data.POWER1);
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

    const plantInfo = PlantMap[petStatus.plant_label] || PlantMap.undefined;
    return (
        <div className="dashboard-item">
            <h2>Plant Health</h2>
            <ul>
                <li>Health: <span className={plantInfo.className}>{plantInfo.label}</span></li>
                <li>Last Detection: {formatDateTime(petStatus.plant_last_detection)}
                </li>
                <li>Duration: {petStatus.plant_since_detection !== undefined
                    ? formatSecondsAdaptive(petStatus.plant_since_detection)
                    : 'N/A'
                }</li>
                <li>Soil Status: {mqttData['axelera.ai/moisture/01/gpio'] === 1 ? "Dry" : "Wet"}</li>
                <li>Analog Soil Status: {mqttData['axelera.ai/moisture/01/adc'] ?? 'N/A'} / 4095</li>
            </ul>
            <h2>Water Control</h2>
            <ul>
                <li>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={relayStatus === "ON"}
                                onChange={() => toggleRelay(1)}
                                disabled={isLoading || !mqttConnected}
                            />
                        }
                        label={
                            <Typography sx={{
                                color: '#4a5568',
                                fontWeight: 500
                            }}>
                                Plant Irrigation:
                                {/* <span style={{
                                    color: relayStatus === "ON" ? '#48bb78' : '#f56565',
                                    fontWeight: 600
                                }}>{relayStatus}</span> */}
                            </Typography>
                        }
                        labelPlacement="start"
                    />
                </li>
            </ul>

        </div >
    );
}
