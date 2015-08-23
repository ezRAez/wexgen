#!/usr/bin/env node

// Import language modules
var path = require('path');

// Import NPM modules
var fs       = require('fs-extra'),
    jsonfile = require('jsonfile'),
    ejs      = require('ejs'),
    debug    = require('debug')('debug'),
    colors   = require('colors'),
    program  = require('commander'),
    AppPath  = require('application-resolved-path');

// Import local modules
var pkg  = require('../package'),
    util = require('../lib/util');

/***************************
 * Define global variables.
 ***************************/

process.env.NODE_DEBUG = true;
process.env.DEBUG = '*';

AppPath.root = path.join(__dirname, '..');

// Define paths.

var __staticsDir   = new AppPath('data/statics',   {app: true}),
    __templatesDir = new AppPath('data/templates', {app: true}),
    __insertsDir   = new AppPath('data/inserts',   {app: true}),
    manifestFile   = new AppPath('data/manifest.json', {app: true}),
    remotesFile    = new AppPath('data/remotes.json',  {app: true}),
    statics        = __staticsDir.children(),
    templates      = __templatesDir.children(),
    inserts        = __insertsDir.children(),
    __outputDir,
    __appname;

// set output path to generate documents
if ((typeof __outputDir === 'undefined') || NODE_DEBUG) {
  // TODO (PJ): fix this to use AppPath correctly once 'File not found'
  //   bug fix is in on the npm
  fs.removeSync('tmp');
  fs.mkdirp('tmp');
  __outputDir = new AppPath('tmp', {app: true});

}

// set default application name
__appname = 'example-app';

/******************************************
 * Declare options and load the manifest. *
 ******************************************/

// TODO (PJ): Defaults for wexgen are:
/*
 * - EJS Templates
 * - .gitignore
 * - session support
 * - no DB
 * - no security
 * - no testing
 * - no client libs
 * - no GA favicon!
 * - no socket.io
 */

/**
 * Create basic setup information for the CLI command.
 */

program
  .version(pkg.version)
  .usage('<appname> [options]')
  .description('Wexgen is an Express application generator that follows WDI conventions.')
  .arguments('<appname> [options]')
  .action(function(name) {
    __appname = name;
  })

program.on('--help', function(){
  console.log(
`  Example:

    ${"$ wexgen new-app-name".green}
` );
});

/**
 * "Use" commands change how wexgen runs.
 *   1. Verbose:  run with full output logging.
 *   2. Comments: insert _all_ comments (there are a LOT) in the files.
 *   3. Force:    overwrite an existing directory if it exists.
 */

program
  // .option('-h, --help',    'print usage information')
  // .option('-V, --version', 'print the version number')
  .option('-v, --verbose', 'print verbosely (not implemented)')
  .option('-C, --use-comments', 'add full explanatory comments (not implemented)')
  .option('-F, --use-force',    'overwrite a non-empty app directory (not implemented)')

/**
 * "Include" commands add optional features to the default build. The
 * data for these is stored in `data/manifest.json`.
 */

// --security [local | token | oauth]

// load manifest json
var manifest = jsonfile.readFileSync(manifestFile.abs);

util.inspect(Object.getOwnPropertyNames(manifest.options).map(function(p) {return manifest.options[p].command}));

/**
 * "Subcommands" or Generators add optional features to build, while not
 * building the default app.
 */

// program
//   .command('generate model [Model]')
//   .alias('g model')
//   .description('creates a basic Mongoose model & seed file')
//   .action(function(modelName){
//     program.includeMongo = true
//   });

// program
//   .command('generate routes [Resource]')
//   .alias('g routes')
//   .description('creates a basic, RESTful controller')

// program
//   .command('generate scaffold [Resource]')
//   .alias('g scaffold')
//   .description('creates a model, controller, and views for a resource ')

// Example Resources (either in HTML or JSON versions)
//   1.  Widget (model/controller/views/seed)
//   2.  User w/ Authentication, according to security type...

/**
 * "Bundle" commands are bundles of includes and generators that represent
 * stock application types.
 */

// --app [basic | full | api | secure-api]
//   - basic (SUPER SIMPLE)
//   - (default) full: ()
//   - api:        (mongo, json version widget scaffold)
//   - secure-api: (mongo, web-tokens / no session, json version user & widget scaffold)

/*****************************
 * Parse and handle options. *
 *****************************/

program.parse(process.argv);

// When there is no information passed in ARGV, print Help and exit.
// if (!process.argv.slice(2).length) {
//   program.help();
// }

// Handle Use Commands
if (program.verbose) process.env.DEBUG='*';
// if (program.useComments)
// if (program.useForce)

// Handle Subcommands/Generators

// Handle Include Commands

// var flagged,
//     structs;

// // load necessary optional code structures
// for (var option in manifest.options) {
//   flagged = program[option] === true;
//   structs = flagged ? manifest.options[option] : []

//   console.log(option + ':', flagged, flagged ? structs : '');
// }

// program.option.apply(program.option, values)

process.exit();

/***********************************
 * Define document parsing helpers.
 ***********************************/

var convertToPath = function(filename) {
  convertedPath = filename.replace(/\.ejs$/, '');
  convertedPath = convertedPath.replace(/_/, '.');
  convertedPath = convertedPath.replace(/-/, '/');
  return convertedPath;
}

var isDirectory = function(givenPath) {
  return fs.lstatSync(givenPath).isDirectory();
};

var isEjs = function(filename) {
  return /\.ejs$/.test(filename);
}

/*****************************
 * Generate static documents.
 *****************************/

statics.forEach(function(inputAppPath) {
  var rawFilename   = inputAppPath.filename,
      convertedPath = convertToPath(rawFilename),
      outputPath,
      content;

  outputPath = path.resolve(
    __outputDir.abs,
    __appname,
    convertedPath
  );

  if (!isDirectory(inputAppPath.abs)) {
    content = fs.readFileSync(inputAppPath.abs, 'utf-8');

    if (isEjs(rawFilename)) {
      content = ejs.render(content, {
        app: {
          name: __appname
        }
      });
    }

    fs.outputFileSync(outputPath, content);
  }
});

/*******************************
 * Build and resolve templates.
 *******************************/

// var templates = fs.readdirSync(__templates)
//                     .map(function(tempFileName) {
//                       return path.resolve(__templates, tempFileName);
//                     })
//                     .map(function(tempPath) {
//                       return jsonfile.readFileSync(tempPath);
//                     });


// console.log(JSON.stringify(templates, null, 2));

/*****************************
 * Build and resolve inserts.
 *****************************/

// ...

/****************************
 * Add inserts to templates.
 ****************************/

// ...

/*************************************
 * Generate documents from templates.
 *************************************/

// ...
