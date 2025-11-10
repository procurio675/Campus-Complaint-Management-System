import { expect } from '@playwright/test';

export class CommitteeDashboardPage {

    constructor(page) {
        this.page = page;
        // Locators
        this.profileMenu = page.getByText('Committee Name', { exact: true });
        this.logoutButton = page.getByRole('button', { name: 'Logout' });
    }

    //clicks profile and then clicks logout
    async doLogout() {
        await this.profileMenu.click();
        await this.logoutButton.click();
    }
}