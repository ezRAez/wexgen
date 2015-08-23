var BaseParser = require('./BaseParser');

var NoVowelParser = function() {
  BaseParser.call(this); // super.constructor
}

// extend super class
NoVowelParser.prototype = Object.create(BaseParser.prototype);
NoVowelParser.prototype.constructor = NoVowelParser;

// extend the data stream transformer
NoVowelParser.prototype.parseStream = function(data) {

  console.log(data.constructor)
  return data.replace(/[aeiou]/, '')
}

module.exports = NoVowelParser;
