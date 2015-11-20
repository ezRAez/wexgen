// "use strict";

var _      = require('lodash'),
    colors = require('colors'),
    util   = require('./util');

function createPrinter(name, defaults) {
  var storedDefaults = defaults;

  // create a new method with the given name that uses
  // a different set of options defaults
  this[name] = function(text, options) {
    this.print(text, _.defaults(options, storedDefaults));
  }
}

function print(text, options) {
  var output,
      printLevel;

  // Initialize default values for the arguments.
  // text     = text     || "";
  if (!text) return;
  options  = options  || {};

  // Generate the formatted logging text.
  output = this.formatText(text, options);

  // options.level
  printLevel = (options.level === undefined) ? this.level : options.level;

  if (printLevel >= this.level)
    console.log(output);
}

function formatText(text, options) {
  // Restructure any objects as strings.
  if (typeof text === 'object')
    text = util.inspect(text, false);

  // Set options defaults.
  _.defaults(options, {
    indent:    0,
    maxLines:  0,
    padBefore: 0,
    padAfter:  0
  });

  text =
    // prepend padding
    _.repeat("\n", options.padBefore) + (
      // make text transformations chainable
      _.chain(_(text))
      // break in to a series of lines
      .split("\n")
      // truncate, if necessary
      .tap(function(lines) { truncate(lines, options.maxLines); })
      // indent, if necessary
      .map(indent(options.indent))
      // and rejoin
      .join("\n") ) +
    // append padding
    _.repeat("\n", options.padAfter);

  // add any color
  if (options.color)
    text = colors[options.color](text);

  // console.log('hi')
  return text;
}

function truncate(lines, maxLength) {
  var numLines = lines.length;

  if (maxLength > 0 && numLines > maxLength) {
    lines.splice(maxLength, numLines - maxLength);
    return lines.push("... (" + numLines + " lines total)");
  } else {
    return lines;
  }
}

function indent(numIndents) {
  var indents = _.repeat(" ", numIndents);
  return function(str) {
    return `${indents}${str}`;
  };
}

module.exports = {
  createPrinter: createPrinter,
  print:         print,
  formatText:    formatText,
  level:         10
};
