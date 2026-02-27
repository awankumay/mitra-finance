import { useEffect, useState } from "react";
import { api } from "../../services/api";

export function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/admin/logs").then(({ data }) => setLogs(data));
  }, []);

  return (
    <section>
      <h2 className="mb-3">Audit Logs</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString("id-ID")}</td>
                <td>{log.user_id}</td>
                <td>{log.action_type}</td>
                <td>{log.entity_type}</td>
                <td>{log.entity_id || "-"}</td>
                <td>{log.ip_address || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
