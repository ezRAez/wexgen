//:importModules-
var debug        = require('debug')('app:http');

//:addRoutingMiddleware!!
// Useful for debugging the state of requests.
app.use(debugReq);

//:addErrorHandlingMiddleware
function debugReq(req, res, next) {
  debug('params:', req.params);
  debug('query:',  req.query);
  debug('body:',   req.body);
  next();
}
