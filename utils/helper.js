const { omit } = require("lodash");

const userWithoutPassword = (user) => {
  return omit(user.dataValues, ["password"]);
};

module.exports = {
  userWithoutPassword
};
