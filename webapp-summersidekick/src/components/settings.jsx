import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

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
    error
}) {
    return (
        <section style={{ padding: 32 }}>
            <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Settings</h2>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #0002' }}>
                    <h2>System Controls</h2>
                    <div style={{ marginBottom: '1.5em' }}>
                        <h3 style={{ marginBottom: '0.5em', fontWeight: 600, color: '#222' }}>Food Dispenser</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '0.7em', color: '#222' }}>
                            <label htmlFor="feed-portions">Portions:</label>
                            <input
                                id="feed-portions"
                                type="number"
                                min={1}
                                max={10}
                                value={feedPortions}
                                onChange={e => setFeedPortions(Math.max(1, Math.min(10, Number(e.target.value))))}
                                style={{ width: 60, fontSize: '1em', padding: '0.2em 0.5em', borderRadius: 6, border: '1px solid #ccc' }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleFeedPublish}
                                disabled={feedLoading || !mqttConnected}
                                sx={{ fontWeight: 600 }}
                            >
                                {feedLoading ? <CircularProgress size={20} color="inherit" /> : 'Send'}
                            </Button>
                            <Tooltip title="Send a number of portions (1-10) to the feed dispenser via MQTT." arrow>
                                <HelpOutlineIcon style={{ color: '#888', cursor: 'pointer' }} />
                            </Tooltip>
                        </div>
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={() => publishReset('axelera.ai/feed_control/02/control')}
                            disabled={!mqttConnected}
                            sx={{ fontWeight: 600, marginBottom: '0.7em' }}
                        >
                            RESET
                        </Button>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '0.5em', fontWeight: 600, color: '#222' }}>Soil Moisture</h3>
                        <div style={{ color: '#222' }}>
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={() => publishReset('axelera.ai/moisture/02/control')}
                                disabled={!mqttConnected}
                                sx={{ fontWeight: 600 }}
                            >
                                RESET
                            </Button>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #0002', marginTop: 24 }}>
                    <h2>System Status</h2>
                    <ul>
                        <li>Running: {systemStatus.running !== undefined ? (systemStatus.running ? 'Yes' : 'No') : 'N/A'}</li>
                        <li>Frame Count: {systemStatus.frameCount ?? 'N/A'}</li>
                        <li>FPS: {systemStatus.fps ?? 'N/A'}</li>
                        <li>
                            <strong>moisture/01/health:</strong>
                            <span className={`led-indicator ${mqttData['axelera.ai/moisture/01/health'] === 'ALIVE' ? 'led-green' : 'led-gray'}`}></span>
                            {mqttData['axelera.ai/moisture/01/health'] ?? 'N/A'}
                        </li>
                        <li>
                            <strong>feed_contro/02/health:</strong>
                            <span className={`led-indicator ${mqttData['axelera.ai/feed_control/02/health'] === 'ALIVE' ? 'led-green' : 'led-gray'}`}></span>
                            {mqttData['axelera.ai/feed_control/02/health'] ?? 'N/A'}
                        </li>
                    </ul>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', marginTop: '1.5em', alignItems: 'stretch' }}>
                        <Button
                            variant={systemRunning ? 'contained' : 'contained'}
                            color={systemRunning ? 'error' : 'success'}
                            onClick={systemRunning ? handleStop : handleStart}
                            disabled={isLoading}
                            size="large"
                            sx={{ minWidth: 180, fontWeight: 600 }}
                        >
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <CircularProgress size={24} color="inherit" />
                                    Processing...
                                </span>
                            ) : systemRunning ? 'Stop System' : 'Start System'}
                        </Button>
                        <Button
                            variant="outlined"
                            color={wsConnected ? 'success' : 'error'}
                            onClick={reconnect}
                            sx={{ minWidth: 140, fontWeight: 600 }}
                        >
                            {wsConnected ? 'WebSocket: Connected' : 'WebSocket: Disconnected'}
                        </Button>
                        <Button
                            variant="outlined"
                            color={mqttConnected ? 'success' : 'error'}
                            onClick={reconnectMqtt}
                            sx={{ minWidth: 140, fontWeight: 600 }}
                        >
                            {mqttConnected ? 'MQTT: Connected' : 'MQTT: Disconnected'}
                        </Button>
                    </div>
                    {error && (
                        <div style={{ color: '#e74c3c', marginTop: '0.7em' }}>
                            {error.message}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
