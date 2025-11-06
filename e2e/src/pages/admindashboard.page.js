import { expect } from '@playwright/test';

export class AdminDashboardPage {

    constructor(page) {
        this.page = page;

        // Locators
        this.heading = page.getByText('Welcome to the Admin Dashboard');
    }

    //clicks profile and then clicks logout
    async doLogout() {

       // a mock routing for demo as page not developed yet
        await this.page.goto('/');
    }
}