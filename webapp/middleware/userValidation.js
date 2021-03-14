const userService = require("../services/users");

const validateUser = (req, res, next) => {
  // check for basic auth header

  userService
    .validateUser(req.body, req.method)
    .then(() => {
      next();
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
};
module.exports = validateUser;
