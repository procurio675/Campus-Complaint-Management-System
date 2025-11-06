import { expect } from '@playwright/test';

 export class RoleSelectionPage {

    //create constructor which contains all locators 
    /**
     * 
     * @param {import('@playwright/test'.Page)} page //JSdoc comment
     * //tells what type of argument is 'page' ( for autocompletion purposes)
     */
    constructor(page){
        this.page = page;
        this.heading = page.getByRole('heading',{name : 'Campus Complaint Resolve'});
        this.subHeading = page.getByText('Select your role to continue', { exact: true });
        this.loginAsAdminButton = page.getByRole('button',{ name: 'Login as Admin' });
        this.loginAsStudentButton = page.getByRole('button', { name: 'Login as Student' });
        this.loginAsCommitteeButton = page.getByRole('button', { name: 'Login as Committee' });
    }

    //Actions - Reusable functions 

    //1 . Go to Url stored in Base_URL in .env folder
    async goto() {
        await this.page.goto('/');
        await expect(this.heading).toBeVisible();

    }

    //2. Click Login as Student button
     async selectStudentRole() {
        await this.loginAsStudentButton.click();
    }

    // 3. Click Login as Admin button
    async selectAdminRole() {
        await this.loginAsAdminButton.click();
    }

    // 4. Click Login as Committee button
    async selectCommitteeRole() {
        await this.loginAsCommitteeButton.click();
    }

}

// module.exports = { RoleSelectionPage };
