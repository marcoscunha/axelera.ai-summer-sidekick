


import Button from '@mui/material/Button';
import React from 'react';
import './App.css';
import { useStartSystem, useStopSystem } from './api/system';
import { useSystemStatusWS } from './api/ws';



function App() {
  const cameraStreamUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
  const startMutation = useStartSystem();
  const stopMutation = useStopSystem();
  const isLoading = startMutation.isLoading || stopMutation.isLoading;
  const error = startMutation.error || stopMutation.error;
  const [systemRunning, setSystemRunning] = React.useState(false);
  const { status, frame, wsConnected, reconnect } = useSystemStatusWS();

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync();
      setSystemRunning(true);
    } catch {
      // Error handled by react-query
    }
  };
  const handleStop = async () => {
    try {
      await stopMutation.mutateAsync();
      setSystemRunning(false);
    } catch {
      // Error handled by react-query
    }
  };

  // Extract status info
  const petStatus = status ? {
    activity: status.pet_activity_level,
    bowl: status.bowl_fill_level,
    fountain: status.fountain_water_level,
  } : {};
  const plantStatus = status ? {
    health: status.plant_health_status,
  } : {};
  const systemStatus = status ? {
    running: status.running,
    frameCount: status.frame_count,
    fps: status.fps,
  } : {};

  return (
    <div className="pet-monitor-container">
      <header className="dashboard-header">
        <h1>Summer Sidekick Project</h1>
        <p>Monitor your pets remotely with live camera streaming and dashboard insights.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            variant={systemRunning ? 'contained' : 'contained'}
            color={systemRunning ? 'error' : 'success'}
            onClick={systemRunning ? handleStop : handleStart}
            disabled={isLoading}
            size="large"
            sx={{ minWidth: 180, fontWeight: 600 }}
          >
            {isLoading ? 'Processing...' : systemRunning ? 'Stop System' : 'Start System'}
          </Button>
          <Button
            variant="outlined"
            color={wsConnected ? 'success' : 'error'}
            onClick={reconnect}
            sx={{ minWidth: 140, fontWeight: 600 }}
          >
            {wsConnected ? 'WebSocket: Connected' : 'WebSocket: Disconnected'}
          </Button>
          {error && (
            <div style={{ color: '#e74c3c', marginTop: '0.7em' }}>
              {error.message}
            </div>
          )}
        </div>
      </header>
      <section className="dashboard" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <div className="dashboard-item">
          <h2>Pet Status</h2>
          <ul>
            <li>Activity Level: <span className="status-active">{petStatus.activity ?? 'N/A'}</span></li>
            <li>Bowl Fill Level: {petStatus.bowl ?? 'N/A'}</li>
            <li>Fountain Water Level: {petStatus.fountain ?? 'N/A'}</li>
          </ul>
        </div>
        <div className="dashboard-item">
          <h2>Plant Status</h2>
          <ul>
            <li>Health: {plantStatus.health ?? 'N/A'}</li>
          </ul>
        </div>
        <div className="dashboard-item">
          <h2>System Status</h2>
          <ul>
            <li>Running: {systemStatus.running !== undefined ? (systemStatus.running ? 'Yes' : 'No') : 'N/A'}</li>
            <li>Frame Count: {systemStatus.frameCount ?? 'N/A'}</li>
            <li>FPS: {systemStatus.fps ?? 'N/A'}</li>
          </ul>
        </div>
      </section>
      <section className="camera-stream">
        <h2>Live Camera Stream</h2>
        {frame ? (
          <img
            src={`data:image/jpeg;base64,${frame}`}
            alt="Live Pet Camera"
            width="640"
            height="360"
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px #0002', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 640, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', borderRadius: '12px', boxShadow: '0 2px 12px #0002' }}>
            <span style={{ color: '#888' }}>Waiting for live frame...</span>
          </div>
        )}
        <p className="camera-info">Streaming from: Living Room Camera</p>
      </section>
    </div>
  );
}

export default App;
