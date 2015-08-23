var util = require('util');

/**
 * A unique wrapper for util.inspect().
 * @arg {*}       obj - The object to be inspected.
 * @arg {boolean} [log=true] - Flag to console.log.
 * @api false
 */

var _inspect = util.inspect;

util.inspect = function(obj, log) {
  if (typeof log !== 'undefined' && !log) log = false;
  if (typeof log === 'undefined') log = true;

  var val = _inspect(obj, {showHidden: false, depth: null});
  if (log) console.log(val);

  return val;
};

module.exports = util;
