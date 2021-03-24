const models = require("../models");
const userService = require("../services/users");
const logger = require('../config/logger');

const authenticateUser = (req, res, next) => {
  logger.info("Entering User Authentication");
  // check for basic auth header
  const { authorization } = req.headers;
  if (!authorization && authorization.indexOf("Basic ") === -1) {
    logger.error("Missing Authorization Header");
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
      logger.info("User Authenticated");
      req.user = user;
      next();
    })
    .catch((error) => {
      logger.error(error);
      res.status(401).json(error);
    });
};
module.exports = authenticateUser;
