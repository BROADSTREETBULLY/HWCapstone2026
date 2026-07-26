
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");

const setupTestApp = async () => {
  let mongod = null;
  const dbName = `CapstoneTest_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  if (process.env.TEST_DB_URI) {
    process.env.DB_URI = `${process.env.TEST_DB_URI.replace(/\/$/, "")}/${dbName}`;
  } else {
    mongod = await MongoMemoryServer.create();
    process.env.DB_URI = mongod.getUri(dbName);
  }
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

  const app = require("../src/app");
  const Organisation = require("../src/models/orgModel");

  await mongoose.connection.asPromise();

  const org = await Organisation.create({
    ownerId: new mongoose.Types.ObjectId(),
    orgName: "Test Firm",
  });

  await request(app).post("/api/users/register").send({
    username: "tester",
    firstName: "Test",
    lastName: "User",
    orgId: org._id,
    email: "tester@test.com",
    password: "password123",
  });

  const login = await request(app)
    .post("/api/users/login")
    .send({ username: "tester", password: "password123" });

  return {
    app,
    mongod,
    orgId: org._id,
    token: login.body.accessToken,
    userId: login.body.user._id,
  };
};

const teardownTestApp = async (mongod) => {
  await mongoose.connection.dropDatabase().catch(() => {});
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
};


const authed = (app, token) => ({
  get: (url) => request(app).get(url).set("Authorization", `Bearer ${token}`),
  post: (url) => request(app).post(url).set("Authorization", `Bearer ${token}`),
  put: (url) => request(app).put(url).set("Authorization", `Bearer ${token}`),
  delete: (url) =>
    request(app).delete(url).set("Authorization", `Bearer ${token}`),
});


const seedScheduleWithItem = async (api, orgId) => {
  const schedule = await api
    .post("/api/schedules")
    .send({ projectID: new mongoose.Types.ObjectId(), scheduleType: "FF&E" });

  const item = await api
    .post(`/api/schedules/${schedule.body._id}/items`)
    .send({
      orgId,
      category: "Chair",
      subCategory: "Task Chair",
      productName: "Eames Lounge",
      rawText: "Eames lounge chair, walnut shell, black leather",
      itemCode: "CH01",
    });

  return {
    scheduleId: schedule.body._id,
    itemId: item.body.item._id,
    specId: item.body.spec._id,
    optionId: item.body.option._id,
    versionId: item.body.version._id,
  };
};

module.exports = { setupTestApp, teardownTestApp, authed, seedScheduleWithItem };
