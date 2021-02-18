const { omit } = require("lodash");

const userWithoutPassword = (user) => {
  return omit(user.dataValues, ["password"]);
};

const bookWithoutUpdatedDate = (book) => {
  return omit(book.dataValues, ["book_updated"]);
};

module.exports = {
  userWithoutPassword,
  bookWithoutUpdatedDate
};
