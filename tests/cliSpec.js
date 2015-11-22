var program = require('commander'),
    cli     = require('../lib/cli');

var passArguments = function(argString) {
  process.argv = [process.argv[0], "bin/wexgen"]
  if (!argString) return;

  return process.argv = process.argv.concat(argString.split(" "));
};


var runCli = function() {
  var success = cli(program, "test-app", true);
  var app     = cli.generatedApp();
  app.success = success;

  return app;
};

// ***********

passArguments("");
runCli();
// should fail and print help message…

passArguments("i-love-christie -q -v");
runCli();
// should fail and print error…

passArguments("i-love-christie");
runCli();
