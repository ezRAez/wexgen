// Import language modules
var path = require('path');

// Import NPM modules
var jsonfile = require('jsonfile'),
    AppPath  = require('application-resolved-path');

// Import local modules
var pkg  = require('../package');

var cli,
    outputDir,
    manifestFile = new AppPath('data/manifest.json', {
      root: path.resolve(__dirname, '..'),
      app:  true
    });

// set output path to generate documents
if ((typeof outputDir === 'undefined') || NODE_DEBUG) {
  // TODO (PJ): fix this to use AppPath correctly once 'File not found'
  //   bug fix is in on the npm
  // fs.removeSync('tmp');
  // fs.mkdirp('tmp');
  outputDir = new AppPath('tmp', {app: true});
}

cli = function(program, debug) {
  var app  = {},
      cont = true;

  cli.generatedApp = function() {
    return app;
  };

  /******************************************
   * Declare options and load the manifest. *
   ******************************************/

  // EVENTUALLY SHOULD LOOK LIKE
  // var cli = require('../lib/cli');
  // if (!cli(program, appname, process.env.DEBUG))
  //   process.exit();
  //
  // var app = cli.generatedApp();


  /**
   * Create basic setup information for the CLI command.
   */

  program
    .version(pkg.version)
    .usage('<appname> [options]')
    .description('Wexgen is an Express application generator that follows WDI conventions.')
    .arguments('<appname> [options]')
    .action(function(name) {
      // console.log('NAME:', name)
      // if(!name) {
      //   console.log(
      //   `
      //   ${"Missing argument for application name!".red}`);
      // } else {
      //   appname = name;
      // }
    })

  program.on('--help', function(){
    console.log(
  `  Example:

      ${"$ wexgen new-app-name".green}
  ` );
    process.exit(1);
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
    .option('-v, --verbose',      'print verbosely')
    .option('-C, --use-comments', 'add full explanatory comments (not implemented)')
    .option('-F, --use-force',    'overwrite a non-empty app directory (not implemented)')

  /**
   * "Include" commands add optional features to the default build. The
   * data for these is stored in `data/manifest.json`.
   */

  // --security [local | token | oauth] !!!!!!!!!!!!!!!!!!!!

  // load manifest json
  var manifest = jsonfile.readFileSync(manifestFile.abs);

  // grab commands from manifest
  var defaultNames = Object.getOwnPropertyNames(manifest.defaults);
  var commandNames = Object.getOwnPropertyNames(manifest.options);
  // util.inspect(commandNames);

  var commandOptionData = commandNames.map(function(name) {
    return manifest.options[name].command;
  });
  // util.inspect(commandOptionData);

  commandOptionData.forEach(function(commandOption) {
    program.option.apply(program, commandOption);
  });

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

  // Display info from options...

  // commandNames.forEach(function(name) {
  //   console.log(name + ': ', program[name]);
  // });
  var optionValue = function(name) {
    return program[name];
  };

  var includeNames = commandNames
                       .filter(optionValue)
                       .concat(defaultNames);

  var includes = includeNames.reduce(function(allIncludes, name) {
    var includes = manifest.defaults[name] ?
                   manifest.defaults[name].includes :
                   manifest.options[name].includes
    return allIncludes.concat(includes);
  }, []);

  var parseInclude = function(include) {
    include = include.split(/:/);
    return {
      type: include[0],
      definition: include.splice(1).join(':')
    };
  }

  var typeVal = function(type) {
    switch (type) {
      case 'remote':   return 4;
      case 'static':   return 3;
      case 'template': return 2;
      case 'insert':   return 1;
      default:         return 0;
    }
  };

  var compareIncludes = function(i1, i2) {
    var typeCompare = typeVal(i2.type) - typeVal(i1.type);
    return (typeCompare !== 0) ? typeCompare : i1.definition > i2.definition;
  }

  var isType = function(include, type) {
    return include.type === type;
  }

  var isInsert = function(include) {
    return isType(include, 'insert');
  }

  var isTemplate = function(include) {
    return isType(include, 'template');
  }

  Array.prototype.findTemplateIndex = function(definition) {
    for (var i = 0, len = this.length; i < len; i++) {
      if (isTemplate(this[i]) && this[i].definition === definition)
        return i;
    }
  };

  var uniqueBy = function(arr, fn) {
    var unique = {};
    var distinct = [];
    arr.forEach(function (x) {
      var key = fn(x);
      if (!unique[key]) {
        distinct.push(x);
        unique[key] = true;
      }
    });
    return distinct;
  }

  var resolveIncludes = function(includes) {
    includes = includes.map(parseInclude).sort(compareIncludes);
    includes = uniqueBy(includes, function(include) { return JSON.stringify(include) });

    // console.log("!!!!!!!!!!", includes)

    return includes.reduceRight(function(app, include, i, original) {
      if (isInsert(include)) {
        var definition      = include.definition.split(':'),
            template        = definition[0],
            newDefinition   = definition[1],
            templateInclude = original[includes.findTemplateIndex(template)];

        if (!templateInclude.inserts) templateInclude.inserts = [];

        templateInclude.inserts.push(newDefinition);
      } else {
        app.unshift(include);
      }
      return app;
    }, []);
  };

  // When there is no information passed in ARGV, print Help and exit.
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    cont = false;
  }

  var app = {};

  // console.log(program)

  // Handle Use Commands
  if (program.verbose) {
    process.env.DEBUG='*';
    app.verbose = true;
  } else {
    app.verbose = false;
  }

  (program.useComments) ? app.comments = true : app.comments = false;
  (program.useForce)    ? app.force = true    : app.force = false;

  // Handle Subcommands/Generators

  // Handle Include Commands
  app.includes = resolveIncludes(includes)

  app.name = program.args[0];
  if (!app.name) {
    console.log(`
  ${"Error: missing argument for application name!".red}
  For help with using wexgen, try:

      ${"$ wexgen -h".green}
`   );
    process.exit(1);
  }

  app.outputDir = path.resolve(outputDir.abs, app.name);

  return cont; // continue or not...
};

module.exports = cli;
