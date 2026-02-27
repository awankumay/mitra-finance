import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function AppLayout() {
  const { user, setToken } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">MitraFinance</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/assets">
                  Assets
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/snapshots">
                  Snapshots
                </NavLink>
              </li>
              {user?.role === "admin" && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/users">
                    Users
                  </NavLink>
                </li>
              )}
              {user?.role === "admin" && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/logs">
                    Audit Logs
                  </NavLink>
                </li>
              )}
            </ul>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">
                {user?.name || user?.email}
              </span>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setToken(null)}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container-fluid py-3">
        <Outlet />
      </main>
    </>
  );
}
