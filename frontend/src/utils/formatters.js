export function formatPrice(amount, currency = "USD", symbol = "$") {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0.00`;
  const num = Number(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${symbol}${formatted}`;
}

export function formatDate(dateString, includeTime = false) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function truncateText(text, maxLen = 60) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export function formatPhoneNumber(phone) {
  if (!phone) return "";
  const trimmed = String(phone).trim();
  if (!trimmed) return "";
  if (!trimmed.endsWith("|")) {
    return `${trimmed} |`;
  }
  return trimmed;
}

