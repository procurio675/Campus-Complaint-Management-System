import { expect } from '@playwright/test';

// This class holds all locators and actions for the SHARED login form
export class LoginFormPage {

  constructor(page) {
    this.page = page;

    // All locators MUST be Playwright Locator objects
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.backButton = page.getByRole('button', { name: '← Back' });
    this.forgotPasswordLink = page.getByRole('button', { name: 'Forgot password?' });

    this.studentHeading = page.getByRole('heading', { name: 'Student Login' });
    this.adminHeading = page.getByRole('heading', { name: 'Admin Login' });
    this.committeeHeading = page.getByRole('heading', { name: 'Committee Login' });

    // FIX: Make error messages Locators, not dynamic methods
    this.errorIncorrectPassword = page.getByText('Incorrect password');
    this.errorAccountDoesNotExist = page.getByText('Account does not exist');
    this.errorMessage = page.locator('p.text-red-500, .text-red-500'); // Generic error locator

    this.passwordToggleShow = page.getByRole('button', { name: 'Show password' });
    this.passwordToggleHide = page.getByRole('button', { name: 'Hide password' });
  }

  getEmailInput() {
    return this.emailInput;
  }

  getPasswordInput() {
    return this.passwordInput;
  }

  getLoginButton() {
    return this.loginButton;
  }

  async verifyOnPage(role) {
    if (role === 'student') {
      await expect(this.studentHeading).toBeVisible();
    } else if (role ==='admin') {
      await expect(this.adminHeading).toBeVisible();
    } else if (role === 'committee') {
      await expect(this.committeeHeading).toBeVisible();
    } else {
      throw new Error("Invalid role specified for verification.");
    }
  }

  async doLogin(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async login(email, password) {
    await this.getEmailInput().fill(email);
    await this.getPasswordInput().fill(password);
    await this.getLoginButton().click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
  
  async togglePasswordVisibility() {
    await this.passwordToggleShow.or(this.passwordToggleHide).click();
  }

  // Helper method to get dynamic error text if needed
  getErrorByText(messageText) {
    return this.page.getByText(messageText, { exact: true });
  }
}