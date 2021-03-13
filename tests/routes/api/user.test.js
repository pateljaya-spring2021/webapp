require("mysql2/node_modules/iconv-lite").encodingExists("foo");
const app = require("../../../app");
// import db from "../../../models";
const supertest = require("supertest");
const User = require("../../../models").User;

describe("post /v1/user", () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await User.sync({ force: true });
  });

  describe("when user object is valid", () => {
    it("should return succees with correct response", async () => {
        const user = {
          first_name: "Jayashree",
          last_name: "Patel",
          password: "Jayashree@123",
          username: "a@b.com",
        };

        // App is used with supertest to simulate server request
        const response = await supertest(app)
          .post("/v1/user")
          .send(user)
          .expect(201);

        expect(response.body).toEqual(
          expect.objectContaining({
            first_name: "Jayashree",
            last_name: "Patel",
            username: "a@b.com",
          })
        );
      });
  });

  describe("when user object is invalid", () => {
    it("should return 400 bad request", async () => {
        const user = {
          first_name: "Jayashree",
          last_name: null,
          password: "Jayashree@123",
          username: "a@b.com",
        };

        const response = await supertest(app)
          .post("/v1/user")
          .send(user)
          .expect(400);
      });
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await User.close();
  });
});