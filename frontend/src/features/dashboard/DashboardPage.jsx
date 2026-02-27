import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { api } from "../../services/api";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

function toCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function DashboardPage() {
  const [points, setPoints] = useState([]);
  const [assets, setAssets] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/net-worth?days=30"),
      api.get("/assets"),
      api.get("/snapshots"),
    ]).then(([netWorthResponse, assetsResponse, snapshotsResponse]) => {
      setPoints(netWorthResponse.data);
      setAssets(assetsResponse.data);
      setSnapshots(snapshotsResponse.data);
    });
  }, []);

  const chartData = useMemo(
    () => ({
      labels: points.map((item) => item.snapshot_date.slice(0, 10)),
      datasets: [
        {
          label: "Total Net Worth",
          data: points.map((item) => Number(item.total_value)),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.2)",
        },
      ],
    }),
    [points],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    }),
    [],
  );

  const latest = points[points.length - 1];
  const first = points[0];

  const calculatePercent = (startValue, endValue) => {
    if (startValue === 0) {
      if (endValue > 0) return 100;
      if (endValue < 0) return -100;
      return 0;
    }

    return ((endValue - startValue) / Math.abs(startValue)) * 100;
  };

  const growthPercent = useMemo(() => {
    const startValue = Number(first?.total_value || 0);
    const endValue = Number(latest?.total_value || 0);

    return calculatePercent(startValue, endValue);
  }, [first, latest]);

  const formatGrowthLabel = (percent) =>
    percent > 0
      ? `Naik ${percent.toFixed(2)}%`
      : percent < 0
        ? `Turun ${Math.abs(percent).toFixed(2)}%`
        : "Tetap 0.00%";

  const growthLabel = formatGrowthLabel(growthPercent);

  const snapshotChange = useMemo(() => {
    if (!snapshots.length || !points.length) {
      return null;
    }

    const netWorthByDate = new Map(
      points.map((point) => [
        point.snapshot_date.slice(0, 10),
        Number(point.total_value || 0),
      ]),
    );

    const uniqueSnapshotDates = [
      ...new Set(snapshots.map((item) => item.snapshot_date.slice(0, 10))),
    ].sort();

    if (uniqueSnapshotDates.length < 2) {
      return null;
    }

    const latestSnapshotDate =
      uniqueSnapshotDates[uniqueSnapshotDates.length - 1];
    const previousSnapshotDate =
      uniqueSnapshotDates[uniqueSnapshotDates.length - 2];

    const latestValue = netWorthByDate.get(latestSnapshotDate);
    const previousValue = netWorthByDate.get(previousSnapshotDate);

    if (latestValue == null || previousValue == null) {
      return null;
    }

    return {
      label: formatGrowthLabel(calculatePercent(previousValue, latestValue)),
      fromDate: previousSnapshotDate,
      toDate: latestSnapshotDate,
      growthAmount: latestValue - previousValue,
    };
  }, [snapshots, points]);

  const summaryAssets = useMemo(() => {
    return assets
      .map((asset) => {
        const relatedSnapshots = snapshots.filter(
          (snapshot) => Number(snapshot.asset_id) === Number(asset.id),
        );

        if (!relatedSnapshots.length) {
          return {
            id: asset.id,
            name: asset.name,
            category: asset.category,
            oldSnapshotDate: "-",
            oldSnapshotValue: 0,
            lastSnapshotDate: "-",
            lastSnapshotValue: 0,
            latestValue: 0,
          };
        }

        const sortedSnapshots = [...relatedSnapshots].sort(
          (a, b) =>
            new Date(a.snapshot_date).getTime() -
            new Date(b.snapshot_date).getTime(),
        );

        const lastSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
        const oldSnapshot =
          sortedSnapshots.length > 1
            ? sortedSnapshots[sortedSnapshots.length - 2]
            : null;

        return {
          id: asset.id,
          name: asset.name,
          category: asset.category,
          oldSnapshotDate: oldSnapshot
            ? oldSnapshot.snapshot_date.slice(0, 10)
            : "-",
          oldSnapshotValue: Number(oldSnapshot?.value || 0),
          lastSnapshotDate: lastSnapshot.snapshot_date.slice(0, 10),
          lastSnapshotValue: Number(lastSnapshot.value || 0),
          latestValue: Number(lastSnapshot.value || 0),
        };
      })
      .sort((a, b) => b.latestValue - a.latestValue);
  }, [assets, snapshots]);

  const totalSummaryValue = useMemo(
    () => summaryAssets.reduce((sum, item) => sum + item.latestValue, 0),
    [summaryAssets],
  );

  const rangeText = snapshotChange
    ? `${snapshotChange.fromDate} → ${snapshotChange.toDate}`
    : "Belum cukup data snapshot";

  const growthAmountText = snapshotChange
    ? `${snapshotChange.growthAmount >= 0 ? "+" : "-"}${toCurrency(Math.abs(snapshotChange.growthAmount))}`
    : "-";

  const snapshotChangeText = snapshotChange
    ? `${snapshotChange.label}`
    : "Belum cukup data snapshot";

  return (
    <section>
      <div className="row align-items-center mb-3">
        <div className="col">
          <h4 className="mb-0">Dashboard (30D)</h4>
        </div>
        <div className="col text-end">
          <p>{rangeText}</p>
        </div>
      </div>

      <div className="row row-cols-2 row-cols-md-4 g-3 mb-3">
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Total Net Worth</h6>
              <p className="card-text mb-0">
                {toCurrency(Number(latest?.total_value || 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">
                Pertumbuhan (Rp)
              </h6>
              <p className="card-text mb-0">{growthAmountText}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">
                Perubahan 30 Hari
              </h6>
              <p className="card-text mb-0">{growthLabel}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Pertumbuhan</h6>
              <p className="card-text mb-0">{snapshotChangeText}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Net Worth Trend</h5>
          <div className="dashboard-chart-canvas">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Summary Assets</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm mb-0">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Old Snapshot</th>
                  <th>Last Snapshot</th>
                  <th>Portion</th>
                </tr>
              </thead>
              <tbody>
                {summaryAssets.map((item) => {
                  const portion =
                    totalSummaryValue > 0
                      ? (item.latestValue / totalSummaryValue) * 100
                      : 0;

                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>
                        {item.oldSnapshotDate === "-"
                          ? "-"
                          : `${item.oldSnapshotDate} (${toCurrency(item.oldSnapshotValue)})`}
                      </td>
                      <td>
                        {item.lastSnapshotDate === "-"
                          ? "-"
                          : `${item.lastSnapshotDate} (${toCurrency(item.lastSnapshotValue)})`}
                      </td>
                      <td>{portion.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
