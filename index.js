var express = require('express');
var app = express();
var server = require('http').createServer(app);
// require socket.io and pass in the server
var io = require('socket.io')(server);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// listen for socket connections
io.on('connection', function(socket) {
    console.log('Client connected');

    // listen for a join event
    // the events can be named anything
    socket.on('join', function(data) {
        console.log(data);
        socket.emit('message', 'Successfully connected to server')
    });

    // when we recieve a message from a client,
    // broadcast to all other clients
    socket.on('message', function(data) {
        console.log(data)
        socket.broadcast.emit('message', data);
    })
});

server.listen(5000);
