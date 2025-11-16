/**
 * Login Flow - Multi-step authentication
 * Authenticates student and returns session state
 */

import { LoginFormPage } from '../pages/loginform.page.js';

/**
 * Authenticate as student
 * @param {Page} page - Playwright page
 * @param {string} email - Student email
 * @param {string} password - Student password
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function authenticateStudent(page, email, password) {
  const result = { success: false, error: null };
  try {
    const login = new LoginFormPage(page);
    
    // Fill credentials
    await login.getEmailInput().fill(email);
    await login.getPasswordInput().fill(password);
    
    // Submit
    await login.getSubmitButton().click();
    
    // Wait for redirect
    await page.waitForURL('**/student-dashboard', { timeout: 10000 });
    
    // Get token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    
    result.success = true;
    result.token = token;
  } catch (error) {
    result.error = error.message;
  }
  return result;
}

/**
 * Login and verify dashboard loads
 * @param {Page} page - Playwright page
 * @param {string} email - Student email
 * @param {string} password - Student password
 * @returns {Promise<{success: boolean, redirected?: boolean, error?: string}>}
 */
export async function loginAndVerifyRedirect(page, email, password) {
  const result = { success: false, redirected: false, error: null };
  try {
    const login = new LoginFormPage(page);
    
    await login.getEmailInput().fill(email);
    await login.getPasswordInput().fill(password);
    await login.getSubmitButton().click();
    
    // Verify redirect to dashboard
    await page.waitForURL('**/student-dashboard', { timeout: 10000 });
    result.success = true;
    result.redirected = true;
  } catch (error) {
    result.error = error.message;
  }
  return result;
}
