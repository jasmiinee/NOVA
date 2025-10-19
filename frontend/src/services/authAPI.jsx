import api from "./api.js";

// returns { ok, token, user } from backend
export async function loginApi({ email, password }) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function signupApi({ email, password, employeeId }) {
  const { data } = await api.post("/api/auth/signup", { email, password, employeeId });
  return data;
}

export async function meApi() {
  const { data } = await api.get("/api/auth/me");
  return data;
}
