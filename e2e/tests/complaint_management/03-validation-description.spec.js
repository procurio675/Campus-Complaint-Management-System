import { test, expect } from "@playwright/test";
import { apiLogin } from "../../src/api/auth.api.js";
import users from "../../src/data/users.json" assert { type: "json" };
import { AddComplaintPage } from "../../src/pages/student/addComplaint.page.js";

test.describe("Complaint Form - DESCRIPTION VALIDATION", () => {

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

    // Disable browser validation to test React validations
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.setAttribute("novalidate", "true");
    });
  });

  test("should show error when description is empty", async ({ page }) => {
    const pageObj = new AddComplaintPage(page);

    await pageObj.fillTitle("Broken equipment");
    await pageObj.fillDescription("");
    await pageObj.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when description is too short", async ({ page }) => {
    const pageObj = new AddComplaintPage(page);

    await pageObj.fillTitle("Broken tap");
    await pageObj.fillDescription("too short...");
    await pageObj.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when description exceeds 3000 chars", async ({ page }) => {
    const pageObj = new AddComplaintPage(page);

    await pageObj.fillTitle("Overflow");
    await pageObj.fillDescription("x".repeat(4000));
    await pageObj.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when description has no alphanumeric characters", async ({ page }) => {
    const pageObj = new AddComplaintPage(page);

    await pageObj.fillTitle("Noise issue");
    await pageObj.fillDescription("@@@@@@@!!!!!!----");
    await pageObj.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error on heavy repetition", async ({ page }) => {
    const pageObj = new AddComplaintPage(page);

    await pageObj.fillTitle("Water issue");
    await pageObj.fillDescription("water water water water water");
    await pageObj.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when description equals title", async ({ page }) => {
    const pageObj = new AddComplaintPage(page);

    await pageObj.fillTitle("wifi broken");
    await pageObj.fillDescription("wifi broken");
    await pageObj.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

  test("should show error when description is a repeated or extended title copy", async ({ page }) => {
    const pageObj = new AddComplaintPage(page);

    await pageObj.fillTitle("wifi not working");
    await pageObj.fillDescription("wifi not working wifi not working");
    await pageObj.submit();

    await expect(page.getByTestId("error-container")).toBeVisible();
  });

});
