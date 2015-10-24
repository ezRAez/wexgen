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
var util = require('../lib/util'),
    cli  = require('../lib/cli');

/***************************
 * Define global variables.
 ***************************/

process.env.NODE_DEBUG = true;
process.env.DEBUG = '*';

AppPath.root = path.join(__dirname, '..');

var remotesFile  = new AppPath('data/remotes.json',  {app: true}),
    staticsDir   = new AppPath('data/statics',   {app: true}),
    templatesDir = new AppPath('data/templates', {app: true}),
    insertsDir   = new AppPath('data/inserts',   {app: true});

function createIndenter(indents) {
  return function(str) {
    var ind = "";
    for (var i = 0; i < indents; i++) {
      ind += " ";
    };
    return ind + str;
  };
}

function logger() {
  var text      = arguments[0] || "",
      indents   = arguments[1] || 0,
      indent    = createIndenter(indents),
      maxLines  = arguments[2] || 0,
      lines     = text.split("\n"),
      numLines  = lines.length;

  if (maxLines > 0 && numLines > maxLines) {
    lines = lines.slice(0, maxLines);
    lines.push(
      "... (" + numLines + " lines total)");
  }

  text = lines.map(indent).join("\n");

  console.log(text);
  return text;
}

/******************************************************
 * Handle CLI input and generate an app description. *
 ******************************************************/

logger()
logger(colors.yellow("1. Creating application description from options."))

var definitions = function(app, type) {
  return app.includes.filter(function(include) {
    return include.type === type;
  }).map(function(include) {
    return include.definition;
  });
};

// call with default application name
cli(program, 'example-app', process.env.DEBUG) || process.exit();

var app     = cli.generatedApp();
    statics = definitions(app, 'static');

logger(colors.yellow('- Description: '), 2);
logger(util.inspect(app, false), 4);

/***********************************
 * Define document parsing helpers.
 ***********************************/

var convertToFilenamePath = function(filename) {
  convertedPath = filename.replace(/\.ejs$/, '');
  convertedPath = convertedPath.replace(/_/, '.');
  convertedPath = convertedPath.replace(/-/, '/');
  return convertedPath;
};

var addDirectoryToFilenamePath = function(dir, filename) {
  return dir + '/' + filename;
}

var isDirectory = function(givenPath) {
  return fs.lstatSync(givenPath).isDirectory();
};

var isEjs = function(filename) {
  return /\.ejs$/.test(filename);
};

var readStaticContent = function(inputPath) {
  content = fs.readFileSync(inputPath, 'utf-8');
  if (isEjs(path.basename(inputPath))) {
    content = ejs.render(content, {app: app});
  }
  return content;
};

logger();
logger(colors.yellow('2. Generating application.'));

/*****************************
 * Generate static documents.
 *****************************/

logger(colors.yellow('- Generating static documents:'), 2);

statics.forEach(function(rawFilename) {
  var inputFile  = convertToFilenamePath(rawFilename),
      inputPath  = new AppPath(addDirectoryToFilenamePath(staticsDir, rawFilename), {app: false}),
      outputFile = app.name + "/" + inputFile,
      outputPath = path.resolve(outputFile),
      content;

  logger('* Writing static file: ' + colors.red(outputFile), 4);
  content = readStaticContent(inputPath.abs);
  logger("==============================", 6)
  logger(content, 6, 8)
  logger("==============================", 6)
  logger();
  fs.outputFileSync(outputPath, content);
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
