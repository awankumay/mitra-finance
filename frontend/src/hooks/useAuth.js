import { useMemo } from "react";

function parseToken(token) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const data = JSON.parse(atob(payload));

    // -- Security: treat token as absent if it has already expired --
    if (data.exp && data.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }

    return data;
  } catch (_error) {
    return null;
  }
}

export function useAuth() {
  const token = localStorage.getItem("token");
  const user = useMemo(() => parseToken(token), [token]);

  function setToken(value) {
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
    window.location.reload();
  }

  return { token: user ? token : null, user, setToken };
}
