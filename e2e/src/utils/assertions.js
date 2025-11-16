/**
 * Assertion Helpers
 * NO BOOLEAN RETURNS - Use Playwright expect() directly
 * Failed assertions throw immediately (tests fail fast)
 * Single responsibility: Domain-specific assertions
 */

import { expect } from '@playwright/test';

/**
 * Assert error message is visible on page
 * THROWS if message not found (test fails immediately)
 * @param {Page} page - Playwright page object
 * @param {string} expectedMessage - Error message text
 * @returns {Promise<void>}
 */
export async function assertErrorMessage(page, expectedMessage) {
  const locator = page.locator(`text="${expectedMessage}"`);
  await expect(locator).toBeVisible({ timeout: 5000 });
}

/**
 * Assert success message is visible on page
 * THROWS if message not found
 * @param {Page} page - Playwright page object
 * @param {string} expectedMessage - Success message text
 * @returns {Promise<void>}
 */
export async function assertSuccessMessage(page, expectedMessage) {
  const locator = page.locator(`text="${expectedMessage}"`);
  await expect(locator).toBeVisible({ timeout: 5000 });
}

/**
 * Assert complaint row exists in table
 * @param {Page} page - Playwright page object
 * @param {string} complaintId - Complaint ID
 * @returns {Promise<void>}
 */
export async function assertComplaintRowExists(page, complaintId) {
  const row = page.getByTestId(`complaint-row-${complaintId}`);
  await expect(row).toBeVisible();
}

/**
 * Assert complaint row does NOT exist
 * @param {Page} page - Playwright page object
 * @param {string} complaintId - Complaint ID
 * @returns {Promise<void>}
 */
export async function assertComplaintRowNotExists(page, complaintId) {
  const row = page.getByTestId(`complaint-row-${complaintId}`);
  await expect(row).not.toBeVisible();
}

/**
 * Assert element contains specific text
 * @param {Locator} locator - Element locator
 * @param {string} expectedText - Expected text
 * @returns {Promise<void>}
 */
export async function assertElementContainsText(locator, expectedText) {
  await expect(locator).toContainText(expectedText);
}

/**
 * Assert element has specific value
 * @param {Locator} locator - Element locator
 * @param {string} expectedValue - Expected value
 * @returns {Promise<void>}
 */
export async function assertElementValue(locator, expectedValue) {
  await expect(locator).toHaveValue(expectedValue);
}

/**
 * Assert element is visible
 * @param {Locator} locator - Element locator
 * @returns {Promise<void>}
 */
export async function assertElementVisible(locator) {
  await expect(locator).toBeVisible();
}

/**
 * Assert element is NOT visible
 * @param {Locator} locator - Element locator
 * @returns {Promise<void>}
 */
export async function assertElementNotVisible(locator) {
  await expect(locator).not.toBeVisible();
}

/**
 * Assert element is enabled
 * @param {Locator} locator - Element locator (button, input, etc)
 * @returns {Promise<void>}
 */
export async function assertElementEnabled(locator) {
  await expect(locator).toBeEnabled();
}

/**
 * Assert element is disabled
 * @param {Locator} locator - Element locator
 * @returns {Promise<void>}
 */
export async function assertElementDisabled(locator) {
  await expect(locator).toBeDisabled();
}

/**
 * Assert page URL contains string
 * @param {Page} page - Playwright page object
 * @param {string} expectedUrlPart - Expected URL part
 * @returns {Promise<void>}
 */
export async function assertUrlContains(page, expectedUrlPart) {
  await expect(page).toHaveURL(new RegExp(expectedUrlPart));
}

/**
 * Assert numeric value within range
 * @param {number} actual - Actual value
 * @param {number} expected - Expected value
 * @param {number} tolerance - Acceptable difference (default 0)
 * @returns {void} - Throws if out of range
 */
export function assertNumberEquals(actual, expected, tolerance = 0) {
  expect(actual).toBeCloseTo(expected, tolerance);
}

/**
 * Assert array contains item
 * @param {any[]} array - Array to check
 * @param {any} item - Item to find
 * @returns {void}
 */
export function assertArrayContains(array, item) {
  expect(array).toContain(item);
}

/**
 * Assert object properties match expected
 * @param {Object} actual - Actual object
 * @param {Object} expected - Expected properties
 * @returns {void}
 */
export function assertObjectMatches(actual, expected) {
  expect(actual).toMatchObject(expected);
}
