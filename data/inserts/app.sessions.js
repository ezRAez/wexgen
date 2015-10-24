//:importModules
var cookieParser = require('cookie-parser');

//:configureServer
app.use(express.cookieParser());
app.use(express.session({secret: 'notsosecretnowareyou'}));
