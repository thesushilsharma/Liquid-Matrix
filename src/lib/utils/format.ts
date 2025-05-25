/**
 * Formats a number with the specified precision
 */
export function formatNumber(value: number, precision: number = 2): string {
  // Handle different display formats based on the number's magnitude
  if (value === 0) return "0";

  // For very small numbers, use scientific notation
  if (value > 0 && value < 0.0001) {
    return value.toExponential(2);
  }

  // For normal numbers, format with the specified precision
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });

  return formatter.format(value);
}

/**
 * Formats a timestamp to a readable time string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
