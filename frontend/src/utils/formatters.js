export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  const s = new Date(start); const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} – ${e.getDate()} ${s.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
};

export const getDuration = (start, end) => {
  if (!start || !end) return 0;
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
};

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
export const truncate = (str, len = 100) => str && str.length > len ? str.substring(0, len) + '...' : str;
