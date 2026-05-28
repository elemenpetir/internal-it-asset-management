const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

describe("AUTH API", () => {
  test("should login successfully with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@gmail.com",
      password: "admin12345",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("asset_admin");
  });

  test("should return 401 when password is invalid", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@gmail.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("invalid email or password");
  });

  test("should return 401 when accessing protected route without token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe("failed");
  });

  test("should return 403 when employee accesses audit logs", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "employee1@gmail.com",
      password: "11111111",
    });

    const employeeToken = loginRes.body.data.token;

    const res = await request(app)
      .get("/api/audit-logs")
      .set("authorization", `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(403)
    expect(res.body.status).toBe('failed')
  });

  afterAll(async () => {
    await db.end();
  });
});
