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
    insertsDir   = new AppPath('data/inserts',   {app: true}),
    appname;

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
      maxLines  = arguments[2] || 10,
      lines     = text.split("\n"),
      numLines  = lines.length;

  if (numLines > maxLines) {
    lines = lines.slice(0, maxLines);
    lines.push(
      "... (" + numLines + " lines total)");
  }

  text = lines.map(indent).join("\n");

  console.log(text);
  return text;
}

// set default application name
appname = 'example-app';

/******************************************************
 * Handle CLI input and generate an app description. *
 ******************************************************/

var definitions = function(app, type) {
  return app.includes.filter(function(include) {
    return include.type === type;
  }).map(function(include) {
    return include.definition;
  });
};

cli(program, appname, process.env.DEBUG) || process.exit();

var app     = cli.generatedApp();
    statics = definitions(app, 'static');

util.inspect(app);

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

console.log('');
console.log('Beginning app creation: ...');
console.log('');

/*****************************
 * Generate static documents.
 *****************************/

console.log('Generating static documents:');

statics.forEach(function(rawFilename) {
  var inputFile  = convertToFilenamePath(rawFilename),
      inputPath  = new AppPath(addDirectoryToFilenamePath(staticsDir, rawFilename), {app: false}),
      outputFile = app.name + "/" + inputFile,
      outputPath = path.resolve(outputFile),
      content;

  // outputPath = path.resolve(
  //   //app.outputDir.abs //,
  //   // app.name,
  //   // filename
  // );

  // console.log()

  // if (!isDirectory(inputPath)) {
    console.log('  - writing static file: ' + colors.red(outputFile)
                /*, '(' + colors.yellow(inputPath.app) + ' -> ' + colors.green(outputFile) + ')'*/);
    content = readStaticContent(inputPath.abs);
    logger("==============================", 4)
    logger(content, 4)
    logger("==============================", 4)
    logger("")
    fs.outputFileSync(outputPath, content);
  // }
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
