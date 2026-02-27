import { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/LoginPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { AssetsPage } from "./features/assets/AssetsPage";
import { SnapshotsPage } from "./features/snapshots/SnapshotsPage";
import { UsersPage } from "./features/users/UsersPage";
import { LogsPage } from "./features/users/LogsPage";
import { AppLayout } from "./layouts/AppLayout";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { token } = useAuth();
  const defaultRoute = useMemo(() => (token ? "/" : "/login"), [token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="snapshots" element={<SnapshotsPage />} />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/logs"
          element={
            <AdminRoute>
              <LogsPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}
