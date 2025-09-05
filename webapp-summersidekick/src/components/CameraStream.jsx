
export function CameraStream({ frame0, frame1 }) {
    return (
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
    );
}
