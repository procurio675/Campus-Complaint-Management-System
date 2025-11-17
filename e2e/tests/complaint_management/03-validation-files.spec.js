import { test, expect } from "@playwright/test";
import { apiLogin } from "../../src/api/auth.api.js";
import users from "../../src/data/users.json" assert { type: "json" };
import { AddComplaintPage } from "../../src/pages/student/addComplaint.page.js";

test.describe("Complaint Form - FILE VALIDATION", () => {

  test.beforeEach(async ({ page }) => {
    const { token, user } = await apiLogin(
      users.student.email,
      users.student.password,
      "student"
    );

    await page.addInitScript(({ token, user }) => {
      localStorage.setItem("ccms_token", token);
      localStorage.setItem("ccms_user", JSON.stringify(user));
    }, { token, user });

    await page.goto("http://localhost:5173/student-dashboard/add-complaint");

    // Disable native browser validation
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.setAttribute("novalidate", "true");
    });
  });

  test("should reject invalid file type", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/text-file.txt");
    await addPage.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should reject files larger than 10MB", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/image-10MB.jpg");
    await addPage.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should reject more than 3 files", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/image-2MB.jpg");
    await addPage.uploadFile("src/data/test-files/image-8MB.jpg");
    await addPage.uploadFile("src/data/test-files/image-2MB.jpg");

    // 4th upload
    await addPage.uploadFile("src/data/test-files/image-2MB.jpg");

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should reject when total upload size exceeds 20MB", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/image-8MB.jpg");
    await addPage.uploadFile("src/data/test-files/image-8MB.jpg");

    // Third file pushes total > 20MB
    await addPage.uploadFile("src/data/test-files/image-8MB.jpg");

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show preview for valid image files", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/image-2MB.jpg");

    await expect(page.getByTestId("file-preview-item-0")).toBeVisible();
  });

  test("should reject large video files", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/video-large-21MB.mp4"); // large but valid type

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

//   test("should remove a single file", async ({ page }) => {
//     const addPage = new AddComplaintPage(page);

//     await addPage.uploadFile("src/data/test-files/image-2MB.jpg");
//     await addPage.uploadFile("src/data/test-files/image-2MB.jpg");

//     // Verify 2 files are present
//     await expect(page.getByTestId("file-preview-item-0")).toBeVisible();
//     const fileCount = await page.locator('[data-testid^="file-preview-item-"]').count();
//     expect(fileCount).toBeGreaterThanOrEqual(1);

//     // Hover over the first file to reveal the remove button
//     await page.getByTestId("file-preview-item-0").hover();
    
//     // Remove first file
//     await page.getByTestId("remove-file-button-0").click();

//     // After removal, only 1 file should remain
//     const remainingCount = await page.locator('[data-testid^="file-preview-item-"]').count();
//     expect(remainingCount).toBe(1);
//     await expect(page.getByTestId("file-preview-item-0")).toBeVisible();
//   });

  test("should remove all files", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/image-2MB.jpg");
    await addPage.uploadFile("src/data/test-files/image-2MB.jpg");

    await page.getByTestId("remove-all-files-button").click();

    // No preview items should exist
    expect(await page.getByTestId("file-preview-item-0").count()).toBe(0);
  });

});
