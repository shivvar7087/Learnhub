export function formatToday(date = new Date()) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
}
