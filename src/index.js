// -------------------------------------------
// Adds support for function resources
// -------------------------------------------
export default function fnc(ripple){
  log('creating')
  ripple.types['application/javascript'] = { header, check, parse }
  return ripple
}

const header = 'application/javascript'

const check = res => is.fn(res.body)

const parse = res => (res.body = fn(res.body), res)

const log = require('utilise/log')('[ri/types/fn]')

import is from 'utilise/is'
import fn from 'utilise/fn'