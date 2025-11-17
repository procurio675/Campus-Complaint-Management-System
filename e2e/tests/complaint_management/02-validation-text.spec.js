import { test, expect } from "@playwright/test";
import { apiLogin } from "../../src/api/auth.api.js";
import users from "../../src/data/users.json" assert { type: "json" };
import { AddComplaintPage } from "../../src/pages/student/addComplaint.page.js";

test.describe("Complaint Form - TEXT VALIDATION", () => {

  test.beforeEach(async ({ page }) => {
    // Login via API
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

  // ------------------------------------------------------------
  // EMPTY FIELDS
  // ------------------------------------------------------------
test("should block submit due to HTML5 required validation", async ({ page }) => {
  const addComplaintPage = new AddComplaintPage(page);

  // Submit with empty fields
  await addComplaintPage.submit();

  // Browser native validation must trigger
  await expect(page.locator('[data-testid="title-input"]:invalid')).toBeVisible();
  await expect(page.locator('[data-testid="description-input"]:invalid')).toBeVisible();
});


  // ------------------------------------------------------------
  // TITLE LENGTH VALIDATION
  // ------------------------------------------------------------

  test("should show error for title < 5 chars", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    await addComplaintPage.fillTitle("abc");
    await addComplaintPage.fillDescription("A valid description with more than thirty characters.");
    await addComplaintPage.submit();

    const errors = await page.getByTestId("error-list").textContent();
    expect(errors).toContain("Title must be at least 5 characters long.");
  });

  test("should limit title input to 200 chars", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    const longTitle = "x".repeat(205);

    await addComplaintPage.fillTitle(longTitle);

    const titleValue = await page.getByTestId("title-input").inputValue();
    expect(titleValue.length).toBe(200);

    await expect(page.getByTestId("title-char-count")).toContainText("200 / 200 characters");
  });

  // ------------------------------------------------------------
  // DESCRIPTION LENGTH VALIDATION
  // ------------------------------------------------------------

  test("should show error for description < 30 chars", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    await addComplaintPage.fillTitle("Wi-Fi issue");
    await addComplaintPage.fillDescription("Too short");
    await addComplaintPage.submit();

    const errors = await page.getByTestId("error-list").textContent();
    expect(errors).toContain("Please describe your complaint in at least 30 characters");
  });

  test("should show error for description > 3000 chars", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    const longDesc = "x".repeat(3050);

    await addComplaintPage.fillTitle("Long description");
    await addComplaintPage.fillDescription(longDesc);
    await addComplaintPage.submit();

    const errors = await page.getByTestId("error-list").textContent();
    expect(errors).toContain("Description has excessive repetition of a single character — please revise.");
  });

  // ------------------------------------------------------------
  // WORD REPETITION / LOW QUALITY TEXT
  // ------------------------------------------------------------

  test("should show error if description repeats same word excessively", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    await addComplaintPage.fillTitle("Spam complaint");
    await addComplaintPage.fillDescription("wifi wifi wifi wifi wifi wifi wifi wifi wifi");

    await addComplaintPage.submit();

    const errors = await page.getByTestId("error-list").textContent();
    expect(errors).toContain("Complaint repeats the same words");
  });

  // ------------------------------------------------------------
  // TITLE - DESCRIPTION SIMILARITY
  // ------------------------------------------------------------

  test("should show error if description is basically same as title", async ({ page }) => {
    const addComplaintPage = new AddComplaintPage(page);

    const text = "water leakage in bathroom";

    await addComplaintPage.fillTitle(text);
    await addComplaintPage.fillDescription(text + " " + text);  // same repeated

    await addComplaintPage.submit();

    const errors = await page.getByTestId("error-list").textContent();
    expect(errors).toContain("Complaint repeats the same words. Add more detail about the issue.");
  });

});
