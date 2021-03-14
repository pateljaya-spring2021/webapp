const models = require("../models");
const userService = require("../services/users");

const authenticateUser = (req, res, next) => {
  // check for basic auth header
  const { authorization } = req.headers;
  if (!authorization && authorization.indexOf("Basic ") === -1) {
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  // verify auth credentials
  const base64Credentials = authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  userService
    .authenticate( username, password )
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => {
      res.status(401).json(error);
    });
};
module.exports = authenticateUser;
