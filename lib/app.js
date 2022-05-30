console.log("Starting...")

const config = require("../config.json");

let auth = require('.' + config.spotify.authDir + 'auth.json');

let device = {};

let queue = [
    {uri: 'spotify:track:04OxTCLGgDKfO0MMA2lcxv'},
    {uri: 'spotify:track:5k3jdIh7BpJaV1DntDQoSD'},
    {uri: 'spotify:track:0BlGTqfeWoSOd0LId5imGt'},
    {uri: 'spotify:track:2HOMVMnOukowkziBJZyf7o'},
    {uri: 'spotify:track:7hvbAtsi9DoWZDJ3VWcfqJ'},
];

const express = require('express');
const fs = require('fs');
let app = express();

const http = require("http"),
    server = http.Server(app),
    io = require("socket.io")(server),
    querystring = require('query-string'),
    request = require("request");

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

let SpotifyWebApi = require('spotify-web-api-node');

let spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
});

spotifyApi.setAccessToken(auth.access);
spotifyApi.setRefreshToken(auth.refresh_token);

server.listen(config.http.port, config.http.ip);
console.log("Started on port %s:%s", config.http.ip, config.http.port);
app.use(express.static(__dirname + "/public"));

app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    var scopes = [
        'ugc-image-upload',
        'user-modify-playback-state',
        'user-read-playback-state',
        'user-read-currently-playing',
        'user-follow-modify',
        'user-follow-read',
        'user-read-recently-played',
        'user-read-playback-position',
        'user-top-read',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-read-private',
        'playlist-modify-private',
        'app-remote-control',
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-library-modify',
        'user-library-read',
    ];

    var scope = scopes.join(' ');

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: config.spotify.clientId,
            scope: scope,
            redirect_uri: config.spotify.redirectUri,
            state: state
        }));
});

app.get('/auth/callback', function (req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: config.spotify.redirectUri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(config.spotify.clientId + ':' + config.spotify.clientSecret).toString('base64'))
        },
        json: true
    };


    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let expires = (new Date).getTime() + body.expires_in * 1000;

            let auth = {
                code: code,
                state: state,
                access: body.access_token,
                expires: expires,
                refresh_token: body.refresh_token,
            }

            console.log(body);

            let json = JSON.stringify(auth);
            fs.writeFile(config.spotify.authDir + 'auth.json', json, function (err) {
                if (err) throw err;
                console.log(err);
            });
        }
    });


});

io.on('connection', function (socket) {
    var ip = socket.request.connection.remoteAddress;
    console.log("Connection from: " + ip)

    socket.on("disconnect", function () {
        console.log(ip + " disconnected: " + JSON.stringify(arguments));
    });

    socket.on("togglePlay", function () {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            console.log(data);
            if (data.body.is_playing) {
                spotifyApi.pause();
            } else {
                spotifyApi.play({uris: ['spotify:track:' + data.body.item.id], position_ms: data.body.progress_ms}).then((data) => {
                });
            }
        });
    });

    socket.on("setVolume", (data) => {
        if ('undefined' === typeof data.volume || data.volume <= 0 || data.volume >= 100) {
            return;
        }
        spotifyApi.setVolume(data.volume);
    });

    socket.on("changedSong", (data) => {
        console.log("changedSong", data);
        spotifyApi.play({uris: [data.uri]}).then((data) => {
        });
    });

    socket.on("playerConnected", ({device_id}) => {
        console.log(device_id);
        setTimeout(() => {
            spotifyApi.play({device_id: device_id, uris: [queue[0].uri]}).then((data) => {
            });
        }, 200);
    });
});