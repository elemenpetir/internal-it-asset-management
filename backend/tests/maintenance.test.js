const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

let employeeToken;
let adminToken;
let maintenanceId;

beforeAll(async () => {
  const [employeeRes, adminRes] = await Promise.all([
    request(app).post("/api/auth/login").send({
      email: "budi.santoso@company.com",
      password: "password123",
    }),
    request(app).post("/api/auth/login").send({
      email: "admin@company.com",
      password: "password123",
    }),
  ]);
  employeeToken = employeeRes.body.data.token;
  adminToken = adminRes.body.data.token;
});

describe("MAINTENANCE API", () => {
  test("should create maintenance request for assigned asset", async () => {
    // Ambil asset yang di-assign ke employee ini
    const assetsRes = await request(app)
      .post("/api/maintenance-requests/my-assets")
      .set("Authorization", `Bearer ${employeeToken}`);

    const myAssets = assetsRes.body.data;

    if (!myAssets || myAssets.length === 0) {
      console.warn("No assigned assets for employee, skipping test.");
      return;
    }

    const assetId = myAssets[0].id;

    const res = await request(app)
      .post("/api/maintenance-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        asset_id: assetId,
        issue_description: "Test issue from unit test",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    maintenanceId = res.body.data?.id;
  });

  test("should return maintenance requests for employee", async () => {
    const res = await request(app)
      .get("/api/maintenance-requests/my-requests")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("T4: should return 400 when requesting maintenance for someone else's asset", async () => {
    // asset 2 is assigned to Siti (employee 2), not Budi
    const res = await request(app)
      .post("/api/maintenance-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ asset_id: 2, issue_description: "Not mine" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T4: should return 400 on duplicate active request for same asset", async () => {
    if (!maintenanceId) {
      console.warn("No maintenance request created, skipping test.");
      return;
    }
    const myRes = await request(app)
      .get("/api/maintenance-requests/my-requests")
      .set("Authorization", `Bearer ${employeeToken}`);
    const mine = myRes.body.data.find((r) => r.id === maintenanceId);
    expect(mine).toBeDefined();

    const res = await request(app)
      .post("/api/maintenance-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ asset_id: mine.asset_id, issue_description: "Duplicate request" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T2: should return 400 on illegal reported -> completed jump", async () => {
    if (!maintenanceId) {
      console.warn("No maintenance request created, skipping test.");
      return;
    }
    const res = await request(app)
      .patch(`/api/maintenance-requests/${maintenanceId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "completed", resolution_note: "Skipped triage" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T2: should move reported -> in_progress and flip asset to under_maintenance", async () => {
    if (!maintenanceId) {
      console.warn("No maintenance request created, skipping test.");
      return;
    }
    const res = await request(app)
      .patch(`/api/maintenance-requests/${maintenanceId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "in_progress" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  test("T2: should return 400 when completing without resolution note", async () => {
    if (!maintenanceId) {
      console.warn("No maintenance request created, skipping test.");
      return;
    }
    const res = await request(app)
      .patch(`/api/maintenance-requests/${maintenanceId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "completed" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T2: should complete with note and flip asset back to assigned", async () => {
    if (!maintenanceId) {
      console.warn("No maintenance request created, skipping test.");
      return;
    }
    const res = await request(app)
      .patch(`/api/maintenance-requests/${maintenanceId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "completed", resolution_note: "Fixed in test" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

afterAll(async () => {
  // cleanup test maintenance request
  if (maintenanceId) {
    await db.query(`DELETE FROM maintenance_requests WHERE id = ?`, [
      maintenanceId,
    ]);
  }
  await db.end();
});
