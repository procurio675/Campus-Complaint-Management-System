/**
 * Flows Layer Architecture & Usage Guide
 * 
 * PHILOSOPHY:
 * - Flows encapsulate multi-step business operations
 * - Flows combine POMs + waits + utils into coherent workflows
 * - Flows return structured results (success, data, errors)
 * - Flows are reusable across multiple test files
 * - Tests orchestrate flows; flows don't orchestrate tests
 * 
 * STRUCTURE:
 * e2e/src/flows/
 * ├── fileComplaintFlow.js     (Multi-step: fill form → submit → verify)
 * ├── deleteComplaintFlow.js   (Multi-step: confirm dialog → delete → verify)
 * ├── upvoteFlow.js            (Multi-step: get count → click → verify change)
 * └── searchFilterFlow.js      (Multi-step: various search/filter combinations)
 */

// ============================================================================
// 1. FILE COMPLAINT FLOW - Complete complaint filing workflow
// ============================================================================

import { fileComplaintFlow, fileComplaintAndRedirect } from './fileComplaintFlow.js';

// FUNCTION 1: fileComplaintFlow()
// PURPOSE: Fill form → submit → extract complaint ID
// 
// PARAMETERS:
// - page: Playwright page object
// - complaintData: { title, description, category, priority, files }
//
// RETURNS: { success, complaintId, error }
//
// USAGE:
const result = await fileComplaintFlow(page, {
  title: 'Noisy dormitory',
  description: 'The common area is too loud at night',
  category: 'Noise Complaint',
  priority: 'High',
  files: ['./path/to/file.pdf']
});

if (result.success) {
  console.log('Complaint filed:', result.complaintId);  // 'CC99039012'
} else {
  console.error('Failed:', result.error);
}

// FUNCTION 2: fileComplaintAndRedirect()
// PURPOSE: File complaint AND verify redirect to detail page
//
// PARAMETERS: Same as fileComplaintFlow
//
// RETURNS: { success, complaintId, redirected, error }
//
// USAGE:
const result2 = await fileComplaintAndRedirect(page, {
  title: 'Test complaint',
  description: 'Test description',
  category: 'Facility',
  priority: 'Medium',
  files: []
});

// INTERNALLY DOES:
// 1. Fill form fields (title, description, category, priority)
// 2. Upload files (if provided)
// 3. Click submit
// 4. Wait for success modal
// 5. Extract complaint ID from modal
// 6. Verify redirect to detail page (optional)
// 7. Return structured result

// ============================================================================
// 2. DELETE COMPLAINT FLOW - Delete with confirmation
// ============================================================================

import { deleteComplaintFlow, cancelDeleteComplaintFlow } from './deleteComplaintFlow.js';

// FUNCTION 1: deleteComplaintFlow()
// PURPOSE: Click delete → confirm → verify removal
//
// PARAMETERS:
// - page: Playwright page object
// - complaintId: Complaint ID (used to find delete button)
// - context: 'myComplaints' | 'detail' (where delete button is)
//
// RETURNS: { success, message, error }
//
// USAGE:
const deleteResult = await deleteComplaintFlow(page, 'xyz123', 'myComplaints');

if (deleteResult.success) {
  console.log('Deleted:', deleteResult.message);
} else {
  console.error('Delete failed:', deleteResult.error);
}

// FUNCTION 2: cancelDeleteComplaintFlow()
// PURPOSE: Click delete → cancel → verify NOT deleted
//
// PARAMETERS: Same as deleteComplaintFlow
//
// RETURNS: { success, cancelled, complaintStillExists }
//
// USAGE:
const cancelResult = await cancelDeleteComplaintFlow(page, 'xyz123', 'myComplaints');

// INTERNALLY DOES:
// 1. Find delete button for complaint
// 2. Click delete button
// 3. Wait for confirmation modal
// 4. Click confirm button
// 5. Wait for row to disappear (or modal to close)
// 6. Return success/error
// OR for cancel:
// 1-4: Same
// 5. Click cancel button
// 6. Verify row still visible
// 7. Return cancelled status

// ============================================================================
// 3. UPVOTE FLOW - Increment upvote with verification
// ============================================================================

import { upvoteComplaintFlow, upvoteComplaintDetailFlow } from './upvoteFlow.js';

// FUNCTION 1: upvoteComplaintFlow()
// PURPOSE: Get initial count → click upvote → verify count increases
//
// PARAMETERS:
// - page: Playwright page object
// - complaintId: Complaint ID in table
// - expectedIncrement: How much should count increase (default: 1)
//
// RETURNS: { success, initialCount, newCount, difference, error }
//
// USAGE:
const upvoteResult = await upvoteComplaintFlow(page, 'xyz123', 1);

if (upvoteResult.success) {
  console.log(`Upvote: ${upvoteResult.initialCount} → ${upvoteResult.newCount}`);
  console.log(`Difference: +${upvoteResult.difference}`);
} else {
  console.error('Upvote failed:', upvoteResult.error);
}

