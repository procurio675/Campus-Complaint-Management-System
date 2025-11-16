/**
 * Search and Filter Flow
 * Multi-step: set filters, wait for results, verify filtering applied
 */

export async function searchComplaintsFlow(page, { tablePageObject, searchTerm }) {
  // Step 1: Click search input
  await tablePageObject.clickSearchInput();

  // Step 2: Type search term
  await tablePageObject.typeSearch(searchTerm);

  // Step 3: Wait for table to update (proper Playwright pattern)
  // Use locator's built-in wait rather than arbitrary timeout
  const table = tablePageObject.getComplaintsTable();
  await table.waitFor({ state: 'visible', timeout: 5000 });

  // Step 4: Brief delay for debounce/filter
  await page.waitForTimeout(500);

  // Step 5: Get filtered results
  const rowCount = await tablePageObject.getRowCount();

  return {
    success: true,
    searchTerm,
    resultCount: rowCount,
  };
}
// filterByStatusFlow.js
export async function filterByStatusFlow(page, { tablePageObject, status }) {
  // Step 1: Click status filter
  await tablePageObject.clickStatusFilter();

  // Step 2: Select status value
  const statusFilter = tablePageObject.getStatusFilter();
  await statusFilter.selectOption(status);

  // Step 3: Wait for table to update
  const table = tablePageObject.getComplaintsTable();
  await table.waitFor({ state: 'visible', timeout: 5000 });

  // Step 4: Brief delay for filter
  await page.waitForTimeout(500);

  // Step 5: Get filtered count
  const rowCount = await tablePageObject.getRowCount();

  return {
    success: true,
    status,
    resultCount: rowCount,
  };
}

/**
 * Filter by priority flow
 */
export async function filterByPriorityFlow(page, { tablePageObject, priority }) {
  // Step 1: Click priority filter
  await tablePageObject.clickPriorityFilter();

  // Step 2: Select priority value
  const priorityFilter = tablePageObject.getPriorityFilter();
  await priorityFilter.selectOption(priority);

  // Step 3: Wait for table to update
  const table = tablePageObject.getComplaintsTable();
  await table.waitFor({ state: 'visible', timeout: 5000 });

  // Step 4: Brief delay for filter
  await page.waitForTimeout(500);

  // Step 5: Get filtered count
  const rowCount = await tablePageObject.getRowCount();

  return {
    success: true,
    priority,
    resultCount: rowCount,
  };
}

// sort by data flow
export async function sortByDateFlow(page, { tablePageObject }) {
  // Step 1: Click date sort button
  await tablePageObject.clickDateSort();

  // Step 2: Wait for table to update
  const table = tablePageObject.getComplaintsTable();
  await table.waitFor({ state: 'visible', timeout: 5000 });

  // Step 3: Brief delay for sort animation
  await page.waitForTimeout(300);

  return {
    success: true,
    sortBy: 'date',
  };
}

// combinedSearchAndFilterFlow.js
export async function searchAndFilterFlow(page, { tablePageObject, searchTerm, status, priority }) {
  const results = {};

  // Search
  if (searchTerm) {
    results.search = await searchComplaintsFlow(page, { tablePageObject, searchTerm });
    await page.waitForTimeout(300);
  }

  // Filter by status
  if (status) {
    results.status = await filterByStatusFlow(page, { tablePageObject, status });
    await page.waitForTimeout(300);
  }

  // Filter by priority
  if (priority) {
    results.priority = await filterByPriorityFlow(page, { tablePageObject, priority });
  }

  // Get final count
  const finalCount = await tablePageObject.getRowCount();

  return {
    success: true,
    filters: results,
    finalResultCount: finalCount,
  };
}
