console.log("Starting...")

const config = require("../config.json");

let express = require('express');
let app = express();

let http = require("http"),
    server = http.Server(app),
    io = require("socket.io")(server);

server.listen(config.http.port, config.http.ip);
console.log("Started on port %s:%s", config.http.ip, config.http.port);
app.use(express.static(__dirname + "/public"));
