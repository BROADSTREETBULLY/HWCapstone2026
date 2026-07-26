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

describe("push-to-library and add-from-library", () => {
  let seeded, libOptionId;

  test("pushes a schedule-owned option to the library with breadcrumbs both ways", async () => {
    seeded = await seedScheduleWithItem(api, ctx.orgId);

    const res = await api.post(
      `/api/specs/options/${seeded.optionId}/push-to-library`,
    );
    expect(res.status).toBe(201);
    expect(res.body.spec.ownerType).toBe("library");
    expect(res.body.version.versionNumber).toBe(1);
    expect(res.body.version.rawText).toMatch(/walnut/); 
    expect(res.body.option.derivedFromVersionID).toBe(seeded.versionId);
    libOptionId = res.body.option._id;

    
    const src = await api.get(`/api/specs/options/${seeded.optionId}`);
    expect(src.body.pushedAsOptionID).toBe(libOptionId);
  });

  test("blocks a fresh push of the same option twice (409)", async () => {
    const res = await api.post(
      `/api/specs/options/${seeded.optionId}/push-to-library`,
    );
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already been pushed/);
  });

  test("blocks a fresh push of a library-owned option with no origin (400)", async () => {
    const spec = await api.post("/api/specs").send({
      orgId: ctx.orgId,
      ownerType: "library",
    });
    const opt = await api.post(`/api/specs/${spec.body._id}/options`).send({});
    await api
      .post(`/api/specs/options/${opt.body._id}/versions`)
      .send({ rawText: "direct library spec" });
    const res = await api.post(
      `/api/specs/options/${opt.body._id}/push-to-library`,
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Only schedule-owned/);
  });

  test("blocks pushing an option with no version", async () => {
    const spec = await api.post("/api/specs").send({
      orgId: ctx.orgId,
      ownerType: "library",
    });
    const opt = await api.post(`/api/specs/${spec.body._id}/options`).send({});
    const res = await api.post(
      `/api/specs/options/${opt.body._id}/push-to-library`,
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no version/);
  });

  test("adds a library option to a schedule as a cloned schedule-local family", async () => {
    const schedule = await api.post("/api/schedules").send({
      projectID: new mongoose.Types.ObjectId(),
      scheduleType: "FF&E",
    });

    const res = await api
      .post(`/api/schedules/${schedule.body._id}/items/from-library`)
      .send({ optionID: libOptionId, itemCode: "CH01" });
    expect(res.status).toBe(201);
    expect(res.body.spec.ownerType).toBe("schedule");
    expect(res.body.spec.scheduleID).toBe(schedule.body._id);
    expect(res.body.option._id).not.toBe(libOptionId); 
    expect(res.body.option.derivedFromVersionID).toBeDefined();
    expect(res.body.item.itemCode).toBe("CH01");


    await api
      .post(`/api/specs/options/${res.body.option._id}/versions`)
      .send({ rawText: "schedule-local edit" });
    const libOpt = await api.get(`/api/specs/options/${libOptionId}`);
    expect(libOpt.body.currentVersionID.rawText).not.toBe(
      "schedule-local edit",
    );
  });

  test("blocks adding a schedule-owned option from the library route", async () => {
    const schedule = await api.post("/api/schedules").send({
      projectID: new mongoose.Types.ObjectId(),
      scheduleType: "FF&E",
    });
    const res = await api
      .post(`/api/schedules/${schedule.body._id}/items/from-library`)
      .send({ optionID: seeded.optionId });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Only library-owned/);
  });

  test("push-back: a derived schedule copy pushes edits back as a new version on the library original", async () => {
    const schedule = await api.post("/api/schedules").send({
      projectID: new mongoose.Types.ObjectId(),
      scheduleType: "FF&E",
    });
    const added = await api
      .post(`/api/schedules/${schedule.body._id}/items/from-library`)
      .send({ optionID: libOptionId, itemCode: "CH09" });
    const copyOptionId = added.body.option._id;

    await api
      .post(`/api/specs/options/${copyOptionId}/versions`)
      .send({ rawText: "pushed-back edit ONE" });

    const before = await api.get(`/api/specs/options/${libOptionId}`);
    const beforeVersion = before.body.currentVersionID.versionNumber;

    const res = await api.post(
      `/api/specs/options/${copyOptionId}/push-to-library`,
    );
    expect(res.status).toBe(201);
    expect(res.body.pushedBack).toBe(true);
    expect(res.body.option._id).toBe(libOptionId); 
    expect(res.body.version.versionNumber).toBe(beforeVersion + 1);
    expect(res.body.version.rawText).toBe("pushed-back edit ONE");

    const after = await api.get(`/api/specs/options/${libOptionId}`);
    expect(after.body.currentVersionID.rawText).toBe("pushed-back edit ONE");
  });

  test("push-back is repeatable (no 409)", async () => {
    const schedule = await api.post("/api/schedules").send({
      projectID: new mongoose.Types.ObjectId(),
      scheduleType: "FF&E",
    });
    const added = await api
      .post(`/api/schedules/${schedule.body._id}/items/from-library`)
      .send({ optionID: libOptionId, itemCode: "CH10" });
    const copyOptionId = added.body.option._id;

    await api
      .post(`/api/specs/options/${copyOptionId}/versions`)
      .send({ rawText: "edit A" });
    const first = await api.post(
      `/api/specs/options/${copyOptionId}/push-to-library`,
    );
    expect(first.status).toBe(201);

    await api
      .post(`/api/specs/options/${copyOptionId}/versions`)
      .send({ rawText: "edit B" });
    const second = await api.post(
      `/api/specs/options/${copyOptionId}/push-to-library`,
    );
    expect(second.status).toBe(201);
    expect(second.body.version.rawText).toBe("edit B");
  });

  test("requires optionID in the body", async () => {
    const schedule = await api.post("/api/schedules").send({
      projectID: new mongoose.Types.ObjectId(),
      scheduleType: "FF&E",
    });
    const res = await api
      .post(`/api/schedules/${schedule.body._id}/items/from-library`)
      .send({});
    expect(res.status).toBe(400);
  });
});
