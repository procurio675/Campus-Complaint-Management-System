import { expect } from '@playwright/test';

export class StudentDashboardPage {

    constructor(page) {
        this.page = page;

        // Locators
        this.profileMenu = page.getByRole('button').filter({ hasText: 'Name' });
        this.logoutButton = page.getByRole('button', { name: 'Logout' });
    }

   //clicks profile and then clicks logout
    async doLogout() {
        await this.profileMenu.click();
        await this.logoutButton.click();
    }
}