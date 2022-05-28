console.log("Starting...")

const config = require("../config.json");

const deviceId = '13284af46ff40a918a38dc9b8e144cc85564a12c';

let express = require('express');
let app = express();

let accessToken = '';

let http = require("http"),
    server = http.Server(app),
    io = require("socket.io")(server),
    TokenManager = new require("./TokenManager");

tokenManager = new TokenManager(config, io);

let SpotifyWebApi = require('spotify-web-api-node');
let spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
});

tokenManager.get().then(function (token) {
    spotifyApi.setAccessToken(token);

    // Get a User's Available Devices
    spotifyApi.getMyDevices()
        .then(function (data) {
            let availableDevices = data.body.devices;
            console.log(availableDevices);
        }, function (err) {
            console.log('Something went wrong!', err);
        });
});

server.listen(config.http.port, config.http.ip);
console.log("Started on port %s:%s", config.http.ip, config.http.port);
app.use(express.static(__dirname + "/public"));

io.on('connection', function (socket) {
    var ip = socket.request.connection.remoteAddress;
    console.log("Connection from: " + ip)

    socket.on("disconnect", function () {
        console.log(ip + " disconnected: " + JSON.stringify(arguments));
    });

    socket.on("togglePlay", function () {
        console.log("toggle Play back");
    });
});