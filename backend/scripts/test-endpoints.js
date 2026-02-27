const base = "http://localhost:5000/api";

const today = new Date();
const toIsoDate = (date) => date.toISOString().slice(0, 10);
const past = new Date(today);
past.setDate(today.getDate() - 1);
const future = new Date(today);
future.setDate(today.getDate() + 1);

async function request(name, path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  console.log(
    `${name} => ${response.status}`,
    data ? JSON.stringify(data).slice(0, 200) : "",
  );
  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async function run() {
  await request("health", "/health");

  const login = await request("admin login", "/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@mitrafinance.local",
      password: "Admin1234",
    }),
  });
  assert(login.status === 200, "Admin login failed");

  const adminToken = login.data.token;
  const testUserEmail = `user${Date.now()}@mitrafinance.local`;

  const createUser = await request("admin create user", "/admin/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: "User Test",
      email: testUserEmail,
      password: "User12345",
      role: "user",
    }),
  });
  assert([201, 409].includes(createUser.status), "Create user failed");

  const createAsset = await request("create asset", "/assets", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: `Bitcoin Test ${Date.now()}`,
      category: "crypto",
      description: "test",
    }),
  });
  assert(createAsset.status === 201, "Create asset failed");

  const assetId = createAsset.data.id;

  const updateAsset = await request("update asset", `/assets/${assetId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: "Bitcoin Test Updated",
      category: "crypto",
      description: "updated",
    }),
  });
  assert(updateAsset.status === 200, "Update asset failed");

  const createPast = await request("create past snapshot", "/snapshots", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      asset_id: assetId,
      snapshot_date: toIsoDate(past),
      value: 1000000.25,
    }),
  });
  assert(createPast.status === 201, "Create past snapshot failed");

  const pastSnapshotId = createPast.data.id;

  const updatePast = await request(
    "update past snapshot forbidden",
    `/snapshots/${pastSnapshotId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ value: 1200000 }),
    },
  );
  assert(updatePast.status === 403, "Past snapshot update should be forbidden");

  const createFuture = await request(
    "create future snapshot rejected",
    "/snapshots",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        asset_id: assetId,
        snapshot_date: toIsoDate(future),
        value: 2000000,
      }),
    },
  );
  assert(createFuture.status === 400, "Future snapshot should be rejected");

  const createToday = await request("create today snapshot", "/snapshots", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      asset_id: assetId,
      snapshot_date: toIsoDate(today),
      value: 1500000,
    }),
  });
  assert(createToday.status === 201, "Create today snapshot failed");

  const todaySnapshotId = createToday.data.id;

  const updateToday = await request(
    "update today snapshot",
    `/snapshots/${todaySnapshotId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ value: 1700000 }),
    },
  );
  assert(updateToday.status === 200, "Update today snapshot failed");

  const dashboard = await request(
    "dashboard 30d",
    "/dashboard/net-worth?days=30",
    {
      headers: { Authorization: `Bearer ${adminToken}` },
    },
  );
  assert(
    dashboard.status === 200 && Array.isArray(dashboard.data),
    "Dashboard failed",
  );

  const logs = await request("admin logs", "/admin/logs", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(logs.status === 200 && Array.isArray(logs.data), "Admin logs failed");

  const userLogin = await request("user login", "/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: testUserEmail,
      password: "User12345",
    }),
  });
  assert(userLogin.status === 200, "User login failed");

  const userToken = userLogin.data.token;

  const userDeleteAttempt = await request(
    "user delete asset forbidden",
    `/assets/${assetId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userToken}` },
    },
  );
  assert(
    userDeleteAttempt.status === 403,
    "User delete asset should be forbidden",
  );

  const adminDelete = await request(
    "admin delete asset",
    `/assets/${assetId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    },
  );
  assert(adminDelete.status === 204, "Admin delete asset failed");

  console.log("ALL_ENDPOINT_TESTS_PASSED");
})().catch((error) => {
  console.error("ENDPOINT_TEST_FAILED:", error.message);
  process.exit(1);
});
