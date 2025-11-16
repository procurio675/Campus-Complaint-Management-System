/**
 * Upvote Complaint Flow
 * Multi-step: click upvote, wait for API response, verify count increased
 */

export async function upvoteComplaintFlow(page, { tablePageObject, rowIndex }) {
  // Step 1: Get initial upvote count
  const initialCountText = await tablePageObject.getUpvoteCountText(rowIndex);
  const initialCount = parseInt(initialCountText?.trim().match(/\d+/)?.[0] || '0');

  // Step 2: Click upvote button
  await tablePageObject.clickUpvote(rowIndex);

  // Step 3: Wait for count to change (proper Playwright pattern)
  const upvoteCount = tablePageObject.getUpvoteCount(rowIndex);
  await page.waitForFunction(
    (selector, expectedMin) => {
      const el = document.querySelector(selector);
      const count = parseInt(el?.textContent?.match(/\d+/)?.[0] || '0');
      return count > expectedMin;
    },
    `[data-testid="complaint-upvote-count"]`,
    initialCount,
    { timeout: 5000 }
  );

  // Step 4: Get new count
  const newCountText = await tablePageObject.getUpvoteCountText(rowIndex);
  const newCount = parseInt(newCountText?.trim().match(/\d+/)?.[0] || '0');

  return {
    success: newCount > initialCount,
    initialCount,
    newCount,
    difference: newCount - initialCount,
  };
}

/**
 * Upvote complaint detail
 */
export async function upvoteComplaintDetailFlow(page, { complaintDetailPageObject }) {
  // Step 1: Get initial upvote count
  const initialCountText = await complaintDetailPageObject.getUpvoteCountText();
  const initialCount = parseInt(initialCountText?.trim().match(/\d+/)?.[0] || '0');

  // Step 2: Click upvote button
  await complaintDetailPageObject.clickUpvote();

  // Step 3: Wait for count to change
  await page.waitForFunction(
    (expectedMin) => {
      const el = document.querySelector('[data-testid="detail-upvote-count"]');
      const count = parseInt(el?.textContent?.match(/\d+/)?.[0] || '0');
      return count > expectedMin;
    },
    initialCount,
    { timeout: 5000 }
  );

  // Step 4: Get new count
  const newCountText = await complaintDetailPageObject.getUpvoteCountText();
  const newCount = parseInt(newCountText?.trim().match(/\d+/)?.[0] || '0');

  return {
    success: newCount > initialCount,
    initialCount,
    newCount,
    difference: newCount - initialCount,
  };
}
