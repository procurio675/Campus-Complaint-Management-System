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


export async function apiLogin(email, password, role = 'student') {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, intendedRole: role })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    user: {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      committeeType: data.committeeType
    }
  };
}
