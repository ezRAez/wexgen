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
var util = require('../lib/util');

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



// set default application name
appname = 'example-app';

/******************************************************
 * Handle CLI input and generates an app description. *
 ******************************************************/

var cli = require('../lib/cli');
if (!cli(program, appname, process.env.DEBUG))
  process.exit();

var app = cli.generatedApp();

util.inspect(app);

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
    outputDir.abs,
    appname,
    convertedPath
  );

  if (!isDirectory(inputAppPath.abs)) {
    content = fs.readFileSync(inputAppPath.abs, 'utf-8');

    if (isEjs(rawFilename)) {
      content = ejs.render(content, {
        app: {
          name: appname
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
