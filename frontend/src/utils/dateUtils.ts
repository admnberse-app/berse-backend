/**
 * Utility functions for date calculations
 */

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth as string or Date object
 * @returns Age in years
 */
export const calculateAge = (dateOfBirth: string | Date | null | undefined): number => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) return 0;
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get zodiac sign from date of birth
 * @param dateOfBirth - Date of birth
 * @returns Zodiac sign
 */
export const getZodiacSign = (dateOfBirth: string | Date | null | undefined): string => {
  if (!dateOfBirth) return '';
  
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const signs = [
    { name: 'Capricorn', start: [12, 22], end: [1, 19] },
    { name: 'Aquarius', start: [1, 20], end: [2, 18] },
    { name: 'Pisces', start: [2, 19], end: [3, 20] },
    { name: 'Aries', start: [3, 21], end: [4, 19] },
    { name: 'Taurus', start: [4, 20], end: [5, 20] },
    { name: 'Gemini', start: [5, 21], end: [6, 20] },
    { name: 'Cancer', start: [6, 21], end: [7, 22] },
    { name: 'Leo', start: [7, 23], end: [8, 22] },
    { name: 'Virgo', start: [8, 23], end: [9, 22] },
    { name: 'Libra', start: [9, 23], end: [10, 22] },
    { name: 'Scorpio', start: [10, 23], end: [11, 21] },
    { name: 'Sagittarius', start: [11, 22], end: [12, 21] }
  ];
  
  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (startMonth === 12 && month === 12 && day >= startDay) {
      return sign.name;
    }
    if (endMonth === 1 && month === 1 && day <= endDay) {
      return sign.name;
    }
    if (month === startMonth && day >= startDay) {
      return sign.name;
    }
    if (month === endMonth && day <= endDay) {
      return sign.name;
    }
  }
  
  return '';
};