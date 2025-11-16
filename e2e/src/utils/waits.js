/**
 * Wait Utilities
 * Proper Playwright wait patterns (NOT flaky arbitrary timeouts)
 * Single responsibility: waiting for elements and network states
 */

/**
 * Wait for complaint row to appear in table
 * @param {Page} page - Playwright page object
 * @param {string} complaintId - Complaint ID
 * @param {number} timeout - Timeout in ms (default 15000)
 * @returns {Promise<void>}
 */
export async function waitForComplaintRow(page, complaintId, timeout = 15000) {
  await page.getByTestId(`complaint-row-${complaintId}`).waitFor({ state: 'visible', timeout });
}

/**
 * Wait for network to be idle (no pending requests)
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function waitForNetworkIdle(page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for element to be visible then click
 * @param {Locator} locator - Element locator
 * @param {number} timeout - Timeout in ms (default 5000)
 * @returns {Promise<void>}
 */
export async function waitAndClick(locator, timeout = 5000) {
  await locator.waitFor({ state: 'visible', timeout });
  await locator.click();
}

/**
 * Wait for element to be visible then fill
 * @param {Locator} locator - Element locator
 * @param {string} value - Value to fill
 * @param {number} timeout - Timeout in ms (default 5000)
 * @returns {Promise<void>}
 */
export async function waitAndFill(locator, value, timeout = 5000) {
  await locator.waitFor({ state: 'visible', timeout });
  await locator.fill(value);
}

/**
 * Wait for multiple elements to be visible
 * @param {Page} page - Playwright page object
 * @param {string[]} testIds - Array of test IDs
 * @returns {Promise<void>}
 */
export async function waitForMultipleElements(page, testIds) {
  for (const testId of testIds) {
    await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 5000 });
  }
}

/**
 * Wait for element to disappear/hide
 * @param {Locator} locator - Element locator
 * @param {number} timeout - Timeout in ms (default 10000)
 * @returns {Promise<void>}
 */
export async function waitForHidden(locator, timeout = 10000) {
  await locator.waitFor({ state: 'hidden', timeout });
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts (default 3)
 * @param {number} delayMs - Initial delay in ms (default 1000)
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(fn, maxRetries = 3, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      const delay = delayMs * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
