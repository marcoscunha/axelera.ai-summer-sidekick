// Utility formatters for dashboard components
export function formatSecondsAdaptive(seconds) {
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

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
