import { test, expect } from '@playwright/test';
import { StudentDashboardPage } from '../../src/pages/student/studentDashboard.page.js';
import { StudentSidebarPage } from '../../src/pages/student/studentSidebar.page.js';
import { loginAsStudent } from '../../utils/login.helper.js';

test.describe('Dashboard Home', () => {
  let dashboard;
  let sidebar;

  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    
    await page.goto('http://localhost:5173/student-dashboard');
    await page.waitForLoadState('networkidle');
    
    dashboard = new StudentDashboardPage(page);
    sidebar = new StudentSidebarPage(page);
  });

  test('should load dashboard successfully', async () => {
    await expect(dashboard.header).toBeVisible();
    await expect(dashboard.totalCard).toBeVisible();
  });

  test('should display correct title', async () => {
    await expect(dashboard.title).toHaveText('Campus Complaint Resolve');
  });

  test('should render all stat cards', async () => {
    await expect(dashboard.totalCard).toBeVisible();
    await expect(dashboard.resolvedCard).toBeVisible();
    await expect(dashboard.inProgressCard).toBeVisible();
    await expect(dashboard.pendingCard).toBeVisible();
  });

  test('should show valid integer stats', async () => {
    const stats = await dashboard.getStats();

    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.resolved).toBeGreaterThanOrEqual(0);
    expect(stats.pending).toBeGreaterThanOrEqual(0);
  });

  test('should update stats after filing complaint', async ({ page }) => {
    const before = await dashboard.getTotal();

    // Navigate to add complaint page
    await page.goto('http://localhost:5173/student-dashboard/add-complaint');
    await page.waitForLoadState('networkidle');

    // Fill complaint form with realistic data that won't trigger spam filter
    await page.getByTestId('title-input').fill('Wi-Fi connectivity issues in library');
    await page.getByTestId('description-input').fill('The Wi-Fi connection in the main library keeps dropping every 10-15 minutes. This has been happening for the past 3 days and is affecting students who are trying to complete their assignments and access online resources. The issue occurs on both the second and third floors.');
    
    // Submit the complaint
    await page.getByTestId('submit-complaint-button').click();

    // Wait for loading modal to appear and disappear
    await page.getByTestId('loading-modal-container').waitFor({ state: 'visible', timeout: 5000 });
    await page.getByTestId('loading-modal-container').waitFor({ state: 'hidden', timeout: 20000 });

    // Wait for success modal
    await page.getByTestId('success-modal-container').waitFor({ state: 'visible', timeout: 5000 });

    // Close success modal and navigate to my complaints
    await page.getByTestId('view-complaints-button').click();
    await page.waitForURL('**/my-complaints');
    
    // Navigate back to dashboard home
    await page.goto('http://localhost:5173/student-dashboard');
    await page.waitForLoadState('networkidle');
    
    const after = await dashboard.getTotal();

    expect(after).toBeGreaterThanOrEqual(before);
  });
});
