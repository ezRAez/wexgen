
var Application = function() {
  // Display info from options...
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

  app.outputDir = path.resolve(process.cwd(), app.name);
};

module.exports = Application;
