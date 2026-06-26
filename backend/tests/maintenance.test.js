const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

let employeeToken;
let maintenanceId;

beforeAll(async () => {
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "employee1@gmail.com",
    password: "11111111",
  });
  employeeToken = loginRes.body.data.token;
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

    console.log(res.body);
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
