import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  const load = () => api.get("/admin/users").then(({ data }) => setUsers(data));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const resetForm = () => {
      setForm({ name: "", email: "", password: "", role: "user" });
      setError("");
    };
    el.addEventListener("hidden.bs.modal", resetForm);
    return () => el.removeEventListener("hidden.bs.modal", resetForm);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/admin/users", form);
      load();
      const modal = window.bootstrap.Modal.getInstance(modalRef.current);
      modal?.hide();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to create user");
    }
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">User Management</h2>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addUserModal"
        >
          + Add User
        </button>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="addUserModal"
        tabIndex="-1"
        aria-labelledby="addUserModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="addUserModalLabel">
                  Add New User
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label" htmlFor="user-name">
                    Name
                  </label>
                  <input
                    id="user-name"
                    className="form-control"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="user-email">
                    Email
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="user-password">
                    Password
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, password: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="user-role">
                    Role
                  </label>
                  <select
                    id="user-role"
                    className="form-select"
                    value={form.role}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, role: e.target.value }))
                    }
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
