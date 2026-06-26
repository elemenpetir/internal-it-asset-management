const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

let adminToken;
let employeeToken;

beforeAll(async () => {
  const [adminRes, employeeRes] = await Promise.all([
    request(app)
      .post("/api/auth/login")
      .send({ email: "admin@gmail.com", password: "admin12345" }),
    request(app)
      .post("/api/auth/login")
      .send({ email: "employee1@gmail.com", password: "11111111" }),
  ]);
  adminToken = adminRes.body.data.token;
  employeeToken = employeeRes.body.data.token;
});

describe("ANALYTICS API", () => {
  test("should return analytics overview for admin", async () => {
    const res = await request(app)
      .get("/api/analytics/overview")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("total_assets");
    expect(res.body.data).toHaveProperty("available");
    expect(res.body.data).toHaveProperty("assigned");
    expect(res.body.data).toHaveProperty("under_maintenance");
  });

  test("should return 403 when employee accesses analytics overview", async () => {
    const res = await request(app)
      .get("/api/analytics/overview")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("failed");
  });
});

afterAll(async () => {
  await db.end();
});
