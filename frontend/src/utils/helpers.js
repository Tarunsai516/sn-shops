/**
 * Format a number as Indian Rupee currency
 */
export function formatCurrency(amount) {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string consistently: "25 Apr 2026, 8:33 PM"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Get CSS class for payment status badge
 */
export function getStatusBadge(status) {
  switch (status) {
    case 'PAID':
      return 'badge-success';
    case 'PARTIAL':
      return 'badge-warning';
    case 'UNPAID':
      return 'badge-danger';
    default:
      return '';
  }
}

/**
 * Capitalize user-facing text:
 *  - "bread-whole" → "Bread Whole"
 *  - "tarun" → "Tarun"
 *  - "LOYAL" → "Loyal"
 *  - "milk" → "Milk"
 */
export function capitalize(str) {
  if (!str) return '';
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
}
