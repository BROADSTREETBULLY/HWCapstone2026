const mongoose = require("mongoose");
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

describe("schedules and schedule items", () => {
  let scheduleId, itemId, optionId;

  test("creates a schedule and auto-titles from type", async () => {
    const res = await api.post("/api/schedules").send({
      projectID: new mongoose.Types.ObjectId(),
      scheduleType: "FF&E",
    });
    expect(res.status).toBe(201);
    expect(res.body.scheduleTitle).toBe("FF&E Schedule");
    expect(res.body.scheduleStatus).toBe("draft");
    scheduleId = res.body._id;
  });

  test("keeps an explicit title when supplied", async () => {
    const res = await api.post("/api/schedules").send({
      projectID: new mongoose.Types.ObjectId(),
      scheduleType: "Finishes",
      scheduleTitle: "Appendix 6 - Finishes",
    });
    expect(res.body.scheduleTitle).toBe("Appendix 6 - Finishes");
  });

  test("rejects a schedule without a type", async () => {
    const res = await api
      .post("/api/schedules")
      .send({ projectID: new mongoose.Types.ObjectId() });
    expect(res.status).toBe(500); 
  });

  test("creates an item with a brand new free-text spec (Spec > Option > Version > Item)", async () => {
    const res = await api.post(`/api/schedules/${scheduleId}/items`).send({
      orgId: ctx.orgId,
      category: "Chair",
      productName: "Eames Lounge",
      rawText: "Eames lounge chair, walnut, black leather",
      itemCode: "CH01",
    });
    expect(res.status).toBe(201);
    expect(res.body.spec.ownerType).toBe("schedule");
    expect(res.body.spec.scheduleID).toBe(scheduleId);
    expect(res.body.version.versionNumber).toBe(1);
    expect(res.body.option.currentVersionID).toBe(res.body.version._id);
    expect(res.body.item.scheduleID).toBe(scheduleId);
    itemId = res.body.item._id;
    optionId = res.body.option._id;
  });

  test("item creation auto-parses rawText into version attributes", async () => {
    const res = await api.post(`/api/schedules/${scheduleId}/items`).send({
      orgId: ctx.orgId,
      category: "Storage",
      rawText: "Product: Filestor Shelving\nSize: D600 x W1200 x H850mm\nInstallation: Under bench",
      itemCode: "ST01",
    });
    expect(res.status).toBe(201);
    expect(res.body.version.attributes.map((a) => a.key)).toEqual([
      "Product",
      "Size",
      "Installation",
    ]);
    await api.delete(`/api/schedules/items/${res.body.item._id}`); 
  });

  test("lists items with live spec text resolved through the pointer", async () => {
    const res = await api.get(`/api/schedules/${scheduleId}/items`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].optionID.currentVersionID.rawText).toMatch(/walnut/);
    expect(res.body[0].optionID.specID.ownerType).toBe("schedule");
  });

  test("editing spec text (new version) is reflected in the item list without touching the item", async () => {
    await api
      .post(`/api/specs/options/${optionId}/versions`)
      .send({ rawText: "UPDATED spec text" });

    const res = await api.get(`/api/schedules/${scheduleId}/items`);
    expect(res.body[0].optionID.currentVersionID.rawText).toBe(
      "UPDATED spec text",
    );
    expect(res.body[0].optionID.currentVersionID.versionNumber).toBe(2);
  });

  test("updates item wrapper fields only", async () => {
    const res = await api
      .put(`/api/schedules/items/${itemId}`)
      .send({ itemCode: "CH02", itemComments: "west wing", sortOrder: 5 });
    expect(res.status).toBe(200);
    expect(res.body.itemCode).toBe("CH02");
    expect(res.body.updatedBy).toBe(ctx.userId);
  });

  test("filters schedules by projectID query param", async () => {
    const projectID = new mongoose.Types.ObjectId();
    await api.post("/api/schedules").send({ projectID, scheduleType: "Doors" });
    const res = await api.get(`/api/schedules?projectID=${projectID}`);
    expect(res.body.length).toBe(1);
    expect(res.body[0].scheduleType).toBe("Doors");
  });

  test("updates and deletes a schedule", async () => {
    const upd = await api
      .put(`/api/schedules/${scheduleId}`)
      .send({ scheduleStatus: "active" });
    expect(upd.body.scheduleStatus).toBe("active");
    expect(upd.body.updatedBy).toBe(ctx.userId);

    const del = await api.delete(`/api/schedules/${scheduleId}`);
    expect(del.status).toBe(204);
    const gone = await api.get(`/api/schedules/${scheduleId}`);
    expect(gone.status).toBe(404);
  });

  test("deletes an item", async () => {
    const seeded = await seedScheduleWithItem(api, ctx.orgId);
    const del = await api.delete(`/api/schedules/items/${seeded.itemId}`);
    expect(del.status).toBe(204);
    const list = await api.get(`/api/schedules/${seeded.scheduleId}/items`);
    expect(list.body.length).toBe(0);
  });
});
