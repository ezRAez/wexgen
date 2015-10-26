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
var util = require('../lib/util'),
    cli  = require('../lib/cli');

/***************************
 * Define global variables.
 ***************************/

process.env.NODE_DEBUG = true;
process.env.DEBUG = '*';

AppPath.root = path.join(__dirname, '..');

var remotesFile  = new AppPath('data/remotes',   {app: true}),
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
    return include;
  });
};

// call with default application name
cli(program, 'example-app', process.env.DEBUG) || process.exit();

var app     = cli.generatedApp();
    statics = definitions(app, 'static'),
    templates = definitions(app, 'template');

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

statics.forEach(function(include) {
  var rawFilename = include.definition,
      inputFile  = convertToFilenamePath(rawFilename),
      inputPath  = new AppPath(addDirectoryToFilenamePath(staticsDir, rawFilename), {app: false}),
      outputFile = app.name + "/" + inputFile,
      outputPath = path.resolve(outputFile),
      content;

  logger('* Writing static file: ' + colors.green(outputFile), 4);
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

function parseInsert(text) {
  var re = /\/\/(\s*)\:([\w|\!]+)\n/g,
      match = "",
      matches = [];

  while(match = re.exec(text)) {
    matches.push({entry: match[2], startIndex: match.index, endIndex: match.index + match[0].length});
  }


  return matches;
}

logger(colors.yellow('- Generating templated documents:'), 2);

templates.forEach(function(include) {
  var rawFilename = include.definition +  '.template.json',
      inputFile  = convertToFilenamePath(rawFilename),
      inputPath  = new AppPath(addDirectoryToFilenamePath(templatesDir, rawFilename), {app: false}),
      outputFile = app.name + "/" + include.definition + ".js",
      outputPath = path.resolve(outputFile),
      insertFiles = include.inserts,
      inserts,
      content;

  logger('* Generating template: ' + colors.yellow(inputFile) + ', with the inserts in:', 4);

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
    logger((index + 1) + ". " + colors.yellow(insertFile) + ": Parsed for inserts… " + parsedInserts.length + " found.", 6);

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

  logger((insertFiles.length+1) + '. Inserts parsed. Now loading the template file…', 6);

  var template = jsonfile.readFileSync(inputPath.abs),
      entries  = _.pluck(template.entries, "name"),
      currentInserts = [],
      currentIndex = -1,
      codeBlock,
      commentBlock,
      content = "";


  template.entries.forEach(function(entry) {
    logger("- Compiling " + colors.yellow(inputFile + ":" + entry.name) + ".", 9);

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

    logger("==============================", 9)
    logger(commentBlock + codeBlock, 9, 8)
    logger("==============================", 9)
    logger();

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
