const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

let adminToken;
let availableAssetId;
let employeeId;

beforeAll(async () => {
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin@company.com",
    password: "password123",
  });
  adminToken = loginRes.body.data.token;

  // Ambil asset yang available
  const assetRes = await request(app)
    .get("/api/assets?status=available")
    .set("Authorization", `Bearer ${adminToken}`);
  availableAssetId = assetRes.body.data[0]?.id;

  // Ambil employee pertama
  const empRes = await request(app)
    .get("/api/employees")
    .set("Authorization", `Bearer ${adminToken}`);
  employeeId = empRes.body.data[0]?.id;
});

describe("ASSIGNMENT API", () => {
  test("should assign available asset to employee successfully", async () => {
    const res = await request(app)
      .post("/api/asset-assignments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        asset_id: availableAssetId,
        employee_id: employeeId,
        notes: "Test assignment",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
  });

  test("should return 400 when assigning already assigned asset", async () => {
    const res = await request(app)
      .post("/api/asset-assignments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        asset_id: availableAssetId,
        employee_id: employeeId,
        notes: "Duplicate assignment",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T1: should return asset via endpoint and flip status to available", async () => {
    const listRes = await request(app)
      .get("/api/asset-assignments")
      .set("Authorization", `Bearer ${adminToken}`);
    const assignment = listRes.body.data.find(
      (a) => a.asset_id === availableAssetId && a.status === "active",
    );
    expect(assignment).toBeDefined();

    const res = await request(app)
      .patch(`/api/asset-assignments/${assignment.id}/return`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");

    const assetRes = await request(app)
      .get(`/api/assets/${availableAssetId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(assetRes.body.data.status).toBe("available");
  });

  test("T1: should return 400 on double return", async () => {
    const listRes = await request(app)
      .get("/api/asset-assignments")
      .set("Authorization", `Bearer ${adminToken}`);
    const assignment = listRes.body.data.find(
      (a) => a.asset_id === availableAssetId,
    );

    const res = await request(app)
      .patch(`/api/asset-assignments/${assignment.id}/return`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T1: should return 400 when returning asset under maintenance", async () => {
    // re-assign, force under_maintenance (available -> under_maintenance is legal), then return
    const assignRes = await request(app)
      .post("/api/asset-assignments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ asset_id: availableAssetId, employee_id: employeeId });
    expect(assignRes.statusCode).toBe(201);

    const listRes = await request(app)
      .get("/api/asset-assignments")
      .set("Authorization", `Bearer ${adminToken}`);
    const assignment = listRes.body.data.find(
      (a) => a.asset_id === availableAssetId && a.status === "active",
    );

    await request(app)
      .patch(`/api/assets/${availableAssetId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "under_maintenance" });

    const res = await request(app)
      .patch(`/api/asset-assignments/${assignment.id}/return`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");

    // cleanup: restore asset to available and close the assignment directly
    await db.query(`UPDATE assets SET status = 'available' WHERE id = ?`, [
      availableAssetId,
    ]);
    await db.query(
      `UPDATE asset_assignments SET status = 'returned', returned_at = NOW() WHERE id = ?`,
      [assignment.id],
    );
  });
});

afterAll(async () => {
  // return asset setelah test
  if (availableAssetId) {
    const assignmentRes = await db.query(
      `SELECT id FROM asset_assignments WHERE asset_id = ? AND status = 'active'`,
      [availableAssetId],
    );
    if (assignmentRes[0].length > 0) {
      const assignmentId = assignmentRes[0][0].id;
      await db.query(
        `UPDATE asset_assignments SET status = 'returned', returned_at = NOW() WHERE id = ?`,
        [assignmentId],
      );
      await db.query(`UPDATE assets SET status = 'available' WHERE id = ?`, [
        availableAssetId,
      ]);
    }
  }
  await db.end();
});
