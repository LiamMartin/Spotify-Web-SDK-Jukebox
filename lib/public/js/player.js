window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQBJOzsUMLJ9gs5eyml9-axwQ0eixHqYp150BHgYgWBcZa04Q_HyDNi8q0KFL0rQWYnMXcjHCzyISZpEAcLT_6oUGmwso-H6fmiFZ4DKjrMIQe1ve6VyyY7CD1Kp3HCl5CJCR976tI5yOAqfpmfWlhPA-Ty-5Nk6se6hHA';
    const player = new Spotify.Player({
        name: 'Office Jukebox',
        getOAuthToken: cb => {
            cb(token);
        },
        volume: 0.5
    });

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

    player.connect();
}