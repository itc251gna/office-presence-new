// Greek Holiday Calculator

/**
 * Calculate Orthodox Easter date using Meeus/Jones/Butcher algorithm
 * @param {number} year
 * @returns {Date}
 */
export const calculateOrthodoxEaster = (year) => {
  const a = year % 19;
  const b = year % 7;
  const c = year % 4;
  const d = (19 * a + 16) % 30;
  const e = (2 * c + 4 * b + 6 * d) % 7;
  const f = d + e;
  
  let day, month;
  if (f <= 9) {
    day = f + 22;
    month = 2; // March (0-indexed)
  } else {
    day = f - 9;
    month = 3; // April (0-indexed)
  }
  
  // Convert from Julian to Gregorian calendar (add 13 days for 20th-21st century)
  const easterDate = new Date(year, month, day);
  easterDate.setDate(easterDate.getDate() + 13);
  
  return easterDate;
};

/**
 * Get all Greek public holidays for a given year
 * @param {number} year
 * @returns {Array<{date: string, name: string}>}
 */
export const getGreekHolidays = (year) => {
  const holidays = [];
  
  // Fixed holidays
  holidays.push({ date: `${year}-01-01`, name: 'Πρωτοχρονιά' });
  holidays.push({ date: `${year}-01-06`, name: 'Θεοφάνεια' });
  holidays.push({ date: `${year}-03-25`, name: '25η Μαρτίου' });
  holidays.push({ date: `${year}-05-01`, name: 'Πρωτομαγιά' });
  holidays.push({ date: `${year}-08-15`, name: 'Κοίμηση Θεοτόκου' });
  holidays.push({ date: `${year}-10-28`, name: '28η Οκτωβρίου' });
  holidays.push({ date: `${year}-12-25`, name: 'Χριστούγεννα' });
  holidays.push({ date: `${year}-12-26`, name: 'Σύναξη Θεοτόκου' });
  
  // Calculate movable holidays based on Orthodox Easter
  const easter = calculateOrthodoxEaster(year);
  
  // Clean Monday (Καθαρά Δευτέρα) - 48 days before Easter
  const cleanMonday = new Date(easter);
  cleanMonday.setDate(cleanMonday.getDate() - 48);
  holidays.push({
    date: cleanMonday.toISOString().split('T')[0],
    name: 'Καθαρά Δευτέρα'
  });
  
  // Good Friday (Μεγάλη Παρασκευή) - 2 days before Easter
  const goodFriday = new Date(easter);
  goodFriday.setDate(goodFriday.getDate() - 2);
  holidays.push({
    date: goodFriday.toISOString().split('T')[0],
    name: 'Μεγάλη Παρασκευή'
  });
  
  // Easter Sunday (Κυριακή του Πάσχα)
  holidays.push({
    date: easter.toISOString().split('T')[0],
    name: 'Κυριακή Πάσχα'
  });
  
  // Easter Monday (Δευτέρα του Πάσχα)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easterMonday.getDate() + 1);
  holidays.push({
    date: easterMonday.toISOString().split('T')[0],
    name: 'Δευτέρα Πάσχα'
  });
  
  // Whit Monday (Αγίου Πνεύματος) - 50 days after Easter
  const whitMonday = new Date(easter);
  whitMonday.setDate(whitMonday.getDate() + 50);
  holidays.push({
    date: whitMonday.toISOString().split('T')[0],
    name: 'Αγίου Πνεύματος'
  });
  
  return holidays;
};

/**
 * Check if a date is a Greek public holiday
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {{isHoliday: boolean, name: string | null}}
 */
export const isGreekHoliday = (dateStr) => {
  const [year] = dateStr.split('-').map(Number);
  const holidays = getGreekHolidays(year);
  const holiday = holidays.find(h => h.date === dateStr);
  
  return {
    isHoliday: !!holiday,
    name: holiday?.name || null
  };
};

/**
 * Check if a date is a weekend
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isWeekend = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

/**
 * Check if a date is a weekend or holiday
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {{isNonWorkingDay: boolean, reason: string | null}}
 */
export const isNonWorkingDay = (dateStr) => {
  const weekend = isWeekend(dateStr);
  const { isHoliday, name } = isGreekHoliday(dateStr);
  
  if (isHoliday) {
    return { isNonWorkingDay: true, reason: name };
  }
  
  if (weekend) {
    return { isNonWorkingDay: true, reason: 'Σαββατοκύριακο' };
  }
  
  return { isNonWorkingDay: false, reason: null };
};