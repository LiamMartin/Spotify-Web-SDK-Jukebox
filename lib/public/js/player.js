window.onSpotifyWebPlaybackSDKReady = () => {
    var socket = window.socket = io('ws://' + window.location.hostname + "/", {transports: ['websocket']});
    var connected = false;

    const token = 'BQATbAq7OrtuC6zttyubZOzRTQteLORVu7KFF13344gyYK62cICm4fV_bgs_UGTlDJsaRRiPq1NvT38Vm_CvkgR4iNBS7rj6RTs2A2CGf2aN7KuUb__PoaMhvbxAx9j-0hSQkRxX--cbSKOyKocu8AINjWapnSlqFMoO_La4EZXo0lNQRnYxM5G4vlMCiGi0Lfr8NUCd5guoi9rqFriaOhhEgIT3OfqoO_d1Mkq6Qk4Ci4lfoQhb3spQgyEBZg8jCbmBTNL1hrpknvwdYuj9C_IXyTFpBkDplfw';
    const player = new Spotify.Player({
        name: 'Office Jukebox',
        getOAuthToken: cb => {
            cb(token);
        },
        volume: 0.5
    });

    let currentSong = false;

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

    player.connect();
    window.player = player;
}