//Entry point of the application

//import packages
const express = require('express');

const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");

//app
const app = express();
let bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));

//routes
app.use('/v1/user', userRoutes)
app.use('/books', bookRoutes)

module.exports = app;