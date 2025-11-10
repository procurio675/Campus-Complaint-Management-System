import { test, expect } from '@playwright/test';
import { RoleSelectionPage } from '../../src/pages/roleselection.page.js';
import { LoginFormPage } from '../../src/pages/loginform.page.js';
import { StudentDashboardPage } from '../../src/pages/studentdashboard.page.js';
import { AdminDashboardPage } from '../../src/pages/admindashboard.page.js';
import { CommitteeDashboardPage } from '../../src/pages/committeedashboard.page.js';
import { URLS } from '../../src/constants/urls.js';
import users from '../../src/data/users.json' assert { type: 'json' };


// Roles array
const roleTests = [
  {
    role: 'student',
    selectRole: async (roleSelection) => await roleSelection.selectStudentRole(),
    expectedDashboard: URLS.studentDashboard,
    validUser: 'student',
    DashboardPage: StudentDashboardPage 
  },
  {
    role: 'admin',
    selectRole: async (roleSelection) => await roleSelection.selectAdminRole(),
    expectedDashboard: URLS.adminDashboard,
    validUser: 'admin',
    DashboardPage: AdminDashboardPage 
  },
  {
    role: 'committee',
    selectRole: async (roleSelection) => await roleSelection.selectCommitteeRole(),
    expectedDashboard: URLS.committeeDashboard,
    validUser: 'committee',
    DashboardPage: CommitteeDashboardPage
  }
];


//iterate tests for each role
for (const { role, selectRole, expectedDashboard, validUser, DashboardPage } of roleTests) {
  
  //   CI/CD tags @functional and @smoke
  test.describe(`${role.toUpperCase()} Login Functional Tests @functional @smoke`, () => {
    let roleSelectionPage;
    let loginFormPage;
    let dashboardPage; 

    //BEFORE HOOK
    test.beforeEach(async ({ page }) => {

      // Initialize pages
      roleSelectionPage = new RoleSelectionPage(page);
      loginFormPage = new LoginFormPage(page);
      dashboardPage = new DashboardPage(page);

        await test.step('Navigate and select role', async () => {
        await roleSelectionPage.goto();
        await selectRole(roleSelectionPage);
        await loginFormPage.verifyOnPage(role);
      });
    });

   
    test.afterEach(async ({ page }) => {
      const currentUrl = page.url();
      if (currentUrl.includes(expectedDashboard)) {
        await test.step('Logout (if logged in)', async () => {
          try {
            await dashboardPage.doLogout();
            // timeout for stability
            await expect(roleSelectionPage.heading).toBeVisible({ timeout: 5000 });
          } catch (err) {
            // prevents a failing logout from breaking the test
            console.warn(`Logout skipped: ${err.message}`);
          }
        });
      }
    });


    test(`${role}: logs in successfully with valid credentials`, async ({ page }) => {
      const user = users[validUser];
      
          await test.step('Login with valid credentials', async () => {
        await loginFormPage.doLogin(user.email, user.password);
      });
      
         await test.step('Verify successful login', async () => {
        //  timeout for stability
        await expect(page).toHaveURL(expectedDashboard, { timeout: 10000 });
      });
    });

  });
}