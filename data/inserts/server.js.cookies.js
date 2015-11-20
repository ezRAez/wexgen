//:importModules
var cookieParser = require('cookie-parser');

//:addApplicationMiddleware
app.use(cookieParser('notsosecretnowareyou'));
