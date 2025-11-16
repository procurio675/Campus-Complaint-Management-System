import { test, expect } from '@playwright/test';
import { MyComplaintsPage } from '../../src/pages/student/myComplaints.page.js';
import { ComplaintDetailPage } from '../../src/pages/student/complaintDetail.page.js';
import { apiLogin } from '../../src/api/auth.api.js';
import users from '../../src/data/users.json' assert { type: 'json' };

test.describe('Student Dashboard - My Complaints', () => {
  let myComplaintsPage;
  let complaintDetailPage;

  test.beforeEach(async ({ page }) => {
    // API login and inject localStorage
    const { token, user } = await apiLogin(users.student.email, users.student.password, 'student');
    
    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('ccms_token', token);
      localStorage.setItem('ccms_user', JSON.stringify(user));
    }, { token, user });

    await page.goto('http://localhost:5173/student-dashboard/my-complaints');
    await page.waitForLoadState('networkidle');

    myComplaintsPage = new MyComplaintsPage(page);
    complaintDetailPage = new ComplaintDetailPage(page);
  });

  test('should display list of user complaints', async ({ page }) => {
    // Verify page heading is loaded
    const heading = page.getByRole('heading', { name: /My Complaints/i });
    await expect(heading).toBeVisible();

    // Verify table or empty state is present
    const table = page.locator('table');
    const emptyState = page.getByText(/No.*complaints/i);
    
    // Either table exists or empty message is shown
    const tableVisible = await table.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    
    expect(tableVisible || emptyVisible).toBeTruthy();
  });


  test('should filter complaints by status', async ({ page }) => {
    // Wait for page to load
    await page.locator('table').or(page.getByText(/No.*complaints/i)).waitFor({ state: 'visible', timeout: 10000 });

    // Filter by "Resolved" status
    await myComplaintsPage.filterByStatus('Resolved');
    await page.waitForTimeout(1000);

    // Verify all visible rows show Resolved status
    const statusCells = page.getByTestId(/^complaint-status-/);
    const count = await statusCells.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const status = await statusCells.nth(i).textContent();
      expect(status?.trim()).toBe('Resolved');
    }
  });

  test('should filter complaints by priority', async ({ page }) => {
    // Wait for page to load
    await page.locator('table').or(page.getByText(/No.*complaints/i)).waitFor({ state: 'visible', timeout: 10000 });

    // Filter by "High" priority
    await myComplaintsPage.filterByPriority('High');
    await page.waitForTimeout(1000);

    // Verify results
    const priorityCells = page.getByTestId(/^complaint-priority-/);
    const count = await priorityCells.count();

    if (count > 0) {
      const priority = await priorityCells.first().textContent();
      expect(priority?.trim()).toBe('High');
    }
  });

    test('should sort complaints by date descending', async ({ page }) => {
    // Wait for page to load
    await page.locator('table').or(page.getByText(/No.*complaints/i)).waitFor({ state: 'visible', timeout: 10000 });

    // Click sort button
    await myComplaintsPage.sortByDate();

    // Get first 3 dates
    const dateCells = page.getByTestId(/^complaint-date-/);
    const dates = [];

    for (let i = 0; i < Math.min(3, await dateCells.count()); i++) {
      const dateText = await dateCells.nth(i).textContent();
      dates.push(new Date(dateText?.trim() || ''));
    }

    // Verify descending order
    if (dates.length >= 2) {
      expect(dates[0].getTime()).toBeGreaterThanOrEqual(dates[1].getTime());
    }
  });

//   test.skip('should open complaint detail page', async ({ page }) => {
//     // Wait for page to load
//     await page.locator('table').waitFor({ state: 'visible', timeout: 10000 });

//     // Get first complaint row and click
//     const firstRow = page.getByTestId(/^complaint-row-/).first();
//     const complaintId = await firstRow.getAttribute('data-complaint-id');

//     await firstRow.click();
//     await page.waitForURL(`**/complaint-detail/${complaintId}`);

//     // Verify detail page loaded
//     const detailTitle = page.getByTestId('complaint-detail-title');
//     await expect(detailTitle).toBeVisible();
//   });

//   test.skip('should upvote a complaint', async ({ page }) => {
//     await page.getByTestId('complaints-table').waitFor({ state: 'visible' });

//     // Get first complaint row
//     const firstRow = page.getByTestId(/^complaint-row-/).first();

//     // Get upvote button and initial count
//     const upvoteBtn = firstRow.getByTestId('complaint-upvote-btn');
//     const upvoteCount = firstRow.getByTestId('complaint-upvote-count');

//     const initialCount = parseInt(await upvoteCount.textContent() || '0');

//     // Click upvote
//     await upvoteBtn.click();
//     await page.waitForTimeout(500);

//     // Verify count increased
//     const updatedCount = parseInt(await upvoteCount.textContent() || '0');
//     expect(updatedCount).toBe(initialCount + 1);
//   });

