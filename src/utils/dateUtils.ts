export function formatTime(
  isoString: string,
  use24h: boolean
): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  const opts: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h,
  };
  return date.toLocaleTimeString(undefined, opts);
}