// FUNCTION 2: upvoteComplaintDetailFlow()
// PURPOSE: Same as above but from detail page
//
// PARAMETERS: Same as upvoteComplaintFlow
//
// RETURNS: Same as upvoteComplaintFlow
//
// USAGE:
const detailUpvote = await upvoteComplaintDetailFlow(page, 'xyz123');

// INTERNALLY DOES:
// 1. Get current upvote count (by parsing text)
// 2. Click upvote button
// 3. Wait for count to update (with retries)
// 4. Get new upvote count
// 5. Calculate difference
// 6. Verify difference matches expected
// 7. Return structured result

// ============================================================================
// 4. SEARCH FILTER FLOW - Various search/filter operations
// ============================================================================

import {
  searchComplaintsFlow,
  filterByStatusFlow,
  filterByPriorityFlow,
  sortByDateFlow,
  searchAndFilterFlow,
  clearAllFiltersFlow,
} from './searchFilterFlow.js';

// FUNCTION 1: searchComplaintsFlow()
// PURPOSE: Search for complaints by title/description
//
// PARAMETERS:
// - page: Playwright page object
// - searchTerm: String to search for
//
// RETURNS: { success, resultCount, complaints, error }
//
// USAGE:
const searchResult = await searchComplaintsFlow(page, 'noisy');

console.log(`Found ${searchResult.resultCount} complaints`);
// Typically: resultCount > 0 (at least one match)

// FUNCTION 2: filterByStatusFlow()
// PURPOSE: Filter complaints by status
//
// PARAMETERS:
// - page: Playwright page object
// - status: 'Pending' | 'In Progress' | 'Resolved'
//
// RETURNS: { success, resultCount, error }
//
// USAGE:
const statusFilter = await filterByStatusFlow(page, 'Pending');

// FUNCTION 3: filterByPriorityFlow()
// PURPOSE: Filter complaints by priority
//
// PARAMETERS:
// - page: Playwright page object
// - priority: 'Low' | 'Medium' | 'High'
//
// RETURNS: { success, resultCount, error }
//
// USAGE:
const priorityFilter = await filterByPriorityFlow(page, 'High');

// FUNCTION 4: sortByDateFlow()
// PURPOSE: Sort complaints by date (newest/oldest)
//
// PARAMETERS:
// - page: Playwright page object
// - order: 'newest' | 'oldest'
//
// RETURNS: { success, dates, error }
//
// USAGE:
const sortResult = await sortByDateFlow(page, 'newest');

// FUNCTION 5: searchAndFilterFlow()
// PURPOSE: Combine search + filter in one operation
//
// PARAMETERS:
// - page: Playwright page object
// - filters: { search?, status?, priority?, sort? }
//
// RETURNS: { success, resultCount, appliedFilters, error }
//
// USAGE:
const combined = await searchAndFilterFlow(page, {
  search: 'facility',
  status: 'Pending',
  priority: 'High',
  sort: 'newest'
});

console.log(`Filters: ${combined.appliedFilters.join(', ')}`);
console.log(`Results: ${combined.resultCount}`);

// FUNCTION 6: clearAllFiltersFlow()
// PURPOSE: Clear all active filters and search
//
// PARAMETERS:
// - page: Playwright page object
//
// RETURNS: { success, cleared, error }
//
// USAGE:
const clearResult = await clearAllFiltersFlow(page);

// ============================================================================
// 5. USAGE PATTERNS
// ============================================================================

// PATTERN 1: Single flow execution
test('User can file complaint', async ({ page }) => {
  // Arrange
  await login(page);
  
  // Act
  const result = await fileComplaintFlow(page, {
    title: 'Test',
    description: 'Test description',
    category: 'Facility',
    priority: 'High',
    files: []
  });
  
  // Assert
  expect(result.success).toBe(true);
  expect(result.complaintId).toBeTruthy();
});

// PATTERN 2: Chained flows
test('User can file and then delete complaint', async ({ page }) => {
  // Arrange
  await login(page);
  
  // Act 1: File complaint
  const fileResult = await fileComplaintFlow(page, {
    title: 'To be deleted',
    description: 'Test',
    category: 'Facility',
    priority: 'Low',
    files: []
  });
  
  expect(fileResult.success).toBe(true);
  const complaintId = fileResult.complaintId;
  
  // Act 2: Navigate to my complaints
  await page.getByTestId('sidebar-my-complaints').click();
  await page.waitForURL('**/my-complaints');
  
  // Act 3: Delete complaint
  const deleteResult = await deleteComplaintFlow(page, complaintId, 'myComplaints');
  
  // Assert
  expect(deleteResult.success).toBe(true);
});

// PATTERN 3: Verify state after flow
test('Upvote updates stat card', async ({ page }) => {
  // Arrange
  await login(page);
  const dashboard = new StudentDashboardPage(page);
  
  // Get initial stats
  const initialUpvotes = await dashboard.getTotalUpvotesValue();
  
  // Act
  const upvoteResult = await upvoteComplaintFlow(page, 'xyz123');
  
  // Assert
  expect(upvoteResult.success).toBe(true);
  expect(upvoteResult.difference).toBe(1);
  
  // Verify stat updated
  const newUpvotes = await dashboard.getTotalUpvotesValue();
  expect(parseInt(newUpvotes) - parseInt(initialUpvotes)).toBe(1);
});

