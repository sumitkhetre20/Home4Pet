/**
 * Formatting helpers for consistent display of pet age and currency.
 */

export const formatAge = (age, unit) => {
  if (age === null || age === undefined) return 'Unknown Age';
  const val = parseInt(age, 10);
  if (isNaN(val)) return 'Unknown Age';
  
  const unitStr = unit?.toUpperCase() || 'YEARS';
  switch (unitStr) {
    case 'DAYS':
      return `${val} ${val === 1 ? 'Day' : 'Days'}`;
    case 'MONTHS':
      return `${val} ${val === 1 ? 'Month' : 'Months'}`;
    case 'YEARS':
    default:
      return `${val} ${val === 1 ? 'Year' : 'Years'}`;
  }
};

export const formatCurrency = (amount) => {
  return `₹${amount || 0}`;
};
