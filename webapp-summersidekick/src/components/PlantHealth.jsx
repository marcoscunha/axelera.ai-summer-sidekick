import { formatDateTime, formatSecondsAdaptive } from '../utils/formatters';

export function PlantHealth({ petStatus, mqttData }) {
    return (
        <div className="dashboard-item">
            <h2>Plant Health</h2>
            <ul>
                <li>Health: {petStatus.plant_label === "unhealthy_plant" ? "Unhealthy" :
                    petStatus.plant_label === "healthy_plant" ? "Healthy" : "N/A"}</li>
                <li>Last Detection: {petStatus.plant_last_detection !== undefined ?
                    formatDateTime(petStatus.plant_last_detection) : 'N/A'
                }</li>
                <li>Duration: {petStatus.plant_since_detection !== undefined
                    ? formatSecondsAdaptive(petStatus.plant_since_detection)
                    : 'N/A'
                }</li>
                <li>Soil Status: {mqttData['axelera.ai/moisture/01/gpio'] === 1 ? "Dry" : "Wet"}</li>
                <li>Analog Soil Status: {mqttData['axelera.ai/moisture/01/adc'] ?? 'N/A'} / 4095</li>
            </ul>
        </div>
    );
}
