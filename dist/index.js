"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// -------------------------------------------
// Exposes a convenient global instance
// -------------------------------------------
module.exports = fn;

function fn(ripple) {
  log("creating");
  ripple.types["application/javascript"] = {
    header: "application/javascript",
    check: function check(res) {
      return is.fn(res.body);
    },
    parse: function parse(res) {
      return (res.body = fn(res.body), res);
    }
  };

  return ripple;
}

var includes = _interopRequire(require("utilise/includes"));

var log = _interopRequire(require("utilise/log"));

var is = _interopRequire(require("utilise/is"));

var fn = _interopRequire(require("utilise/fn"));

log = log("[ri/types/fn]");