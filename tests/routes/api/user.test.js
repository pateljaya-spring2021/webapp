const Helper = require("../../../helper/helpers");
const helper = new Helper();
const urlPrefix = "/v1/user/self";

describe("Username should not be allowed to be updated", () => {
  it("Consuming Update User API endpoint", async () => {
      const { body } = await helper.apiServer
          .put(`${urlPrefix}`, {
            first_name: "Jane",
            last_name: "Doe",
            password: "skdjfhskdfjhg"
          })
      expect(body).not.toHaveProperty("username");
  });
});
