import { test, expect } from "@playwright/test";
import { AuthAPI } from "../../src/api/auth.api.js";
import { API_BASE_URL } from "../../src/config/api.config.js";
import users from "../../src/data/users.json" assert { type: "json" };

const authAPI = new AuthAPI();

test.describe("Login API Tests @api",() => {

  test.describe("Successful logins", () => {
    for (const role of ["student", "admin", "committee"]) {
    
      // 1 .
      test(`${role} logs in successfully`, async ({ request }) => {
        const user = users[role];
        const response = await authAPI.login(
          request,
          user.email,
          user.password,
          role
        );

        expect(response.status()).toBe(200);
        const body = await response.json();

        expect(body).toMatchObject({
          token: expect.any(String),
          role,
          email: user.email,
        });
      });
    }
  });


  test.describe("Failed logins", () => {
    test("should return 401 for incorrect password", async ({ request }) => {
      const user = users.student;
      const response = await authAPI.login(
        request,
        user.email,
        "WrongPassword",
        "student"
      );

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toMatch(/incorrect password/i);
    });

    test("should return 401 for non-existent account", async ({ request }) => {
      const response = await authAPI.login(
        request,
        "fake@test.com",
        "123456",
        "student"
      );

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toMatch(/account does not exist/i);
    });

    test("should return 400 for missing password", async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: { email: users.student.email },
        timeout: 5000,
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toMatch(/please provide/i);
    });
  });

  
  test.describe("Cross role validation", () => {
    test("should block admin trying student portal", async ({ request }) => {
      const user = users.admin;
      const response = await authAPI.login(
        request,
        user.email,
        user.password,
        "student"
      );

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.message).toMatch(/use the admin login portal/i);
    });

    test("should block student trying admin portal", async ({ request }) => {
      const user = users.student;
      const response = await authAPI.login(
        request,
        user.email,
        user.password,
        "admin"
      );

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.message).toMatch(/use the student login portal/i);
    });
  });




});


  // Security Testing - API
test.describe(" Security Validations", () => {

  for (const role of ["student", "admin","committee"]) {

    test(`${role}: should NOT include sensitive data (hashed pass ) in response object`, async ({ request }) => {
      const user = users[role];
      const response = await authAPI.login(request, user.email, user.password, role);

      expect(response.status()).toBe(200);
      const body = await response.json();

      expect(body.email).toBe(user.email);
      expect(body.role).toBe(role);
      expect(body.token).toBeDefined();
      expect(body.password).toBeUndefined();
      expect(body.passwordHash).toBeUndefined();
      expect(body.salt).toBeUndefined();
    });

    test(`${role}: should return a valid JWT token`, async ({ request }) => {
      const user = users[role];
      const response = await authAPI.login(request, user.email, user.password, role);

      expect(response.status()).toBe(200);
      const body = await response.json();

      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
      expect(body.token).toEqual(expect.stringMatching(jwtRegex));
    });

    test(`${role}: should return the correct user object schema on login`, async ({ request }) => {
      const user = users[role];
      const response = await authAPI.login(request, user.email, user.password, role);

      expect(response.status()).toBe(200);
      const body = await response.json();

      expect(body).toMatchObject({
        _id: expect.any(String),
        name: expect.any(String),
        email: user.email,
        role,
        token: expect.any(String)
      });
    });
  }
});