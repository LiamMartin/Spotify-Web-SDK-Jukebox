$(function () {
    console.log("Connecting...")
    var socket = window.socket = io('ws://' + window.location.hostname + "/", {transports: ['websocket']});
    var connected = false;

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

    $('#togglePlay').on('click', () => {
        console.log(connected);

        if (!connected) {
            return;
        }

        socket.emit('togglePlay');
    });


    $('#volumeControl').on('change', function () {
        socket.emit('setVolume', {
            volume: $(this).val()
        });
    });
});