// import server configurations
var config = require('./serverConfig.json');
var serverIdentifier = config.serverIdentifier;

// set up the express app/server
var express = require('express');
var app = new express();
var server = require('http').createServer(app);

// require socket.io and pass in the server
var io = require('socket.io')(server);

// require redis ds/mesenger
// create separate subsriber and publisher instances
var redis = require('redis');
var sub = redis.createClient();
var pub = redis.createClient();

// express.js code to server up index.html
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// listen for socket connections
io.on('connection', function(socket) {
    console.log('Client connected to server ' + serverIdentifier);

    // listen for a join event
    // the events can be named anything
    socket.on('join', function(data) {
        console.log(data);
        socket.emit('message', 'Successfully connected to server ' + serverIdentifier);
    });

    // when we receive a message from a client,
    // broadcast to all other clients
    socket.on('message', function(data) {
        console.log(data)
        socket.broadcast.emit('message', data);

        // we also want to publish to clients connected to
        // any of our other server nodes
        pub.publish('server-' + serverIdentifier, data);
    });
});

// subscribe to channels for all of the other servers except this one
sub.psubscribe('server-?');

// when we receive a message, write it to the console
sub.on('pmessage', function(pattern, channel, message) {
    var re = new RegExp('server-' + serverIdentifier);

    // we don't want the server to hear events on its own channel
    if (!re.test(channel)) {
        console.log(channel + ': ' + message);
        io.sockets.emit('message', message);
    }
});

// tell the server to start listening to the configured port
server.listen(config.port);
