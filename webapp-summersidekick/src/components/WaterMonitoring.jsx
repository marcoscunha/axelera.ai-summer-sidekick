import { formatDateTime, formatSecondsAdaptive } from '../utils/formatters';

export function WaterMonitoring({ petStatus }) {
    return (
        <div className="dashboard-item">
            <h2>Water Monitoring</h2>
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
        </div>
    );
}
