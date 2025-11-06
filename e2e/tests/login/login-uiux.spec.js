import { test, expect } from '@playwright/test';
import { RoleSelectionPage } from '../../src/pages/roleselection.page.js';
import { LoginFormPage } from '../../src/pages/loginform.page.js';
import { URLS } from '../../src/constants/urls.js';
import users from '../../src/data/users.json' assert { type: 'json' };

// Roles array
const roleTests = [
  {
    role: 'student',
    selectRole: async (roleSelection) => await roleSelection.selectStudentRole(),
  },
  {
    role: 'admin',
    selectRole: async (roleSelection) => await roleSelection.selectAdminRole(),
  },
  {
    role: 'committee',
    selectRole: async (roleSelection) => await roleSelection.selectCommitteeRole(),
  }
];


// @uiux tag for CI/CD 
for (const { role, selectRole } of roleTests) {

  test.describe(`${role.toUpperCase()} Login UI/UX Tests @uiux`, () => {
    let roleSelectionPage;
    let loginFormPage;

    test.beforeEach(async ({ page }) => {
      roleSelectionPage = new RoleSelectionPage(page);
      loginFormPage = new LoginFormPage(page);
      
      await test.step('Navigate and select role', async () => {
        await roleSelectionPage.goto();
        await selectRole(roleSelectionPage);
        await loginFormPage.verifyOnPage(role);
      });
    });

    test('"Back" button navigates back to role selection', async ({ page }) => {
        await test.step('Click the Back button', async () => {
        await loginFormPage.clickBack();
      });
      
        await test.step('Verify navigation and form is gone', async () => {
        await expect(roleSelectionPage.heading).toBeVisible();
        await expect(page).toHaveURL(URLS.home);
        await expect(loginFormPage.emailInput).not.toBeVisible();
      });
    });

    test('Email and Password fields have correct placeholders', async () => {
        await test.step('Check placeholders', async () => {
        await expect(loginFormPage.emailInput).toHaveAttribute('placeholder', 'Enter your email');
        await expect(loginFormPage.passwordInput).toHaveAttribute('placeholder', 'Enter your password');
      });
    });

    test('Tab key follows correct partial focus order', async ({ page }) => {
        await test.step('Check Tab order from Email to Password', async () => {
        await loginFormPage.emailInput.focus();
        await page.keyboard.press('Tab');
        await expect(loginFormPage.passwordInput).toBeFocused();
      });
    });

    test('Error message disappears on new input', async () => {
      const user = users[role]; // Get the correct user for the role

        await test.step('Trigger a login error', async () => {
        await loginFormPage.doLogin(user.email, 'WrongPassword123');
        await expect(loginFormPage.errorIncorrectPassword).toBeVisible();
      });

        await test.step('Start typing in email field', async () => {
        await loginFormPage.emailInput.fill('new-text@test.com');
      });

      await test.step('Verify error message is hidden', async () => {
        // --- NEW: Real UX Test ---
        await expect(loginFormPage.errorIncorrectPassword).not.toBeVisible();
      });
    });

    test('Password toggle changes input type', async () => {
            await test.step('Check initial password state', async () => {
        await expect(loginFormPage.passwordInput).toHaveAttribute('type', 'password');
      });

        await test.step('Toggle visibility to "text"', async () => {
        await loginFormPage.togglePasswordVisibility();
        await expect(loginFormPage.passwordInput).toHaveAttribute('type', 'text');
      });

        await test.step('Toggle visibility back to "password"', async () => {
          await loginFormPage.togglePasswordVisibility();
        await expect(loginFormPage.passwordInput).toHaveAttribute('type', 'password');
      });
    });
  });
}