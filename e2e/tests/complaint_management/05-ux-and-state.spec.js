import { test, expect } from "@playwright/test";
import { apiLogin } from "../../src/api/auth.api.js";
import users from "../../src/data/users.json" assert { type: "json" };
import { AddComplaintPage } from "../../src/pages/student/addComplaint.page.js";

test.describe("Complaint Form - UX & STATE", () => {

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
  });

  test("should update title and description character counters", async ({ page }) => {
    const addPage = new AddComplaintPage(page);
    
    await addPage.fillTitle("Hello");
    await expect(page.getByTestId("title-char-count")).toHaveText("5 / 200 characters");

    // Description
    await addPage.fillDescription("Testing character counter functionality...");
    await expect(page.getByTestId("description-char-count")).toContainText("characters");
  });

  test("should toggle between Public and Personal complaint type", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.selectPersonal();
    await expect(page.getByTestId("type-personal-radio")).toBeChecked();

    await addPage.selectPublic();
    await expect(page.getByTestId("type-public-radio")).toBeChecked();
  });

  test("should toggle anonymous checkbox correctly", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.toggleAnonymous(true);
    await expect(page.getByTestId("anonymous-checkbox")).toBeChecked();

    await addPage.toggleAnonymous(false);
    await expect(page.getByTestId("anonymous-checkbox")).not.toBeChecked();
  });

  test("should show file remove button when hovering file preview", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.uploadFile("src/data/test-files/image-2MB.jpg");

    await expect(page.getByTestId("file-preview-item-0")).toBeVisible();

    // The remove button only appears on hover
    await page.getByTestId("file-preview-item-0").hover();

    await expect(page.getByTestId("remove-file-button-0")).toBeVisible();
  });


  test("should display loading modal with spinner during submission", async ({ page }) => {
    const addPage = new AddComplaintPage(page);

    await addPage.fillTitle("Testing loading modal");
    await addPage.fillDescription("This description has enough valid length.");

    // Delay backend response so loading modal stays visible
    await page.route("**/complaints/create", async route => {
      await new Promise(r => setTimeout(r, 3000));
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          complaint: { _id: "507f1f77bcf86cd799439011" },
          routing: { committee: "Hostel" }
        }),
      });
    });

    await addPage.submit();

    // Loading modal must appear
    await expect(page.getByTestId("loading-modal-container")).toBeVisible();
    await expect(page.getByTestId("loading-spinner")).toBeVisible();

    // Eventually disappears
    await expect(page.getByTestId("loading-modal-container")).not.toBeVisible({ timeout: 8000 });
  });

});