// PATTERN 4: Flow with error handling
test('Delete flow returns error for invalid complaint', async ({ page }) => {
  // Arrange
  await login(page);
  
  // Act
  const result = await deleteComplaintFlow(page, 'invalid-id', 'myComplaints');
  
  // Assert
  expect(result.success).toBe(false);
  expect(result.error).toBeTruthy();
});

// ============================================================================
// 6. FLOW STRUCTURE (INTERNAL)
// ============================================================================

/**
 * Every flow follows this pattern:
 * 
 * 1. INITIALIZATION
 *    - Validate inputs
 *    - Initialize result object
 * 
 * 2. OPERATION
 *    - Use POMs to get locators
 *    - Use utils to wait/parse/extract
 *    - Execute multi-step workflow
 * 
 * 3. VERIFICATION
 *    - Verify operation succeeded
 *    - Extract result data
 * 
 * 4. RETURN
 *    - Return structured result
 *    - Include success/error
 *    - Include relevant data (ID, count, etc)
 * 
 * EXAMPLE CODE STRUCTURE:
 * 
 * export async function complaintFlow(page, data) {
 *   // 1. Initialize
 *   const result = { success: false, error: null };
 *   try {
 *     // 2. Get POMs
 *     const form = new AddComplaintPage(page);
 *     const dashboard = new StudentDashboardPage(page);
 *     
 *     // 3. Execute workflow
 *     await waitAndFill(form.getTitleInput(), data.title);
 *     await waitAndFill(form.getDescriptionInput(), data.description);
 *     await waitAndClick(form.getSubmitButton());
 *     
 *     // 4. Verify result
 *     await assertSuccessMessage(page, 'Success');
 *     const complaintId = await extractComplaintId(page);
 *     
 *     // 5. Return
 *     result.success = true;
 *     result.complaintId = complaintId;
 *   } catch (error) {
 *     result.error = error.message;
 *   }
 *   return result;
 * }
 */

// ============================================================================
// 7. FLOW RETURN VALUES
// ============================================================================

/**
 * ALL flows return structured objects:
 * 
 * SUCCESS RESPONSE:
 * {
 *   success: true,
 *   [flowSpecificData]: ...
 * }
 * 
 * ERROR RESPONSE:
 * {
 *   success: false,
 *   error: 'Error message',
 *   [debugInfo]: ...
 * }
 * 
 * EXAMPLES:
 * 
 * fileComplaintFlow: {
 *   success: true,
 *   complaintId: 'CC99039012'
 * }
 * 
 * upvoteFlow: {
 *   success: true,
 *   initialCount: 5,
 *   newCount: 6,
 *   difference: 1
 * }
 * 
 * searchFlow: {
 *   success: true,
 *   resultCount: 3,
 *   complaints: [{ id, title, status }]
 * }
 */

// ============================================================================
// 8. BEST PRACTICES
// ============================================================================

// ✅ DO:
// - Return structured result objects
// - Include success flag always
// - Catch and return errors (don't throw)
// - Use POMs for locators
// - Use utils for waits/parsing/assertions
// - Verify operation succeeded
// - Document parameters and return values
// - Reuse flows across multiple tests

// ❌ DON'T:
// - Throw errors (return in result object)
// - Return raw Playwright results
// - Have flows call other flows unnecessarily
// - Add test assertions (return data for tests to assert)
// - Create flows for single operations (use POMs directly)
// - Have flows with unclear return values
// - Put test-specific logic in flows

// ============================================================================
// 9. WHEN TO CREATE A FLOW
// ============================================================================

/**
 * CREATE A FLOW WHEN:
 * ✅ Multi-step business operation (2+ steps)
 * ✅ Reusable across multiple tests
 * ✅ Verifiable end result (success/failure)
 * ✅ Complex timing/waits involved
 * ✅ Extraction/parsing needed
 * 
 * DON'T CREATE A FLOW WHEN:
 * ❌ Single operation (use POM directly)
 * ❌ Only used once (keep in test)
 * ❌ Highly test-specific logic (keep in test)
 * ❌ Simple click/fill (use waitAndClick in test)
 */

// ============================================================================
// 10. FLOW CATEGORIES
// ============================================================================

/**
 * FORM FLOWS (fileComplaintFlow):
 * - Fill form → Submit → Verify success
 * - Returns: complaint ID, success status
 * 
 * DELETION FLOWS (deleteComplaintFlow):
 * - Click delete → Confirm → Verify removal
 * - Returns: success status, message
 * 
 * INTERACTION FLOWS (upvoteFlow):
 * - Get initial state → Interact → Verify change
 * - Returns: before/after values, difference
 * 
 * SEARCH/FILTER FLOWS (searchFilterFlow):
 * - Apply filter → Get results → Verify count
 * - Returns: result count, applied filters
 */
