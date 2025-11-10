import { API_BASE_URL } from "../config/api.config.js";

export class AuthAPI {
  async login(request, email, password, intendedRole) {
    const url = `${API_BASE_URL}/api/auth/login`;

    const response = await request.post(url, {
      data: { email, password, intendedRole },
      headers: { "Content-Type": "application/json" },
    });

    return response;
  }
}