//   test.skip('should delete complaint from table', async ({ page }) => {
//     await page.getByTestId('complaints-table').waitFor({ state: 'visible' });

//     // Store initial row count
//     const initialRows = await page.getByTestId(/^complaint-row-/).count();

//     // Get first complaint for deletion
//     const firstRow = page.getByTestId(/^complaint-row-/).first();
//     const complaintId = await firstRow.getAttribute('data-complaint-id');

//     // Click delete button
//     const deleteBtn = firstRow.getByTestId('complaint-delete-btn');
//     await deleteBtn.click();

//     // Confirm deletion in modal
//     const confirmBtn = page.getByTestId('delete-confirm-btn');
//     await expect(confirmBtn).toBeVisible();
//     await confirmBtn.click();

//     // Wait for row to disappear
//     const deletedRow = page.getByTestId(`complaint-row-${complaintId}`);
//     await expect(deletedRow).toBeHidden({ timeout: 10000 });

//     // Verify row count decreased
//     const finalRows = await page.getByTestId(/^complaint-row-/).count();
//     expect(finalRows).toBeLessThan(initialRows);
//   });

//   test.skip('should cancel delete operation', async ({ page }) => {
//     await page.getByTestId('complaints-table').waitFor({ state: 'visible' });

//     const firstRow = page.getByTestId(/^complaint-row-/).first();
//     const deleteBtn = firstRow.getByTestId('complaint-delete-btn');

//     // Click delete
//     await deleteBtn.click();

//     // Click cancel
//     const cancelBtn = page.getByTestId('delete-cancel-btn');
//     await expect(cancelBtn).toBeVisible();
//     await cancelBtn.click();

//     // Verify modal closed and row still visible
//     const modal = page.getByTestId('delete-confirmation-modal');
//     await expect(modal).toBeHidden();
//     await expect(firstRow).toBeVisible();
//   });

//   test.skip('should extract complaint data from table row', async ({ page }) => {
//     await page.getByTestId('complaints-table').waitFor({ state: 'visible' });

//     // Get first complaint row data
//     const firstRow = page.getByTestId(/^complaint-row-/).first();
//     const complaintData = await myComplaintsPage.getComplaintRowData(0);

//     expect(complaintData).toHaveProperty('id');
//     expect(complaintData).toHaveProperty('title');
//     expect(complaintData).toHaveProperty('status');
//     expect(complaintData).toHaveProperty('category');
//     expect(complaintData).toHaveProperty('priority');
//     expect(complaintData).toHaveProperty('date');

//     // Verify data is not empty
//     expect(complaintData.title).toBeTruthy();
//     expect(complaintData.status).toBeTruthy();
//     expect(['Low', 'Medium', 'High']).toContain(complaintData.priority);
//   });

//   test.skip('should combine search and filter', async ({ page }) => {
//     await page.getByTestId('complaints-table').waitFor({ state: 'visible' });

//     // Search for specific term
//     await myComplaintsPage.searchComplaints('hostel');

//     // Filter by status
//     await myComplaintsPage.filterByStatus('In Progress');

//     // Wait for filters to apply
//     await page.waitForTimeout(1000);

//     // Verify results match both criteria
//     const rows = page.getByTestId(/^complaint-row-/);
//     const count = await rows.count();

//     if (count > 0) {
//       // At least one row should be visible
//       const firstRowText = await rows.first().textContent();
//       expect(firstRowText).toBeTruthy();
//     }
//   });

//   test.skip('should handle empty search results gracefully', async ({ page }) => {
//     await page.getByTestId('complaints-table').waitFor({ state: 'visible' });

//     // Search for non-existent complaint
//     await myComplaintsPage.searchComplaints('xyzabcnonexistent123456');
//     await page.waitForTimeout(1000);

//     // Verify empty state message
//     const emptyMessage = page.getByTestId('no-complaints-message');
//     const rows = page.getByTestId(/^complaint-row-/);

//     const rowCount = await rows.count();
//     if (rowCount === 0) {
//       const messageVisible = await emptyMessage.isVisible().catch(() => false);
//       expect(messageVisible || rowCount === 0).toBeTruthy();
//     }
//   });

//   test.skip('should navigate to complaint details and verify back link works', async ({ page }) => {
//     await page.getByTestId('complaints-table').waitFor({ state: 'visible' });

//     // Click first complaint
//     const firstRow = page.getByTestId(/^complaint-row-/).first();
//     const complaintId = await firstRow.getAttribute('data-complaint-id');

//     await firstRow.click();
//     await page.waitForURL(`**/complaint-detail/**`);

//     // Verify detail page loaded
//     const detailTitle = page.getByTestId('complaint-detail-title');
//     await expect(detailTitle).toBeVisible();

//     // Click back button
//     const backBtn = page.getByTestId('detail-back-btn');
//     await backBtn.click();

//     // Verify back to table
//     await page.waitForURL('**/my-complaints');
//     const table = page.getByTestId('complaints-table');
//     await expect(table).toBeVisible();
//   });
});
