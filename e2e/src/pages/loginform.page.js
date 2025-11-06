import { expect } from '@playwright/test';

// This class holds all locators and actions for the SHARED login form
 export class LoginFormPage {

    constructor(page) {
        this.page = page;

        //Locators
        this.emailInput = page.getByPlaceholder('Enter your email');
        this.passwordInput = page.getByLabel('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.backButton = page.getByRole('button', { name: '← Back' });
        this.forgotPasswordLink = page.getByRole('button', { name: 'Forgot password?' });

        //password toggle button
        this.passwordToggle = page.getByLabel('Show password');
        // Dynamic heading for different roles
        this.studentHeading = page.getByRole('heading', { name: 'Student Login' });
        this.adminHeading = page.getByRole('heading', { name: 'Admin Login' });
        this.committeeHeading = page.getByRole('heading', { name: 'Committee Login' });

        // Locators for error messages
        this.errorIncorrectPassword = page.getByText('Incorrect password');
        this.errorAccountDoesNotExist = page.getByText('Account does not exist');
        this.errorIsAdminAccount = page.getByText('This is a admin account. Please use the admin login portal.');
        this.errorIsCommitteeAccount = page.getByText('This is a committee account. Please use the committee login portal.');
        this.errorIsStudentAccount = page.getByText('This is a student account. Please use the student login portal.');
        
    }

    //Actions (reusable functions)

    // 1. Checks that we are on the correct login page based on role
    async verifyOnPage(role) {
        if (role === 'student') {
            await expect(this.studentHeading).toBeVisible();
        } else if (role === 'admin') {
            await expect(this.adminHeading).toBeVisible();
        } else if (role === 'committee') {
            await expect(this.committeeHeading).toBeVisible();
        } else {
            throw new Error("Invalid role specified for verification.");
        }
    }

    // 2. Fills email, password and clicks the Login button.
    async doLogin(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    // 3. Clicks the 'Back' button to return to the role selection page.
    async clickBack() {
        await this.backButton.click();
    }

    //4 . Clicks the 'Forgot password?' link.

    //5. Add dynamic error message locator
     errorMessage(messageText) {
        return this.page.getByText(messageText, { exact: true });
    }
}

// module.exports = { LoginFormPage };