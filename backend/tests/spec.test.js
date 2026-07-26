const { setupTestApp, teardownTestApp, authed } = require("./helpers");

let ctx, api;
beforeAll(async () => {
  ctx = await setupTestApp();
  api = authed(ctx.app, ctx.token);
});
afterAll(() => teardownTestApp(ctx.mongod));

describe("specs, options and versions", () => {
  let specId, optionId;

  test("creates a library-owned spec", async () => {
    const res = await api.post("/api/specs").send({
      orgId: ctx.orgId,
      ownerType: "library",
      category: "Chair",
      subCategory: "Task Chair",
    });
    expect(res.status).toBe(201);
    expect(res.body.ownerType).toBe("library");
    expect(res.body.createdBy).toBe(ctx.userId);
    specId = res.body._id;
  });

  test("rejects a spec with an invalid ownerType", async () => {
    const res = await api.post("/api/specs").send({
      orgId: ctx.orgId,
      ownerType: "banana",
    });
    expect(res.status).toBe(500); 
  });

  test("ownerType is immutable after creation", async () => {
    const res = await api
      .put(`/api/specs/${specId}`)
      .send({ ownerType: "schedule", category: "Chair - updated" });
    expect(res.status).toBe(200);
    expect(res.body.ownerType).toBe("library"); 
    expect(res.body.category).toBe("Chair - updated");
  });

  test("creates an option under the spec", async () => {
    const res = await api.post(`/api/specs/${specId}/options`).send({});
    expect(res.status).toBe(201);
    expect(res.body.specID).toBe(specId);
    expect(res.body.currentVersionID).toBeFalsy(); 
    optionId = res.body._id;
  });

  test("creates version 1 and moves the currentVersionID pointer", async () => {
    const res = await api
      .post(`/api/specs/options/${optionId}/versions`)
      .send({ productName: "Eames Lounge", rawText: "v1 text" });
    expect(res.status).toBe(201);
    expect(res.body.versionNumber).toBe(1);

    const opt = await api.get(`/api/specs/options/${optionId}`);
    expect(opt.body.currentVersionID._id).toBe(res.body._id);
  });

  test("creating another version auto-increments and re-points", async () => {
    const res = await api
      .post(`/api/specs/options/${optionId}/versions`)
      .send({ rawText: "v2 text" });
    expect(res.status).toBe(201);
    expect(res.body.versionNumber).toBe(2);

    const opt = await api.get(`/api/specs/options/${optionId}`);
    expect(opt.body.currentVersionID.versionNumber).toBe(2);
    expect(opt.body.currentVersionID.rawText).toBe("v2 text");
  });

  test("version history returns newest first with all versions intact", async () => {
    const res = await api.get(`/api/specs/options/${optionId}/versions`);
    expect(res.status).toBe(200);
    expect(res.body.map((v) => v.versionNumber)).toEqual([2, 1]);
    expect(res.body[1].rawText).toBe("v1 text"); 
  });

  test("stores attributes on a version", async () => {
    const res = await api
      .post(`/api/specs/options/${optionId}/versions`)
      .send({
        rawText: "v3",
        attributes: [{ key: "Finish", value: "Walnut", sortOrder: 1 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.attributes[0].key).toBe("Finish");
  });

  test("auto-parses rawText into attributes when none are supplied", async () => {
    const res = await api.post(`/api/specs/options/${optionId}/versions`).send({
      rawText: "Product: Filestor Shelving\nSize: D600 x W1200\nFinish: Laminate, white",
    });
    expect(res.status).toBe(201);
    expect(res.body.attributes).toHaveLength(3);
    expect(res.body.attributes[0]).toMatchObject({
      key: "Product",
      value: "Filestor Shelving",
    });
    expect(res.body.rawText).toMatch(/Filestor/); 
  });

  test("explicitly supplied attributes win over parsing", async () => {
    const res = await api.post(`/api/specs/options/${optionId}/versions`).send({
      rawText: "Product: should not be parsed",
      attributes: [{ key: "Custom", value: "explicit", sortOrder: 1 }],
    });
    expect(res.body.attributes).toHaveLength(1);
    expect(res.body.attributes[0].key).toBe("Custom");
  });

  test("rejects a version with no rawText (400)", async () => {
    const res = await api.post(`/api/specs/options/${optionId}/versions`).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/rawText/);
  });

  test("marks an option redundant", async () => {
    const res = await api
      .put(`/api/specs/options/${optionId}`)
      .send({ isRedundant: true });
    expect(res.status).toBe(200);
    expect(res.body.isRedundant).toBe(true);
  });

  test("spec grid query returns items and count", async () => {
    const res = await api.post("/api/specs/query").send({
      paginationModel: { page: 0, pageSize: 10 },
      filterModel: {
        items: [{ field: "category", value: "chair", operator: "contains" }],
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.itemCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test("404s on a valid-format id that does not exist", async () => {
    const res = await api.get("/api/specs/000000000000000000000000");
    expect(res.status).toBe(404);
  });

test("400s on a malformed id", async () => {
  const res = await api.get("/api/specs/options/notanid");
  expect(res.status).toBe(400);
});

  test("deletes a spec", async () => {
    const res = await api.delete(`/api/specs/${specId}`);
    expect(res.status).toBe(204);
    const gone = await api.get(`/api/specs/${specId}`);
    expect(gone.status).toBe(404);
  });
});
