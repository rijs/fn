# Ripple | fn
[![Coverage Status](https://coveralls.io/repos/rijs/fn/badge.svg?branch=master&service=github)](https://coveralls.io/github/rijs/fn?branch=master)
[![Build Status](https://travis-ci.org/rijs/fn.svg)](https://travis-ci.org/rijs/fn)

Allows registering function resources.

```js
ripple('component', function(){ })
```

If you coerce a string to be registered as a function, it will attempt to turn it into a real function first:

```js
ripple({
  name: 'component'
, body: 'function(){ }' 
, headers: { 'content-type': 'application/javascript' }
})

typeof ripple('component') // 'function'
```