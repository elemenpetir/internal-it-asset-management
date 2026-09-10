// B19: malformed tokens must yield null, never throw (blank page crash)
function decodePayload() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function getRoleFromToken() {
  return decodePayload()?.role ?? null;
}

export function getUserIdFromToken() {
  return decodePayload()?.id ?? null;
}