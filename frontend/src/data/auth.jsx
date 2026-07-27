

import { apiFetch, setSession, clearSession, getUser, isLoggedIn } from "./api";

export { getUser, isLoggedIn };

export async function login(username, password) {
  const data = await apiFetch("/api/users/login", {
    method: "POST",
    body: { username, password },
    auth: false, 
  });
  const { password: _ph, ...safeUser } = data.user ?? {};
  setSession({ user: safeUser, accessToken: data.accessToken });
  return safeUser;
}

export async function register(fields) {
  return apiFetch("/api/users/register", {
    method: "POST",
    body: fields,
    auth: false,
  });
}

export function logout() {
  clearSession();
  window.location.assign("/");
}
