/**
 * Domain Parsers
 * Parse domain-specific data (Complaint IDs, Dates, Counters, etc)
 * Single responsibility: parsing and formatting business objects
 */

/**
 * Format complaint ID to display format (CC + last 6 chars uppercase)
 * @param {string} id - Complaint ObjectId
 * @returns {string} - Formatted ID (e.g., CC7C59)
 */
export function formatComplaintId(id) {
  if (!id) return 'N/A';
  return `CC${id.slice(-6).toUpperCase()}`;
}

/**
 * Extract complaint ID from formatted string
 * @param {string} formattedId - Formatted ID string (e.g., "CC7C59")
 * @returns {string}
 */
export function parseFormattedComplaintId(formattedId) {
  return formattedId.replace('CC', '');
}

/**
 * Parse stat counter from text (e.g., "42" from "42 / 200")
 * @param {string} text - Counter text
 * @returns {number}
 */
export function parseCounter(text) {
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string
 * @returns {Date|null}
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
}

/**
 * Format date for display (e.g., "Jan 15, 2025")
 * @param {Date|string} date - Date object or string
 * @returns {string}
 */
export function formatDate(date) {
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  if (!dateObj) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Parse priority level (Low, Medium, High) → numeric (1, 2, 3)
 * @param {string} priority - Priority string
 * @returns {number}
 */
export function parsePriority(priority) {
  const map = {
    'low': 1,
    'medium': 2,
    'high': 3,
  };
  return map[priority?.toLowerCase()] || 0;
}

/**
 * Parse status string to standard format
 * @param {string} status - Status string
 * @returns {string}
 */
export function parseStatus(status) {
  const normalized = status?.trim().toLowerCase() || '';
  const map = {
    'pending': 'Pending',
    'open': 'Open',
    'in progress': 'In Progress',
    'inprogress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Rejected',
    'closed': 'Closed',
  };
  return map[normalized] || status;
}

/**
 * Parse complaint object from table row text array
 * @param {string[]} rowTexts - Array of cell texts
 * @param {string[]} headers - Column headers
 * @returns {Object}
 */
export function parseComplaintFromRow(rowTexts, headers) {
  const complaint = {};
  headers.forEach((header, idx) => {
    complaint[header.toLowerCase()] = rowTexts[idx]?.trim() || '';
  });
  return complaint;
}
