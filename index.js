// -------------------------------------------
// Adds support for function resources
// -------------------------------------------
module.exports = function fnc(ripple, { dir = '.' } = {}){
  log('creating')

  // TODO: re-add client-side resolve too?
  ripple.require = res => module => {
    if (module in res.headers.dependencies && ripple.resources[res.headers.dependencies[module]])
      return ripple(res.headers.dependencies[module])
    else
      throw new Error(`Cannot find module: ${module} for ${res.name}`)
  }

  ripple.types['application/javascript'] = { 
    header
  , selector: res => `${res.name},[is~="${res.name}"]`
  , extract: el => (attr('is')(el) || '').split(' ').concat(lo(el.nodeName))
  , ext: '*.js'
  , shortname: path => basename(path).split('.').shift()
  , check: res => is.fn(res.body)
  , load: !client && (res => {
      if (res.headers.path.endsWith('.res.js')) {
        let exported = require(res.headers.path)
        exported = exported.default || exported
        res.headers['content-type'] = header
        ripple(merge(res)(exported))
        return ripple.resources[res.name]
      } else {
        // TODO: try catch this, emit fail
        res.body = new Function('module', 'exports', 'require', 'process', file(res.headers.path))
        res.headers['content-type'] = header
        res.headers.format = 'cjs'
        ripple(res)
        return ripple.resources[res.name]
      }
    })
  , parse: res => { 
      // TODO: separate entrypoint?
      if (client) {
        // TODO: branch on headers.format
        const m = { exports: {} };
        res.body(m, m.exports, ripple.require(res), { env: {}}) 
        res.body = m.exports
      } else {
        // TODO: use deep defaults hers
        res.headers.transpile = res.headers.transpile || { limit: 25 }
        // TODO: branch on headers.format
        // TODO: here or on load?
        res.headers.dependencies = (`${res.body}`.match(/require\(.*?\)/g) || [])
          .reduce((deps, match) => { 
            const specifier = match.slice(9, -2)
                , resolved  = bresolve(specifier, res.headers.path)
            deps[specifier] = './' + relative(dir, resolved).replace(/\\/g, '/')
            return deps
          }, {})
      }

      return res
    }
  }

  return ripple
}

const bresolve = (module, parent) => 
  resolve.sync(module, { filename: parent })

const log = require('utilise/log')('[ri/types/fn]')
    , client = require('utilise/client')
    , merge = require('utilise/merge')
    , attr = require('utilise/attr')
    , key = require('utilise/key')
    , is = require('utilise/is')
    , lo = require('utilise/lo')
    , fn = require('utilise/fn')
    , header = 'application/javascript'

if (!client) {
  var { relative, basename } = require('path')
      , resolve = require('browser-resolve')
      , file = require('utilise/file')
}