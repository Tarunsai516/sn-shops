export function formatCurrency(amount) {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
