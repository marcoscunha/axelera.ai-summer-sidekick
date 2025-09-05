import '../App.css';
import { formatDateTime, formatSecondsAdaptive } from '../utils/formatters';

export function FoodMonitoring({ petStatus }) {
    const bowlMap = {
        bowl_full: { label: "Full", className: "status-green" },
        bowl_half: { label: "Half", className: "status-yellow" },
        bowl_empty: { label: "Empty", className: "status-red" },
        undefined: { label: "N/A", className: "status-gray" }
    };

    const bowlInfo = bowlMap[petStatus.bowl_label] || bowlMap.undefined;

    return (
        <div className="dashboard-item">
            <h2>Food Monitoring</h2>
            <ul>
                <li>Level: <span className={bowlInfo.className}>{bowlInfo.label}</span></li>
                <li>Last Detection: {petStatus.bowl_last_detection !== undefined ?
                    formatDateTime(petStatus.bowl_last_detection) : 'N/A'
                }</li>
                <li>Duration: {formatSecondsAdaptive(petStatus.bowl_since_detection)}
                </li>
            </ul>
        </div>
    );
}
