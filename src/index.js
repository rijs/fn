// -------------------------------------------
// Exposes a convenient global instance 
// -------------------------------------------
export default function fn(ripple){
  log('creating')
  ripple.types['application/javascript'] = {
    header: 'application/javascript'
  , check(res){ return is.fn(res.body) }
  , parse(res){ return res.body = fn(res.body), res }
  }

  return ripple
}

import includes from 'utilise/includes'
import log from 'utilise/log'
import is from 'utilise/is'
import fn from 'utilise/fn'
log = log('[ri/types/fn]')