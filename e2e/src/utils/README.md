/**
 * E2E Test Utilities - Architecture & Usage Guide
 * 
 * STRUCTURE:
 * e2e/src/utils/
 * ├── waits.js         (Wait patterns)
 * ├── storage.js       (LocalStorage management)
 * ├── extraction.js    (DOM text/data extraction)
 * ├── parsers.js       (Domain-specific parsing)
 * ├── assertions.js    (Test assertions - NO BOOLEAN RETURNS)
 * ├── helpers.js       (Misc utilities)
 * └── index.js         (Central exports)
 */

// ============================================================================
// 1. WAITS - Playwright best practices (NOT flaky arbitrary timeouts)
// ============================================================================

import {
  waitForComplaintRow,      // Wait for specific complaint in table
  waitForNetworkIdle,       // Wait for network to settle
  waitAndClick,             // Wait then click
  waitAndFill,              // Wait then fill input
  waitForMultipleElements,  // Wait for multiple elements
  waitForHidden,            // Wait for element to disappear
  retryWithBackoff,         // Retry with exponential backoff
} from './waits.js';

// EXAMPLES:
// await waitAndClick(page.getByTestId('submit-btn'));
// await waitAndFill(page.getByTestId('email-input'), 'test@example.com');
// await retryWithBackoff(() => apiCall(), 3, 1000);

// ============================================================================
// 2. STORAGE - LocalStorage only
// ============================================================================

import {
  clearLocalStorage,        // Clear all localStorage
  getStorageValue,          // Get value by key
  setStorageValue,          // Set key-value pair
  removeStorageValue,       // Remove specific key
  hasStorageKey,            // Check if key exists
} from './storage.js';

// EXAMPLES:
// const token = await getStorageValue(page, 'authToken');
// await setStorageValue(page, 'authToken', 'xyz123');
// await clearLocalStorage(page);

// ============================================================================
// 3. EXTRACTION - Text & data from DOM (NO PARSING)
// ============================================================================

import {
  getAllTexts,              // Get text from all matching elements
  extractNumbers,           // Extract all numbers from string
  extractFirstNumber,       // Get first number only
  extractHref,              // Get href from link
  extractAttribute,         // Get any attribute value
  extractTestIds,           // Get all data-testid values
  extractKeyValuePairs,     // Extract label-value pairs (e.g., table row)
} from './extraction.js';

// EXAMPLES:
// const statValues = await getAllTexts(page.getByTestId(/complaint-upvote-count-/));
// const numbers = extractNumbers('42 / 200');  // Returns [42, 200]
// const href = await extractHref(page.locator('a'));
// const testIds = await extractTestIds(page.locator('[data-testid]'));

// ============================================================================
// 4. PARSERS - Domain-specific formatting
// ============================================================================

import {
  formatComplaintId,        // Format complaint ID (123abc → CC3ABC)
  parseFormattedComplaintId,// Parse CC3ABC → 3abc
  parseCounter,             // Parse counter text (42 / 200 → 42)
  parseDate,                // Parse date string to Date object
  formatDate,               // Format date nicely
  parsePriority,            // Parse priority to number (Low=1, Medium=2, High=3)
  parseStatus,              // Normalize status strings
  parseComplaintFromRow,    // Parse table row into complaint object
} from './parsers.js';

// EXAMPLES:
// const id = formatComplaintId('507f1f77bcf86cd799439012');  // 'CC99039012'
// const count = parseCounter('42 / 200');  // 42
// const date = formatDate('2025-01-15');   // 'Jan 15, 2025'
// const priority = parsePriority('High');  // 3

// ============================================================================
// 5. ASSERTIONS - NO BOOLEAN RETURNS (THROW ON FAILURE)
// ============================================================================

import {
  assertErrorMessage,           // Assert error visible
  assertSuccessMessage,         // Assert success visible
  assertComplaintRowExists,     // Assert complaint in table
  assertComplaintRowNotExists,  // Assert complaint NOT in table
  assertElementContainsText,    // Assert text content
  assertElementValue,           // Assert input value
  assertElementVisible,         // Assert element visible
  assertElementNotVisible,      // Assert element NOT visible
  assertElementEnabled,         // Assert button/input enabled
  assertElementDisabled,        // Assert button/input disabled
  assertUrlContains,            // Assert URL contains string
  assertNumberEquals,           // Assert number value
  assertArrayContains,          // Assert array has item
  assertObjectMatches,          // Assert object properties
} from './assertions.js';

