const userService = require("../services/users");
const { userWithoutPassword } = require('../utils/helper');
const logger = require('../config/logger');
const SDC = require('statsd-client');
const dbConfig = require("../config/config");

const sdc = new SDC({host: dbConfig.METRICS_HOSTNAME, port: dbConfig.METRICS_PORT});

const createUser = (req, res) => {

  let start = Date.now();
  logger.info("Entering create user endpoint");
  sdc.increment('No of times post user endpoint called');

  const { first_name, last_name, password, username } = req.body;

  const user = {
    first_name: first_name,
    last_name: last_name,
    password: password,
    username: username,
  };

  userService
    .createUser(user)
    .then((user) => {
      res.status(201).json(user);
      logger.info("New user created");
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for post user endpoint', elapsed);
    })
    .catch((errors) => {
      logger.error(errors[0].message);   
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for post user endpoint', elapsed);
      res.status(400).json(errors);
    });
};

const getUser = (req, res) => {

  let start = Date.now();
  logger.info("Entering get user endpoint");
  sdc.increment('No of times get user endpoint called');

  res.status(200).json(userWithoutPassword(req.user));

  let end = Date.now();
  var elapsed = end - start;
  sdc.timing('time taken for get user endpoint', elapsed);
};

const updateUser = (req, res) => {
  let start = Date.now();
  logger.info("Entering update user endpoint");
  sdc.increment('No of times update user endpoint called');
  const updateAttributes = Object.keys(req.body);

  if(unPermittedUpdateAttributes(updateAttributes)){
    logger.error("Request body has unpermitted Attributes");
    return res.sendStatus(400);
  }

  userService
    .updateUser(req.user, req.body)
    .then(() => {
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for update user endpoint', elapsed);
      return res.sendStatus(204);
    })
    .catch((errors) => {
      logger.error(errors[0].message);  
      let end = Date.now();
      var elapsed = end - start;
      sdc.timing('time taken for update user endpoint', elapsed);
      res.status(400).json(errors);
    });
};

const unPermittedUpdateAttributes = (updateAttributes) => {
  const permittedAttributes = ['first_name', 'last_name', 'password'];
  return !updateAttributes.every((attribute) => permittedAttributes.includes(attribute));
}

module.exports = {
  createUser,
  getUser,
  updateUser,
};
