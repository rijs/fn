var fn = (function (path,fs) {
	'use strict';

	path = path && path.hasOwnProperty('default') ? path['default'] : path;
	fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}



	var core = /*#__PURE__*/Object.freeze({

	});

	var require$$0 = ( core && undefined ) || core;

	var core$1 = require$$0.reduce(function (acc, x) {
	    acc[x] = true;
	    return acc;
	}, {});

	var caller = function () {
	    // see https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
	    var origPrepareStackTrace = Error.prepareStackTrace;
	    Error.prepareStackTrace = function (_, stack) { return stack };
	    var stack = (new Error()).stack;
	    Error.prepareStackTrace = origPrepareStackTrace;
	    return stack[2].getFileName();
	};

	var nodeModulesPaths = function (start, opts) {
	    var modules = opts.moduleDirectory
	        ? [].concat(opts.moduleDirectory)
	        : ['node_modules']
	    ;

	    // ensure that `start` is an absolute path at this point,
	    // resolving against the process' current working directory
	    start = path.resolve(start);

	    var prefix = '/';
	    if (/^([A-Za-z]:)/.test(start)) {
	        prefix = '';
	    } else if (/^\\\\/.test(start)) {
	        prefix = '\\\\';
	    }

	    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/;

	    var parts = start.split(splitRe);

	    var dirs = [];
	    for (var i = parts.length - 1; i >= 0; i--) {
	        if (modules.indexOf(parts[i]) !== -1) { continue; }
	        dirs = dirs.concat(modules.map(function(module_dir) {
	            return prefix + path.join(
	                path.join.apply(path, parts.slice(0, i + 1)),
	                module_dir
	            );
	        }));
	    }
	    if (process.platform === 'win32'){
	        dirs[dirs.length-1] = dirs[dirs.length-1].replace(":", ":\\");
	    }
	    return dirs.concat(opts.paths);
	};

	var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\//;

	var async = function resolve (x, opts, cb) {
	    if (typeof opts === 'function') {
	        cb = opts;
	        opts = {};
	    }
	    if (!opts) { opts = {}; }
	    if (typeof x !== 'string') {
	        return process.nextTick(function () {
	            cb(new Error('path must be a string'));
	        });
	    }
	    
	    var isFile = opts.isFile || function (file, cb) {
	        fs.stat(file, function (err, stat) {
	            if (err && err.code === 'ENOENT') { cb(null, false); }
	            else if (err) { cb(err); }
	            else { cb(null, stat.isFile() || stat.isFIFO()); }
	        });
	    };
	    var readFile = opts.readFile || fs.readFile;
	    
	    var extensions = opts.extensions || [ '.js' ];
	    var y = opts.basedir || path.dirname(caller());
	    
	    opts.paths = opts.paths || [];
	    
	    if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\\/])/.test(x)) {
	        var res = path.resolve(y, x);
	        if (x === '..') { res += '/'; }
	        if (/\/$/.test(x) && res === y) {
	            loadAsDirectory(res, opts.package, onfile);
	        }
	        else { loadAsFile(res, opts.package, onfile); }
	    }
	    else { loadNodeModules(x, y, function (err, n, pkg) {
	        if (err) { cb(err); }
	        else if (n) { cb(null, n, pkg); }
	        else if (core$1[x]) { return cb(null, x); }
	        else { cb(new Error("Cannot find module '" + x + "' from '" + y + "'")); }
	    }); }
	    
	    function onfile (err, m, pkg) {
	        if (err) { cb(err); }
	        else if (m) { cb(null, m, pkg); }
	        else { loadAsDirectory(res, function (err, d, pkg) {
	            if (err) { cb(err); }
	            else if (d) { cb(null, d, pkg); }
	            else { cb(new Error("Cannot find module '" + x + "' from '" + y + "'")); }
	        }); }
	    }
	    
	    function loadAsFile (x, pkg, cb) {
	        if (typeof pkg === 'function') {
	            cb = pkg;
	            pkg = undefined;
	        }
	        
	        var exts = [''].concat(extensions);
	        load(exts, x, pkg);
			
			function load (exts, x, pkg) {
	            if (exts.length === 0) { return cb(null, undefined, pkg); }
	            var file = x + exts[0];
	            
	            if (pkg) { onpkg(null, pkg); }
	            else { loadpkg(path.dirname(file), onpkg); }
	            
	            function onpkg (err, pkg_, dir) {
	                pkg = pkg_;
	                if (err) { return cb(err) }
	                if (dir && pkg && opts.pathFilter) {
	                    var rfile = path.relative(dir, file);
	                    var rel = rfile.slice(0, rfile.length - exts[0].length);
	                    var r = opts.pathFilter(pkg, x, rel);
	                    if (r) { return load(
	                        [''].concat(extensions.slice()),
	                        path.resolve(dir, r),
	                        pkg
	                    ); }
	                }
	                isFile(file, onex);
	            }
	            function onex (err, ex) {
	                if (err) { cb(err); }
	                else if (!ex) { load(exts.slice(1), x, pkg); }
	                else { cb(null, file, pkg); }
	            }
	        }
	    }
	    
	    function loadpkg (dir, cb) {
	        if (dir === '' || dir === '/') { return cb(null); }
	        if (process.platform === 'win32' && /^\w:[\\\/]*$/.test(dir)) {
	            return cb(null);
	        }
	        if (/[\\\/]node_modules[\\\/]*$/.test(dir)) { return cb(null); }
	        
	        var pkgfile = path.join(dir, 'package.json');
	        isFile(pkgfile, function (err, ex) {
	            // on err, ex is false
	            if (!ex) { return loadpkg(
	                path.dirname(dir), cb
	            ); }
	            
	            readFile(pkgfile, function (err, body) {
	                if (err) { cb(err); }
	                try { var pkg = JSON.parse(body); }
	                catch (err) {}
	                
	                if (pkg && opts.packageFilter) {
	                    pkg = opts.packageFilter(pkg, pkgfile);
	                }
	                cb(null, pkg, dir);
	            });
	        });
	    }
	    
	    function loadAsDirectory (x, fpkg, cb) {
	        if (typeof fpkg === 'function') {
	            cb = fpkg;
	            fpkg = opts.package;
	        }
	        
	        var pkgfile = path.join(x, '/package.json');
	        isFile(pkgfile, function (err, ex) {
	            if (err) { return cb(err); }
	            if (!ex) { return loadAsFile(path.join(x, '/index'), fpkg, cb); }
	            
	            readFile(pkgfile, function (err, body) {
	                if (err) { return cb(err); }
	                try {
	                    var pkg = JSON.parse(body);
	                }
	                catch (err) {}
	                
	                if (opts.packageFilter) {
	                    pkg = opts.packageFilter(pkg, pkgfile);
	                }
	                
	                if (pkg.main) {
	                    if (pkg.main === '.' || pkg.main === './'){
	                        pkg.main = 'index';
	                    }
	                    loadAsFile(path.resolve(x, pkg.main), pkg, function (err, m, pkg) {
	                        if (err) { return cb(err); }
	                        if (m) { return cb(null, m, pkg); }
	                        if (!pkg) { return loadAsFile(path.join(x, '/index'), pkg, cb); }

	                        var dir = path.resolve(x, pkg.main);
	                        loadAsDirectory(dir, pkg, function (err, n, pkg) {
	                            if (err) { return cb(err); }
	                            if (n) { return cb(null, n, pkg); }
	                            loadAsFile(path.join(x, '/index'), pkg, cb);
	                        });
	                    });
	                    return;
	                }
	                
	                loadAsFile(path.join(x, '/index'), pkg, cb);
	            });
	        });
	    }
	    
	    function loadNodeModules (x, start, cb) {
	        (function process (dirs) {
	            if (dirs.length === 0) { return cb(null, undefined); }
	            var dir = dirs[0];
	            
	            var file = path.join(dir, '/', x);
	            loadAsFile(file, undefined, onfile);
	            
	            function onfile (err, m, pkg) {
	                if (err) { return cb(err); }
	                if (m) { return cb(null, m, pkg); }
	                loadAsDirectory(path.join(dir, '/', x), undefined, ondir);
	            }
	            
	            function ondir (err, n, pkg) {
	                if (err) { return cb(err); }
	                if (n) { return cb(null, n, pkg); }
	                process(dirs.slice(1));
	            }
	        })(nodeModulesPaths(start, opts));
	    }
	};

	var sync = function (x, opts) {
	    if (!opts) { opts = {}; }
	    var isFile = opts.isFile || function (file) {
	        try { var stat = fs.statSync(file); }
	        catch (err) { if (err && err.code === 'ENOENT') { return false } }
	        return stat.isFile() || stat.isFIFO();
	    };
	    var readFileSync = opts.readFileSync || fs.readFileSync;
	    
	    var extensions = opts.extensions || [ '.js' ];
	    var y = opts.basedir || path.dirname(caller());

	    opts.paths = opts.paths || [];

	    if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\\/])/.test(x)) {
	        var res = path.resolve(y, x);
	        if (x === '..') { res += '/'; }
	        var m = loadAsFileSync(res) || loadAsDirectorySync(res);
	        if (m) { return m; }
	    } else {
	        var n = loadNodeModulesSync(x, y);
	        if (n) { return n; }
	    }
	    
	    if (core$1[x]) { return x; }
	    
	    throw new Error("Cannot find module '" + x + "' from '" + y + "'");
	    
	    function loadAsFileSync (x) {
	        if (isFile(x)) {
	            return x;
	        }
	        
	        for (var i = 0; i < extensions.length; i++) {
	            var file = x + extensions[i];
	            if (isFile(file)) {
	                return file;
	            }
	        }
	    }
	    
	    function loadAsDirectorySync (x) {
	        var pkgfile = path.join(x, '/package.json');
	        if (isFile(pkgfile)) {
	            var body = readFileSync(pkgfile, 'utf8');
	            try {
	                var pkg = JSON.parse(body);
	                if (opts.packageFilter) {
	                    pkg = opts.packageFilter(pkg, x);
	                }
	                
	                if (pkg.main) {
	                    var m = loadAsFileSync(path.resolve(x, pkg.main));
	                    if (m) { return m; }
	                    var n = loadAsDirectorySync(path.resolve(x, pkg.main));
	                    if (n) { return n; }
	                }
	            }
	            catch (err) {}
	        }
	        
	        return loadAsFileSync(path.join( x, '/index'));
	    }
	    
	    function loadNodeModulesSync (x, start) {
	        var dirs = nodeModulesPaths(start, opts);
	        for (var i = 0; i < dirs.length; i++) {
	            var dir = dirs[i];
	            var m = loadAsFileSync(path.join( dir, '/', x));
	            if (m) { return m; }
	            var n = loadAsDirectorySync(path.join( dir, '/', x ));
	            if (n) { return n; }
	        }
	    }
	};

	var resolve = createCommonjsModule(function (module, exports) {
	exports = module.exports = async;
	exports.core = core$1;
	exports.isCore = function (x) { return core$1[x] };
	exports.sync = sync;
	});
	var resolve_1 = resolve.core;
	var resolve_2 = resolve.isCore;
	var resolve_3 = resolve.sync;

	// builtin



	// vendor


	// given a path, create an array of node_module paths for it
	// borrowed from substack/resolve
	function nodeModulesPaths$1 (start, cb) {
	    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/;
	    var parts = start.split(splitRe);

	    var dirs = [];
	    for (var i = parts.length - 1; i >= 0; i--) {
	        if (parts[i] === 'node_modules') { continue; }
	        var dir = path.join.apply(
	            path, parts.slice(0, i + 1).concat(['node_modules'])
	        );
	        if (!parts[0].match(/([A-Za-z]:)/)) {
	            dir = '/' + dir;
	        }
	        dirs.push(dir);
	    }
	    return dirs;
	}

	function find_shims_in_package(pkgJson, cur_path, shims, browser) {
	    try {
	        var info = JSON.parse(pkgJson);
	    }
	    catch (err) {
	        err.message = pkgJson + ' : ' + err.message;
	        throw err;
	    }

	    var replacements = getReplacements(info, browser);

	    // no replacements, skip shims
	    if (!replacements) {
	        return;
	    }

	    // if browser mapping is a string
	    // then it just replaces the main entry point
	    if (typeof replacements === 'string') {
	        var key = path.resolve(cur_path, info.main || 'index.js');
	        shims[key] = path.resolve(cur_path, replacements);
	        return;
	    }

	    // http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders
	    Object.keys(replacements).forEach(function(key) {
	        var val;
	        if (replacements[key] === false) {
	            val = __dirname + '/empty.js';
	        }
	        else {
	            val = replacements[key];
	            // if target is a relative path, then resolve
	            // otherwise we assume target is a module
	            if (val[0] === '.') {
	                val = path.resolve(cur_path, val);
	            }
	        }

	        if (key[0] === '/' || key[0] === '.') {
	            // if begins with / ../ or ./ then we must resolve to a full path
	            key = path.resolve(cur_path, key);
	        }
	        shims[key] = val;
	    });

	    [ '.js', '.json' ].forEach(function (ext) {
	        Object.keys(shims).forEach(function (key) {
	            if (!shims[key + ext]) {
	                shims[key + ext] = shims[key];
	            }
	        });
	    });
	}

	// paths is mutated
	// load shims from first package.json file found
	function load_shims(paths, browser, cb) {
	    // identify if our file should be replaced per the browser field
	    // original filename|id -> replacement
	    var shims = Object.create(null);

	    (function next() {
	        var cur_path = paths.shift();
	        if (!cur_path) {
	            return cb(null, shims);
	        }

	        var pkg_path = path.join(cur_path, 'package.json');

	        fs.readFile(pkg_path, 'utf8', function(err, data) {
	            if (err) {
	                // ignore paths we can't open
	                // avoids an exists check
	                if (err.code === 'ENOENT') {
	                    return next();
	                }

	                return cb(err);
	            }
	            try {
	                find_shims_in_package(data, cur_path, shims, browser);
	                return cb(null, shims);
	            }
	            catch (err) {
	                return cb(err);
	            }
	        });
	    })();
	}
	// paths is mutated
	// synchronously load shims from first package.json file found
	function load_shims_sync(paths, browser) {
	    // identify if our file should be replaced per the browser field
	    // original filename|id -> replacement
	    var shims = Object.create(null);
	    var cur_path;

	    while (cur_path = paths.shift()) {
	        var pkg_path = path.join(cur_path, 'package.json');

	        try {
	            var data = fs.readFileSync(pkg_path, 'utf8');
	            find_shims_in_package(data, cur_path, shims, browser);
	            return shims;
	        }
	        catch (err) {
	            // ignore paths we can't open
	            // avoids an exists check
	            if (err.code === 'ENOENT') {
	                continue;
	            }

	            throw err;
	        }
	    }
	    return shims;
	}

	function build_resolve_opts(opts, base) {
	    var packageFilter = opts.packageFilter;
	    var browser = normalizeBrowserFieldName(opts.browser);

	    opts.basedir = base;
	    opts.packageFilter = function (info, pkgdir) {
	        if (packageFilter) { info = packageFilter(info, pkgdir); }

	        var replacements = getReplacements(info, browser);

	        // no browser field, keep info unchanged
	        if (!replacements) {
	            return info;
	        }

	        info[browser] = replacements;

	        // replace main
	        if (typeof replacements === 'string') {
	            info.main = replacements;
	            return info;
	        }

	        var replace_main = replacements[info.main || './index.js'] ||
	            replacements['./' + info.main || './index.js'];

	        info.main = replace_main || info.main;
	        return info;
	    };

	    var pathFilter = opts.pathFilter;
	    opts.pathFilter = function(info, resvPath, relativePath) {
	        if (relativePath[0] != '.') {
	            relativePath = './' + relativePath;
	        }
	        var mappedPath;
	        if (pathFilter) {
	            mappedPath = pathFilter.apply(this, arguments);
	        }
	        if (mappedPath) {
	            return mappedPath;
	        }

	        var replacements = info[browser];
	        if (!replacements) {
	            return;
	        }

	        mappedPath = replacements[relativePath];
	        if (!mappedPath && path.extname(relativePath) === '') {
	            mappedPath = replacements[relativePath + '.js'];
	            if (!mappedPath) {
	                mappedPath = replacements[relativePath + '.json'];
	            }
	        }
	        return mappedPath;
	    };

	    return opts;
	}

	function resolve$1(id, opts, cb) {

	    // opts.filename
	    // opts.paths
	    // opts.modules
	    // opts.packageFilter

	    opts = opts || {};
	    opts.filename = opts.filename || '';

	    var base = path.dirname(opts.filename);

	    if (opts.basedir) {
	        base = opts.basedir;
	    }

	    var paths = nodeModulesPaths$1(base);

	    if (opts.paths) {
	        paths.push.apply(paths, opts.paths);
	    }

	    paths = paths.map(function(p) {
	        return path.dirname(p);
	    });

	    // we must always load shims because the browser field could shim out a module
	    load_shims(paths, opts.browser, function(err, shims) {
	        if (err) {
	            return cb(err);
	        }

	        var resid = path.resolve(opts.basedir || path.dirname(opts.filename), id);
	        if (shims[id] || shims[resid]) {
	            var xid = shims[id] ? id : resid;
	            // if the shim was is an absolute path, it was fully resolved
	            if (shims[xid][0] === '/') {
	                return resolve(shims[xid], build_resolve_opts(opts, base), function(err, full, pkg) {
	                    cb(null, full, pkg);
	                });
	            }

	            // module -> alt-module shims
	            id = shims[xid];
	        }

	        var modules = opts.modules || Object.create(null);
	        var shim_path = modules[id];
	        if (shim_path) {
	            return cb(null, shim_path);
	        }

	        // our browser field resolver
	        // if browser field is an object tho?
	        var full = resolve(id, build_resolve_opts(opts, base), function(err, full, pkg) {
	            if (err) {
	                return cb(err);
	            }

	            var resolved = (shims) ? shims[full] || full : full;
	            cb(null, resolved, pkg);
	        });
	    });
	}
	resolve$1.sync = function (id, opts) {

	    // opts.filename
	    // opts.paths
	    // opts.modules
	    // opts.packageFilter

	    opts = opts || {};
	    opts.filename = opts.filename || '';

	    var base = path.dirname(opts.filename);

	    if (opts.basedir) {
	        base = opts.basedir;
	    }

	    var paths = nodeModulesPaths$1(base);

	    if (opts.paths) {
	        paths.push.apply(paths, opts.paths);
	    }

	    paths = paths.map(function(p) {
	        return path.dirname(p);
	    });

	    // we must always load shims because the browser field could shim out a module
	    var shims = load_shims_sync(paths, opts.browser);

	    if (shims[id]) {
	        // if the shim was is an absolute path, it was fully resolved
	        if (shims[id][0] === '/') {
	            return shims[id];
	        }

	        // module -> alt-module shims
	        id = shims[id];
	    }

	    var modules = opts.modules || Object.create(null);
	    var shim_path = modules[id];
	    if (shim_path) {
	        return shim_path;
	    }

	    // our browser field resolver
	    // if browser field is an object tho?
	    var full = resolve.sync(id, build_resolve_opts(opts, base));

	    return (shims) ? shims[full] || full : full;
	};

	function normalizeBrowserFieldName(browser) {
	    return browser || 'browser';
	}

	function getReplacements(info, browser) {
	    browser = normalizeBrowserFieldName(browser);
	    var replacements = info[browser] || info.browser;

	    // support legacy browserify field for easier migration from legacy
	    // many packages used this field historically
	    if (typeof info.browserify === 'string' && !replacements) {
	        replacements = info.browserify;
	    }

	    return replacements;
	}

	var browserResolve = resolve$1;

	var is_1 = is;
	is.fn      = isFunction;
	is.str     = isString;
	is.num     = isNumber;
	is.obj     = isObject;
	is.lit     = isLiteral;
	is.bol     = isBoolean;
	is.truthy  = isTruthy;
	is.falsy   = isFalsy;
	is.arr     = isArray;
	is.null    = isNull;
	is.def     = isDef;
	is.in      = isIn;
	is.promise = isPromise;
	is.stream  = isStream;

	function is(v){
	  return function(d){
	    return d == v
	  }
	}

	function isFunction(d) {
	  return typeof d == 'function'
	}

	function isBoolean(d) {
	  return typeof d == 'boolean'
	}

	function isString(d) {
	  return typeof d == 'string'
	}

	function isNumber(d) {
	  return typeof d == 'number'
	}

	function isObject(d) {
	  return typeof d == 'object'
	}

	function isLiteral(d) {
	  return d.constructor == Object
	}

	function isTruthy(d) {
	  return !!d == true
	}

	function isFalsy(d) {
	  return !!d == false
	}

	function isArray(d) {
	  return d instanceof Array
	}

	function isNull(d) {
	  return d === null
	}

	function isDef(d) {
	  return typeof d !== 'undefined'
	}

	function isPromise(d) {
	  return d instanceof Promise
	}

	function isStream(d) {
	  return !!(d && d.next)
	}

	function isIn(set) {
	  return function(d){
	    return !set ? false  
	         : set.indexOf ? ~set.indexOf(d)
	         : d in set
	  }
	}

	var to = { 
	  arr: toArray
	, obj: toObject
	};

	function toArray(d){
	  return Array.prototype.slice.call(d, 0)
	}

	function toObject(d) {
	  var by = 'id'
	    ;

	  return arguments.length == 1 
	    ? (by = d, reduce)
	    : reduce.apply(this, arguments)

	  function reduce(p,v,i){
	    if (i === 0) { p = {}; }
	    p[is_1.fn(by) ? by(v, i) : v[by]] = v;
	    return p
	  }
	}

	var client = typeof window != 'undefined';

	var owner = client ? /* istanbul ignore next */ window : commonjsGlobal;

	var log = function log(ns){
	  return function(d){
	    if (!owner.console || !console.log.apply) { return d; }
	    is_1.arr(arguments[2]) && (arguments[2] = arguments[2].length);
	    var args = to.arr(arguments)
	      , prefix = '[log][' + (new Date()).toISOString() + ']' + ns;

	    args.unshift(prefix.grey ? prefix.grey : prefix);
	    return console.log.apply(console, args), d
	  }
	};

	var merge_1 = merge;

	function merge(to){ 
	  return function(from){
	    for (x in from) 
	      { is_1.obj(from[x]) && is_1.obj(to[x])
	        ? merge(to[x])(from[x])
	        : (to[x] = from[x]); }
	    return to
	  }
	}

	var file = function file(name){
	  return fs.readFileSync(name, { encoding:'utf8' })
	};

	var attr = function attr(name, value) {
	  var args = arguments.length;
	  
	  return !is_1.str(name) && args == 2 ? attr(arguments[1]).call(this, arguments[0])
	       : !is_1.str(name) && args == 3 ? attr(arguments[1], arguments[2]).call(this, arguments[0])
	       :  function(el){
	            var ctx = this || {};
	            el = ctx.nodeName || is_1.fn(ctx.node) ? ctx : el;
	            el = el.node ? el.node() : el;
	            el = el.host || el;

	            return args > 1 && value === false ? el.removeAttribute(name)
	                 : args > 1                    ? (el.setAttribute(name, value), value)
	                 : el.attributes.getNamedItem(name) 
	                && el.attributes.getNamedItem(name).value
	          } 
	};

	var lo = function lo(d){
	  return (d || '').toLowerCase()
	};

	// -------------------------------------------
	// Adds support for function resources
	// -------------------------------------------
	var fn_1 = function fnc(ripple, ref){
	  if ( ref === void 0 ) ref = {};
	  var dir = ref.dir; if ( dir === void 0 ) dir = '.';

	  log$1('creating');

	  // TODO: re-add client-side resolve too?
	  ripple.require = function (res) { return function (module) {
	    if (module in res.headers.dependencies && ripple.resources[res.headers.dependencies[module]])
	      { return ripple(res.headers.dependencies[module]) }
	    else
	      { throw new Error(("Cannot find module: " + module + " for " + (res.name))) }
	  }; };

	  ripple.types['application/javascript'] = { 
	    selector: function (res) { return ((res.name) + ",[is~=\"" + (res.name) + "\"]"); }
	  , extract: function (el) { return (attr('is')(el) || '').split(' ').concat(lo(el.nodeName)); }
	  , header: 'application/javascript'
	  , ext: '*.js'
	  , shortname: function (path$$1) { return basename(path$$1).split('.').shift(); }
	  , check: function (res) { return is_1.fn(res.body); }
	  , load: function load(res) {
	      if (res.headers.path.endsWith('.res.js')) {
	        var exported = commonjsRequire(res.headers.path);
	        exported = exported.default || exported;
	        res.headers['content-type'] = this.header;
	        ripple(merge_1(res)(exported));
	        return ripple.resources[res.name]
	      } else {
	        // TODO: try catch this, emit fail
	        res.body = new Function('module', 'exports', 'require', 'process', file(res.headers.path));
	        res.headers['content-type'] = this.header;
	        res.headers.format = 'cjs';
	        ripple(res);
	        return ripple.resources[res.name]
	      }
	    }
	  , parse: function (res) { 
	      // TODO: separate entrypoint?
	      if (client) {
	        // TODO: branch on headers.format
	        var m = { exports: {} };
	        res.body(m, m.exports, ripple.require(res), { env: {}}); 
	        res.body = m.exports;
	      } else {
	        // TODO: use deep defaults hers
	        res.headers.transpile = res.headers.transpile || { limit: 25 };
	        // TODO: branch on headers.format
	        // TODO: here or on load?
	        res.headers.dependencies = (("" + (res.body)).match(/require\(.*?\)/g) || [])
	          .reduce(function (deps, match) { 
	            var specifier = match.slice(9, -2)
	                , resolved  = bresolve(specifier, res.headers.path);
	            deps[specifier] = './' + relative(dir, resolved).replace(/\\/g, '/');
	            return deps
	          }, {});
	      }

	      return res
	    }
	  };

	  return ripple
	};

	var bresolve = function (module, parent) { return browserResolve
	  .sync(module, { filename: parent }); };

	var relative = path.relative;
	var basename = path.basename;
	var log$1 = log('[ri/types/fn]');

	return fn_1;

}(path,fs));
