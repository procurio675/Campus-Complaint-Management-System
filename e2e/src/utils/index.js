/**
 * E2E Test Utils Index
 * Central export point for all utility modules
 *
 * USAGE:
 * import { waitAndClick, parseDate, assertErrorMessage } from '../../src/utils/index.js';
 *
 * OR import from specific modules:
 * import { waitAndClick } from '../../src/utils/waits.js';
 * import { parseDate } from '../../src/utils/parsers.js';
 * import { assertErrorMessage } from '../../src/utils/assertions.js';
 */

// Wait utilities
export {
  waitForComplaintRow,
  waitForNetworkIdle,
  waitAndClick,
  waitAndFill,
  waitForMultipleElements,
  waitForHidden,
  retryWithBackoff,
} from './waits.js';

// Storage utilities
export {
  clearLocalStorage,
  getStorageValue,
  setStorageValue,
  removeStorageValue,
  hasStorageKey,
} from './storage.js';

// Extraction utilities
export {
  getAllTexts,
  extractNumbers,
  extractFirstNumber,
  extractHref,
  extractAttribute,
  extractTestIds,
  extractKeyValuePairs,
} from './extraction.js';

// Parser utilities
export {
  formatComplaintId,
  parseFormattedComplaintId,
  parseCounter,
  parseDate,
  formatDate,
  parsePriority,
  parseStatus,
  parseComplaintFromRow,
} from './parsers.js';

// Assertion utilities
export {
  assertErrorMessage,
  assertSuccessMessage,
  assertComplaintRowExists,
  assertComplaintRowNotExists,
  assertElementContainsText,
  assertElementValue,
  assertElementVisible,
  assertElementNotVisible,
  assertElementEnabled,
  assertElementDisabled,
  assertUrlContains,
  assertNumberEquals,
  assertArrayContains,
  assertObjectMatches,
} from './assertions.js';

// Helper utilities
export {
  generateTestFileName,
  isInViewport,
  scrollIntoView,
  compareObjects,
  takeScreenshot,
  getCurrentTimestamp,
  formatTimestamp,
  sleep,
  generateRandomString,
  generateRandomEmail,
  getEnvVar,
} from './helpers.js';
