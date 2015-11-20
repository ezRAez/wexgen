//:importModules!!-
var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var bodyParser   = require('body-parser');

//:importLocals!!
// Load local libraries.
var env      = require('./config/environment'),
    mongoose = require('./config/database'),
    routes   = require('./config/routes');

//:instantiateApp!!
// Instantiate a server application.
var app = express();

//:configureApp!!-
// Configure the application (and set it's title!).

//:configureApp!-
app.set('title', env.TITLE);
app.set('safe-title', env.SAFE_TITLE);

//:createLocalVariables!!
// Create local variables for use thoughout the application.
app.locals.title = app.get('title');

//:addApplicationMiddleware!
// Logging layer.
app.use(logger('dev'));

// Helper layer (parses the requests, and adds further data).
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//:addStaticRoutingMiddleware!!
// Routing layers: favicon, static assets, dynamic routes, or 404…

//:addStaticRoutingMiddleware!
// Routes to static assets. Uncomment below if you have a favicon.
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

//:addRoutingMiddleware!
// Defines all of our "dynamic" routes.
app.use('/', routes);

// Catches all 404 routes.
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//:addErrorHandlingMiddleware
// Error-handling layer.
app.use(function(err, req, res, next) {
  // In development, the error handler will print stacktrace.
  err = (app.get('env') === 'development') ? err : {};
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

//:moduleExport
module.exports = app;
