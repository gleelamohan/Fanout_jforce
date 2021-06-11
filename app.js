var jsforce = require('jsforce');
var path = require('path');
var express = require('express');
var config = require('./config.js');

var channel = '/data/CaseChangeEvent';
var user = config.USERNAME;
var pass = config.PASSWORD;
var securityToken = config.SECURITYTOKEN ;

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var socket = io.sockets.on('connection', function (socket) {});
const port = process.env.PORT || 3000;

var replayId = -1; // -1 = Only New messages | -2 = All Window and New
var conn = new jsforce.Connection();
app.use(express.static(__dirname + '/public'));// Serve static files

 conn.login(user, pass + securityToken, function (err, res) {
	console.log('loggedin');
	if (err) {
		return console.error(err);
	}

	var client = conn.streaming.createClient([
		new jsforce.StreamingExtension.Replay(channel, replayId),
		new jsforce.StreamingExtension.AuthFailure(function () {
			console.log('failed');
			return process.exit(1);
		}),
	]);

	subscription = client.subscribe(channel, function (data) {
		console.log('Received CDC Event');
		socket.send(JSON.stringify(data));
		console.log('Data sent to clients!!');
	});
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`listening on port ${port}!`)); 