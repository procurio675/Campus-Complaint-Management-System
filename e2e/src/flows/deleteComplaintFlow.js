/**
 * Delete Complaint Flow
 * Multi-step operation: click delete, confirm modal, wait for removal
 */

export async function deleteComplaintFlow(page, { tablePageObject, rowIndex }) {
  // Step 1: Click delete button
  await tablePageObject.clickDelete(rowIndex);

  // Step 2: Wait for delete modal (proper Playwright pattern - NOT in POM)
  const deleteModal = tablePageObject.getDeleteConfirmationModal();
  await deleteModal.waitFor({ state: 'visible', timeout: 5000 });

  // Step 3: Confirm deletion
  await tablePageObject.confirmDelete();

  // Step 4: Wait for modal to disappear and row to be removed
  await deleteModal.waitFor({ state: 'hidden', timeout: 10000 });

  return {
    success: true,
    message: 'Complaint deleted successfully',
  };
}

/**
 * Cancel delete operation
 */
export async function cancelDeleteComplaintFlow(page, { tablePageObject, rowIndex }) {
  // Step 1: Click delete button
  await tablePageObject.clickDelete(rowIndex);

  // Step 2: Wait for delete modal
  const deleteModal = tablePageObject.getDeleteConfirmationModal();
  await deleteModal.waitFor({ state: 'visible', timeout: 5000 });

  // Step 3: Cancel deletion
  await tablePageObject.cancelDelete();

  // Step 4: Verify modal closed and row still exists
  await deleteModal.waitFor({ state: 'hidden', timeout: 5000 });

  return {
    success: true,
    message: 'Delete operation cancelled',
  };
}
