var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('calendar:server');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var calendarSchema = new mongoose.Schema({
    name: String,
    events: [{
        type: Date
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
});

var userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    password: String
});

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', userSchema);
var Calendar = mongoose.model('Calendar', calendarSchema);

mongoose.connect('localhost');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var httpProxy = require('http-proxy');
var http = require('http');
var proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    ws: true
});
var isProduction = process.env.NODE_ENV === 'production';
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

//routes
app.get('/api/calendars', function (req, res, next) {
    var query = Calendar.find();
    if (req.query.genre) {
        query.where({genre: req.query.genre});
    } else if (req.query.alphabet) {
        query.where({name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i')});
    } else {
        query.limit(12);
    }
    query.exec(function (err, shows) {
        if (err) return next(err);
        res.send(shows);
    });
});

app.get('/api/calendars/:id', function (req, res, next) {
    Calendar.findById(req.params.id, function (err, calendar) {
        if (err) return next(err);
        res.send(calendar);
    });
});

app.put('/api/calendars/:id', function (req, res) {
    Calendar.findById(req.params.id, function (err, calendar) {
        if (err) return next(err);
        calendar.events = req.body.events;
        calendar.save(function(err) {
            if (err) {
                return next(err);
            }
            res.send(calendar);
        });
    });
});

app.post('/api/calendars', function(req, res, next) {
    var calendar = new Calendar({
        name: req.body.calendarName
    });

    calendar.save(function(err) {
        if (err) {
            if (err.code == 11000) {
                return res.send(409, { message: calendar.name + ' already exists.' });
            }
            return next(err);
        }
        res.send(200);
    });
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, {message: err.message});
});

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


    proxy.on('error', function (e) {
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

app.get('*', function (req, res) {
    res.redirect('/#' + req.originalUrl);
});

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
