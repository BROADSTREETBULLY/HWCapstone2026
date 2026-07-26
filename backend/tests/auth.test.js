const request = require("supertest");
const { setupTestApp, teardownTestApp } = require("./helpers");

let ctx;
beforeAll(async () => {
  ctx = await setupTestApp();
});
afterAll(() => teardownTestApp(ctx.mongod));

describe("auth", () => {
  test("registers a new user", async () => {
    const res = await request(ctx.app).post("/api/users/register").send({
      username: "second",
      firstName: "Second",
      lastName: "User",
      orgId: ctx.orgId,
      email: "second@test.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("second");
  });

  test("rejects duplicate email", async () => {
    const res = await request(ctx.app).post("/api/users/register").send({
      username: "third",
      firstName: "Third",
      lastName: "User",
      orgId: ctx.orgId,
      email: "second@test.com",
      password: "password123",
    });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/already exists/);
  });

  test("logs in with valid credentials and returns tokens", async () => {
    const res = await request(ctx.app)
      .post("/api/users/login")
      .send({ username: "tester", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test("rejects wrong password", async () => {
    const res = await request(ctx.app)
      .post("/api/users/login")
      .send({ username: "tester", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("rejects missing fields on login", async () => {
    const res = await request(ctx.app)
      .post("/api/users/login")
      .send({ username: "tester" });
    expect(res.status).toBe(400);
  });

  test("blocks protected routes without a token", async () => {
    const res = await request(ctx.app).get("/api/schedules");
    expect(res.status).toBe(401);
  });

  test("blocks protected routes with a garbage token", async () => {
    const res = await request(ctx.app)
      .get("/api/schedules")
      .set("Authorization", "Bearer notarealtoken");
    expect(res.status).toBe(403);
  });
});
