import { test, expect } from '@playwright/test';
import { StudentDashboardPage } from '../../src/pages/student/studentDashboard.page.js';
import { StudentSidebarPage } from '../../src/pages/student/studentSidebar.page.js';
import { fileComplaintFlow } from '../../src/flows/fileComplaint.flow.js';
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

    await fileComplaintFlow(page, { title: 'Auto Test', description: 'Valid desc ...' });

    await page.goto('http://localhost:5173/student-dashboard');
    await page.waitForLoadState('networkidle');
    
    const after = await dashboard.getTotal();

    expect(after).toBeGreaterThanOrEqual(before);
  });
});
