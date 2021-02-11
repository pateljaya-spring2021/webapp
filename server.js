//My Node server

const http = require("http");
const app = require("./app");
const port = 3005;

const server = http.createServer(app);

server.listen(port, () => {
  console.log("Express server listening on port ", port);
});

module.exports = app