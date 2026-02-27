import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

const categories = ["stock", "gold", "crypto", "other"];

export function AssetsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", category: "stock" });
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  const load = () => api.get("/assets").then(({ data }) => setItems(data));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const resetForm = () => {
      setForm({ name: "", category: "stock" });
      setError("");
    };
    el.addEventListener("hidden.bs.modal", resetForm);
    return () => el.removeEventListener("hidden.bs.modal", resetForm);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/assets", form);
      load();
      const modal = window.bootstrap.Modal.getInstance(modalRef.current);
      modal?.hide();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create asset");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/assets/${id}`);
    load();
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Assets</h2>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addAssetModal"
        >
          + Add Asset
        </button>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="addAssetModal"
        tabIndex="-1"
        aria-labelledby="addAssetModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="addAssetModalLabel">
                  Add New Asset
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
                  <label className="form-label" htmlFor="asset-name">
                    Name
                  </label>
                  <input
                    id="asset-name"
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
                  <label className="form-label" htmlFor="asset-category">
                    Category
                  </label>
                  <select
                    id="asset-category"
                    className="form-select"
                    value={form.category}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, category: e.target.value }))
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
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
        <table className="table table-bordered table-hover table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.description || "-"}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
