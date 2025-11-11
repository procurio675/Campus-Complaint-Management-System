import { expect } from '@playwright/test';

export class StudentDashboardPage {

    constructor(page) {
        this.page = page;

        // Locators
        // The header contains multiple buttons; the profile menu is typically the second button (after notifications).
        // Use a positional locator so tests don't depend on the displayed name text.
        this.profileMenu = page.locator('header').getByRole('button').nth(1);
        this.logoutButton = page.getByRole('button', { name: /logout/i });
    }

   //clicks profile and then clicks logout
    async doLogout() {
        await this.profileMenu.click();
        await this.logoutButton.click();
    }
}