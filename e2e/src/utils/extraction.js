/**
 * Extraction Utilities
 * Text and data extraction from page elements
 * Single responsibility: extracting data from DOM
 */

/**
 * Get all text content from elements matching locator
 * @param {Locator} locator - Element locator (may match multiple elements)
 * @returns {Promise<string[]>}
 */
export async function getAllTexts(locator) {
  const count = await locator.count();
  const values = [];

  for (let i = 0; i < count; i++) {
    const text = await locator.nth(i).textContent();
    values.push(text?.trim() || '');
  }

  return values;
}

/**
 * Extract all numbers from text string
 * @param {string} text - Text to extract from
 * @returns {number[]}
 */
export function extractNumbers(text) {
  const matches = text?.match(/\d+/g) || [];
  return matches.map(Number);
}

/**
 * Extract first number from text
 * @param {string} text - Text to extract from
 * @returns {number|null}
 */
export function extractFirstNumber(text) {
  const numbers = extractNumbers(text);
  return numbers.length > 0 ? numbers[0] : null;
}

/**
 * Extract URL from href attribute
 * @param {Locator} locator - Link element
 * @returns {Promise<string|null>}
 */
export async function extractHref(locator) {
  return await locator.getAttribute('href');
}

/**
 * Extract attribute value from element
 * @param {Locator} locator - Element locator
 * @param {string} attributeName - Attribute name (class, id, data-*, etc)
 * @returns {Promise<string|null>}
 */
export async function extractAttribute(locator, attributeName) {
  return await locator.getAttribute(attributeName);
}

/**
 * Extract all data-testid values from elements
 * @param {Locator} locator - Element locator (may match multiple)
 * @returns {Promise<string[]>}
 */
export async function extractTestIds(locator) {
  const count = await locator.count();
  const ids = [];

  for (let i = 0; i < count; i++) {
    const id = await locator.nth(i).getAttribute('data-testid');
    if (id) ids.push(id);
  }

  return ids;
}

/**
 * Extract text from multiple elements as key-value pairs
 * Useful for table rows, form fields, etc
 * @param {Locator} labelLocator - Labels (e.g., column headers)
 * @param {Locator} valueLocator - Values (e.g., column values)
 * @returns {Promise<Object>}
 */
export async function extractKeyValuePairs(labelLocator, valueLocator) {
  const labels = await getAllTexts(labelLocator);
  const values = await getAllTexts(valueLocator);

  const result = {};
  labels.forEach((label, idx) => {
    result[label] = values[idx] || '';
  });

  return result;
}
