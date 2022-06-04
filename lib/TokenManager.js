var events = require('events'),
    Promise = require('promise');


function TokenManager(spotify, io) {
    events.EventEmitter.call(this);
    this.spotify = spotify;
    this.io = io;
    this.token = spotify.getAccessToken();
    this.expires = 0;
}


TokenManager.prototype = {
    get: function () {
        return new Promise(function (resolve) {
            var time = (new Date).getTime();

            if (this.expires - 60000 < time) {
                //Expires before 60 secs in future
                this.updateToken().then(resolve)
            } else {
                resolve(this.token);
            }

        }.bind(this))
    },
    updateToken: function () {
        return new Promise(function (resolve) {
            if (this.io.sockets.sockets.length == 0) {
                //No one connected
                resolve(this.token);
                return;
            }
            this.spotify.refreshAccessToken().then(({body}) => {
                this.token = body.access_token;
                let duration = body.expires_in;
                this.expires = (new Date).getTime() + duration * 1000;
                this.emit("token", this.token);
                this.spotify.setAccessToken(this.token);

                console.log("Got access token %s", this.token);
                resolve(this.token);

                setTimeout(this.updateToken.bind(this), (duration - 30) * 1000); //Renew 30 secs before expires
            });
        }.bind(this))
    }
}

TokenManager.prototype.__proto__ = events.EventEmitter.prototype;


module.exports = TokenManager;