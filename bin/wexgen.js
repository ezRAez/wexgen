#!/usr/bin/env node

// Import language modules
var path = require('path'),
    fs   = require('fs-extra');

// Import NPM modules
var jsonfile = require('jsonfile'),
    ejs      = require('ejs'),
    debug    = require('debug')('debug'),
    colors   = require('colors'),
    program  = require('commander'),
    AppPath  = require('application-resolved-path');

// Import local modules
var pkg = require('../package');

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

/***************************************
 * Handle options and load the manifest.
 ***************************************/

// TODO (PJ): update this to include...
/*
 * - Example Resources (either in HTML or JSON versions)
 *     1.  Widget (model/controller/views/seed)
 *     2.  User w/ Authentication
 *
 * --app [basic | full | api | secure-api]
 *     - basic (SUPER SIMPLE)
 *     - (default) full: ()
 *     - api:        (mongo, json version widget scaffold)
 *     - secure-api: (mongo, web-tokens, json version user & widget scaffold)
 * --security [local | token | oauth]
 *
 */

// TODO (PJ): Defaults for wex are:
/*
 * - EJS Templates
 * - .gitignore
 * - session support
 * - no DB
 * - no security
 * - no testing
 * - no client libs
 * - no GA favicon!
 */

// parse options
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
  `);
});

program
  // .option('-h, --help',    'print usage information')
  // .option('-V, --version', 'print the version number')
  .option('-v, --verbose', 'print verbosely (not implemented)')

  .option('-C, --use-comments', 'add full explanatory comments (not implemented)')
  .option('-F, --use-force',    'overwrite a non-empty app directory (not implemented)')

  .option('-i, --include-favicon',  'include the GA Gear favicon')
  .option('-m, --include-mongo',    'include MongoDB and Mongoose')
  .option('-p, --include-procfile', 'include a Procfile for Heroku')
  .option('-t, --include-tests',    'include Mocha/Chai BDD testing')

  .option('-$, --include-jquery',    'include client library jQuery')
  .option('-_, --include-lodash',    'include client library LoDash')
  .option('-b, --include-bootstrap', 'include client library Bootstrap')

program
  .command('generate model [Model]')
  .alias('g model')
  .description('creates a basic Mongoose model & seed file')
  .action(function(modelName){
    program.includeMongo = true
  });

program
  .command('generate routes [Resource]')
  .alias('g routes')
  .description('creates a basic, RESTful controller')

program
  .command('generate scaffold [Resource]')
  .alias('g scaffold')
  .description('creates a model, controller, and views for a resource ')

program.parse(process.argv);

// console.log(process.argv)
// if (!process.argv.slice(2).length) {
//   program.help();
// }

// console.log(program.usage())

// load manifest json
var manifest = jsonfile.readFileSync(manifestFile.abs);

var flagged,
    structs;

// load necessary optional code structures
for (var option in manifest.options) {
  flagged = program[option] === true;
  structs = flagged ? manifest.options[option] : []

  console.log(option + ':', flagged, flagged ? structs : '');
}

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
