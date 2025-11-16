/**
 * File Complaint Flow - Multi-step complaint filing
 * Fill form → Submit → Extract complaint ID
 */

import { AddComplaintPage } from '../pages/student/addComplaint.page.js';
export async function fileComplaintFlow(page, data) {
  const result = { success: false, error: null };
  try {
    const form = new AddComplaintPage(page);
    
    // Fill form fields
    await form.getTitleInput().fill(data.title);
    await form.getDescriptionInput().fill(data.description);
    await form.getCategorySelect().selectOption(data.category);
    await form.getPrioritySelect().selectOption(data.priority);
    
    // Upload files if provided
    if (data.files && data.files.length > 0) {
      const fileInput = form.getFileInput();
      await fileInput.setInputFiles(data.files);
      await page.waitForTimeout(1000); // Wait for upload to process
    }
    
    // Submit form
    await form.getSubmitButton().click();
    
    // Wait for success modal
    await page.waitForSelector('[data-testid="success-modal"]', { timeout: 10000 });
    
    // Extract complaint ID from modal
    const idElement = await page.locator('[data-testid="complaint-id"]').textContent();
    const complaintId = idElement?.trim();
    
    result.success = true;
    result.complaintId = complaintId;
  } catch (error) {
    result.error = error.message;
  }
  return result;
}

/**
 * File complaint and verify redirect to detail page
 * @param {Page} page - Playwright page
 * @param {Object} data - Complaint data
 * @returns {Promise<{success: boolean, complaintId?: string, redirected?: boolean, error?: string}>}
 */
export async function fileComplaintAndRedirect(page, data) {
  const result = { success: false, redirected: false, error: null };
  try {
    const fileResult = await fileComplaintFlow(page, data);
    
    if (!fileResult.success) {
      result.error = fileResult.error;
      return result;
    }
    
    result.complaintId = fileResult.complaintId;
    
    // Verify redirect to complaint detail
    await page.waitForURL(`**/complaint/${fileResult.complaintId}`, { timeout: 10000 });
    
    result.success = true;
    result.redirected = true;
  } catch (error) {
    result.error = error.message;
  }
  return result;
}
