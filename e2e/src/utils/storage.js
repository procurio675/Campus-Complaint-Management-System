/**
 * Storage Utilities
 * LocalStorage ONLY helpers
 * Single responsibility: managing browser storage
 */

/**
 * Clear all localStorage
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function clearLocalStorage(page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get value from localStorage
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @returns {Promise<string|null>}
 */
export async function getStorageValue(page, key) {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Set value in localStorage
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {Promise<void>}
 */
export async function setStorageValue(page, key, value) {
  await page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
}

/**
 * Remove specific key from localStorage
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function removeStorageValue(page, key) {
  await page.evaluate((k) => localStorage.removeItem(k), key);
}

/**
 * Check if key exists in localStorage
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @returns {Promise<boolean>}
 */
export async function hasStorageKey(page, key) {
  return await page.evaluate((k) => localStorage.hasOwnProperty(k), key);
}
