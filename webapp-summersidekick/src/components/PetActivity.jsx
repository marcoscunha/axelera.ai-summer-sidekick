import { formatDateTime, formatSecondsAdaptive } from '../utils/formatters';

export function PetActivity({ petStatus }) {

    const statusMap = {
        true: { label: "Active", className: "status-active" },
        false: { label: "Inactive", className: "status-inactive" },
        undefined: { label: "N/A", className: "status-inactive" }
    };
    const statusInfo = statusMap[petStatus.pet_active];

    return (
        <div className="dashboard-item">
            <h2>Pet Activity</h2>
            <ul>
                <li>Status: <span className={statusInfo.className}>{statusInfo.label}</span></li>
                <li>Last Active: {petStatus.last_pet_active !== undefined ?
                    formatDateTime(petStatus.last_pet_active) : 'N/A'
                }</li>
                <li>Duration Active: {petStatus.pet_active !== undefined
                    ? formatSecondsAdaptive(petStatus.since_pet_active)
                    : 'N/A'
                }</li>
            </ul>
        </div>
    );
}
