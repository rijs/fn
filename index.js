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
  , shortname: path => basename(path).split('.').slice(0, -1).join('.')
  , check: res => is.fn(res.body)
  , load: !client && (res => {
      if (res.headers.path.endsWith('.res.js')) {
        let exported = require(res.headers.path)
        exported = exported.default || exported
        res.headers['content-type'] = header
        ripple(merge(res)(exported))
        return ripple.resources[res.name]
        // TODO: consider if we want to also do following interpretation here
      } else {
        // TODO: try catch this, emit fail
        // TODO: differentiate body value vs soruce text
        res.body = new Function('module', 'exports', 'require', 'process', file(res.headers.path))
        res.headers['content-type'] = header
        res.headers.format = 'cjs'
        res.headers.vary = ({ name }, { platform }) => `name:${name},ua:${platform.name}-${platform.version}`// TODO: how high can this be?
        // TODO: branch on headers.format
        // TODO: here or on parse?
        res.headers.dependencies = (`${res.body}`.match(/require\(.*?\)/g) || [])
          .reduce((deps, match) => { 
            const specifier = match.slice(9, -2)
                , resolved  = bresolve(specifier, res.headers.path)
            deps[specifier] = './' + relative(dir, resolved).replace(/\\/g, '/')
            ripple.load(deps[specifier])
            return deps
          }, {})

        const flattened = {}
            , undeps = values(res.headers.dependencies)
  
        while (dep = undeps.shift()) {
          if (!(dep in flattened)) {
            flattened[dep] = 1
            undeps.push.apply(undeps, values(ripple.resources[dep].headers.dependencies))
          }
        }

        res.headers.flattened = keys(flattened).reverse()
        ripple(res)
        return ripple.resources[res.name]
      }
    })
  , parse: res => { 
      // TODO: separate entrypoint?
      if (client) {
        // TODO: branch on headers.format
        if (res.headers.format == 'cjs') {
          const m = { exports: {} };
          res.body(m, m.exports, ripple.require(res), { env: {}}) 
          res.body = m.exports
        }
      } else {
        // TODO: use deep defaults here
        // merge(res.headers)({ transpile: { limit: 25 }})
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
      , { values, keys } = Object
}