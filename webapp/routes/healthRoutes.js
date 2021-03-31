//dependencies
const healthRouter = require("express").Router();

//import service layer
const healthController = require("../controllers/health");


/**
 * The following route is used to create a new user
 * @method GET
 * @memberof healthRoute
 * @function /healthstatus
 * @param {Object} req request
 * @param {Object} res response
 */
 healthRouter.get("/", healthController.healthCheck);

 module.exports = healthRouter;