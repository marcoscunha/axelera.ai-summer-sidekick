import { useEffect, useRef, useState } from 'react';
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
  // LED-like status for device health

  // Alive status logic: default green, turn red if no health signal after 2 minutes
  // Status: 'gray' (default), 'green' (ALIVE), 'red' (timeout)
  const [soilStatus, setSoilStatus] = useState('gray');
  const [feedStatus, setFeedStatus] = useState('gray');
  const lastSoilHealth = useRef(Date.now());
  const lastFeedHealth = useRef(Date.now());

  // Extract health values for dependency array
  const soilHealthValue = mqttData['axelera.ai/moisture/01/health'];
  const feedHealthValue = mqttData['axelera.ai/feed_control/02/health'];

  useEffect(() => {
    if (soilHealthValue === 'ALIVE') {
      setSoilStatus('green');
      lastSoilHealth.current = Date.now();
    }
    if (feedHealthValue === 'ALIVE') {
      setFeedStatus('green');
      lastFeedHealth.current = Date.now();
    }
  }, [soilHealthValue, feedHealthValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSoilHealth.current > 120000) {
        setSoilStatus('red');
      }
      if (Date.now() - lastFeedHealth.current > 120000) {
        setFeedStatus('red');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="settings-columns">
      {/* Left column: System Controls */}
      <div className="settings-column settings-controls">
        <h2 >Inference Control</h2>
        <h4 className="settings-subheading">Axelera AI - Mentis System</h4>
        <button
          onClick={systemRunning ? handleStop : handleStart}
          disabled={isLoading}
          className={`settings-status-btn${systemRunning ? ' stop' : ' start'}${isLoading ? ' loading' : ''}`}>
          {isLoading ? 'Processing...' : systemRunning ? 'Stop System' : 'Start System'}
        </button>
      </div>
      <div className="settings-column settings-controls">
        <h2 >Sensor Controls</h2>
        <h4 className="settings-subheading">Food Dispenser</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
          <span>Alive:</span>
          <span style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background:
              feedStatus === 'green' ? '#48bb78' :
                feedStatus === 'red' ? '#f56565' : '#888',
            border: '2px solid #888'
          }} />
        </div>
        <button
          onClick={() => publishReset('axelera.ai/feed_control/02/control')}
          disabled={!mqttConnected}
          className="settings-feed-btn"
          style={{ marginTop: '0.5em', background: '#e67e22' }}
        >
          RESET DEVICE
        </button>
        <div className="settings-section">
          <h4 className="settings-subheading">Soil Moisture</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <span>Alive:</span>
            <span style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background:
                soilStatus === 'green' ? '#48bb78' :
                  soilStatus === 'red' ? '#f56565' : '#888',
              border: '2px solid #888'
            }} />
          </div>
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
      <div className="settings-column settings-status">
        <h2>System Status</h2>
        <ul className="settings-status-list">
          <li>Running: {systemStatus.running ? 'Yes' : 'No'}</li>
          <li>Frame Count: {systemStatus.frameCount ?? 'N/A'}</li>
          <li>FPS: {systemStatus.fps ?? 'N/A'}</li>
          <li>Core Temp: {systemStatus.core_temp ?? 'N/A'}</li>
          <li>CPU Usage: {systemStatus.cpu_usage ?? 'N/A'}</li>
        </ul>
        <div className="settings-status-btns">
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
