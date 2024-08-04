const http = require("http");
const app = require("./app");

const port = 6060;

const server = http.createServer(app);
server.listen(port);
console.log(`[INFO] Listening on port ${port}!`)
