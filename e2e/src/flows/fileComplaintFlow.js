/**
 * File Complaint Flow
 * Multi-step operation: fill title, description, select category/priority, upload files, submit
 * This is WHERE business logic belongs, NOT in POMs
 */

export async function fileComplaintFlow(page, { addComplaintPage, title, description, category, priority, files = [] }) {
  // Step 1: Fill form fields
  await addComplaintPage.fillTitle(title);
  await addComplaintPage.fillDescription(description);
  await addComplaintPage.selectCategory(category);
  await addComplaintPage.selectPriority(priority);

  // Step 2: Upload files if provided
  if (files && files.length > 0) {
    for (const filePath of files) {
      await addComplaintPage.uploadFile(filePath);
      await page.waitForTimeout(300); // Brief wait between uploads
    }
  }

  // Step 3: Submit form
  await addComplaintPage.clickSubmit();

  // Step 4: Wait for success modal (proper Playwright pattern - NOT in POM)
  const successModal = addComplaintPage.getSuccessModal();
  await successModal.waitFor({ state: 'visible', timeout: 10000 });

  // Step 5: Extract complaint ID from modal
  const idText = await addComplaintPage.getSuccessModalIdText();

  return {
    success: true,
    complaintId: idText?.trim() || '',
  };
}

/**
 * Submit complaint and redirect to my-complaints
 */
export async function fileComplaintAndRedirect(page, { addComplaintPage, ...formData }) {
  const result = await fileComplaintFlow(page, { addComplaintPage, ...formData });

  // Close modal (will auto-redirect after)
  await addComplaintPage.closeSuccessModal();

  // Wait for redirect
  await page.waitForURL('**/my-complaints', { timeout: 10000 });

  return result;
}
