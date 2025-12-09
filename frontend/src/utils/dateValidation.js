/**
 * Check if a date is within the allowed period for attendance submission
 * Allowed period: December 17th to January 11th
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isDateInAllowedPeriod = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  // December 17-31
  if (month === 12 && day >= 17) {
    return true;
  }
  
  // January 1-11
  if (month === 1 && day <= 11) {
    return true;
  }
  
  return false;
};

/**
 * Get a message explaining why a date is not allowed
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string}
 */
export const getDateRestrictionMessage = (dateStr) => {
  if (isDateInAllowedPeriod(dateStr)) {
    return '';
  }
  
  return 'Οι δηλώσεις παρουσιών επιτρέπονται μόνο για το διάστημα 17/12 - 11/1';
};