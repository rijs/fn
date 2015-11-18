'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fnc;

var _includes = require('utilise/includes');

var _includes2 = _interopRequireDefault(_includes);

var _is = require('utilise/is');

var _is2 = _interopRequireDefault(_is);

var _fn = require('utilise/fn');

var _fn2 = _interopRequireDefault(_fn);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// Exposes a convenient global instance
// -------------------------------------------
function fnc(ripple) {
  log('creating');
  ripple.types['application/javascript'] = {
    header: 'application/javascript',
    check: function check(res) {
      return _is2.default.fn(res.body);
    },
    parse: function parse(res) {
      return res.body = (0, _fn2.default)(res.body), res;
    }
  };

  return ripple;
}

var log = require('utilise/log')('[ri/types/fn]');