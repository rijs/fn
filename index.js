// -------------------------------------------
// Adds support for function resources
// -------------------------------------------
module.exports = function fnc(ripple){
  log('creating')
  ripple.types['application/javascript'] = { 
    selector
  , extract
  , header
  , check
  , parse
  }
  return ripple
}

const selector = res => `${res.name},[is~="${res.name}"]`
    , extract = el => (attr('is')(el) || '').split(' ').concat(lo(el.nodeName))
    , header = 'application/javascript'
    , check = res => is.fn(res.body)
    , parse = res => (res.body = fn(res.body), res)
    , log   = require('utilise/log')('[ri/types/fn]')
  
const attr = require('utilise/attr')
    , str = require('utilise/str')
    , is = require('utilise/is')
    , lo = require('utilise/lo')
    , fn = require('utilise/fn')