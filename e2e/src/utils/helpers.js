/**
 * Miscellaneous Test Helpers
 * Small utility functions that don't fit other categories
 * Single responsibility: generic test utilities
 */

/**
 * Generate test file name with timestamp
 * @param {string} extension - File extension (jpg, png, mp4, pdf, etc)
 * @returns {string} - Generated file name (e.g., test-complaint-1700000000.jpg)
 */
export function generateTestFileName(extension = 'jpg') {
  return `test-complaint-${Date.now()}.${extension}`;
}

/**
 * Check if element is in viewport
 * @param {Locator} locator - Element locator
 * @returns {Promise<boolean>}
 */
export async function isInViewport(locator) {
  return await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
}

/**
 * Scroll element into view
 * @param {Locator} locator - Element locator
 * @returns {Promise<void>}
 */
export async function scrollIntoView(locator) {
  await locator.scrollIntoViewIfNeeded();
}

/**
 * Compare two objects for deep equality
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean}
 */
export function compareObjects(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Take screenshot for debugging/documentation
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @returns {Promise<void>}
 */
export async function takeScreenshot(page, name) {
  const timestamp = Date.now();
  const path = `./test-results/screenshots/${name}-${timestamp}.png`;

  await page.screenshot({
    path,
    fullPage: true,
  });
}

/**
 * Get current timestamp in milliseconds
 * @returns {number}
 */
export function getCurrentTimestamp() {
  return Date.now();
}

/**
 * Format timestamp to readable string
 * @param {number} timestamp - Milliseconds since epoch
 * @returns {string} - Formatted date time (ISO format)
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random string of specified length
 * @param {number} length - String length (default 10)
 * @returns {string}
 */
export function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random email address
 * @returns {string}
 */
export function generateRandomEmail() {
  const randomPart = generateRandomString(8);
  return `test-${randomPart}@example.com`;
}

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string}
 */
export function getEnvVar(key, defaultValue = '') {
  return process.env[key] || defaultValue;
}
