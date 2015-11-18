var expect = require('chai').expect
  , core = require('rijs.core').default
  , fn = require('./').default

describe('Function Type', function() {

  it('should create fn resource', function(){  
    var ripple = fn(core())
    ripple('foo', String)
    expect(ripple('foo')).to.eql(String)
  })

  it('should not create fn resource', function(){  
    var ripple = fn(core())
    ripple('baz', [])
    expect(ripple.resources['baz']).to.not.be.ok
  })

})