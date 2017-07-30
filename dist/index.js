'use strict';

// -------------------------------------------
// Adds support for function resources
// -------------------------------------------
module.exports = function fnc(ripple) {
  log('creating');
  ripple.types['application/javascript'] = { header: header, check: check, parse: parse, to: to };
  return ripple;
};

var header = 'application/javascript';
var check = function check(res) {
  return is.fn(res.body);
};
var parse = function parse(res) {
  return res.body = fn(res.body), res;
};
var log = require('utilise/log')('[ri/types/fn]');
var to = function to(res) {
  return res.value = str(res.value), res;
};

var str = require('utilise/str'),
    is = require('utilise/is'),
    fn = require('utilise/fn');