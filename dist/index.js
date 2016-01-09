'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fnc;

var _is = require('utilise/is');

var _is2 = _interopRequireDefault(_is);

var _fn = require('utilise/fn');

var _fn2 = _interopRequireDefault(_fn);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// Adds support for function resources
// -------------------------------------------
function fnc(ripple) {
  log('creating');
  ripple.types['application/javascript'] = { header: header, check: check, parse: parse };
  return ripple;
}

var header = 'application/javascript';

var check = function check(res) {
  return _is2.default.fn(res.body);
};

var parse = function parse(res) {
  return res.body = (0, _fn2.default)(res.body), res;
};

var log = require('utilise/log')('[ri/types/fn]');