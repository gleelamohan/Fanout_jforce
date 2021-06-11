var jsforce = require('jsforce');
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


var replayId = -1; // -1 = Only New messages | -2 = All Window and New
var conn = new jsforce.Connection();

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
		console.log('Received Data');
		socket.send(JSON.stringify(data));
		console.log('Data Sent!!');
	});
});
