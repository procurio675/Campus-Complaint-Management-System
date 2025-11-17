import { test, expect } from "@playwright/test";
import { apiLogin } from "../../src/api/auth.api.js";
import users from "../../src/data/users.json" assert { type: "json" };
import { AddComplaintPage } from "../../src/pages/student/addComplaint.page.js";

test.describe("Complaint Form - TITLE VALIDATION", () => {

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

    // Disable browser native validation
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.setAttribute("novalidate", "true");
    });
  });

  test("should show error when title is empty", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    await addComplaintPage.fillTitle("");
    await addComplaintPage.fillDescription("Valid description with enough length");

    await addComplaintPage.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();

    const errorText = await page.getByTestId("error-list").textContent();
    expect(errorText).toMatch(/title/i);
  });

  test("should show error when title is shorter than 5 characters", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    await addComplaintPage.fillTitle("ab");
    await addComplaintPage.fillDescription("Valid long description for testing.");

    await addComplaintPage.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when title exceeds 200 characters", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    const longTitle = "x".repeat(210);
    await addComplaintPage.fillTitle(longTitle);
    await addComplaintPage.fillDescription("Valid description here...");

    await addComplaintPage.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when title contains no alphanumeric characters", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    await addComplaintPage.fillTitle("!!!@@@###---");
    await addComplaintPage.fillDescription("Proper valid description.");

    await addComplaintPage.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when title has excessive repetition", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    await addComplaintPage.fillTitle("wifi wifi wifi wifi wifi");
    await addComplaintPage.fillDescription(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaa a a a a a a a."
    );

    await addComplaintPage.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });
});
