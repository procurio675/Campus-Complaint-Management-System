import { test, expect } from '@playwright/test';
import { StudentSidebarPage } from '../../src/pages/student/studentSidebar.page.js';
import { StudentDashboardPage } from '../../src/pages/student/studentDashboard.page.js';
import { AddComplaintPage } from '../../src/pages/student/addComplaint.page.js';
import { MyComplaintsPage } from '../../src/pages/student/myComplaints.page.js';
import { apiLogin } from '../../src/api/auth.api.js';
import users from '../../src/data/users.json' assert { type: 'json' };

test.describe('Student Dashboard - Sidebar Navigation', () => {
  let sidebar;
  let dashboard;

  test.beforeEach(async ({ page }) => {
    // API login and inject localStorage
    const { token, user } = await apiLogin(users.student.email, users.student.password, 'student');
    
    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('ccms_token', token);
      localStorage.setItem('ccms_user', JSON.stringify(user));
    }, { token, user });

    await page.goto('http://localhost:5173/student-dashboard');
    await page.waitForLoadState('networkidle');

    sidebar = new StudentSidebarPage(page);
    dashboard = new StudentDashboardPage(page);
  });

  test('should display all navigation links', async ({ page }) => {
    // Verify all links are visible
    const links = [
      'sidebar-home-link',
      'sidebar-add-complaint-link',
      'sidebar-my-complaints-link',
      'sidebar-all-complaints-link',
    ];

    for (const link of links) {
      const element = page.getByTestId(link);
      await expect(element).toBeVisible();
    }
  });

  test('should navigate to dashboard home', async ({ page }) => {
    // Click home link
    await sidebar.clickHomeLink();
    await page.waitForURL('**/student-dashboard');

    // Verify dashboard cards are visible
    const totalCard = page.getByTestId('dashboard-card-total');
    await expect(totalCard).toBeVisible();
  });

  test('should navigate to add complaint page', async ({ page }) => {
    // Click add complaint link
    await sidebar.clickAddComplaintLink();
    await page.waitForURL('**/add-complaint');

    // Verify add complaint page content is visible
    const formTitle = page.getByRole('heading', { name: /File a New Complaint/i });
    await expect(formTitle).toBeVisible();

    // Title input can be located via its placeholder text
    const titleInput = page.getByPlaceholder(/Wi-Fi not working/i);
    await expect(titleInput).toBeVisible();
  });

  test('should navigate to my complaints', async ({ page }) => {
    // Click my complaints link
    await sidebar.clickMyComplaintsLink();
    await page.waitForURL('**/my-complaints');

    // Verify My Complaints page heading and table
    const heading = page.getByRole('heading', { name: /My Complaints/i });
    await expect(heading).toBeVisible();

    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('should navigate to all complaints', async ({ page }) => {
    // Click all complaints link
    await sidebar.clickAllComplaintsLink();
    await page.waitForURL('**/all-complaints');

    // Verify all complaints page loaded
    const pageTitle = page.getByRole('heading', { name: /All Complaints/i });
    await expect(pageTitle).toBeVisible();
  });

  test('should highlight active navigation link', async ({ page }) => {
    // Initially on dashboard home
    const homeLink = page.getByTestId('sidebar-home-link');
    let isActive = await sidebar.isLinkActive('sidebar-home-link');
    expect(isActive).toBeTruthy();

    // Navigate to add complaint
    await sidebar.clickAddComplaintLink();
    await page.waitForURL('**/add-complaint');

    // Verify add complaint link is now active
    isActive = await sidebar.isLinkActive('sidebar-add-complaint-link');
    expect(isActive).toBeTruthy();

    // Verify home link is no longer active
    isActive = await sidebar.isLinkActive('sidebar-home-link');
    expect(isActive).toBeFalsy();
  });

  test('should maintain sidebar visibility during navigation', async ({ page }) => {
    const sidebarElement = page.getByTestId('sidebar-container');
    await expect(sidebarElement).toBeVisible();

    // Navigate through different pages
    await sidebar.clickAddComplaintLink();
    await page.waitForURL('**/add-complaint');
    await expect(sidebarElement).toBeVisible();

    await sidebar.clickMyComplaintsLink();
    await page.waitForURL('**/my-complaints');
    await expect(sidebarElement).toBeVisible();

    await sidebar.clickAllComplaintsLink();
    await page.waitForURL('**/all-complaints');
    await expect(sidebarElement).toBeVisible();
  });

  test('should navigate between pages quickly', async ({ page }) => {
    // Home → Add → My → All → Home
    const navigation = [
      { link: 'sidebar-add-complaint-link', url: '**/add-complaint' },
      { link: 'sidebar-my-complaints-link', url: '**/my-complaints' },
      { link: 'sidebar-all-complaints-link', url: '**/all-complaints' },
      { link: 'sidebar-home-link', url: '**/student-dashboard' },
    ];

    for (const nav of navigation) {
      const link = page.getByTestId(nav.link);
      await link.click();
      await page.waitForURL(nav.url);

      // Verify page loaded
      const isActive = await sidebar.isLinkActive(nav.link);
      expect(isActive).toBeTruthy();
    }
  });
});