// EXAMPLES:
// await assertErrorMessage(page, 'Email already exists');
// await assertSuccessMessage(page, 'Complaint filed successfully');
// await assertComplaintRowExists(page, 'xyz123');
// await assertElementVisible(page.getByTestId('submit-btn'));
// assertNumberEquals(42, 42, 0);

// ⚠️ IMPORTANT: These THROW on failure (test fails immediately)
// NO MORE: if (visible) { expect... }
// YES: await assertElementVisible(locator);  // Throws if not visible

// ============================================================================
// 6. HELPERS - Miscellaneous utilities
// ============================================================================

import {
  generateTestFileName,         // Generate random file name with timestamp
  isInViewport,                 // Check if element in viewport
  scrollIntoView,               // Scroll element into view
  compareObjects,               // Deep compare two objects
  takeScreenshot,               // Take screenshot for debugging
  getCurrentTimestamp,          // Get current time in ms
  formatTimestamp,              // Format timestamp to ISO string
  sleep,                        // Sleep for ms
  generateRandomString,         // Generate random string
  generateRandomEmail,          // Generate random email
  getEnvVar,                    // Get env variable with fallback
} from './helpers.js';

// EXAMPLES:
// const fileName = generateTestFileName('jpg');  // 'test-complaint-1700000000.jpg'
// await sleep(500);  // Wait 500ms
// const email = generateRandomEmail();  // 'test-a1b2c3d4@example.com'
// const timestamp = getCurrentTimestamp();

// ============================================================================
// 7. CENTRALIZED IMPORT (RECOMMENDED)
// ============================================================================

// Import everything from index.js:
import {
  waitAndClick,
  parseDate,
  assertErrorMessage,
  generateTestFileName,
  extractNumbers,
} from './index.js';

// ============================================================================
// 8. USAGE PATTERNS
// ============================================================================

// PATTERN 1: Wait + Assert
async function exampleWaitAssert(page) {
  const submitBtn = page.getByTestId('submit-btn');
  await waitAndClick(submitBtn);  // Wait for visible, then click
  await assertSuccessMessage(page, 'Submitted successfully');
}

// PATTERN 2: Extract + Parse
async function exampleExtractParse(page) {
  const texts = await getAllTexts(page.getByTestId(/stat-value-/));
  const numbers = texts.map(text => parseCounter(text));
  assertNumberEquals(numbers[0], 42);
}

// PATTERN 3: Storage
async function exampleStorage(page) {
  const token = await getStorageValue(page, 'authToken');
  if (token) {
    await removeStorageValue(page, 'authToken');
  }
}

// PATTERN 4: Retry with backoff
async function exampleRetry() {
  const result = await retryWithBackoff(async () => {
    return await fetchComplaintData();  // Retry if fails
  }, 3, 1000);
}

// ============================================================================
// 9. BEST PRACTICES
// ============================================================================

// ✅ DO:
// - Use specific extraction functions (extractNumbers, not regex)
// - Use assertions that throw (fail fast)
// - Use proper waits (NOT arbitrary setTimeout)
// - Group related utilities by file (waits.js, parsers.js, etc)
// - Import from index.js for convenience

// ❌ DON'T:
// - Check boolean returns from assertions (they throw instead)
// - Use arbitrary page.waitForTimeout(500)
// - Mix parsing logic with test logic
// - Return boolean from assertion helpers
// - Create new util files without discussing single responsibility

// ============================================================================
// 10. FILE ORGANIZATION SUMMARY
// ============================================================================

/**
 * WAITS.JS (6 functions)
 * Purpose: Proper Playwright wait patterns
 * Usage: Before clicking, filling, or doing DOM operations
 * 
 * STORAGE.JS (5 functions)
 * Purpose: LocalStorage management
 * Usage: Get/set/clear browser storage
 * 
 * EXTRACTION.JS (7 functions)
 * Purpose: Extract raw text/data from page (NO parsing)
 * Usage: Get texts, numbers, attributes from elements
 * 
 * PARSERS.JS (8 functions)
 * Purpose: Parse domain objects (IDs, dates, status, priority)
 * Usage: Format complaint IDs, parse dates, normalize statuses
 * 
 * ASSERTIONS.JS (14 functions)
 * Purpose: Domain-specific assertions (NO boolean returns)
 * Usage: Assert elements visible, values correct, errors shown
 * Key: All functions THROW on failure (test fails immediately)
 * 
 * HELPERS.JS (11 functions)
 * Purpose: Miscellaneous test utilities
 * Usage: Generate random data, take screenshots, compare objects
 * 
 * INDEX.JS
 * Purpose: Central export point for all utilities
 * Usage: import * from './index.js'
 */
