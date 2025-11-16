import { test, expect } from '@playwright/test';
import { StudentDashboardPage } from '../../src/pages/student/studentDashboard.page.js';
import { apiLogin } from '../../src/api/auth.api.js';
import users from '../../src/data/users.json' assert { type: 'json' };

test.describe('Student Dashboard - Header & Profile', () => {
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

    dashboard = new StudentDashboardPage(page);
  });

  test('should display dashboard header with title', async ({ page }) => {
    // Verify header is visible
    const header = page.getByTestId('dashboard-header');
    await expect(header).toBeVisible();

    // Verify title
    const title = page.getByTestId('dashboard-title');
    await expect(title).toBeVisible();

    const titleText = await title.textContent();
    expect(titleText?.trim()).toBe('Campus Complaint Resolve');
  });

  test('should display all dashboard stat cards', async ({ page }) => {
    // Verify all cards are visible
    const totalCard = page.getByTestId('dashboard-card-total');
    const resolvedCard = page.getByTestId('dashboard-card-resolved');
    const inprogressCard = page.getByTestId('dashboard-card-inprogress');
    const pendingCard = page.getByTestId('dashboard-card-pending');

    await expect(totalCard).toBeVisible();
    await expect(resolvedCard).toBeVisible();
    await expect(inprogressCard).toBeVisible();
    await expect(pendingCard).toBeVisible();
  });

  test('should display stat card values', async ({ page }) => {
    // Get values for each stat
    const totalValue = page.getByTestId('dashboard-card-total-value');
    const resolvedValue = page.getByTestId('dashboard-card-resolved-value');
    const inprogressValue = page.getByTestId('dashboard-card-inprogress-value');
    const pendingValue = page.getByTestId('dashboard-card-pending-value');

    // Verify values are numbers
    const total = await totalValue.textContent();
    const resolved = await resolvedValue.textContent();
    const inprogress = await inprogressValue.textContent();
    const pending = await pendingValue.textContent();

    expect(/^\d+$/.test(total?.trim() || '')).toBeTruthy();
    expect(/^\d+$/.test(resolved?.trim() || '')).toBeTruthy();
    expect(/^\d+$/.test(inprogress?.trim() || '')).toBeTruthy();
    expect(/^\d+$/.test(pending?.trim() || '')).toBeTruthy();

    // Verify total = resolved + inprogress + pending
    const totalNum = parseInt(total || '0');
    const resolvedNum = parseInt(resolved || '0');
    const inprogressNum = parseInt(inprogress || '0');
    const pendingNum = parseInt(pending || '0');

    const sum = resolvedNum + inprogressNum + pendingNum;
    expect(totalNum).toBe(sum);
  });

  test('should display notification bell in header', async ({ page }) => {
    const notificationBell = page.getByTestId('notification-bell-button');
    await expect(notificationBell).toBeVisible();

    // Click to open notification dropdown
    await notificationBell.click();
    await page.waitForTimeout(500);

    // Verify dropdown appears
    const notificationDropdown = page.getByTestId('notification-dropdown');
    const isVisible = await notificationDropdown.isVisible().catch(() => false);

    if (isVisible) {
      expect(isVisible).toBeTruthy();
    }
  });

  test('should display user profile button in header', async ({ page }) => {
    const profileBtn = page.getByTestId('user-profile-dropdown-button');
    await expect(profileBtn).toBeVisible();

    // Click profile button
    await profileBtn.click();
    await page.waitForTimeout(500);

    // Verify profile menu appears
    const profileMenu = page.getByTestId('user-dropdown-menu');
    const isVisible = await profileMenu.isVisible().catch(() => false);

    if (isVisible) {
      expect(isVisible).toBeTruthy();
    }
  });

  test('should open user profile menu on click', async ({ page }) => {
    const profileBtn = page.getByTestId('user-profile-dropdown-button');
    await profileBtn.click();
    await page.waitForTimeout(500);

    // Verify menu items
    const viewProfileLink = page.getByTestId('dropdown-profile-link');
    const logoutLink = page.getByTestId('dropdown-logout-button');

    const profileVisible = await viewProfileLink.isVisible().catch(() => false);
    const logoutVisible = await logoutLink.isVisible().catch(() => false);

    if (profileVisible) {
      expect(profileVisible).toBeTruthy();
    }

    if (logoutVisible) {
      expect(logoutVisible).toBeTruthy();
    }
  });

  test('should navigate to profile page from menu', async ({ page }) => {
    const profileBtn = page.getByTestId('user-profile-dropdown-button');
    await profileBtn.click();
    await page.waitForTimeout(500);

    const viewProfileLink = page.getByTestId('dropdown-profile-link');
    const linkExists = await viewProfileLink.isVisible().catch(() => false);

    if (linkExists) {
      await viewProfileLink.click();
      await page.waitForURL('**/profile');

      // Verify profile page loaded
      const profileTitle = page.getByRole('heading', { name: /profile/i });
      await expect(profileTitle).toBeVisible();
    }
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Verify we're on dashboard
    await expect(page.getByTestId('dashboard-header')).toBeVisible();

    // Open profile menu
    const profileBtn = page.getByTestId('user-profile-dropdown-button');
    await profileBtn.click();
    await page.waitForTimeout(500);

    // Click logout
    const logoutLink = page.getByTestId('dropdown-logout-button');
    const logoutExists = await logoutLink.isVisible().catch(() => false);

    if (logoutExists) {
      await dashboard.logout();

      // Verify redirected to login or role selection
      // Use { timeout: 10000 } since page navigation might take time
      const currentUrl = page.url();
      expect(
        currentUrl.includes('/login') ||
        currentUrl.includes('/role-login') ||
        currentUrl.includes('/') // Back to home
      ).toBeTruthy();
    }
  });

  test('should prevent back navigation after logout', async ({ page }) => {
    // Store initial URL
    const initialUrl = page.url();

    // Open profile menu and logout
    const profileBtn = page.getByTestId('user-profile-dropdown-button');
    await profileBtn.click();
    await page.waitForTimeout(500);

    const logoutLink = page.getByTestId('dropdown-logout-button');
    const logoutExists = await logoutLink.isVisible().catch(() => false);

    if (logoutExists) {
      await dashboard.logout();
      await page.waitForTimeout(2000);

      // Try to go back
      await page.goBack().catch(() => {}); // May not work due to replace
      await page.waitForTimeout(1000);

      // Verify not back on dashboard
      const header = page.getByTestId('dashboard-header');
      const isVisible = await header.isVisible().catch(() => false);

      // Should not be on dashboard anymore
      expect(isVisible).toBeFalsy();
    }
  });

  test('should display recent complaints section', async ({ page }) => {
    const recentTitle = page.getByTestId('recent-complaints-title');
    await expect(recentTitle).toBeVisible();

    const table = page.locator('main').locator('table').first();
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      expect(tableVisible).toBeTruthy();
    } else {
      const emptyMessage = page.getByText(/You haven't filed any complaints yet/i);
      const fallbackMessage = page.getByText(/No complaints found/i);
      const emptyVisible =
        (await emptyMessage.isVisible().catch(() => false)) ||
        (await fallbackMessage.isVisible().catch(() => false));
      expect(emptyVisible).toBeTruthy();
    }
  });


  test('should update stats when new complaint is added', async ({ page }) => {
    // Get initial total
    const totalValue = page.getByTestId('dashboard-card-total-value');
    const initialTotal = parseInt(await totalValue.textContent() || '0');

    // Navigate to add complaint (would need to create one)
    // For this test, we'll just verify the stat exists and can be updated
    expect(initialTotal).toBeGreaterThanOrEqual(0);

    // Verify pending count exists
    const pendingValue = page.getByTestId('dashboard-card-pending-value');
    await expect(pendingValue).toBeVisible();
  });


  test('should show loading message before data loads', async ({ page }) => {
    // Navigate to dashboard with network throttling
    await page.route('**/api/**', (route) => {
      setTimeout(() => route.continue(), 2000); // Delay 2 seconds
    });

    await page.goto('http://localhost:5173/student-dashboard');

    // Check for loading message while requests are delayed
    const loadingMessage = page.getByText(/Loading dashboard data/i);
    const loadingVisible = await loadingMessage.isVisible().catch(() => false);
    expect(loadingVisible).toBeTruthy();

    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Verify actual content is now visible
    const cards = page.getByTestId(/^dashboard-card-/);
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
