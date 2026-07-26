const request = require("supertest");
const {
  setupTestApp,
  teardownTestApp,
  authed,
  seedScheduleWithItem,
} = require("./helpers");

let ctx, api;
beforeAll(async () => {
  ctx = await setupTestApp();
  api = authed(ctx.app, ctx.token);
});
afterAll(() => teardownTestApp(ctx.mongod));

describe("curated libraries", () => {
  let libraryId, libOptionId, libraryItemId, copyOptionId;

  test("creates a library", async () => {
    const res = await api
      .post("/api/libraries")
      .send({ name: "My Favourites", description: "go-to chairs" });
    expect(res.status).toBe(201);
    expect(res.body.userID).toBe(ctx.userId);
    libraryId = res.body._id;
  });

  test("rejects a library with no name", async () => {
    const res = await api.post("/api/libraries").send({});
    expect(res.status).toBe(400);
  });

  test("lists only the logged-in user's libraries", async () => {
    const res = await api.get("/api/libraries");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test("adding an org option creates an EDITABLE COPY, not a reference", async () => {
    
    const seeded = await seedScheduleWithItem(api, ctx.orgId);
    const pushed = await api.post(
      `/api/specs/options/${seeded.optionId}/push-to-library`,
    );
    libOptionId = pushed.body.option._id;

    const res = await api
      .post(`/api/libraries/${libraryId}/items`)
      .send({ optionID: libOptionId });
    expect(res.status).toBe(201);
    libraryItemId = res.body._id;
    copyOptionId = res.body.optionID;
    expect(copyOptionId).not.toBe(libOptionId); 
  });

  test("the copy's spec is marked with the libraryID (kept out of the org grid)", async () => {
    const copy = await api.get(`/api/specs/options/${copyOptionId}`);
    expect(copy.body.specID.libraryID).toBe(libraryId);
    expect(copy.body.derivedFromVersionID).toBeDefined();

  
    const grid = await api.post("/api/specs/query").send({});
    const ids = grid.body.items.map((s) => s._id);
    expect(ids).not.toContain(copy.body.specID._id);
  });

  test("editing the copy does not touch the org original", async () => {
    await api
      .post(`/api/specs/options/${copyOptionId}/versions`)
      .send({ rawText: "my personal tweak" });
    const original = await api.get(`/api/specs/options/${libOptionId}`);
    expect(original.body.currentVersionID.rawText).not.toBe("my personal tweak");
  });

  test("adding the same org option again creates a second independent copy", async () => {
    const res = await api
      .post(`/api/libraries/${libraryId}/items`)
      .send({ optionID: libOptionId });
    expect(res.status).toBe(201);
    expect(res.body.optionID).not.toBe(copyOptionId);
    await api.delete(`/api/libraries/items/${res.body._id}`);
  });

  test("blocks adding a schedule-owned option to a user library", async () => {
    const seeded = await seedScheduleWithItem(api, ctx.orgId);
    const res = await api
      .post(`/api/libraries/${libraryId}/items`)
      .send({ optionID: seeded.optionId });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Only library-owned/);
  });

  test("lists items with the COPY's current text resolved", async () => {
    const res = await api.get(`/api/libraries/${libraryId}/items`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].optionID._id).toBe(copyOptionId);
    expect(res.body[0].optionID.currentVersionID.rawText).toBe(
      "my personal tweak",
    );
  });

  test("another user cannot see or touch this library (all 404)", async () => {
    await request(ctx.app).post("/api/users/register").send({
      username: "intruder",
      firstName: "In",
      lastName: "Truder",
      orgId: ctx.orgId,
      email: "intruder@test.com",
      password: "password123",
    });
    const login = await request(ctx.app)
      .post("/api/users/login")
      .send({ username: "intruder", password: "password123" });
    const other = authed(ctx.app, login.body.accessToken);

    expect((await other.get(`/api/libraries/${libraryId}/items`)).status).toBe(404);
    expect((await other.put(`/api/libraries/${libraryId}`).send({ name: "mine now" })).status).toBe(404);
    expect((await other.delete(`/api/libraries/items/${libraryItemId}`)).status).toBe(404);
    expect((await other.delete(`/api/libraries/${libraryId}`)).status).toBe(404);


    const list = await other.get("/api/libraries");
    expect(list.body.length).toBe(0);
  });

  test("removes an item", async () => {
    const res = await api.delete(`/api/libraries/items/${libraryItemId}`);
    expect(res.status).toBe(204);
    const list = await api.get(`/api/libraries/${libraryId}/items`);
    expect(list.body.length).toBe(0);
  });

  test("deletes a library and its items", async () => {
    const res = await api.delete(`/api/libraries/${libraryId}`);
    expect(res.status).toBe(204);
    const list = await api.get("/api/libraries");
    expect(list.body.find((l) => l._id === libraryId)).toBeUndefined();
  });
});
