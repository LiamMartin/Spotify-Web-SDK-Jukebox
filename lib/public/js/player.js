window.onSpotifyWebPlaybackSDKReady = () => {
    let socket = window.socket = io('ws://' + window.location.hostname + "/", {transports: ['websocket']});
    let connected = false;
    let player = null;
    let accessToken = '';

    socket.on('connect', function () {
        console.log("Connected to server");
        connected = true;
    });

    socket.on("reconnect", function () {
        console.log("Reconnected");
        connected = true;
    })

    socket.on("disconnect", function () {
        console.error("Disconnected");
        connected = false;
    });

    socket.on('connectAccessToken', (token) => {
        accessToken = token;
        player = new Spotify.Player({
            name: 'Office Jukebox',
            getOAuthToken: cb => {
                cb(accessToken);
            },
            volume: 0.5
        });

        // Ready
        player.addListener('ready', ({device_id}) => {
            console.log('Ready with Device ID', device_id);
            socket.emit('playerConnected', {device_id});
        });

        // Not Ready
        player.addListener('not_ready', ({device_id}) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({message}) => {
            console.error(message);
        });

        player.addListener('authentication_error', ({message}) => {
            console.error(message);
        });

        player.addListener('account_error', ({message}) => {
            console.error(message);
        });

        player.addListener('player_state_changed', (data) => {
            if (!connected) {
                return;
            }

            var text = '';

            text += data.track_window.current_track.name;

            $('#currentlyPlaying').text(text);
            $('#status').text(data.paused ? 'Paused' : 'Playing');
        });

        player.connect().then(success => {
            if (success) {
                console.log('The Web Playback SDK successfully connected to Spotify!');
            }
        });

        window.player = player;
    });
}