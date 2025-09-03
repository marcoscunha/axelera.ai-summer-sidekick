import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

export function RelayControl({ relayStatus, toggleRelay, disabled }) {
  return (
    // <Card sx={{
    //   mb: 2,
    //   borderRadius: '12px',
    //   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    // }}>
    //   <CardContent sx={{ padding: '32px !important' }}>
    <div>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          color: '#2c3e50',
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '24px !important',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '12px'
        }}>
        Water Control
      </Typography>
      <div style={{
        background: '#f7fafc',
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <FormControlLabel
          control={
            <Switch
              checked={relayStatus.relay1 === "ON"}
              onChange={() => toggleRelay(1)}
              disabled={disabled}
            />
          }
          label={
            <Typography sx={{
              color: '#4a5568',
              fontWeight: 500
            }}>
              Plant Irrigation: <span style={{
                color: relayStatus.relay1 === "ON" ? '#48bb78' : '#f56565',
                fontWeight: 600
              }}>{relayStatus.relay1}</span>
            </Typography>
          }
          sx={{
            margin: 0,
            '.MuiSwitch-root': {
              marginRight: 2
            }
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={relayStatus.relay2 === "ON"}
              onChange={() => toggleRelay(2)}
              disabled={disabled}
            />
          }
          label={
            <Typography sx={{
              color: '#4a5568',
              fontWeight: 500
            }}>
              Pet Fountain : <span style={{
                color: relayStatus.relay2 === "ON" ? '#48bb78' : '#f56565',
                fontWeight: 600
              }}>{relayStatus.relay2}</span>
            </Typography>
          }
          sx={{
            margin: 0,
            '.MuiSwitch-root': {
              marginRight: 2
            }
          }}
        />
      </div>
    </div>
    //   </CardContent>
    // </Card>
  );
}
