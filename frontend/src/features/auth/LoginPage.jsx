import { useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { token, setToken } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <div className="card" style={{ width: "360px" }}>
        <div className="card-body">
          <h2 className="card-title mb-3">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
