#!/usr/bin/env node

// Import language modules
var path = require('path');

// Import NPM modules
var fs       = require('fs-extra'),
    jsonfile = require('jsonfile'),
    _        = require('lodash'),
    ejs      = require('ejs'),
    debug    = require('debug')('debug'),
    colors   = require('colors'),
    program  = require('commander'),
    AppPath  = require('application-resolved-path');

// Import local modules
var util   = require('../lib/util'),
    cli    = require('../lib/cli'),
    logger = require('../lib/logger');

/***************************
 * Define global variables.
 ***************************/

process.env.NODE_DEBUG = true;
process.env.DEBUG = '*';

// log levels
LOG = {
  VERBOSE: 0, // print message *only* when the verbose flag is on...
  DEFAULT: 1,
  QUIET:   2  // print message *even* when the quiet flag is on (ie, always!)...
};

logger.createPrinter('verbose', {level: LOG.VERBOSE});
logger.createPrinter('quiet',   {level: LOG.QUIET});

AppPath.root = path.join(__dirname, '..');

var remotesFile  = new AppPath('data/remotes/remotes.json',   {app: true}),
    staticsDir   = new AppPath('data/statics',   {app: true}),
    templatesDir = new AppPath('data/templates', {app: true}),
    insertsDir   = new AppPath('data/inserts',   {app: true});

/******************************************************
 * Handle CLI input and generate an app description. *
 ******************************************************/

cli(program, process.env.DEBUG) || process.exit();

/**********************************
 * Create application description.
 **********************************/

var app = cli.generatedApp();

/*******************************************
 * Set environment based on app description
 *******************************************/

// util.inspect(app)

app.verbose ? logger.level = LOG.VERBOSE : logger.level = LOG.DEFAULT;

// console.log(logger.level)

/***********************************
 * Define document parsing helpers.
 ***********************************/

var definitions = function(app, type) {
  return app.includes.filter(function(include) {
    return include.type === type;
  }).map(function(include) {
    return include;
  });
};

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

/*****************************
 * Generate application.
 *****************************/

var statics   = definitions(app, 'static'),
    templates = definitions(app, 'template'),
    remotes   = definitions(app, 'remote');

logger.quiet("Creating a WDI Express application at " + colors.green("./" + app.name));

logger.verbose('1. Application description (from user options).', {padBefore: 1, color: 'yellow'});
logger.verbose('- Description: ', {indent: 2, color: 'yellow'});
logger.verbose(app, {indent: 4});

logger.verbose('2. Generating application.', {padBefore: 1, color: 'yellow'});

/*****************************
 * Generate static documents.
 *****************************/

logger.verbose('- Generating static documents:', {indent: 2});

statics.forEach(function(include) {
  var rawFilename = include.definition,
      inputFile  = convertToFilenamePath(rawFilename),
      inputPath  = new AppPath(addDirectoryToFilenamePath(staticsDir, rawFilename), {app: false}),
      outputFile = app.name + "/" + inputFile,
      outputPath = path.resolve(outputFile),
      content;

  logger.verbose('* Writing static file: ' + colors.green(outputFile), {indent: 4});

  content = readStaticContent(inputPath.abs);

  logger.verbose('==============================', {indent: 6});
  logger.verbose(content, {indent: 6, maxLines: 8});
  logger.verbose('==============================', {indent: 6});
  logger.verbose();

  fs.outputFileSync(outputPath, content);
});

/*******************************
 * Build and resolve templates.
 *******************************/

function parseInsert(text) {
  var re = /\/\/(\s*)\:([\w|\!]+)\n/g,
      match = "",
      matches = [];

  while(match = re.exec(text)) {
    matches.push({entry: match[2], startIndex: match.index, endIndex: match.index + match[0].length});
  }


  return matches;
}

// logger.print(colors.yellow('- Generating templated documents:'), 2);

