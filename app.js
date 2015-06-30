var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('calendar:server');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var httpProxy = require('http-proxy');
var http = require('http');
var proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    ws: true
});
var isProduction = process.env.NODE_ENV === 'production';
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

if (!isProduction) {

    var bundle = require('./bundle.js');
    bundle();
    app.all('/assets/*', function (req, res) {
        proxy.web(req, res, {
            target: 'http://127.0.0.1:8080'
        });
    });
    app.all('/socket.io*', function (req, res) {
        proxy.web(req, res, {
            target: 'http://127.0.0.1:8080'
        });
    });


    proxy.on('error', function(e) {
        // Just catch it
    });

    // We need to use basic HTTP service to proxy
    // websocket requests from webpack
    var server = http.createServer(app);

    server.on('upgrade', function (req, socket, head) {
        proxy.ws(req, socket, head);
    });

    server.listen(port, function () {
        console.log('Server running on port ' + port);
    });

} else {

    // And run the server
    app.listen(port, function () {
        console.log('Server running on port ' + port);
    });

}

server.on('listening', onListening);

//
//// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});
//
//// error handlers
//
//// development error handler
//// will print stacktrace
//if (app.get('env') === 'development') {
//  app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//      message: err.message,
//      error: err
//    });
//  });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  res.status(err.status || 500);
//  res.render('error', {
//    message: err.message,
//    error: {}
//  });
//});

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

