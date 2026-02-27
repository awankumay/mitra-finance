import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

export function SnapshotsPage() {
  const [assets, setAssets] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    asset_id: "",
    snapshot_date: "",
    value: "",
  });
  const [error, setError] = useState("");
  const [tableError, setTableError] = useState("");
  const modalRef = useRef(null);

  const load = async () => {
    const [assetResponse, snapshotResponse] = await Promise.all([
      api.get("/assets"),
      api.get("/snapshots"),
    ]);
    setAssets(assetResponse.data);
    setItems(snapshotResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const resetForm = () => {
      setForm({ asset_id: "", snapshot_date: "", value: "" });
      setError("");
    };
    el.addEventListener("hidden.bs.modal", resetForm);
    return () => el.removeEventListener("hidden.bs.modal", resetForm);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/snapshots", { ...form, value: Number(form.value) });
      await load();
      const modal = window.bootstrap.Modal.getInstance(modalRef.current);
      modal?.hide();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create snapshot");
    }
  }

  async function removeSnapshot(id) {
    try {
      await api.delete(`/snapshots/${id}`);
      await load();
    } catch (err) {
      setTableError(err.response?.data?.message || "Delete failed");
    }
  }

  function getAssetName(assetId) {
    const asset = assets.find((item) => item.id === assetId);
    return asset?.name || `Unknown (${assetId})`;
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Snapshots</h2>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addSnapshotModal"
        >
          + Add Snapshot
        </button>
      </div>

      {tableError && (
        <div className="alert alert-danger py-2" role="alert">
          {tableError}
        </div>
      )}

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="addSnapshotModal"
        tabIndex="-1"
        aria-labelledby="addSnapshotModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="addSnapshotModalLabel">
                  Add New Snapshot
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
                  <label className="form-label" htmlFor="snap-asset">
                    Asset
                  </label>
                  <select
                    id="snap-asset"
                    className="form-select"
                    value={form.asset_id}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, asset_id: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select asset</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="snap-date">
                    Date
                  </label>
                  <input
                    id="snap-date"
                    type="date"
                    className="form-control"
                    value={form.snapshot_date}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, snapshot_date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="snap-value">
                    Value
                  </label>
                  <input
                    id="snap-value"
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Value"
                    value={form.value}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, value: e.target.value }))
                    }
                    required
                  />
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
              <th>ID</th>
              <th>Asset Name</th>
              <th>Date</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{getAssetName(item.asset_id)}</td>
                <td>{item.snapshot_date.slice(0, 10)}</td>
                <td>{item.value}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeSnapshot(item.id)}
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
