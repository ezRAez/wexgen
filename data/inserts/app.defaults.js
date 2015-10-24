//:importModules!!
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

//:importLocals
// loading routes defined in the /routes folder
var routes = require('./routes/index');

//:initializeServer
var app = express();

//:addApplicationMiddleware
// uncomment the below line after placing your favicon in /public…
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// sets up logging level
app.use(logger('dev'));

// parses the request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//:addRoutingMiddleware!!
// defines where to look for "static" assets
app.use(express.static(path.join(__dirname, 'public')));

// defines all of our "dynamic" routes
app.use('/', routes);

//:addErrorHandlingMiddleware
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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

//:moduleExport
module.exports = app;
