import { test, expect } from '@playwright/test';
import { RoleSelectionPage } from '../../src/pages/roleselection.page.js';
import { LoginFormPage } from '../../src/pages/loginform.page.js';
import { URLS } from '../../src/constants/urls.js';
import users from '../../src/data/users.json' assert { type: 'json' };

// only need to run these validation tests using 1 role (student)
const studentUser = users.student;

test.describe('Login - Validation & Negative Tests @validation @negative', () => {

  let loginFormPage;
  let roleSelectionPage; 

  // BEFORE HOOK
  test.beforeEach(async ({ page }) => {
    roleSelectionPage = new RoleSelectionPage(page);
    loginFormPage = new LoginFormPage(page);

    await test.step('Navigate to Student Login page', async () => {
      await roleSelectionPage.goto();
      await roleSelectionPage.selectStudentRole();
      await loginFormPage.verifyOnPage('student');
    });
  });

  // AFTERHOOK for resetting state
  test.afterEach(async ({ page }) => {
    await page.goto(URLS.home);
  });

  // --- Backend Validation ---

  // --- IMPROVEMENT: Renamed test and added steps ---
  test('should show "Incorrect password" for wrong password', async ({ page }) => {
    await test.step('Attempt login with wrong password', async () => {
      await loginFormPage.doLogin(studentUser.email, 'WrongPassword123');
    });

    await test.step('Verify error message and no redirect', async () => {
      await expect(loginFormPage.errorIncorrectPassword).toBeVisible();
      await expect(page).toHaveURL(URLS.roleLogin);
    });
  });

  test('should show "Account does not exist" for invalid email', async ({ page }) => {
    await test.step('Attempt login with non-existent email', async () => {
      await loginFormPage.doLogin('nonexistent@test.com', 'password123');
    });

    await test.step('Verify error message and no redirect', async () => {
      await expect(loginFormPage.errorAccountDoesNotExist).toBeVisible();
      await expect(page).toHaveURL(URLS.roleLogin);
    });
  });

  test('should show correct error when admin tries to log in as student', async ({ page }) => {
    const message = 'This is a admin account. Please use the admin login portal.';
    
    await test.step('Attempt login with Admin credentials', async () => {
      await loginFormPage.doLogin(users.admin.email, users.admin.password);
    });
    
    await test.step('Verify "wrong role" error message', async () => {
      await expect(loginFormPage.getErrorByText(message)).toBeVisible();
      await expect(page).toHaveURL(URLS.roleLogin);
    });
  });

  // ==== Browser/HTML5 Validation =====
  test('should not submit with empty email and password', async ({ page }) => {
  await test.step('Click login with empty fields', async () => {
    await loginFormPage.loginButton.click();
  });

  await test.step('Verify form did not submit and fields are invalid', async () => {
    await expect(page).toHaveURL(URLS.roleLogin);

    // Check that browser validation is triggered
    const message = await loginFormPage.emailInput.evaluate(el => el.validationMessage);
    expect(message).not.toBe('');
  });
});

test('should not submit with empty password', async ({ page }) => {
  await loginFormPage.emailInput.fill(studentUser.email);
  await loginFormPage.loginButton.click();

  const message = await loginFormPage.passwordInput.evaluate(el => el.validationMessage);
  expect(message).not.toBe('');
});


});