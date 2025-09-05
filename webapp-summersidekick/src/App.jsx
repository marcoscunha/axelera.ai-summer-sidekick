import Button from '@mui/material/Button';
import mqtt from 'mqtt';
import React from 'react';
import './App.css';
import { useFeedDispenserPublisher } from './api/mqttPublish';
import { useStartSystem, useStopSystem } from './api/system';
import { useMqttStatus } from './api/useMqttStatus';
import { useSystemStatusWS } from './api/ws';
import { Settings } from './components/settings';


// Helper to format seconds to adaptive HH:MM:SS
function formatSecondsAdaptive(seconds) {
  seconds = Math.floor(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  let result = '';
  if (h > 0) result += `${h}:`;
  if (m > 0 || h > 0) result += `${h > 0 && m < 10 ? '0' : ''}${m}:`;
  result += `${(m > 0 || h > 0) && s < 10 ? '0' : ''}${s}`;
  if (h === 0 && m === 0) {
    result += ' seconds';
  }
  return result;
}

// Helper to format ISO date string to 'Date: DD/MM/YYYY Time: HH:MM'
function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  // return `Date: ${day}/${month}/${year} Time: ${hours}:${minutes}`;
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Helper to publish RESET to a topic
function publishReset(topic) {
  const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://192.168.1.100:9001';
  const client = mqtt.connect(MQTT_BROKER_URL);
  client.on('connect', () => {
    client.publish(topic, 'RESET', {}, () => {
      client.end();
    });
  });
}

// Helper to determine border color
function getBorderColor(systemStatus) {
  if (systemStatus === undefined || systemStatus === null) return "gray";
  if (systemStatus.running === true) return "green";
  if (systemStatus.running === false) return "red";
  return "gray";
}

function App() {
  const [menu, setMenu] = React.useState('dashboard');
  const startMutation = useStartSystem();
  const stopMutation = useStopSystem();
  const error = startMutation.error || stopMutation.error;
  // systemRunning is derived from status.running, not local state
  const { status, frame0, frame1, wsConnected, reconnect } = useSystemStatusWS();
  const { mqttConnected, mqttData, reconnectMqtt } = useMqttStatus();
  const [pendingAction, setPendingAction] = React.useState(null); // 'start' | 'stop' | null
  const [feedPortions, setFeedPortions] = React.useState(1);
  const publishFeed = useFeedDispenserPublisher();
  const [feedLoading, setFeedLoading] = React.useState(false);

  const handleStart = async () => {
    setPendingAction('start');
    try {
      await startMutation.mutateAsync();
      // Wait for status.running to update
    } catch {
      // Error handled by react-query
      setPendingAction(null);
    }
  };

  const handleStop = async () => {
    setPendingAction('stop');
    try {
      await stopMutation.mutateAsync();
      // Wait for status.running to update
    } catch {
      // Error handled by react-query
      setPendingAction(null);
    }
  };
  // Extract status info
  const petStatus = status ? {
    pet_active: status.pet_activity?.active,
    last_pet_active: status.pet_activity?.last_active_time,
    since_pet_active: status.pet_activity?.since_first_active_seconds,
    bowl_label: status.bowl_level.label,
    bowl_since_detection: status.bowl_level.since_first_detection_seconds,
    fountain_label: status.fountain_level.label,
    fountain_last_detection: status.fountain_level.last_detection_time,
    fountain_since_detection: status.fountain_level.since_first_detection_seconds,
    plant_label: status.plant_health?.label,
    plant_last_detection: status.plant_health?.last_detection_time,
    plant_since_detection: status.plant_health?.since_first_detection_seconds,
  } : {};
  const plantStatus = status ? {
    health: status.plant_health_status,
  } : {};
  const systemStatus = status ? {
    running: status.running,
    frameCount: status.frame_count,
    fps: Math.round(status.fps.value) + " " + status.fps.unit,
    core_temp: Math.round(status?.core_temp?.value) + " " + status?.core_temp?.unit,
    cpu_usage: Math.round(status?.cpu_usage?.value) + " " + status?.cpu_usage?.unit,
  } : {};
  const systemRunning = !!systemStatus.running;

  // Border color logic
  const borderColor = getBorderColor(systemStatus);
  // Button loading logic: true if mutation is running OR waiting for backend confirmation
  const isLoading = (
    (pendingAction === 'start' && startMutation.isLoading) ||
    (pendingAction === 'stop' && stopMutation.isLoading) ||
    (pendingAction === 'start' && !systemRunning) ||
    (pendingAction === 'stop' && systemRunning)
  );

  // Reset pendingAction when backend confirms state
  React.useEffect(() => {
    if (pendingAction === 'start' && systemRunning) setPendingAction(null);
    if (pendingAction === 'stop' && !systemRunning) setPendingAction(null);
  }, [systemRunning, pendingAction]);

  const handleFeedPublish = async () => {
    setFeedLoading(true);
    publishFeed(feedPortions);
    setTimeout(() => setFeedLoading(false), 1000); // Simulate quick publish
  };

  const renderDashboard = () => (
    <>
      <section className="dashboard" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <div className="dashboard-item">
          <h2>Pet Activity</h2>
          <ul>
            <li>Activity: <span className={petStatus.pet_active ? "status-active" : "status-inactive"}>{petStatus.pet_active ? "Active" : "Inactive" ?? 'N/A'}</span></li>
            <li>Last Activity: {petStatus.last_pet_active !== undefined ?
              formatDateTime(petStatus.last_pet_active) : 'N/A'
            }</li>
            <li>Duration: {petStatus.pet_active !== undefined
              ? formatSecondsAdaptive(petStatus.since_pet_active)
              : 'N/A'
            }</li>
          </ul>
        </div>
        <div className="dashboard-item">
          <h2>Food Monitoring</h2>
          <ul>
            <li>Level: <span className={petStatus.bowl_label == "bowl_full" ? "status-green" :
              petStatus.bowl_label == "bowl_half" ? "status-yellow" :
                petStatus.bowl_label == "bowl_empty" ? "status-red" :
                  "status-gray"}>{petStatus.bowl_label ?? 'N/A'}</span></li>
            <li>Last Detection: {petStatus.bowl_since_detection !== undefined ?
              formatDateTime(petStatus.bowl_since_detection) : 'N/A'
            }</li>
            <li>Duration Pet Active: {petStatus.pet_active !== undefined
              ? formatSecondsAdaptive(petStatus.since_pet_active)
              : 'N/A'
            }</li>
            <li>Duration Bowl Level: {
              petStatus.since_bowl_level !== undefined
                ? formatSecondsAdaptive(petStatus.since_bowl_level)
                : 'N/A'
            }</li>
            <li>Fountain Water Level: {petStatus.fountain ?? 'N/A'}</li>
          </ul>
        </div>
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

      </section>
      <section className="camera-stream" style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
        <div>
          <h2>Live Camera 0</h2>
          {frame0 ? (
            <img
              src={`data:image/jpeg;base64,${frame0}`}
              alt="Live Camera 0"
              width={640}
              height={360}
              style={{ borderRadius: '12px', boxShadow: '0 2px 12px #0002', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 640, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', borderRadius: '12px', boxShadow: '0 2px 12px #0002' }}>
              <span style={{ color: '#888' }}>Waiting for live frame...</span>
            </div>
          )}
          <p className="camera-info">Streaming from: Camera 0</p>
        </div>
        <div>
          <h2>Live Camera 1</h2>
          {frame1 ? (
            <img
              src={`data:image/jpeg;base64,${frame1}`}
              alt="Live Camera 1"
              width={640}
              height={360}
              style={{ borderRadius: '12px', boxShadow: '0 2px 12px #0002', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 640, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', borderRadius: '12px', boxShadow: '0 2px 12px #0002' }}>
              <span style={{ color: '#888' }}>Waiting for live frame...</span>
            </div>
          )}
          <p className="camera-info">Streaming from: Camera 1</p>
        </div>
      </section>
    </>
  );

  const renderSettings = () => (
    <Settings
      feedPortions={feedPortions}
      setFeedPortions={setFeedPortions}
      feedLoading={feedLoading}
      handleFeedPublish={handleFeedPublish}
      mqttConnected={mqttConnected}
      publishReset={publishReset}
      systemStatus={systemStatus}
      systemRunning={systemRunning}
      handleStart={handleStart}
      handleStop={handleStop}
      isLoading={isLoading}
      wsConnected={wsConnected}
      reconnect={reconnect}
      reconnectMqtt={reconnectMqtt}
      mqttData={mqttData}
      error={error}
    />
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7fa' }}>
      <nav className="side-menu" style={{ width: 180, background: '#222', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32, boxShadow: '2px 0 8px #0002' }}>
        <h2 style={{ fontSize: 22, marginBottom: 32, fontWeight: 700 }}>Menu</h2>
        <Button
          variant={menu === 'dashboard' ? 'contained' : 'text'}
          color={menu === 'dashboard' ? 'primary' : 'inherit'}
          onClick={() => setMenu('dashboard')}
          sx={{ width: '100%', mb: 2, fontWeight: 600, color: menu === 'dashboard' ? '#fff' : '#eee', background: menu === 'dashboard' ? '#1976d2' : 'none' }}
        >
          Dashboard
        </Button>
        <Button
          variant={menu === 'settings' ? 'contained' : 'text'}
          color={menu === 'settings' ? 'primary' : 'inherit'}
          onClick={() => setMenu('settings')}
          sx={{ width: '100%', mb: 2, fontWeight: 600, color: menu === 'settings' ? '#fff' : '#eee', background: menu === 'settings' ? '#1976d2' : 'none' }}
        >
          Settings
        </Button>
      </nav>
      <div style={{ flex: 1 }}>
        <div
          className="pet-monitor-container"
          style={{
            border: `8px solid ${borderColor}`,
            borderRadius: "16px",
            margin: "32px",
            padding: "16px",
            transition: "border-color 0.3s",
            background: '#fff',
          }}
        >
          <header className="dashboard-header">
            <h1>Summer Sidekick Project</h1>
            <p>Monitor your pets remotely with live camera streaming and dashboard insights.</p>
          </header>
          {menu === 'dashboard' && renderDashboard()}
          {menu === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}

export default App;