templates.forEach(function(include) {
  var rawFilename = include.definition +  '.template.json',
      inputFile  = convertToFilenamePath(rawFilename),
      inputPath  = new AppPath(addDirectoryToFilenamePath(templatesDir, rawFilename), {app: false}),
      outputFile = app.name + "/" + include.definition,
      outputPath = path.resolve(outputFile),
      insertFiles = include.inserts,
      inserts,
      content;

  // logger.print('* Generating template: ' + colors.yellow(inputFile) + ', with the inserts in:', 4);

  /*****************************
   * Build and resolve inserts.
   *****************************/

  inserts = insertFiles.reduce(function(inserts, insert, index) {
    var insertFile = include.definition + "." + insert + ".js",
        insertPath = path.resolve(insertsDir.abs, insertFile),
        parsedInserts,
        content,
        current,
        next;

    content = readStaticContent(insertPath);
    parsedInserts = parseInsert(content);

    for (var i = 0, len = parsedInserts.length; i < len; i++) {
      current = parsedInserts[i];

      if (i === len - 1) {
        current.text = content.substring(current.endIndex).trim();
      } else {
        next = parsedInserts[i+1];
        current.text = content.substring(current.endIndex, next.startIndex).trim();
      }
    }
    // logger.print((index + 1) + ". " + colors.yellow(insertFile) + ": Parsed for inserts… " + parsedInserts.length + " found.", 6);

    return inserts.concat(parsedInserts);
  }, []);

  inserts = inserts.sort(function(insert1, insert2) {
    var val1 = insert1.entry.match(/\!/g),
        val2 = insert2.entry.match(/\!/g);

    val1 = (val1 === null) ? 0 : val1.length;
    val2 = (val2 === null) ? 0 : val2.length;

    // console.log(val1, val2)

    return val2 - val1;
  });

  /****************************
   * Add inserts to templates.
   ****************************/

  // logger.print((insertFiles.length+1) + '. Inserts parsed. Now loading the template file…', 6);

  var template = jsonfile.readFileSync(inputPath.abs),
      entries  = _.pluck(template.entries, "name"),
      currentInserts = [],
      currentIndex = -1,
      codeBlock,
      commentBlock,
      content = "";


  template.entries.forEach(function(entry) {
    // logger.print("- Compiling " + colors.yellow(inputFile + ":" + entry.name) + ".", 9);

    do {
      if (currentIndex !== -1)
        currentInserts.push(inserts.splice(currentIndex, 1)[0]);

      currentIndex = inserts.findIndex(function(insert) {
        return insert.entry.indexOf(entry.name) !== -1;
      });

    } while (currentIndex !== -1)

    codeBlock = currentInserts.map(function(ci) { return ci.text; }).join('\n\n')

    if (entry.comments) {
      if (entry.comments.block) {
        commentBlock = entry.comments.block.join("\n * ");
        commentBlock = "/*\n * " + commentBlock + "\n *\n */\n\n";
        // commentBlock = "/* " + commentBlock + "\n */\n\n"; // ALTERNATE SOLUTION
      } else {
        commentBlock = entry.comments.line.join("\n// ");
        commentBlock = "// " + commentBlock + "\n\n";
      }
    } else {
      commentBlock = "";
    }

    content += "\n\n" + commentBlock + codeBlock;

    // logger.print("==============================", 9)
    // logger.print(commentBlock + codeBlock, 9, 8)
    // logger.print("==============================", 9)
    // logger.print();

    currentIndex   = -1;
    currentInserts = [];
  });

  /*************************************
   * Generate documents from templates.
   *************************************/

  content = _.trim(content) + "\n"; // empty newline at EOF

  fs.outputFileSync(outputPath, content);
});

/*******************************************************
 * Downloading from remotes, or from fallback versions.
 *******************************************************/

// logger.print(colors.yellow('- Copying documents stored remotely:'), 2);

remotes.forEach(function(remoteDescription) {

  var remotesJson = jsonfile.readFileSync(remotesFile.abs),
      remoteName = remoteDescription.definition,
      remote = remotesJson[remoteName];

  // logger.print("* Copying document associated with remote " + remoteName.yellow + ":", 4);

  // util.inspect(remote)

  // logger.print("Downloading " + remote.uri.yellow + "… (not implemented yet)", 6)
});

// logger.print();

/************
 * Success!
 ***********/

logger.quiet("Your application has been created!", {color: 'green'});
