import { expect } from '@playwright/test';

export class CommitteeDashboardPage {

    constructor(page) {
        this.page = page;
        // Locators
        // Use header positional button like StudentDashboardPage so tests don't depend on placeholder text
        this.profileMenu = page.locator('header').getByRole('button').nth(1);
        this.logoutButton = page.getByRole('button', { name: /logout/i });
    }

    //clicks profile and then clicks logout
    async doLogout() {
        await this.profileMenu.click();
        await this.logoutButton.click();
    }
}