console.log("Starting...");

let express = require('express');

let app = express();

let http = require("http"),
    server = http.Server(app),
    io = require("socket.io")(server);

let ip = '127.0.0.90';
let port = 8006;

server.listen(port, ip);
console.log("Started on port %s:%s", ip, port);

console.log(__dirname);

app.use(express.static(__dirname + "/public"));