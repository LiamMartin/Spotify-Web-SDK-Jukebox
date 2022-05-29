window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQD2JI17KnL5LMva8xQb-qyu_9Jl2De3l-dr1LReeso9VDaHprdxmQ9pgacJSckDOpGsa6xD4UMIk3sykKoHGkt6zEo0lib4mKmtVrspgaYUchjcBYAFxK6MpYL-XXaMNdmplRWfdLj8WuQkm75C4m3-jh6A_vEWcVV0UEwG';
    const player = new Spotify.Player({
        name: 'Office Jukebox',
        getOAuthToken: cb => {
            cb(token);
        },
        volume: 0.5
    });

    let currentSong = false;

    // Ready
    player.addListener('ready', ({device_id}) => {
        console.log('Ready with Device ID', device_id);
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
        console.log(data);

        if (data.paused) {
            return;
        }

        oldSong = currentSong;
        currentSong = data.context.uri;

        if (oldSong !== currentSong) {
            socket.emit('changedSong');
        }

    });

    player.connect();
}