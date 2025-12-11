const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // για cookie session_token
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data.detail || data.message || message;
    } catch (_) {}
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;

  return res.json();
}

export function getMe() {
  return request("/api/auth/me");
}

export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

export function authCallback(sessionId) {
  return request("/api/auth/callback", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export function getAttendances(year, month) {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (month) params.set("month", month);
  const qs = params.toString();
  return request(`/api/attendances${qs ? `?${qs}` : ""}`);
}

export function createAttendance(data) {
  return request("/api/attendances", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAttendance(attendanceId, data) {
  return request(`/api/attendances/${attendanceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAttendance(attendanceId) {
  return request(`/api/attendances/${attendanceId}`, {
    method: "DELETE",
  });
}

export function getAdminStats() {
  return request("/api/admin/stats");
}

export function adminDeleteAttendance(attendanceId) {
  return request(`/api/admin/attendances/${attendanceId}`, {
    method: "DELETE",
  });
}

export function adminDeleteUser(userId) {
  return request(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export function adminClearOldSessions() {
  return request("/api/admin/clear-old-sessions", {
    method: "POST",
  });
}
