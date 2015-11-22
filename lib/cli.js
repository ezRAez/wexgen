var path = require('path');

var jsonfile  = require('jsonfile'),
    colors    = require('colors'),
    intercept = require("intercept-stdout"),
    AppPath   = require('application-resolved-path');

var pkg         = require('../package'),
    Application = require('./application');

var locus = require('locus');

// ******************************************

var getCommandsFrom = function(includeOptions) {
  var optionNames = Object.getOwnPropertyNames(includeOptions);
  return optionNames.map(function(optionName) {
    return includeOptions[optionName].command;
  });
};

// ******************************************

var cli = function(program, defaultAppName, debug) {
  var app          = {},
      message      = "",
      // continueExec = true,
      outputDir    = defaultAppName,
      manifestFile = path.resolve(__dirname, '..', 'data/manifest.json'),
      manifest     = jsonfile.readFileSync(manifestFile);

  // Since commander prints to console, instead of
  // returning messages, to really encapsulate and test
  // our CLI, we need to capture the
  var unhookIntercept = intercept(
    function(txt) {
      message += txt;
    },
    function(txt) {
      message += txt;
    }
  );

  // Define methods on this function that unwrap
  // the local variables app and message… Allows the
  // importing code to write:
  //
  // var cli       = require('cli');
  // var isSuccess = cli(program, defaultAppName, debug);
  // if (isSuccess) {
  //   var app = cli.generatedApp();
  // } else {
  //   console.error(cli.failMessage());
  // }
  //
  cli.generatedApp = function() {
    return app;
  };
  cli.failMessage = function() {
    return message;
  };
  //  var app = cli(program, defaultAppName, debug) ? cli.generatedApp() : process.exit(1);

  // monkey-patch commander (program) with a way to apply
  // multiple options described in an object of form:
  // {optionA: [command, description], …}
  program.applyAllOptions = function(options) {
    for (command in options) {
      this.option.apply(this, options[command]);
    }
    return this;
  };

  /*******************************************
   * Generate basic CLI command and options. *
   *******************************************/

  // Create basic setup information for the CLI command.
  program
    .version(pkg.version)
    .usage('<appname> [options]')
    .description('Wexgen is an Express application generator that follows WDI conventions.')
    .arguments('<appname> [options]');

  program.on('--help', function(){
    console.log(
  `  Example:

      ${"$ wexgen new-app-name".green}
  ` );
    process.exit(1);
  });

  // Load CLI options from the JSON "manifest."
  program.applyAllOptions(manifest.useOptions);
  program.applyAllOptions(getCommandsFrom(manifest.includeOptions));

  /***************************
   * Handle malformed input. *
   ***************************/

  // When there is no information passed in ARGV,
  // print "help" and exit.
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    return false;
  }

  /********************************************************
   * Parse options, handle, and generate app description. *
   ********************************************************/

  program.parse(process.argv);

  if (program.quiet && program.verbose) {
    console.log(`${"Error: cannot run as both verbose and quiet.".red}`);
    return false;
  }

  // Handle "use" commands: these are commands that
  // change *how wexgen runs*, instead of the app that
  // it outputs (tho this may be changed as well).
  // Therefore, a new "use" command means that the
  // codebase, and not just the /data folder, must be
  // updated, to implement the command.
  //
  // Current use commands:
  //
  // 1. verbose
  // 2. quiet (not implemented)
  // 3. comments (not implemented)
  // 4. force (not implemented)

  if (program.verbose) process.env.DEBUG='*';

  (program.quiet)       ? app.quiet = true    : app.quiet = false;
  (program.verbose)     ? app.verbose = true  : app.verbose = false;
  (program.useComments) ? app.comments = true : app.comments = false;
  (program.useForce)    ? app.force = true    : app.force = false;

  // app = new Application(program, manifest);

  unhookIntercept();

  return true; // continue build
};

module.exports = cli;
