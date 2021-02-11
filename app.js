//Entry point of the application

//import packages
const express = require('express');

const userRoutes = require("./routes/userRoutes");

//app
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//context-path
const appContextPath = '/v1'

//routes
app.use(appContextPath + '/user', userRoutes)

module.exports = app;