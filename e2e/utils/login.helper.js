import users from "../src/data/users.json" assert { type: "json" };
import { apiLogin } from "../src/api/auth.api.js";

export async function loginAsStudent(page) {
  const student = users.student;

  // Use API login for reliability and speed
  const { token, user } = await apiLogin(student.email, student.password, 'student');

  // Inject auth into localStorage before navigation
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('ccms_token', token);
    localStorage.setItem('ccms_user', JSON.stringify(user));
  }, { token, user });
}
