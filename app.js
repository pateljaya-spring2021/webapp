//Entry point of the application

//import packages
const express = require('express');

const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");

//app
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//routes
app.use('/v1/user', userRoutes)
app.use('/book', bookRoutes)

module.exports = app;