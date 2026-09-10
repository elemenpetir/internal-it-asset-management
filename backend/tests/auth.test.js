const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

describe("AUTH API", () => {
  test("should login successfully with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@company.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("asset_admin");
  });

  test("should return 401 when password is invalid", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@company.com",
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
      email: "budi.santoso@company.com",
      password: "password123",
    });

    const employeeToken = loginRes.body.data.token;

    const res = await request(app)
      .get("/api/audit-logs")
      .set("authorization", `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("failed");
  });

  test("T3: should return 400 on activation with invalid employee data", async () => {
    const res = await request(app).post("/api/auth/activate").send({
      email: "nobody@company.com",
      employee_number: "EMP-9999",
      password: "testpass123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T3: should activate Hendro Wijaya (EMP-0006) as employee", async () => {
    const res = await request(app).post("/api/auth/activate").send({
      email: "hendro.wijaya@company.com",
      employee_number: "EMP-0006",
      password: "testpass123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.role).toBe("employee");
  });

  test("T3: should return 400 on double activation", async () => {
    const res = await request(app).post("/api/auth/activate").send({
      email: "hendro.wijaya@company.com",
      employee_number: "EMP-0006",
      password: "testpass123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  test("T3: activated account can log in", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "hendro.wijaya@company.com",
      password: "testpass123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.role).toBe("employee");
  });

  afterAll(async () => {
    // cleanup T3: unlink first (FK), then delete the user
    const [users] = await db.query(
      `SELECT id FROM users WHERE email = 'hendro.wijaya@company.com'`,
    );
    if (users.length > 0) {
      await db.query(`UPDATE employees SET user_id = NULL WHERE id = 7`);
      await db.query(`DELETE FROM users WHERE id = ?`, [users[0].id]);
    }
    await db.end();
  });
});
