var Transform = require('stream').Transform;

var BaseParser = function() {
  this.transformation = new Transform();

  // TODO (PJ): figure out how Transform#_transform sets its
  //            context so that we aren't using `this` the wrong way...
  var self = this;

  this.transformation._transform = function(data, encoding, done) {
    this.push(self.parseStream(data));
    done();
  };
}

// No-op, which is overriden in sub-classes...
BaseParser.prototype.parseStream = function(data) { return data; };

module.exports = BaseParser;
