// Import language modules
var path = require('path'),
    fs   = require('fs-extra');

// Import NPM modules
var jsonfile = require('jsonfile'),
    ejs      = require('ejs'),
    debug    = require('debug'),
    AppPath  = require('application-resolved-path');

// Import local modules

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
    statics        = __staticsDir.children(),
    templates      = __templatesDir.children(),
    inserts        = __insertsDir.children(),
    __outputDir,
    __name;

// set output path to generate documents
if ((typeof __outputDir === 'undefined') || NODE_DEBUG) {
  // TODO (PJ): fix this to use AppPath correctly once 'File not found'
  //   bug fix is in on the npm
  fs.removeSync('tmp');
  fs.mkdirp('tmp');
  __outputDir = new AppPath('tmp', {app: true});

}

// set default application name
if ((typeof __name ==='undefined') || NODE_DEBUG)
  __name = 'example-app';

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

// console.log(statics[2].rel);

statics.forEach(function(inputAppPath) {
  var rawFilename   = inputAppPath.filename,
      convertedPath = convertToPath(rawFilename),
      outputPath,
      content;

  outputPath = path.resolve(
    __outputDir.abs,
    __name,
    convertedPath
  );

  if (!isDirectory(inputAppPath.abs)) {
    content = fs.readFileSync(inputAppPath.abs, 'utf-8');

    if (isEjs(rawFilename)) {
      content = ejs.render(content, {
        app: {
          name: __name
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
