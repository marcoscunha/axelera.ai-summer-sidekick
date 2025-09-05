import RelayManager from './RelayManager';
import './Settings.css'; // Add this import for the CSS file

export function Settings({
  feedPortions,
  setFeedPortions,
  feedLoading,
  handleFeedPublish,
  mqttConnected,
  publishReset,
  systemStatus,
  systemRunning,
  handleStart,
  handleStop,
  isLoading,
  wsConnected,
  reconnect,
  reconnectMqtt,
  mqttData,
  error,
}) {
  return (
    <div className="settings-columns">
      {/* Left column: System Controls */}
      <div className="settings-column settings-controls">
        <h2 className="settings-heading">System Controls</h2>
        <RelayManager />
        <div className="settings-section">
          <h3 className="settings-subheading">Food Dispenser</h3>
          {/* <div className="settings-feed-row">
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
          </div> */}
          <button
            onClick={() => publishReset('axelera.ai/feed_control/02/control')}
            disabled={!mqttConnected}
            className="settings-feed-btn"
            style={{ marginTop: '0.5em', background: '#e67e22' }}
          >
            RESET DEVICE
          </button>
        </div>
        <div className="settings-section">
          <h3 className="settings-subheading">Soil Moisture</h3>
          <button
            onClick={() => publishReset('axelera.ai/moisture/02/control')}
            disabled={!mqttConnected}
            className="settings-feed-btn"
            style={{ marginTop: '0.5em', background: '#e67e22' }}
          >
            RESET DEVICE
          </button>
        </div>
      </div>
      {/* Right column: System Status */}
      <div className="settings-column settings-status">
        <h2 className="settings-heading">System Status</h2>
        <ul className="settings-status-list">
          <li>Running: {systemStatus.running ? 'Yes' : 'No'}</li>
          <li>Frame Count: {systemStatus.frameCount ?? 'N/A'}</li>
          <li>FPS: {systemStatus.fps ?? 'N/A'}</li>
          <li>Core Temp: {systemStatus.core_temp ?? 'N/A'}</li>
          <li>CPU Usage: {systemStatus.cpu_usage ?? 'N/A'}</li>
        </ul>
        <div className="settings-status-btns">
          <button
            onClick={systemRunning ? handleStop : handleStart}
            disabled={isLoading}
            className={`settings-status-btn${systemRunning ? ' stop' : ' start'}${isLoading ? ' loading' : ''}`}
          >
            {isLoading ? 'Processing...' : systemRunning ? 'Stop System' : 'Start System'}
          </button>
          <button
            onClick={reconnect}
            className={`settings-status-btn${wsConnected ? ' connected' : ' disconnected'}`}
          >
            {wsConnected ? 'WebSocket: Connected' : 'WebSocket: Disconnected'}
          </button>
          <button
            onClick={reconnectMqtt}
            className={`settings-status-btn${mqttConnected ? ' connected' : ' disconnected'}`}
          >
            {mqttConnected ? 'MQTT: Connected' : 'MQTT: Disconnected'}
          </button>
        </div>
        {error && (
          <div className="settings-error">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
