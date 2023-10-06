export default function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",      // Added hour
    minute: "2-digit",    // Added minute
    // second: "2-digit", // Uncomment if you want seconds
    timeZone: "UTC",
  };
  return date.toLocaleDateString("es-ES", options);
}
