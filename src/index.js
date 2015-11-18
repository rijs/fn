// -------------------------------------------
// Exposes a convenient global instance 
// -------------------------------------------
export default function fnc(ripple){
  log('creating')
  ripple.types['application/javascript'] = {
    header: 'application/javascript'
  , check(res){ return is.fn(res.body) }
  , parse(res){ return res.body = fn(res.body), res }
  }

  return ripple
}

import includes from 'utilise/includes'
import is from 'utilise/is'
import fn from 'utilise/fn'
var log = require('utilise/log')('[ri/types/fn]')