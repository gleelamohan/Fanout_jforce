var jsforce = require('jsforce');
var path = require('path');
var express = require('express');
var config = require('./config.js');
var routes = require('./routes/index');


var channel = '/data/CaseChangeEvent';
var user = config.USERNAME;
var pass = config.PASSWORD;
var securityToken = config.SECURITYTOKEN ;

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var socket = io.sockets.on('connection', function (socket) {});

//const port = process.env.PORT || 3000;

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
		console.log('Received CDC Event');
		socket.send(JSON.stringify(data));
		console.log('Data sent to clients!!');
	});
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(function(req, res, next){
  res.io = io;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = {app: app, server: server, conn: conn, config: config};
exports.conn = conn;
exports.config = config;
exports.socket = socket;