const { userWithoutPassword }= require("../../utils/helper");

describe("userWithoutPassword", () => {

    let user = {
      dataValues: {
        first_name: 'Jayashree',
        password: '123'
      }
    }

    it("should return the user without password", () => {
        expect(userWithoutPassword(user)).toEqual({first_name: 'Jayashree'});
    });
});