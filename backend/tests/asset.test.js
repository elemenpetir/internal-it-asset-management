const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

let adminToken;

beforeAll(async () => {
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin@company.com",
    password: "password123",
  });
  adminToken = loginRes.body.data.token;
});

describe("ASSET API", () => {
  test("should create asset successfully", async () => {
    const res = await request(app)
      .post("/api/assets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        asset_code: "AST-TEST-001",
        name: "Test Laptop",
        category_id: 1,
        brand: "Test Brand",
        model: "Test Model",
        serial_number: "SN-TEST-001",
        purchase_date: "2023-01-01",
        status: "available",
        location: "IT Room",
        notes: "Test notes",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.asset_code).toBe("AST-TEST-001");
  });

  test("should return 400 when creating asset with missing fields", async () => {
    const res = await request(app)
      .post("/api/assets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Incomplete Asset" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("should get all assets successfully", async () => {
    const res = await request(app)
      .get("/api/assets")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

afterAll(async () => {
  // cleanup test asset
  await db.query("DELETE FROM assets WHERE asset_code = 'AST-TEST-001'");
  await db.end();
});
