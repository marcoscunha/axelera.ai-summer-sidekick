import React from 'react';
import { useFeedDispenserPublisher } from '../api/mqttPublish';
import '../App.css';
import { formatDateTime, formatSecondsAdaptive } from '../utils/formatters';

export function FoodMonitoring({ petStatus, mqttConnected }) {
    const [feedPortions, setFeedPortions] = React.useState(1);
    const [feedLoading, setFeedLoading] = React.useState(false);
    const publishFeed = useFeedDispenserPublisher();
    const bowlMap = {
        bowl_full: { label: "Full", className: "status-green" },
        bowl_half: { label: "Half", className: "status-yellow" },
        bowl_empty: { label: "Empty", className: "status-red" },
        undefined: { label: "N/A", className: "status-gray" }
    };

    const bowlInfo = bowlMap[petStatus.bowl_label] || bowlMap.undefined;

    const handleFeedPublish = async () => {
        setFeedLoading(true);
        publishFeed(feedPortions);
        setTimeout(() => setFeedLoading(false), 1000); // Simulate quick publish
    };

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
                <li>
                    <div className="settings-feed-row">
                        Portions:
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={feedPortions}
                            onChange={e => setFeedPortions(Number(e.target.value))}
                            disabled={!mqttConnected || feedLoading}
                            className="settings-feed-input"
                        />
                        <button
                            onClick={handleFeedPublish}
                            disabled={!mqttConnected || feedLoading}
                            className={`settings-feed-btn${feedLoading ? ' loading' : ''}`}
                        >
                            {feedLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    );
}
