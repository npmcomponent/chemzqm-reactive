
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var arr = this.el.className.split(re);\n\
  if ('' === arr[0]) arr.pop();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
  return exports;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  on.fn = fn;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var cb;\n\
  for (var i = 0; i < callbacks.length; i++) {\n\
    cb = callbacks[i];\n\
    if (cb === fn || cb.fn === fn) {\n\
      callbacks.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
  \n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("yields-merge-attrs/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Export `merge`\n\
 */\n\
\n\
module.exports = merge;\n\
\n\
/**\n\
 * Merge `b`'s attrs into `a`.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @api public\n\
 */\n\
\n\
function merge(a, b){\n\
  for (var i = 0; i < b.attributes.length; ++i) {\n\
    var attr = b.attributes[i];\n\
    if (ignore(a, attr)) continue;\n\
    a.setAttribute(attr.name, attr.value);\n\
  }\n\
}\n\
\n\
/**\n\
 * Check if `attr` should be ignored.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Attr} attr\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function ignore(a, attr){\n\
  return !attr.specified\n\
    || 'class' == attr.name\n\
    || 'id' == attr.name\n\
    || a.hasAttribute(attr.name);\n\
}\n\
//@ sourceURL=yields-merge-attrs/index.js"
));
require.register("yields-uniq/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies\n\
 */\n\
\n\
try {\n\
  var indexOf = require('indexof');\n\
} catch(e){\n\
  var indexOf = require('indexof-component');\n\
}\n\
\n\
/**\n\
 * Create duplicate free array\n\
 * from the provided `arr`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Array} select\n\
 * @return {Array}\n\
 */\n\
\n\
module.exports = function (arr, select) {\n\
  var len = arr.length, ret = [], v;\n\
  select = select ? (select instanceof Array ? select : [select]) : false;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    v = arr[i];\n\
    if (select && !~indexOf(select, v)) {\n\
      ret.push(v);\n\
    } else if (!~indexOf(ret, v)) {\n\
      ret.push(v);\n\
    }\n\
  }\n\
  return ret;\n\
};\n\
//@ sourceURL=yields-uniq/index.js"
));
require.register("yields-carry/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies\n\
 */\n\
\n\
var merge = require('merge-attrs')\n\
  , classes = require('classes')\n\
  , uniq = require('uniq');\n\
\n\
/**\n\
 * Export `carry`\n\
 */\n\
\n\
module.exports = carry;\n\
\n\
/**\n\
 * Carry over attrs and classes\n\
 * from `b` to `a`.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
function carry(a, b){\n\
  if (!a) return b.cloneNode();\n\
  carry.attrs(a, b);\n\
  carry.classes(a, b);\n\
  return a;\n\
}\n\
\n\
/**\n\
 * Carry attributes.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @return {Element} a\n\
 * @api public\n\
 */\n\
\n\
carry.attrs = function(a, b){\n\
  merge(a, b);\n\
  return a;\n\
};\n\
\n\
/**\n\
 * Carry over classes.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @return {Element} a\n\
 * @api public\n\
 */\n\
\n\
carry.classes = function(a, b){\n\
  if (a.className == b.className) return a;\n\
  var blist = classes(b).array();\n\
  var alist = classes(a).array();\n\
  var list = alist.concat(blist);\n\
  a.className = uniq(list).join(' ');\n\
  return a;\n\
};\n\
//@ sourceURL=yields-carry/index.js"
));
require.register("visionmedia-debug/index.js", Function("exports, require, module",
"if ('undefined' == typeof window) {\n\
  module.exports = require('./lib/debug');\n\
} else {\n\
  module.exports = require('./debug');\n\
}\n\
//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
module.exports = debug;\n\
\n\
/**\n\
 * Create a debugger with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Type}\n\
 * @api public\n\
 */\n\
\n\
function debug(name) {\n\
  if (!debug.enabled(name)) return function(){};\n\
\n\
  return function(fmt){\n\
    fmt = coerce(fmt);\n\
\n\
    var curr = new Date;\n\
    var ms = curr - (debug[name] || curr);\n\
    debug[name] = curr;\n\
\n\
    fmt = name\n\
      + ' '\n\
      + fmt\n\
      + ' +' + debug.humanize(ms);\n\
\n\
    // This hackery is required for IE8\n\
    // where `console.log` doesn't have 'apply'\n\
    window.console\n\
      && console.log\n\
      && Function.prototype.apply.call(console.log, console, arguments);\n\
  }\n\
}\n\
\n\
/**\n\
 * The currently active debug mode names.\n\
 */\n\
\n\
debug.names = [];\n\
debug.skips = [];\n\
\n\
/**\n\
 * Enables a debug mode by name. This can include modes\n\
 * separated by a colon and wildcards.\n\
 *\n\
 * @param {String} name\n\
 * @api public\n\
 */\n\
\n\
debug.enable = function(name) {\n\
  try {\n\
    localStorage.debug = name;\n\
  } catch(e){}\n\
\n\
  var split = (name || '').split(/[\\s,]+/)\n\
    , len = split.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    name = split[i].replace('*', '.*?');\n\
    if (name[0] === '-') {\n\
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n\
    }\n\
    else {\n\
      debug.names.push(new RegExp('^' + name + '$'));\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Disable debug output.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
debug.disable = function(){\n\
  debug.enable('');\n\
};\n\
\n\
/**\n\
 * Humanize the given `ms`.\n\
 *\n\
 * @param {Number} m\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
debug.humanize = function(ms) {\n\
  var sec = 1000\n\
    , min = 60 * 1000\n\
    , hour = 60 * min;\n\
\n\
  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n\
  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n\
  if (ms >= sec) return (ms / sec | 0) + 's';\n\
  return ms + 'ms';\n\
};\n\
\n\
/**\n\
 * Returns true if the given mode name is enabled, false otherwise.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
debug.enabled = function(name) {\n\
  for (var i = 0, len = debug.skips.length; i < len; i++) {\n\
    if (debug.skips[i].test(name)) {\n\
      return false;\n\
    }\n\
  }\n\
  for (var i = 0, len = debug.names.length; i < len; i++) {\n\
    if (debug.names[i].test(name)) {\n\
      return true;\n\
    }\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Coerce `val`.\n\
 */\n\
\n\
function coerce(val) {\n\
  if (val instanceof Error) return val.stack || val.message;\n\
  return val;\n\
}\n\
\n\
// persist\n\
\n\
try {\n\
  if (window.localStorage) debug.enable(localStorage.debug);\n\
} catch(e){}\n\
//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object Error]': return 'error';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val !== val) return 'nan';\n\
  if (val && val.nodeType === 1) return 'element';\n\
\n\
  return typeof val.valueOf();\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var type = require('type');\n\
\n\
/**\n\
 * HOP reference.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Iterate the given `obj` and invoke `fn(val, i)`.\n\
 *\n\
 * @param {String|Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  switch (type(obj)) {\n\
    case 'array':\n\
      return array(obj, fn);\n\
    case 'object':\n\
      if ('number' == typeof obj.length) return array(obj, fn);\n\
      return object(obj, fn);\n\
    case 'string':\n\
      return string(obj, fn);\n\
  }\n\
};\n\
\n\
/**\n\
 * Iterate string chars.\n\
 *\n\
 * @param {String} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function string(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj.charAt(i), i);\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate object keys.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn) {\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      fn(key, obj[key]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate array-ish.\n\
 *\n\
 * @param {Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj[i], i);\n\
  }\n\
}//@ sourceURL=component-each/index.js"
));
require.register("component-props/index.js", Function("exports, require, module",
"/**\n\
 * Global Names\n\
 */\n\
\n\
var globals = /\\b(Array|Date|Object|Math|JSON)\\b/g;\n\
\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String|Function} map function or prefix\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, fn){\n\
  var p = unique(props(str));\n\
  if (fn && 'string' == typeof fn) fn = prefixed(fn);\n\
  if (fn) return map(str, p, fn);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .replace(globals, '')\n\
    .match(/[a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` mapped with `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function map(str, props, fn) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return fn(_);\n\
    if (!~props.indexOf(_)) return _;\n\
    return fn(_);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Map with prefix `str`.\n\
 */\n\
\n\
function prefixed(str) {\n\
  return function(_){\n\
    return str + _;\n\
  };\n\
}\n\
//@ sourceURL=component-props/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
try {\n\
  var expr = require('props');\n\
} catch(e) {\n\
  var expr = require('props-component');\n\
}\n\
\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\" or \"age > 18 && age < 36\"\n\
  return new Function('_', 'return ' + get(str));\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
\n\
/**\n\
 * Built the getter function. Supports getter style functions\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function get(str) {\n\
  var props = expr(str);\n\
  if (!props.length) return '_.' + str;\n\
\n\
  var val;\n\
  for(var i = 0, prop; prop = props[i]; i++) {\n\
    val = '_.' + prop;\n\
    val = \"('function' == typeof \" + val + \" ? \" + val + \"() : \" + val + \")\";\n\
    str = str.replace(new RegExp(prop, 'g'), val);\n\
  }\n\
\n\
  return str;\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("juliangruber-isarray/index.js", Function("exports, require, module",
"module.exports = Array.isArray || function (arr) {\n\
  return Object.prototype.toString.call(arr) == '[object Array]';\n\
};\n\
//@ sourceURL=juliangruber-isarray/index.js"
));
require.register("component-enumerable/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function')\n\
  , isArray = require(\"isarray\")\n\
  , proto = {};\n\
\n\
/**\n\
 * Expose `Enumerable`.\n\
 */\n\
\n\
module.exports = Enumerable;\n\
\n\
/**\n\
 * Mixin to `obj`.\n\
 *\n\
 *    var Enumerable = require('enumerable');\n\
 *    Enumerable(Something.prototype);\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object} obj\n\
 */\n\
\n\
function mixin(obj){\n\
  for (var key in proto) obj[key] = proto[key];\n\
  obj.__iterate__ = obj.__iterate__ || defaultIterator;\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Initialize a new `Enumerable` with the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @api private\n\
 */\n\
\n\
function Enumerable(obj) {\n\
  if (!(this instanceof Enumerable)) {\n\
    if (isArray(obj)) return new Enumerable(obj);\n\
    return mixin(obj);\n\
  }\n\
  this.obj = obj;\n\
}\n\
\n\
/*!\n\
 * Default iterator utilizing `.length` and subscripts.\n\
 */\n\
\n\
function defaultIterator() {\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.length },\n\
    get: function(i){ return self[i] }\n\
  }\n\
}\n\
\n\
/**\n\
 * Return a string representation of this enumerable.\n\
 *\n\
 *    [Enumerable [1,2,3]]\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Enumerable.prototype.inspect =\n\
Enumerable.prototype.toString = function(){\n\
  return '[Enumerable ' + JSON.stringify(this.obj) + ']';\n\
};\n\
\n\
/**\n\
 * Iterate enumerable.\n\
 *\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
Enumerable.prototype.__iterate__ = function(){\n\
  var obj = this.obj;\n\
  obj.__iterate__ = obj.__iterate__ || defaultIterator;\n\
  return obj.__iterate__();\n\
};\n\
\n\
/**\n\
 * Iterate each value and invoke `fn(val, i)`.\n\
 *\n\
 *    users.each(function(val, i){\n\
 *\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
proto.forEach =\n\
proto.each = function(fn){\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    fn(vals.get(i), i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map each return value from `fn(val, i)`.\n\
 *\n\
 * Passing a callback function:\n\
 *\n\
 *    users.map(function(user){\n\
 *      return user.name.first\n\
 *    })\n\
 *\n\
 * Passing a property string:\n\
 *\n\
 *    users.map('name.first')\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.map = function(fn){\n\
  fn = toFunction(fn);\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  var arr = [];\n\
  for (var i = 0; i < len; ++i) {\n\
    arr.push(fn(vals.get(i), i));\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Select all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 *    users.select(function(user){\n\
 *      return user.age > 20\n\
 *    })\n\
 *\n\
 *  With a property:\n\
 *\n\
 *    items.select('complete')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.filter =\n\
proto.select = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) arr.push(val);\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Select all unique values.\n\
 *\n\
 *    nums.unique()\n\
 *\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.unique = function(){\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (~arr.indexOf(val)) continue;\n\
    arr.push(val);\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Reject all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 * Rejecting using a callback:\n\
 *\n\
 *    users.reject(function(user){\n\
 *      return user.age < 20\n\
 *    })\n\
 *\n\
 * Rejecting with a property:\n\
 *\n\
 *    items.reject('complete')\n\
 *\n\
 * Rejecting values via `==`:\n\
 *\n\
 *    data.reject(null)\n\
 *    users.reject(tobi)\n\
 *\n\
 * @param {Function|String|Mixed} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.reject = function(fn){\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if ('string' == typeof fn) fn = toFunction(fn);\n\
\n\
  if (fn) {\n\
    for (var i = 0; i < len; ++i) {\n\
      val = vals.get(i);\n\
      if (!fn(val, i)) arr.push(val);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      val = vals.get(i);\n\
      if (val != fn) arr.push(val);\n\
    }\n\
  }\n\
\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Reject `null` and `undefined`.\n\
 *\n\
 *    [1, null, 5, undefined].compact()\n\
 *    // => [1,5]\n\
 *\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
\n\
proto.compact = function(){\n\
  return this.reject(null);\n\
};\n\
\n\
/**\n\
 * Return the first value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.find(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * With a property string:\n\
 *\n\
 *    users.find('age > 20')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.find = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the last value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.findLast(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.findLast = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = len - 1; i > -1; --i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Assert that all invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that all pets are ferrets:\n\
 *\n\
 *    pets.all(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 *    users.all('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.all =\n\
proto.every = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (!fn(val, i)) return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that none of the invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that no pets are admins:\n\
 *\n\
 *    pets.none(function(p){ return p.admin })\n\
 *    pets.none('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.none = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that at least one invocation of `fn(val, i)` is truthy.\n\
 *\n\
 * For example checking to see if any pets are ferrets:\n\
 *\n\
 *    pets.any(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.any = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Count the number of times `fn(val, i)` returns true.\n\
 *\n\
 *    var n = pets.count(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.count = function(fn){\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  var n = 0;\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) ++n;\n\
  }\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the indexof `obj` or return `-1`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.indexOf = function(obj){\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (val === obj) return i;\n\
  }\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Check if `obj` is present in this enumerable.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.has = function(obj){\n\
  return !! ~this.indexOf(obj);\n\
};\n\
\n\
/**\n\
 * Reduce with `fn(accumulator, val, i)` using\n\
 * optional `init` value defaulting to the first\n\
 * enumerable value.\n\
 *\n\
 * @param {Function} fn\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.reduce = function(fn, init){\n\
  var val;\n\
  var i = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  val = null == init\n\
    ? vals.get(i++)\n\
    : init;\n\
\n\
  for (; i < len; ++i) {\n\
    val = fn(val, vals.get(i), i);\n\
  }\n\
\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Determine the max value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.max(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.max('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.max()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.max = function(fn){\n\
  var val;\n\
  var n = 0;\n\
  var max = -Infinity;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n = fn(vals.get(i), i);\n\
      max = n > max ? n : max;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n = vals.get(i);\n\
      max = n > max ? n : max;\n\
    }\n\
  }\n\
\n\
  return max;\n\
};\n\
\n\
/**\n\
 * Determine the min value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.min(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.min('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.min()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.min = function(fn){\n\
  var val;\n\
  var n = 0;\n\
  var min = Infinity;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n = fn(vals.get(i), i);\n\
      min = n < min ? n : min;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n = vals.get(i);\n\
      min = n < min ? n : min;\n\
    }\n\
  }\n\
\n\
  return min;\n\
};\n\
\n\
/**\n\
 * Determine the sum.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.sum(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.sum('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.sum()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.sum = function(fn){\n\
  var ret;\n\
  var n = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n += fn(vals.get(i), i);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n += vals.get(i);\n\
    }\n\
  }\n\
\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the average value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.avg(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.avg('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.avg()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.avg =\n\
proto.mean = function(fn){\n\
  var ret;\n\
  var n = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n += fn(vals.get(i), i);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n += vals.get(i);\n\
    }\n\
  }\n\
\n\
  return n / len;\n\
};\n\
\n\
/**\n\
 * Return the first value, or first `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.first = function(n){\n\
  if ('function' == typeof n) return this.find(n);\n\
  var vals = this.__iterate__();\n\
\n\
  if (n) {\n\
    var len = Math.min(n, vals.length());\n\
    var arr = new Array(len);\n\
    for (var i = 0; i < len; ++i) {\n\
      arr[i] = vals.get(i);\n\
    }\n\
    return arr;\n\
  }\n\
\n\
  return vals.get(0);\n\
};\n\
\n\
/**\n\
 * Return the last value, or last `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.last = function(n){\n\
  if ('function' == typeof n) return this.findLast(n);\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (n) {\n\
    var i = Math.max(0, len - n);\n\
    var arr = [];\n\
    for (; i < len; ++i) {\n\
      arr.push(vals.get(i));\n\
    }\n\
    return arr;\n\
  }\n\
\n\
  return vals.get(len - 1);\n\
};\n\
\n\
/**\n\
 * Return values in groups of `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.inGroupsOf = function(n){\n\
  var arr = [];\n\
  var group = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    group.push(vals.get(i));\n\
    if ((i + 1) % n == 0) {\n\
      arr.push(group);\n\
      group = [];\n\
    }\n\
  }\n\
\n\
  if (group.length) arr.push(group);\n\
\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Return the value at the given index.\n\
 *\n\
 * @param {Number} i\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.at = function(i){\n\
  return this.__iterate__().get(i);\n\
};\n\
\n\
/**\n\
 * Return a regular `Array`.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
proto.toJSON =\n\
proto.array = function(){\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    arr.push(vals.get(i));\n\
  }\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Return the enumerable value.\n\
 *\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.value = function(){\n\
  return this.obj;\n\
};\n\
\n\
/**\n\
 * Mixin enumerable.\n\
 */\n\
\n\
mixin(Enumerable.prototype);\n\
//@ sourceURL=component-enumerable/index.js"
));
require.register("component-collection/index.js", Function("exports, require, module",
"\n\
try {\n\
  var Enumerable = require('enumerable');\n\
} catch (e) {\n\
  var Enumerable = require('enumerable-component');\n\
}\n\
\n\
/**\n\
 * Expose `Collection`.\n\
 */\n\
\n\
module.exports = Collection;\n\
\n\
/**\n\
 * Initialize a new collection with the given `models`.\n\
 *\n\
 * @param {Array} models\n\
 * @api public\n\
 */\n\
\n\
function Collection(models) {\n\
  this.models = models || [];\n\
}\n\
\n\
/**\n\
 * Mixin enumerable.\n\
 */\n\
\n\
Enumerable(Collection.prototype);\n\
\n\
/**\n\
 * Iterator implementation.\n\
 */\n\
\n\
Collection.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.length() },\n\
    get: function(i){ return self.models[i] }\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the collection length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.length = function(){\n\
  return this.models.length;\n\
};\n\
\n\
/**\n\
 * Add `model` to the collection and return the index.\n\
 *\n\
 * @param {Object} model\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.push = function(model){\n\
  return this.models.push(model);\n\
};\n\
//@ sourceURL=component-collection/index.js"
));
require.register("RedVentures-reduce/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Reduce `arr` with `fn`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 * @param {Mixed} initial\n\
 *\n\
 * TODO: combatible error handling?\n\
 */\n\
\n\
module.exports = function(arr, fn, initial){  \n\
  var idx = 0;\n\
  var len = arr.length;\n\
  var curr = arguments.length == 3\n\
    ? initial\n\
    : arr[idx++];\n\
\n\
  while (idx < len) {\n\
    curr = fn.call(null, curr, arr[idx], ++idx, arr);\n\
  }\n\
  \n\
  return curr;\n\
};//@ sourceURL=RedVentures-reduce/index.js"
));
require.register("visionmedia-superagent/lib/client.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var reduce = require('reduce');\n\
\n\
/**\n\
 * Root reference for iframes.\n\
 */\n\
\n\
var root = 'undefined' == typeof window\n\
  ? this\n\
  : window;\n\
\n\
/**\n\
 * Noop.\n\
 */\n\
\n\
function noop(){};\n\
\n\
/**\n\
 * Check if `obj` is a host object,\n\
 * we don't want to serialize these :)\n\
 *\n\
 * TODO: future proof, move to compoent land\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isHost(obj) {\n\
  var str = {}.toString.call(obj);\n\
\n\
  switch (str) {\n\
    case '[object File]':\n\
    case '[object Blob]':\n\
    case '[object FormData]':\n\
      return true;\n\
    default:\n\
      return false;\n\
  }\n\
}\n\
\n\
/**\n\
 * Determine XHR.\n\
 */\n\
\n\
function getXHR() {\n\
  if (root.XMLHttpRequest\n\
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {\n\
    return new XMLHttpRequest;\n\
  } else {\n\
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}\n\
  }\n\
  return false;\n\
}\n\
\n\
/**\n\
 * Removes leading and trailing whitespace, added to support IE.\n\
 *\n\
 * @param {String} s\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
var trim = ''.trim\n\
  ? function(s) { return s.trim(); }\n\
  : function(s) { return s.replace(/(^\\s*|\\s*$)/g, ''); };\n\
\n\
/**\n\
 * Check if `obj` is an object.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isObject(obj) {\n\
  return obj === Object(obj);\n\
}\n\
\n\
/**\n\
 * Serialize the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function serialize(obj) {\n\
  if (!isObject(obj)) return obj;\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key)\n\
      + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
}\n\
\n\
/**\n\
 * Expose serialization method.\n\
 */\n\
\n\
 request.serializeObject = serialize;\n\
\n\
 /**\n\
  * Parse the given x-www-form-urlencoded `str`.\n\
  *\n\
  * @param {String} str\n\
  * @return {Object}\n\
  * @api private\n\
  */\n\
\n\
function parseString(str) {\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  var parts;\n\
  var pair;\n\
\n\
  for (var i = 0, len = pairs.length; i < len; ++i) {\n\
    pair = pairs[i];\n\
    parts = pair.split('=');\n\
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Expose parser.\n\
 */\n\
\n\
request.parseString = parseString;\n\
\n\
/**\n\
 * Default MIME type map.\n\
 *\n\
 *     superagent.types.xml = 'application/xml';\n\
 *\n\
 */\n\
\n\
request.types = {\n\
  html: 'text/html',\n\
  json: 'application/json',\n\
  urlencoded: 'application/x-www-form-urlencoded',\n\
  'form': 'application/x-www-form-urlencoded',\n\
  'form-data': 'application/x-www-form-urlencoded'\n\
};\n\
\n\
/**\n\
 * Default serialization map.\n\
 *\n\
 *     superagent.serialize['application/xml'] = function(obj){\n\
 *       return 'generated xml here';\n\
 *     };\n\
 *\n\
 */\n\
\n\
 request.serialize = {\n\
   'application/x-www-form-urlencoded': serialize,\n\
   'application/json': JSON.stringify\n\
 };\n\
\n\
 /**\n\
  * Default parsers.\n\
  *\n\
  *     superagent.parse['application/xml'] = function(str){\n\
  *       return { object parsed from str };\n\
  *     };\n\
  *\n\
  */\n\
\n\
request.parse = {\n\
  'application/x-www-form-urlencoded': parseString,\n\
  'application/json': JSON.parse\n\
};\n\
\n\
/**\n\
 * Parse the given header `str` into\n\
 * an object containing the mapped fields.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parseHeader(str) {\n\
  var lines = str.split(/\\r?\\n\
/);\n\
  var fields = {};\n\
  var index;\n\
  var line;\n\
  var field;\n\
  var val;\n\
\n\
  lines.pop(); // trailing CRLF\n\
\n\
  for (var i = 0, len = lines.length; i < len; ++i) {\n\
    line = lines[i];\n\
    index = line.indexOf(':');\n\
    field = line.slice(0, index).toLowerCase();\n\
    val = trim(line.slice(index + 1));\n\
    fields[field] = val;\n\
  }\n\
\n\
  return fields;\n\
}\n\
\n\
/**\n\
 * Return the mime type for the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function type(str){\n\
  return str.split(/ *; */).shift();\n\
};\n\
\n\
/**\n\
 * Return header field parameters.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function params(str){\n\
  return reduce(str.split(/ *; */), function(obj, str){\n\
    var parts = str.split(/ *= */)\n\
      , key = parts.shift()\n\
      , val = parts.shift();\n\
\n\
    if (key && val) obj[key] = val;\n\
    return obj;\n\
  }, {});\n\
};\n\
\n\
/**\n\
 * Initialize a new `Response` with the given `xhr`.\n\
 *\n\
 *  - set flags (.ok, .error, etc)\n\
 *  - parse header\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Aliasing `superagent` as `request` is nice:\n\
 *\n\
 *      request = superagent;\n\
 *\n\
 *  We can use the promise-like API, or pass callbacks:\n\
 *\n\
 *      request.get('/').end(function(res){});\n\
 *      request.get('/', function(res){});\n\
 *\n\
 *  Sending data can be chained:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 *  Or passed to `.send()`:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' }, function(res){});\n\
 *\n\
 *  Or passed to `.post()`:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 * Or further reduced to a single call for simple cases:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' }, function(res){});\n\
 *\n\
 * @param {XMLHTTPRequest} xhr\n\
 * @param {Object} options\n\
 * @api private\n\
 */\n\
\n\
function Response(req, options) {\n\
  options = options || {};\n\
  this.req = req;\n\
  this.xhr = this.req.xhr;\n\
  this.text = this.xhr.responseText;\n\
  this.setStatusProperties(this.xhr.status);\n\
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());\n\
  // getAllResponseHeaders sometimes falsely returns \"\" for CORS requests, but\n\
  // getResponseHeader still works. so we get content-type even if getting\n\
  // other headers fails.\n\
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');\n\
  this.setHeaderProperties(this.header);\n\
  this.body = this.parseBody(this.text);\n\
}\n\
\n\
/**\n\
 * Get case-insensitive `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.get = function(field){\n\
  return this.header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set header related properties:\n\
 *\n\
 *   - `.type` the content type without params\n\
 *\n\
 * A response of \"Content-Type: text/plain; charset=utf-8\"\n\
 * will provide you with a `.type` of \"text/plain\".\n\
 *\n\
 * @param {Object} header\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setHeaderProperties = function(header){\n\
  // content-type\n\
  var ct = this.header['content-type'] || '';\n\
  this.type = type(ct);\n\
\n\
  // params\n\
  var obj = params(ct);\n\
  for (var key in obj) this[key] = obj[key];\n\
};\n\
\n\
/**\n\
 * Parse the given body `str`.\n\
 *\n\
 * Used for auto-parsing of bodies. Parsers\n\
 * are defined on the `superagent.parse` object.\n\
 *\n\
 * @param {String} str\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.parseBody = function(str){\n\
  var parse = request.parse[this.type];\n\
  return parse\n\
    ? parse(str)\n\
    : null;\n\
};\n\
\n\
/**\n\
 * Set flags such as `.ok` based on `status`.\n\
 *\n\
 * For example a 2xx response will give you a `.ok` of __true__\n\
 * whereas 5xx will be __false__ and `.error` will be __true__. The\n\
 * `.clientError` and `.serverError` are also available to be more\n\
 * specific, and `.statusType` is the class of error ranging from 1..5\n\
 * sometimes useful for mapping respond colors etc.\n\
 *\n\
 * \"sugar\" properties are also defined for common cases. Currently providing:\n\
 *\n\
 *   - .noContent\n\
 *   - .badRequest\n\
 *   - .unauthorized\n\
 *   - .notAcceptable\n\
 *   - .notFound\n\
 *\n\
 * @param {Number} status\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setStatusProperties = function(status){\n\
  var type = status / 100 | 0;\n\
\n\
  // status / class\n\
  this.status = status;\n\
  this.statusType = type;\n\
\n\
  // basics\n\
  this.info = 1 == type;\n\
  this.ok = 2 == type;\n\
  this.clientError = 4 == type;\n\
  this.serverError = 5 == type;\n\
  this.error = (4 == type || 5 == type)\n\
    ? this.toError()\n\
    : false;\n\
\n\
  // sugar\n\
  this.accepted = 202 == status;\n\
  this.noContent = 204 == status || 1223 == status;\n\
  this.badRequest = 400 == status;\n\
  this.unauthorized = 401 == status;\n\
  this.notAcceptable = 406 == status;\n\
  this.notFound = 404 == status;\n\
  this.forbidden = 403 == status;\n\
};\n\
\n\
/**\n\
 * Return an `Error` representative of this response.\n\
 *\n\
 * @return {Error}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.toError = function(){\n\
  var req = this.req;\n\
  var method = req.method;\n\
  var path = req.path;\n\
\n\
  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';\n\
  var err = new Error(msg);\n\
  err.status = this.status;\n\
  err.method = method;\n\
  err.path = path;\n\
\n\
  return err;\n\
};\n\
\n\
/**\n\
 * Expose `Response`.\n\
 */\n\
\n\
request.Response = Response;\n\
\n\
/**\n\
 * Initialize a new `Request` with the given `method` and `url`.\n\
 *\n\
 * @param {String} method\n\
 * @param {String} url\n\
 * @api public\n\
 */\n\
\n\
function Request(method, url) {\n\
  var self = this;\n\
  Emitter.call(this);\n\
  this._query = this._query || [];\n\
  this.method = method;\n\
  this.url = url;\n\
  this.header = {};\n\
  this._header = {};\n\
  this.on('end', function(){\n\
    var res = new Response(self);\n\
    if ('HEAD' == method) res.text = null;\n\
    self.callback(null, res);\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Emitter.prototype`.\n\
 */\n\
\n\
Request.prototype = new Emitter;\n\
Request.prototype.constructor = Request;\n\
\n\
/**\n\
 * Set timeout to `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.timeout = function(ms){\n\
  this._timeout = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Clear previous timeout.\n\
 *\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.clearTimeout = function(){\n\
  this._timeout = 0;\n\
  clearTimeout(this._timer);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Abort the request, and clear potential timeout.\n\
 *\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.abort = function(){\n\
  if (this.aborted) return;\n\
  this.aborted = true;\n\
  this.xhr.abort();\n\
  this.clearTimeout();\n\
  this.emit('abort');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set header `field` to `val`, or multiple fields with one object.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      req.get('/')\n\
 *        .set('Accept', 'application/json')\n\
 *        .set('X-API-Key', 'foobar')\n\
 *        .end(callback);\n\
 *\n\
 *      req.get('/')\n\
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })\n\
 *        .end(callback);\n\
 *\n\
 * @param {String|Object} field\n\
 * @param {String} val\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.set = function(field, val){\n\
  if (isObject(field)) {\n\
    for (var key in field) {\n\
      this.set(key, field[key]);\n\
    }\n\
    return this;\n\
  }\n\
  this._header[field.toLowerCase()] = val;\n\
  this.header[field] = val;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get case-insensitive header `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.getHeader = function(field){\n\
  return this._header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set Content-Type to `type`, mapping values from `request.types`.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      superagent.types.xml = 'application/xml';\n\
 *\n\
 *      request.post('/')\n\
 *        .type('xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 *      request.post('/')\n\
 *        .type('application/xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 * @param {String} type\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.type = function(type){\n\
  this.set('Content-Type', request.types[type] || type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set Authorization field value with `user` and `pass`.\n\
 *\n\
 * @param {String} user\n\
 * @param {String} pass\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.auth = function(user, pass){\n\
  var str = btoa(user + ':' + pass);\n\
  this.set('Authorization', 'Basic ' + str);\n\
  return this;\n\
};\n\
\n\
/**\n\
* Add query-string `val`.\n\
*\n\
* Examples:\n\
*\n\
*   request.get('/shoes')\n\
*     .query('size=10')\n\
*     .query({ color: 'blue' })\n\
*\n\
* @param {Object|String} val\n\
* @return {Request} for chaining\n\
* @api public\n\
*/\n\
\n\
Request.prototype.query = function(val){\n\
  if ('string' != typeof val) val = serialize(val);\n\
  this._query.push(val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Send `data`, defaulting the `.type()` to \"json\" when\n\
 * an object is given.\n\
 *\n\
 * Examples:\n\
 *\n\
 *       // querystring\n\
 *       request.get('/search')\n\
 *         .end(callback)\n\
 *\n\
 *       // multiple data \"writes\"\n\
 *       request.get('/search')\n\
 *         .send({ search: 'query' })\n\
 *         .send({ range: '1..5' })\n\
 *         .send({ order: 'desc' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual json\n\
 *       request.post('/user')\n\
 *         .type('json')\n\
 *         .send('{\"name\":\"tj\"})\n\
 *         .end(callback)\n\
 *\n\
 *       // auto json\n\
 *       request.post('/user')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send('name=tj')\n\
 *         .end(callback)\n\
 *\n\
 *       // auto x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // defaults to x-www-form-urlencoded\n\
  *      request.post('/user')\n\
  *        .send('name=tobi')\n\
  *        .send('species=ferret')\n\
  *        .end(callback)\n\
 *\n\
 * @param {String|Object} data\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.send = function(data){\n\
  var obj = isObject(data);\n\
  var type = this.getHeader('Content-Type');\n\
\n\
  // merge\n\
  if (obj && isObject(this._data)) {\n\
    for (var key in data) {\n\
      this._data[key] = data[key];\n\
    }\n\
  } else if ('string' == typeof data) {\n\
    if (!type) this.type('form');\n\
    type = this.getHeader('Content-Type');\n\
    if ('application/x-www-form-urlencoded' == type) {\n\
      this._data = this._data\n\
        ? this._data + '&' + data\n\
        : data;\n\
    } else {\n\
      this._data = (this._data || '') + data;\n\
    }\n\
  } else {\n\
    this._data = data;\n\
  }\n\
\n\
  if (!obj) return this;\n\
  if (!type) this.type('json');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Invoke the callback with `err` and `res`\n\
 * and handle arity check.\n\
 *\n\
 * @param {Error} err\n\
 * @param {Response} res\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.callback = function(err, res){\n\
  var fn = this._callback;\n\
  if (2 == fn.length) return fn(err, res);\n\
  if (err) return this.emit('error', err);\n\
  fn(res);\n\
};\n\
\n\
/**\n\
 * Invoke callback with x-domain error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.crossDomainError = function(){\n\
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');\n\
  err.crossDomain = true;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Invoke callback with timeout error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.timeoutError = function(){\n\
  var timeout = this._timeout;\n\
  var err = new Error('timeout of ' + timeout + 'ms exceeded');\n\
  err.timeout = timeout;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Enable transmission of cookies with x-domain requests.\n\
 *\n\
 * Note that for this to work the origin must not be\n\
 * using \"Access-Control-Allow-Origin\" with a wildcard,\n\
 * and also must set \"Access-Control-Allow-Credentials\"\n\
 * to \"true\".\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.withCredentials = function(){\n\
  this._withCredentials = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Initiate request, invoking callback `fn(res)`\n\
 * with an instanceof `Response`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.end = function(fn){\n\
  var self = this;\n\
  var xhr = this.xhr = getXHR();\n\
  var query = this._query.join('&');\n\
  var timeout = this._timeout;\n\
  var data = this._data;\n\
\n\
  // store callback\n\
  this._callback = fn || noop;\n\
\n\
  // CORS\n\
  if (this._withCredentials) xhr.withCredentials = true;\n\
\n\
  // state change\n\
  xhr.onreadystatechange = function(){\n\
    if (4 != xhr.readyState) return;\n\
    if (0 == xhr.status) {\n\
      if (self.aborted) return self.timeoutError();\n\
      return self.crossDomainError();\n\
    }\n\
    self.emit('end');\n\
  };\n\
\n\
  // progress\n\
  if (xhr.upload) {\n\
    xhr.upload.onprogress = function(e){\n\
      e.percent = e.loaded / e.total * 100;\n\
      self.emit('progress', e);\n\
    };\n\
  }\n\
\n\
  // timeout\n\
  if (timeout && !this._timer) {\n\
    this._timer = setTimeout(function(){\n\
      self.abort();\n\
    }, timeout);\n\
  }\n\
\n\
  // querystring\n\
  if (query) {\n\
    query = request.serializeObject(query);\n\
    this.url += ~this.url.indexOf('?')\n\
      ? '&' + query\n\
      : '?' + query;\n\
  }\n\
\n\
  // initiate request\n\
  xhr.open(this.method, this.url, true);\n\
\n\
  // body\n\
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {\n\
    // serialize stuff\n\
    var serialize = request.serialize[this.getHeader('Content-Type')];\n\
    if (serialize) data = serialize(data);\n\
  }\n\
\n\
  // set header fields\n\
  for (var field in this.header) {\n\
    if (null == this.header[field]) continue;\n\
    xhr.setRequestHeader(field, this.header[field]);\n\
  }\n\
\n\
  // send stuff\n\
  xhr.send(data);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Expose `Request`.\n\
 */\n\
\n\
request.Request = Request;\n\
\n\
/**\n\
 * Issue a request:\n\
 *\n\
 * Examples:\n\
 *\n\
 *    request('GET', '/users').end(callback)\n\
 *    request('/users').end(callback)\n\
 *    request('/users', callback)\n\
 *\n\
 * @param {String} method\n\
 * @param {String|Function} url or callback\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
function request(method, url) {\n\
  // callback\n\
  if ('function' == typeof url) {\n\
    return new Request('GET', method).end(url);\n\
  }\n\
\n\
  // url first\n\
  if (1 == arguments.length) {\n\
    return new Request('GET', method);\n\
  }\n\
\n\
  return new Request(method, url);\n\
}\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.get = function(url, data, fn){\n\
  var req = request('GET', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.query(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.head = function(url, data, fn){\n\
  var req = request('HEAD', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * DELETE `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.del = function(url, fn){\n\
  var req = request('DELETE', url);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PATCH `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.patch = function(url, data, fn){\n\
  var req = request('PATCH', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * POST `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.post = function(url, data, fn){\n\
  var req = request('POST', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PUT `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.put = function(url, data, fn){\n\
  var req = request('PUT', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * Expose `request`.\n\
 */\n\
\n\
module.exports = request;\n\
//@ sourceURL=visionmedia-superagent/lib/client.js"
));
require.register("component-model/lib/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
try {\n\
  var Emitter = require('emitter');\n\
} catch (e) {\n\
  var Emitter = require('emitter-component');\n\
}\n\
\n\
var proto = require('./proto');\n\
var statics = require('./static');\n\
\n\
/**\n\
 * Expose `createModel`.\n\
 */\n\
\n\
module.exports = createModel;\n\
\n\
/**\n\
 * Create a new model constructor with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
function createModel(name) {\n\
  if ('string' != typeof name) throw new TypeError('model name required');\n\
\n\
  /**\n\
   * Initialize a new model with the given `attrs`.\n\
   *\n\
   * @param {Object} attrs\n\
   * @api public\n\
   */\n\
\n\
  function model(attrs) {\n\
    if (!(this instanceof model)) return new model(attrs);\n\
    attrs = attrs || {};\n\
    this._callbacks = {};\n\
    this.attrs = attrs;\n\
    this.dirty = attrs;\n\
    this.model.emit('construct', this, attrs);\n\
  }\n\
\n\
  // mixin emitter\n\
\n\
  Emitter(model);\n\
\n\
  // statics\n\
\n\
  model.modelName = name;\n\
  model._base = '/' + name.toLowerCase() + 's';\n\
  model.attrs = {};\n\
  model.validators = [];\n\
  model._headers = {};\n\
  for (var key in statics) model[key] = statics[key];\n\
\n\
  // prototype\n\
\n\
  model.prototype = {};\n\
  model.prototype.model = model;\n\
  for (var key in proto) model.prototype[key] = proto[key];\n\
\n\
  return model;\n\
}\n\
\n\
//@ sourceURL=component-model/lib/index.js"
));
require.register("component-model/lib/static.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Collection = require('collection');\n\
var request = require('superagent');\n\
var noop = function(){};\n\
\n\
/**\n\
 * Expose request for configuration\n\
 */\n\
\n\
exports.request = request;\n\
\n\
/**\n\
 * Construct a url to the given `path`.\n\
 *\n\
 * Example:\n\
 *\n\
 *    User.url('add')\n\
 *    // => \"/users/add\"\n\
 *\n\
 * @param {String} path\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.url = function(path){\n\
  var url = this._base;\n\
  if (0 == arguments.length) return url;\n\
  return url + '/' + path;\n\
};\n\
\n\
/**\n\
 * Set base path for urls.\n\
 * Note this is defaulted to '/' + modelName.toLowerCase() + 's'\n\
 *\n\
 * Example:\n\
 *\n\
 *   User.route('/api/u')\n\
 *\n\
 * @param {String} path\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.route = function(path){\n\
  this._base = path;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Add custom http headers to all requests.\n\
 *\n\
 * Example:\n\
 *\n\
 *   User.headers({\n\
 *    'X-CSRF-Token': 'some token',\n\
 *    'X-API-Token': 'api token\n\
 *   });\n\
 *\n\
 * @param {String|Object} header(s)\n\
 * @param {String} value\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.headers = function(headers){\n\
  for(var i in headers){\n\
    this._headers[i] = headers[i];\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add validation `fn()`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.validate = function(fn){\n\
  this.validators.push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Use the given plugin `fn()`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.use = function(fn){\n\
  fn(this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Define attr with the given `name` and `options`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Object} options\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.attr = function(name, options){\n\
  this.attrs[name] = options || {};\n\
\n\
  // implied pk\n\
  if ('_id' == name || 'id' == name) {\n\
    this.attrs[name].primaryKey = true;\n\
    this.primaryKey = name;\n\
  }\n\
\n\
  // getter / setter method\n\
  this.prototype[name] = function(val){\n\
    if (0 == arguments.length) return this.attrs[name];\n\
    var prev = this.attrs[name];\n\
    this.dirty[name] = val;\n\
    this.attrs[name] = val;\n\
    this.model.emit('change', this, name, val, prev);\n\
    this.model.emit('change ' + name, this, val, prev);\n\
    this.emit('change', name, val, prev);\n\
    this.emit('change ' + name, val, prev);\n\
    return this;\n\
  };\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.destroyAll = function(fn){\n\
  fn = fn || noop;\n\
  var self = this;\n\
  var url = this.url('');\n\
  this.request\n\
    .del(url)\n\
    .set(this._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), null, res);\n\
      fn(null, [], res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Get all and invoke `fn(err, array)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.all = function(fn){\n\
  var self = this;\n\
  var url = this.url('');\n\
  this.request\n\
    .get(url)\n\
    .set(this._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), null, res);\n\
      var col = new Collection;\n\
      for (var i = 0, len = res.body.length; i < len; ++i) {\n\
        col.push(new self(res.body[i]));\n\
      }\n\
      fn(null, col, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Get `id` and invoke `fn(err, model)`.\n\
 *\n\
 * @param {Mixed} id\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(id, fn){\n\
  var self = this;\n\
  var url = this.url(id);\n\
  this.request\n\
    .get(url)\n\
    .set(this._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), null, res);\n\
      var model = new self(res.body);\n\
      fn(null, model, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Response error helper.\n\
 *\n\
 * @param {Response} er\n\
 * @return {Error}\n\
 * @api private\n\
 */\n\
\n\
function error(res) {\n\
  return new Error('got ' + res.status + ' response');\n\
}\n\
//@ sourceURL=component-model/lib/static.js"
));
require.register("component-model/lib/proto.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
try {\n\
  var Emitter = require('emitter');\n\
  var each = require('each');\n\
} catch (e) {\n\
  var Emitter = require('emitter-component');\n\
  var each = require('each-component');\n\
}\n\
\n\
var request = require('superagent');\n\
var noop = function(){};\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(exports);\n\
\n\
/**\n\
 * Expose request for configuration\n\
 */\n\
exports.request = request;\n\
\n\
/**\n\
 * Register an error `msg` on `attr`.\n\
 *\n\
 * @param {String} attr\n\
 * @param {String} msg\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
exports.error = function(attr, msg){\n\
  this.errors.push({\n\
    attr: attr,\n\
    message: msg\n\
  });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if this model is new.\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isNew = function(){\n\
  var key = this.model.primaryKey;\n\
  return ! this.has(key);\n\
};\n\
\n\
/**\n\
 * Get / set the primary key.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
exports.primary = function(val){\n\
  var key = this.model.primaryKey;\n\
  if (0 == arguments.length) return this[key]();\n\
  return this[key](val);\n\
};\n\
\n\
/**\n\
 * Validate the model and return a boolean.\n\
 *\n\
 * Example:\n\
 *\n\
 *    user.isValid()\n\
 *    // => false\n\
 *\n\
 *    user.errors\n\
 *    // => [{ attr: ..., message: ... }]\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isValid = function(){\n\
  this.validate();\n\
  return 0 == this.errors.length;\n\
};\n\
\n\
/**\n\
 * Return `false` or an object\n\
 * containing the \"dirty\" attributes.\n\
 *\n\
 * Optionally check for a specific `attr`.\n\
 *\n\
 * @param {String} [attr]\n\
 * @return {Object|Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.changed = function(attr){\n\
  var dirty = this.dirty;\n\
  if (Object.keys(dirty).length) {\n\
    if (attr) return !! dirty[attr];\n\
    return dirty;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Perform validations.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
exports.validate = function(){\n\
  var self = this;\n\
  var fns = this.model.validators;\n\
  this.errors = [];\n\
  each(fns, function(fn){ fn(self) });\n\
};\n\
\n\
/**\n\
 * Destroy the model and mark it as `.destroyed`\n\
 * and invoke `fn(err)`.\n\
 *\n\
 * Events:\n\
 *\n\
 *  - `destroying` before deletion\n\
 *  - `destroy` on deletion\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.destroy = function(fn){\n\
  fn = fn || noop;\n\
  if (this.isNew()) return fn(new Error('not saved'));\n\
  var self = this;\n\
  var url = this.url();\n\
  this.model.emit('destroying', this);\n\
  this.emit('destroying');\n\
  this.request\n\
    .del(url)\n\
    .set(this.model._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), res);\n\
      self.destroyed = true;\n\
      self.model.emit('destroy', self, res);\n\
      self.emit('destroy');\n\
      fn(null, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Save and invoke `fn(err)`.\n\
 *\n\
 * Events:\n\
 *\n\
 *  - `saving` pre-update or save, after validation\n\
 *  - `save` on updates and saves\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.save = function(fn){\n\
  if (!this.isNew()) return this.update(fn);\n\
  var self = this;\n\
  var url = this.model.url();\n\
  var key = this.model.primaryKey;\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  this.request\n\
    .post(url)\n\
    .set(this.model._headers)\n\
    .send(self)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), res);\n\
      if (res.body) self.primary(res.body[key]);\n\
      self.dirty = {};\n\
      self.model.emit('save', self, res);\n\
      self.emit('save');\n\
      fn(null, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Update and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api private\n\
 */\n\
\n\
exports.update = function(fn){\n\
  var self = this;\n\
  var url = this.url();\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  this.request\n\
    .put(url)\n\
    .set(this.model._headers)\n\
    .send(self)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), res);\n\
      self.dirty = {};\n\
      self.model.emit('save', self, res);\n\
      self.emit('save');\n\
      fn(null, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Return a url for `path` relative to this model.\n\
 *\n\
 * Example:\n\
 *\n\
 *    var user = new User({ id: 5 });\n\
 *    user.url('edit');\n\
 *    // => \"/users/5/edit\"\n\
 *\n\
 * @param {String} path\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.url = function(path){\n\
  var model = this.model;\n\
  var url = model._base;\n\
  var id = this.primary();\n\
  if (0 == arguments.length) return url + '/' + id;\n\
  return url + '/' + id + '/' + path;\n\
};\n\
\n\
/**\n\
 * Set multiple `attrs`.\n\
 *\n\
 * @param {Object} attrs\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
exports.set = function(attrs){\n\
  for (var key in attrs) {\n\
    this[key](attrs[key]);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get `attr` value.\n\
 *\n\
 * @param {String} attr\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(attr){\n\
  return this.attrs[attr];\n\
};\n\
\n\
/**\n\
 * Check if `attr` is present (not `null` or `undefined`).\n\
 *\n\
 * @param {String} attr\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.has = function(attr){\n\
  return null != this.attrs[attr];\n\
};\n\
\n\
/**\n\
 * Return the JSON representation of the model.\n\
 *\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.toJSON = function(){\n\
  return this.attrs;\n\
};\n\
\n\
/**\n\
 * Response error helper.\n\
 *\n\
 * @param {Response} er\n\
 * @return {Error}\n\
 * @api private\n\
 */\n\
\n\
function error(res) {\n\
  return new Error('got ' + res.status + ' response');\n\
}\n\
//@ sourceURL=component-model/lib/proto.js"
));
require.register("component-stack/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `stack()`.\n\
 */\n\
\n\
module.exports = stack;\n\
\n\
/**\n\
 * Return the stack.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
function stack() {\n\
  var orig = Error.prepareStackTrace;\n\
  Error.prepareStackTrace = function(_, stack){ return stack; };\n\
  var err = new Error;\n\
  Error.captureStackTrace(err, arguments.callee);\n\
  var stack = err.stack;\n\
  Error.prepareStackTrace = orig;\n\
  return stack;\n\
}//@ sourceURL=component-stack/index.js"
));
require.register("jkroso-type/index.js", Function("exports, require, module",
"\n\
var toString = {}.toString\n\
var DomNode = typeof window != 'undefined'\n\
  ? window.Node\n\
  : Function\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = exports = function(x){\n\
  var type = typeof x\n\
  if (type != 'object') return type\n\
  type = types[toString.call(x)]\n\
  if (type) return type\n\
  if (x instanceof DomNode) switch (x.nodeType) {\n\
    case 1:  return 'element'\n\
    case 3:  return 'text-node'\n\
    case 9:  return 'document'\n\
    case 11: return 'document-fragment'\n\
    default: return 'dom-node'\n\
  }\n\
}\n\
\n\
var types = exports.types = {\n\
  '[object Function]': 'function',\n\
  '[object Date]': 'date',\n\
  '[object RegExp]': 'regexp',\n\
  '[object Arguments]': 'arguments',\n\
  '[object Array]': 'array',\n\
  '[object String]': 'string',\n\
  '[object Null]': 'null',\n\
  '[object Undefined]': 'undefined',\n\
  '[object Number]': 'number',\n\
  '[object Boolean]': 'boolean',\n\
  '[object Object]': 'object',\n\
  '[object Text]': 'text-node',\n\
  '[object Uint8Array]': 'bit-array',\n\
  '[object Uint16Array]': 'bit-array',\n\
  '[object Uint32Array]': 'bit-array',\n\
  '[object Uint8ClampedArray]': 'bit-array',\n\
  '[object Error]': 'error',\n\
  '[object FormData]': 'form-data',\n\
  '[object File]': 'file',\n\
  '[object Blob]': 'blob'\n\
}\n\
//@ sourceURL=jkroso-type/index.js"
));
require.register("jkroso-equals/index.js", Function("exports, require, module",
"\n\
var type = require('type')\n\
\n\
/**\n\
 * expose equals\n\
 */\n\
\n\
module.exports = equals\n\
equals.compare = compare\n\
\n\
/**\n\
 * assert all values are equal\n\
 *\n\
 * @param {Any} [...]\n\
 * @return {Boolean}\n\
 */\n\
\n\
 function equals(){\n\
  var i = arguments.length - 1\n\
  while (i > 0) {\n\
    if (!compare(arguments[i], arguments[--i])) return false\n\
  }\n\
  return true\n\
}\n\
\n\
// (any, any, [array]) -> boolean\n\
function compare(a, b, memos){\n\
  // All identical values are equivalent\n\
  if (a === b) return true\n\
  var fnA = types[type(a)]\n\
  var fnB = types[type(b)]\n\
  return fnA && fnA === fnB\n\
    ? fnA(a, b, memos)\n\
    : false\n\
}\n\
\n\
var types = {}\n\
\n\
// (Number) -> boolean\n\
types.number = function(a){\n\
  // NaN check\n\
  return a !== a\n\
}\n\
\n\
// (function, function, array) -> boolean\n\
types['function'] = function(a, b, memos){\n\
  return a.toString() === b.toString()\n\
    // Functions can act as objects\n\
    && types.object(a, b, memos)\n\
    && compare(a.prototype, b.prototype)\n\
}\n\
\n\
// (date, date) -> boolean\n\
types.date = function(a, b){\n\
  return +a === +b\n\
}\n\
\n\
// (regexp, regexp) -> boolean\n\
types.regexp = function(a, b){\n\
  return a.toString() === b.toString()\n\
}\n\
\n\
// (DOMElement, DOMElement) -> boolean\n\
types.element = function(a, b){\n\
  return a.outerHTML === b.outerHTML\n\
}\n\
\n\
// (textnode, textnode) -> boolean\n\
types.textnode = function(a, b){\n\
  return a.textContent === b.textContent\n\
}\n\
\n\
// decorate `fn` to prevent it re-checking objects\n\
// (function) -> function\n\
function memoGaurd(fn){\n\
  return function(a, b, memos){\n\
    if (!memos) return fn(a, b, [])\n\
    var i = memos.length, memo\n\
    while (memo = memos[--i]) {\n\
      if (memo[0] === a && memo[1] === b) return true\n\
    }\n\
    return fn(a, b, memos)\n\
  }\n\
}\n\
\n\
types['arguments'] =\n\
types.array = memoGaurd(compareArrays)\n\
\n\
// (array, array, array) -> boolean\n\
function compareArrays(a, b, memos){\n\
  var i = a.length\n\
  if (i !== b.length) return false\n\
  memos.push([a, b])\n\
  while (i--) {\n\
    if (!compare(a[i], b[i], memos)) return false\n\
  }\n\
  return true\n\
}\n\
\n\
types.object = memoGaurd(compareObjects)\n\
\n\
// (object, object, array) -> boolean\n\
function compareObjects(a, b, memos) {\n\
  var ka = getEnumerableProperties(a)\n\
  var kb = getEnumerableProperties(b)\n\
  var i = ka.length\n\
\n\
  // same number of properties\n\
  if (i !== kb.length) return false\n\
\n\
  // although not necessarily the same order\n\
  ka.sort()\n\
  kb.sort()\n\
\n\
  // cheap key test\n\
  while (i--) if (ka[i] !== kb[i]) return false\n\
\n\
  // remember\n\
  memos.push([a, b])\n\
\n\
  // iterate again this time doing a thorough check\n\
  i = ka.length\n\
  while (i--) {\n\
    var key = ka[i]\n\
    if (!compare(a[key], b[key], memos)) return false\n\
  }\n\
\n\
  return true\n\
}\n\
\n\
// (object) -> array\n\
function getEnumerableProperties (object) {\n\
  var result = []\n\
  for (var k in object) if (k !== 'constructor') {\n\
    result.push(k)\n\
  }\n\
  return result\n\
}\n\
//@ sourceURL=jkroso-equals/index.js"
));
require.register("component-assert/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var stack = require('stack');\n\
var equals = require('equals');\n\
\n\
/**\n\
 * Assert `expr` with optional failure `msg`.\n\
 *\n\
 * @param {Mixed} expr\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
module.exports = exports = function (expr, msg) {\n\
  if (expr) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is weak equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.equal = function (actual, expected, msg) {\n\
  if (actual == expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not weak equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notEqual = function (actual, expected, msg) {\n\
  if (actual != expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is deep equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.deepEqual = function (actual, expected, msg) {\n\
  if (equals(actual, expected)) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not deep equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notDeepEqual = function (actual, expected, msg) {\n\
  if (!equals(actual, expected)) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is strict equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.strictEqual = function (actual, expected, msg) {\n\
  if (actual === expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not strict equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notStrictEqual = function (actual, expected, msg) {\n\
  if (actual !== expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `block` throws an `error`.\n\
 *\n\
 * @param {Function} block\n\
 * @param {Function} [error]\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.throws = function (block, error, msg) {\n\
  var err;\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    err = e;\n\
  }\n\
  if (!err) throw new Error(msg || message());\n\
  if (error && !(err instanceof error)) throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `block` doesn't throw an `error`.\n\
 *\n\
 * @param {Function} block\n\
 * @param {Function} [error]\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.doesNotThrow = function (block, error, msg) {\n\
  var err;\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    err = e;\n\
  }\n\
  if (error && (err instanceof error)) throw new Error(msg || message());\n\
  if (err) throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Create a message from the call stack.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function message() {\n\
  if (!Error.captureStackTrace) return 'assertion failed';\n\
  var callsite = stack()[2];\n\
  var fn = callsite.getFunctionName();\n\
  var file = callsite.getFileName();\n\
  var line = callsite.getLineNumber() - 1;\n\
  var col = callsite.getColumnNumber() - 1;\n\
  var src = getScript(file);\n\
  line = src.split('\\n\
')[line].slice(col);\n\
  var m = line.match(/assert\\((.*)\\)/);\n\
  return m && m[1].trim();\n\
}\n\
\n\
/**\n\
 * Load contents of `script`.\n\
 *\n\
 * @param {String} script\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function getScript(script) {\n\
  var xhr = new XMLHttpRequest;\n\
  xhr.open('GET', script, false);\n\
  xhr.send(null);\n\
  return xhr.responseText;\n\
}\n\
//@ sourceURL=component-assert/index.js"
));
require.register("yields-isArray/index.js", Function("exports, require, module",
"\n\
/**\n\
 * isArray\n\
 */\n\
\n\
var isArray = Array.isArray;\n\
\n\
/**\n\
 * toString\n\
 */\n\
\n\
var str = Object.prototype.toString;\n\
\n\
/**\n\
 * Wether or not the given `val`\n\
 * is an array.\n\
 *\n\
 * example:\n\
 *\n\
 *        isArray([]);\n\
 *        // > true\n\
 *        isArray(arguments);\n\
 *        // > false\n\
 *        isArray('');\n\
 *        // > false\n\
 *\n\
 * @param {mixed} val\n\
 * @return {bool}\n\
 */\n\
\n\
module.exports = isArray || function (val) {\n\
  return !! val && '[object Array]' == str.call(val);\n\
};\n\
//@ sourceURL=yields-isArray/index.js"
));
require.register("matthewmueller-array/index.js", Function("exports, require, module",
"module.exports = require('./lib/array');\n\
//@ sourceURL=matthewmueller-array/index.js"
));
require.register("matthewmueller-array/lib/array.js", Function("exports, require, module",
"/**\n\
 * Module dependencies\n\
 */\n\
\n\
var Enumerable = require('./enumerable');\n\
var proto = Array.prototype;\n\
var isArray = Array.isArray || require('isArray');\n\
\n\
try {\n\
  var Emitter = require('emitter');\n\
} catch(e) {\n\
  var Emitter = require('emitter-component');\n\
}\n\
\n\
/*\n\
 * Expose `array`\n\
 */\n\
\n\
module.exports = array;\n\
\n\
/**\n\
 * Initialize `array`\n\
 *\n\
 * @param {Array|Object|Undefined} arr\n\
 * @return {array}\n\
 * @api public\n\
 */\n\
\n\
function array(arr) {\n\
  if(!(this instanceof array)) return new array(arr);\n\
  arr = arr || [];\n\
\n\
  if (isArray(arr)) {\n\
    // create array-like object\n\
    var len = this.length = arr.length;\n\
    for(var i = 0; i < len; i++) this[i] = arr[i];\n\
  } else if ('object' == typeof arr) {\n\
    if (isObjectLiteral(arr)) {\n\
      arr._ctx = this._ctx = JSON.parse(JSON.stringify(arr));\n\
    }\n\
\n\
    // mixin to another object\n\
    for(var key in array.prototype) arr[key] = array.prototype[key];\n\
    return arr;\n\
  }\n\
}\n\
\n\
/**\n\
 * Mixin `Emitter`\n\
 */\n\
\n\
Emitter(array.prototype);\n\
\n\
/**\n\
 * Mixin `Enumerable`\n\
 */\n\
\n\
Enumerable(array.prototype);\n\
\n\
/**\n\
 * Removes the last element from an array and returns that element\n\
 *\n\
 * @return {Mixed} removed element\n\
 * @api public\n\
 */\n\
\n\
array.prototype.pop = function() {\n\
  var ret = proto.pop.apply(this, arguments);\n\
  this.emit('remove', ret, this.length);\n\
  this.emit('change');\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Push a value onto the end of the array,\n\
 * returning the length of the array\n\
 *\n\
 * @param {Mixed, ...} elements\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
array.prototype.push = function() {\n\
  var ret = proto.push.apply(this, arguments),\n\
      args = [].slice.call(arguments);\n\
  for(var i = 0, len = args.length; i < len; i++) this.emit('add', args[i], ret - len + i);\n\
  this.emit('change');\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Removes the first element from an array and returns that element.\n\
 *\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
array.prototype.shift = function() {\n\
  var ret = proto.shift.apply(this, arguments);\n\
  this.emit('remove', ret, 0);\n\
  this.emit('change');\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Adds and/or removes elements from an array.\n\
 *\n\
 * @param {Number} index\n\
 * @param {Number} howMany\n\
 * @param {Mixed, ...} elements\n\
 * @return {Array} removed elements\n\
 * @api public\n\
 */\n\
\n\
array.prototype.splice = function(index) {\n\
  var ret = proto.splice.apply(this, arguments),\n\
      added = [].slice.call(arguments, 2);\n\
  for(var i = 0, len = ret.length; i < len; i++) this.emit('remove', ret[i], index);\n\
  for(    i = 0, len = added.length; i < len; i++) this.emit('add', added[i], index + i);\n\
  this.emit('change');\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Adds one or more elements to the front of an array\n\
 * and returns the new length of the array.\n\
 *\n\
 * @param {Mixed, ...} elements\n\
 * @return {Number} length\n\
 * @api public\n\
 */\n\
\n\
array.prototype.unshift = function() {\n\
  var ret = proto.unshift.apply(this, arguments),\n\
      args = [].slice.call(arguments);\n\
  for(var i = 0, len = args.length; i < len; i++) this.emit('add', args[i], i);\n\
  this.emit('change');\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Reverses the array, emitting the `reverse` event\n\
 *\n\
 * @api public\n\
 */\n\
\n\
array.prototype.reverse = function () {\n\
  var ret = proto.reverse.apply(this, arguments);\n\
  this.emit('reverse');\n\
  this.emit('change');\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Sort the array, emitting the `sort` event\n\
 *\n\
 * With strings:\n\
 *\n\
 *   fruits.sort('calories')\n\
 *\n\
 * Descending sort:\n\
 *\n\
 *   fruits.sort('calories', 'desc')\n\
 *\n\
 * @param {undefined|Function|String} fn\n\
 * @param {Nunber|String|Boolean} dir\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
var sort = array.prototype.sort;\n\
array.prototype.sort = function () {\n\
  var ret = sort.apply(this, arguments);\n\
  this.emit('sort');\n\
  this.emit('change');\n\
  return ret;\n\
}\n\
\n\
\n\
/**\n\
 * toJSON\n\
 *\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
array.prototype.toJSON = function() {\n\
  return this.map(function(obj) {\n\
    return (obj.toJSON) ? obj.toJSON() : obj;\n\
  }).toArray();\n\
}\n\
\n\
/**\n\
 * Convert the array-like object to an actual array\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
array.prototype.toArray  = function() {\n\
  return proto.slice.call(this);\n\
};\n\
\n\
/**\n\
 * Static: get the array item\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
array.get = function(obj) {\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * Get the array item\n\
 *\n\
 * @param {Number} i\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
array.prototype.get = array.get;\n\
\n\
/**\n\
 * Attach the rest of the array methods\n\
 */\n\
\n\
var methods = ['toString', 'concat', 'join', 'slice'];\n\
\n\
methods.forEach(function(method) {\n\
  array.prototype[method] = function() {\n\
    return proto[method].apply(this, arguments);\n\
  };\n\
});\n\
\n\
/**\n\
 * Remake the array, emptying it, then adding values back in\n\
 *\n\
 * @api private\n\
 */\n\
\n\
array.prototype._remake = function(arr) {\n\
  var construct = this.constructor;\n\
  var clone = (this._ctx) ? new construct(this._ctx) : new construct();\n\
  proto.push.apply(clone, arr);\n\
  clone.get = this.get || array.get;\n\
  return clone;\n\
};\n\
\n\
/**\n\
 * Is object utility\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isObjectLiteral(obj) {\n\
  return obj.constructor == Object;\n\
}\n\
//@ sourceURL=matthewmueller-array/lib/array.js"
));
require.register("matthewmueller-array/lib/enumerable.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var toFunction = require('to-function'),\n\
    proto = Array.prototype,\n\
    enumerable = {};\n\
\n\
/**\n\
 * Mixin to `obj`.\n\
 *\n\
 *    var Enumerable = require('enumerable');\n\
 *    Enumerable(Something.prototype);\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object} obj\n\
 * @api private\n\
 */\n\
\n\
module.exports = function(obj) {\n\
  for(var key in enumerable) obj[key] = enumerable[key];\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * Iterate each value and invoke `fn(val, i)`.\n\
 *\n\
 *    users.each(function(val, i){\n\
 *\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
enumerable.forEach =\n\
enumerable.each = function(fn){\n\
  var arr = this,\n\
      len = arr.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    fn(arr[i], i);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map each return value from `fn(val, i)`.\n\
 *\n\
 * Passing a callback function:\n\
 *\n\
 *    users.map(function(user){\n\
 *      return user.name.first\n\
 *    })\n\
 *\n\
 * Passing a property string:\n\
 *\n\
 *    users.map('name.first')\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
enumerable.map = function(fn){\n\
  fn = toFunction(fn);\n\
  var out = [],\n\
      arr = this,\n\
      len = arr.length;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    out.push(fn(arr.get(arr[i]), i));\n\
  }\n\
\n\
  return this._remake(out);\n\
};\n\
\n\
/**\n\
 * Select all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 *    users.select(function(user){\n\
 *      return user.age > 20\n\
 *    })\n\
 *\n\
 *  With a property:\n\
 *\n\
 *    items.select('complete')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
enumerable.filter =\n\
enumerable.select = function(fn){\n\
  fn = toFunction(fn);\n\
  var out = [],\n\
      arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = arr.get(arr[i]);\n\
    if (fn(val, i)) out.push(arr[i]);\n\
  }\n\
\n\
  return this._remake(out);\n\
};\n\
\n\
/**\n\
 * Select all unique values.\n\
 *\n\
 *    nums.unique()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
enumerable.unique = function(fn){\n\
  var out = [],\n\
      vals = [],\n\
      arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  fn = (fn) ? toFunction(fn) : function(o) { return o; };\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = fn(arr.get(arr[i]));\n\
    if (~vals.indexOf(val)) continue;\n\
    vals.push(val);\n\
    out.push(arr[i]);\n\
  }\n\
\n\
  return this._remake(out);\n\
};\n\
\n\
/**\n\
 * Reject all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 * Rejecting using a callback:\n\
 *\n\
 *    users.reject(function(user){\n\
 *      return user.age < 20\n\
 *    })\n\
 *\n\
 * Rejecting with a property:\n\
 *\n\
 *    items.reject('complete')\n\
 *\n\
 * Rejecting values via `==`:\n\
 *\n\
 *    data.reject(null)\n\
 *    users.reject(tobi)\n\
 *\n\
 * @param {Function|String|Mixed} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
enumerable.reject = function(fn){\n\
  var out = [],\n\
      arr = this,\n\
      len = arr.length,\n\
      val, i;\n\
\n\
  if ('string' == typeof fn) fn = toFunction(fn);\n\
  if (fn) {\n\
    for (i = 0; i < len; ++i) {\n\
      val = arr.get(arr[i]);\n\
      if (!fn(val, i)) out.push(arr[i]);\n\
    }\n\
  } else {\n\
    for (i = 0; i < len; ++i) {\n\
      val = arr.get(arr[i]);\n\
      if (val != fn) out.push(arr[i]);\n\
    }\n\
  }\n\
\n\
  return this._remake(out);\n\
};\n\
\n\
/**\n\
 * Reject `null` and `undefined`.\n\
 *\n\
 *    [1, null, 5, undefined].compact()\n\
 *    // => [1,5]\n\
 *\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
\n\
enumerable.compact = function(){\n\
  return this.reject(null);\n\
};\n\
\n\
/**\n\
 * Return the first value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.find(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * With a property string:\n\
 *\n\
 *    users.find('age > 20')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
enumerable.find = function(fn){\n\
  fn = toFunction(fn);\n\
  var arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = arr.get(arr[i]);\n\
    if (fn(val, i)) return arr[i];\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the last value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.findLast(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
enumerable.findLast = function (fn) {\n\
    fn = toFunction(fn);\n\
  var arr = this,\n\
  i = arr.length;\n\
\n\
  while(i--) if (fn(arr.get(arr[i]), i)) return arr[i];\n\
};\n\
\n\
/**\n\
 * Assert that all invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that all pets are ferrets:\n\
 *\n\
 *    pets.all(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 *    users.all('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
enumerable.every = function(fn){\n\
  fn = toFunction(fn);\n\
  var arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = arr.get(arr[i]);\n\
    if (!fn(val, i)) return false;\n\
  }\n\
\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that none of the invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that no pets are admins:\n\
 *\n\
 *    pets.none(function(p){ return p.admin })\n\
 *    pets.none('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
enumerable.none = function(fn){\n\
  fn = toFunction(fn);\n\
  var arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = arr.get(arr[i]);\n\
    if (fn(val, i)) return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that at least one invocation of `fn(val, i)` is truthy.\n\
 *\n\
 * For example checking to see if any pets are ferrets:\n\
 *\n\
 *    pets.any(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
enumerable.any = function(fn){\n\
  fn = toFunction(fn);\n\
  var arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = arr.get(arr[i]);\n\
    if (fn(val, i)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Count the number of times `fn(val, i)` returns true.\n\
 *\n\
 *    var n = pets.count(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
enumerable.count = function(fn){\n\
  fn = toFunction(fn);\n\
  var n = 0,\n\
      arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  if(!fn) return len;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = arr.get(arr[i]);\n\
    if (fn(val, i)) ++n;\n\
  }\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the indexof `obj` or return `-1`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
enumerable.indexOf = function(obj) {\n\
  var arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    val = arr.get(arr[i]);\n\
    if (val === obj) return i;\n\
  }\n\
\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Determine the last indexof `obj` or return `-1`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
enumerable.lastIndexOf = function(obj) {\n\
  var arr = this,\n\
      len = arr.length,\n\
      val;\n\
\n\
  for (var i = --len; i >= 0; --i) {\n\
    val = arr.get(arr[i]);\n\
    if (val === obj) return i;\n\
  }\n\
\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Check if `obj` is present in this enumerable.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
enumerable.has = function(obj) {\n\
  return !! ~this.indexOf(obj);\n\
};\n\
\n\
/**\n\
 * Reduce with `fn(accumulator, val, i)` using\n\
 * optional `init` value defaulting to the first\n\
 * enumerable value.\n\
 *\n\
 * @param {Function} fn\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
enumerable.reduce = function(fn, init){\n\
  var arr = this,\n\
      len = arr.length,\n\
      i = 0,\n\
      val;\n\
\n\
  val = null == init\n\
    ? arr.get(i++)\n\
    : init;\n\
\n\
  for (; i < len; ++i) {\n\
    val = fn(val, arr.get(arr[i]), i);\n\
  }\n\
\n\
  return val;\n\
};\n\
\n\
\n\
/**\n\
 * Determine the max value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.max(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.max('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.max()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
enumerable.max = function(fn){\n\
  var arr = this,\n\
      len = arr.length,\n\
      max = -Infinity,\n\
      n = 0,\n\
      val, i;\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (i = 0; i < len; ++i) {\n\
      n = fn(arr.get(arr[i]), i);\n\
      max = n > max ? n : max;\n\
    }\n\
  } else {\n\
    for (i = 0; i < len; ++i) {\n\
      n = arr.get(arr[i]);\n\
      max = n > max ? n : max;\n\
    }\n\
  }\n\
\n\
  return max;\n\
};\n\
\n\
/**\n\
 * Determine the min value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.min(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.min('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.min()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
enumerable.min = function(fn){\n\
  var arr = this,\n\
      len = arr.length,\n\
      min = Infinity,\n\
      n = 0,\n\
      val, i;\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (i = 0; i < len; ++i) {\n\
      n = fn(arr.get(arr[i]), i);\n\
      min = n < min ? n : min;\n\
    }\n\
  } else {\n\
    for (i = 0; i < len; ++i) {\n\
      n = arr.get(arr[i]);\n\
      min = n < min ? n : min;\n\
    }\n\
  }\n\
\n\
  return min;\n\
};\n\
\n\
/**\n\
 * Determine the sum.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.sum(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.sum('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.sum()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
enumerable.sum = function(fn){\n\
  var arr = this,\n\
      len = arr.length,\n\
      n = 0,\n\
      val, i;\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (i = 0; i < len; ++i) {\n\
      n += fn(arr.get(arr[i]), i);\n\
    }\n\
  } else {\n\
    for (i = 0; i < len; ++i) {\n\
      n += arr.get(arr[i]);\n\
    }\n\
  }\n\
\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the average value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.avg(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.avg('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.avg()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
enumerable.avg =\n\
enumerable.mean = function(fn){\n\
  var arr = this,\n\
      len = arr.length,\n\
      n = 0,\n\
      val, i;\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (i = 0; i < len; ++i) {\n\
      n += fn(arr.get(arr[i]), i);\n\
    }\n\
  } else {\n\
    for (i = 0; i < len; ++i) {\n\
      n += arr.get(arr[i]);\n\
    }\n\
  }\n\
\n\
  return n / len;\n\
};\n\
\n\
/**\n\
 * Return the first value, or first `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
enumerable.first = function(n) {\n\
  var arr = this;\n\
\n\
  if(!n) return arr[0];\n\
  else if ('number' !== typeof n) return this.find(n);\n\
\n\
  var len = Math.min(n, arr.length),\n\
      out = new Array(len);\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    out[i] = arr[i];\n\
  }\n\
\n\
  return out;\n\
\n\
};\n\
\n\
/**\n\
 * Return the last value, or last `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
enumerable.last = function(n){\n\
  var arr = this,\n\
      len = arr.length;\n\
\n\
  if(!n) return arr[len - 1];\n\
  else if ('number' !== typeof n) return this.findLast(n);\n\
\n\
  var i = Math.max(0, len - n),\n\
      out = [];\n\
\n\
  for (; i < len; ++i) {\n\
    out.push(arr[i]);\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Create a hash from a given `key`\n\
 *\n\
 * @param {String} key\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
enumerable.hash = function(str) {\n\
  var arr = this,\n\
      len = arr.length,\n\
      out = {},\n\
      key;\n\
\n\
  for (var i = 0, len = arr.length; i < len; i++) {\n\
    key = arr.get(arr[i])[str];\n\
    // TODO: assess, maybe we want out[i] = arr.get(i)\n\
    if(!key) continue;\n\
    out[key] = arr[i];\n\
  };\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Sort the array.\n\
 *\n\
 * With strings:\n\
 *\n\
 *   fruits.sort('calories')\n\
 *\n\
 * Descending sort:\n\
 *\n\
 *   fruits.sort('calories', 'desc')\n\
 *\n\
 * @param {undefined|Function|String} fn\n\
 * @param {Nunber|String|Boolean} dir\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
enumerable.sort = function(fn, dir) {\n\
  dir = (dir !== undefined) ? dir : 1;\n\
  var sort = proto.sort;\n\
  if(!fn) return sort.apply(this);\n\
  else if('function' == typeof fn) return sort.apply(this, arguments);\n\
\n\
  var self = this;\n\
  fn = toFunction(fn);\n\
\n\
  // support ascending and descending directions\n\
  if('string' == typeof dir) {\n\
    if(/asc/.test(dir)) dir = 1;\n\
    else if(/des/.test(dir)) dir = -1;\n\
  } else if('boolean' == typeof dir) {\n\
    dir = (dir) ? 1 : -1;\n\
  }\n\
\n\
  function compare(a, b) {\n\
    a = fn(self.get(a)), b = fn(self.get(b));\n\
    if(a < b) return -(dir);\n\
    else if(a > b) return dir;\n\
    return 0\n\
  };\n\
\n\
  return sort.call(this, compare);\n\
};\n\
//@ sourceURL=matthewmueller-array/lib/enumerable.js"
));
require.register("component-clone/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var type;\n\
\n\
try {\n\
  type = require('type');\n\
} catch(e){\n\
  type = require('type-component');\n\
}\n\
\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
module.exports = clone;\n\
\n\
/**\n\
 * Clones objects.\n\
 *\n\
 * @param {Mixed} any object\n\
 * @api public\n\
 */\n\
\n\
function clone(obj){\n\
  switch (type(obj)) {\n\
    case 'object':\n\
      var copy = {};\n\
      for (var key in obj) {\n\
        if (obj.hasOwnProperty(key)) {\n\
          copy[key] = clone(obj[key]);\n\
        }\n\
      }\n\
      return copy;\n\
\n\
    case 'array':\n\
      var copy = new Array(obj.length);\n\
      for (var i = 0, l = obj.length; i < l; i++) {\n\
        copy[i] = clone(obj[i]);\n\
      }\n\
      return copy;\n\
\n\
    case 'regexp':\n\
      // from millermedeiros/amd-utils - MIT\n\
      var flags = '';\n\
      flags += obj.multiline ? 'm' : '';\n\
      flags += obj.global ? 'g' : '';\n\
      flags += obj.ignoreCase ? 'i' : '';\n\
      return new RegExp(obj.source, flags);\n\
\n\
    case 'date':\n\
      return new Date(obj.getTime());\n\
\n\
    default: // string, number, boolean, …\n\
      return obj;\n\
  }\n\
}\n\
//@ sourceURL=component-clone/index.js"
));
require.register("reactive/lib/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var query = require('query');\n\
var domify = require('domify');\n\
var debug = require('debug')('reactive');\n\
\n\
var Adapter = require('./adapter');\n\
var AttrBinding = require('./attr-binding');\n\
var TextBinding = require('./text-binding');\n\
var bindings = require('./bindings');\n\
var Binding = require('./binding');\n\
var utils = require('./utils');\n\
var walk = require('./walk');\n\
\n\
/**\n\
 * Expose `Reactive`.\n\
 */\n\
\n\
exports = module.exports = Reactive;\n\
\n\
/**\n\
 * Initialize a reactive template for `el` and `obj`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Element} obj\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Reactive(el, model, opt) {\n\
  if (!(this instanceof Reactive)) return new Reactive(el, model, opt);\n\
  opt = opt || {};\n\
\n\
  if (typeof el === 'string') {\n\
    el = domify(el);\n\
  }\n\
\n\
  var self = this;\n\
  self.opt = opt || {};\n\
  self.model = model || {};\n\
  self.adapter = (opt.adapter || Adapter)(self.model);\n\
  self.el = el;\n\
  self.view = opt.delegate || Object.create(null);\n\
\n\
  self.bindings = opt.bindings || Object.create(null);\n\
\n\
  // TODO undo this crap and just export bindings regularly\n\
  // not that binding order matters!!\n\
  bindings({\n\
    bind: function(name, fn) {\n\
      self.bindings[name] = fn;\n\
    }\n\
  });\n\
\n\
  self._bind(this.el, []);\n\
}\n\
\n\
Emitter(Reactive.prototype);\n\
\n\
/**\n\
 * Subscribe to changes on `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.sub = function(prop, fn){\n\
  var self = this;\n\
\n\
  debug('subscribe %s', prop);\n\
\n\
  // if we have parts, we need to subscribe to the parent as well\n\
  // TODO (defunctzombie) multiple levels of properties\n\
  var parts = prop.split('.');\n\
  if (parts.length > 1) {\n\
    self.sub(parts[0], fn);\n\
  }\n\
\n\
  // for when reactive changes the property\n\
  this.on('change ' + prop, fn);\n\
\n\
  // for when the property changed within the adapter\n\
  this.adapter.subscribe(prop, function() {\n\
    // skip items set internally from calling function twice\n\
    if (self._internal_set) return;\n\
\n\
    fn.apply(this, arguments);\n\
  });\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unsubscribe to changes from `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.unsub = function(prop, fn){\n\
  this.off('change ' + prop, fn);\n\
  this.adapter.unsubscribe(prop, fn);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.get = function(prop) {\n\
  if (prop === 'this') {\n\
    return this.model;\n\
  }\n\
\n\
  // model takes precedence\n\
  var modelVal = this.adapter.get(prop);\n\
  if (modelVal) {\n\
    return modelVal;\n\
  }\n\
\n\
  var view = this.view;\n\
  var viewVal = view[prop];\n\
  if ('function' == typeof viewVal) {\n\
    return viewVal.call(view);\n\
  }\n\
  else if (viewVal) {\n\
    return viewVal;\n\
  }\n\
\n\
  return undefined;\n\
};\n\
\n\
/**\n\
 * Set a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.set = function(prop, val) {\n\
  var self = this;\n\
  // internal set flag lets reactive updates know to avoid triggering\n\
  // updates for the Adapter#set call\n\
  // we will already trigger updates with the change event\n\
  self._internal_set = true;\n\
  if( \"object\" == typeof prop) {\n\
    Object.keys(prop).forEach(function(name){\n\
      self.set(name, prop[name]);\n\
    });\n\
  }\n\
  else {\n\
    self.adapter.set(prop, val);\n\
    self.emit('change ' + prop, val);\n\
  }\n\
  self._internal_set = false;\n\
  return self;\n\
};\n\
\n\
/**\n\
 * Traverse and bind all interpolation within attributes and text.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.bindInterpolation = function(el, els){\n\
\n\
  // element\n\
  if (el.nodeType == 1) {\n\
    for (var i = 0; i < el.attributes.length; i++) {\n\
      var attr = el.attributes[i];\n\
      if (utils.hasInterpolation(attr.value)) {\n\
        new AttrBinding(this, el, attr);\n\
      }\n\
    }\n\
  }\n\
\n\
  // text node\n\
  if (el.nodeType == 3) {\n\
    if (utils.hasInterpolation(el.data)) {\n\
      debug('bind text \"%s\"', el.data);\n\
      new TextBinding(this, el);\n\
    }\n\
  }\n\
\n\
  // walk nodes\n\
  for (var i = 0; i < el.childNodes.length; i++) {\n\
    var node = el.childNodes[i];\n\
    this.bindInterpolation(node, els);\n\
  }\n\
};\n\
\n\
Reactive.prototype._bind = function() {\n\
  var self = this;\n\
\n\
  var bindings = self.bindings;\n\
\n\
  walk(self.el, function(el, next) {\n\
    // element\n\
    if (el.nodeType == 1) {\n\
      var skip = false;\n\
\n\
      var attrs = {};\n\
      for (var i = 0; i < el.attributes.length; ++i) {\n\
        var attr = el.attributes[i];\n\
        var name = attr.name;\n\
        attrs[name] = attr;\n\
      }\n\
\n\
      // bindings must be iterated first\n\
      // to see if any request skipping\n\
      // only then can we see about attributes\n\
      Object.keys(bindings).forEach(function(name) {\n\
        if (!attrs[name] || skip) {\n\
          return;\n\
        }\n\
\n\
        debug('bind [%s]', name);\n\
\n\
        var prop = attrs[name].value;\n\
        var binding_fn = bindings[name];\n\
        if (!binding_fn) {\n\
          return;\n\
        }\n\
\n\
        var binding = new Binding(name, self, el, binding_fn);\n\
        binding.bind();\n\
        if (binding.skip) {\n\
          skip = true;\n\
        }\n\
      });\n\
\n\
      if (skip) {\n\
        return next(skip);\n\
      }\n\
\n\
      // if we are not skipping\n\
      // bind any interpolation attrs\n\
      for (var i = 0; i < el.attributes.length; ++i) {\n\
        var attr = el.attributes[i];\n\
        var name = attr.name;\n\
        if (utils.hasInterpolation(attr.value)) {\n\
          new AttrBinding(self, el, attr);\n\
        }\n\
      }\n\
\n\
      return next(skip);\n\
    }\n\
    // text\n\
    else if (el.nodeType == 3) {\n\
      if (utils.hasInterpolation(el.data)) {\n\
        debug('bind text \"%s\"', el.data);\n\
        new TextBinding(self, el);\n\
      }\n\
    }\n\
\n\
    next();\n\
  });\n\
};\n\
\n\
/**\n\
 * Bind `name` to `fn`.\n\
 *\n\
 * @param {String|Object} name or object\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Reactive.prototype.bind = function(name, fn) {\n\
  var self = this;\n\
  if ('object' == typeof name) {\n\
    for (var key in name) {\n\
      this.bind(key, name[key]);\n\
    }\n\
    return;\n\
  }\n\
\n\
  var els = query.all('[' + name + ']', this.el);\n\
  if (this.el.hasAttribute && this.el.hasAttribute(name)) {\n\
    els = [].slice.call(els);\n\
    els.unshift(this.el);\n\
  }\n\
  if (!els.length) return;\n\
\n\
  debug('bind [%s] (%d elements)', name, els.length);\n\
  for (var i = 0; i < els.length; i++) {\n\
    var binding = new Binding(name, this, els[i], fn);\n\
    binding.bind();\n\
  }\n\
};\n\
\n\
/**\n\
 * Destroy the binding\n\
 * - Removes the element from the dom (if inserted)\n\
 * - unbinds any event listeners\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Reactive.prototype.destroy = function() {\n\
  var self = this;\n\
\n\
  if (self.el.parentNode) {\n\
    self.el.parentNode.removeChild(self.el);\n\
  }\n\
\n\
  self.adapter.unsubscribeAll();\n\
  self.emit('destroyed');\n\
  self.removeAllListeners();\n\
};\n\
\n\
/**\n\
 * Use middleware\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Reactive.prototype.use = function(fn) {\n\
  fn(this);\n\
  return this;\n\
};\n\
//@ sourceURL=reactive/lib/index.js"
));
require.register("reactive/lib/utils.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:utils');\n\
//var props = require('props');\n\
\n\
/**\n\
 * Function cache.\n\
 */\n\
\n\
var cache = {};\n\
\n\
/**\n\
 * Return possible properties of a string\n\
 * @param {String} str\n\
 * @return {Array} of properties found in the string\n\
 * @api private\n\
 */\n\
var props = function(str) {\n\
  return str\n\
    .replace(/\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .match(/[a-zA-Z_]\\w*([.][a-zA-Z_]\\w*)*/g)\n\
    || [];\n\
};\n\
/**\n\
 * Return interpolation property names in `str`,\n\
 * for example \"{foo} and {bar}\" would return\n\
 * ['foo', 'bar'].\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolationProps = function(str) {\n\
  var m;\n\
  var arr = [];\n\
  var re = /\\{([^}]+)\\}/g;\n\
\n\
  while (m = re.exec(str)) {\n\
    var expr = m[1];\n\
    arr = arr.concat(props(expr));\n\
  }\n\
\n\
  return unique(arr);\n\
};\n\
\n\
/**\n\
 * Interpolate `str` with the given `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolate = function(str, fn){\n\
  return str.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    var cb = cache[expr];\n\
    if (!cb) cb = cache[expr] = compile(expr);\n\
    var val = fn(expr.trim(), cb);\n\
    return val == null ? '' : val;\n\
  });\n\
};\n\
\n\
/**\n\
 * Check if `str` has interpolation.\n\
 *\n\
 * @param {String} str\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
exports.hasInterpolation = function(str) {\n\
  return ~str.indexOf('{');\n\
};\n\
\n\
/**\n\
 * Compile `expr` to a `Function`.\n\
 *\n\
 * @param {String} expr\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function compile(expr) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*(\\.[a-zA-Z_]\\w*)*/g;\n\
  var p = props(expr);\n\
\n\
  // replace function calls with [ ] syntax to avoid capture as property\n\
  var funCallRe = /.\\w+ *\\(/g;\n\
  var body = expr.replace(funCallRe, function(_) {\n\
    return '[\\'' + _.slice(1, -1) + '\\'](';\n\
  });\n\
\n\
  var body = body.replace(re, function(_) {\n\
    if (p.indexOf(_) >= 0) {\n\
      return access(_);\n\
    };\n\
\n\
    return _;\n\
  });\n\
\n\
  debug('compile `%s`', body);\n\
  return new Function('reactive', 'return ' + body);\n\
}\n\
\n\
/**\n\
 * Access a method `prop` with dot notation.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function access(prop) {\n\
  return 'reactive.get(\\'' + prop + '\\')';\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=reactive/lib/utils.js"
));
require.register("reactive/lib/text-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:text-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `TextBinding`.\n\
 */\n\
\n\
module.exports = TextBinding;\n\
\n\
/**\n\
 * Initialize a new text binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function TextBinding(reactive, node) {\n\
  this.reactive = reactive;\n\
  this.text = node.data;\n\
  this.node = node;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
TextBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var reactive = this.reactive;\n\
  this.props.forEach(function(prop){\n\
    reactive.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render text.\n\
 */\n\
\n\
TextBinding.prototype.render = function(){\n\
  var node = this.node;\n\
  var text = this.text;\n\
  var reactive = this.reactive;\n\
  var model = reactive.model;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render \"%s\"', text);\n\
  node.data = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(reactive);\n\
    } else {\n\
      return reactive.get(prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=reactive/lib/text-binding.js"
));
require.register("reactive/lib/attr-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:attr-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `AttrBinding`.\n\
 */\n\
\n\
module.exports = AttrBinding;\n\
\n\
/**\n\
 * Initialize a new attribute binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function AttrBinding(reactive, node, attr) {\n\
  var self = this;\n\
  this.reactive = reactive;\n\
  this.node = node;\n\
  this.attr = attr;\n\
  this.text = attr.value;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
AttrBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var reactive = this.reactive;\n\
  this.props.forEach(function(prop){\n\
    reactive.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render the value.\n\
 */\n\
\n\
AttrBinding.prototype.render = function(){\n\
  var attr = this.attr;\n\
  var text = this.text;\n\
  var reactive = this.reactive;\n\
  var model = reactive.model;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render %s \"%s\"', attr.name, text);\n\
  attr.value = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(reactive);\n\
    } else {\n\
      return reactive.get(prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=reactive/lib/attr-binding.js"
));
require.register("reactive/lib/binding.js", Function("exports, require, module",
"var hasInterpolation = require('./utils').hasInterpolation;\n\
var interpolationProps = require('./utils').interpolationProps;\n\
\n\
/**\n\
 * Expose `Binding`.\n\
 */\n\
\n\
module.exports = Binding;\n\
\n\
/**\n\
 * Initialize a binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function Binding(name, reactive, el, fn) {\n\
  this.name = name;\n\
  this.reactive = reactive;\n\
  this.model = reactive.model;\n\
  this.view = reactive.view;\n\
  this.el = el;\n\
  this.fn = fn;\n\
}\n\
\n\
/**\n\
 * Apply the binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bind = function() {\n\
  var val = this.el.getAttribute(this.name);\n\
  this.fn(this.el, val, this.model);\n\
};\n\
\n\
/**\n\
 * Perform interpolation on `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.interpolate = function(name) {\n\
  var self = this;\n\
\n\
  if (~name.indexOf('{')) {\n\
    return name.replace(/{([^}]+)}/g, function(_, name){\n\
      return self.value(name);\n\
    });\n\
  }\n\
\n\
  return self.value(name);\n\
};\n\
\n\
/**\n\
 * Return value for property `name`.\n\
 *\n\
 *  - check if the \"view\" has a `name` method\n\
 *  - check if the \"model\" has a `name` method\n\
 *  - check if the \"model\" has a `name` property\n\
 *\n\
 * @param {String} name\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.value = function(name) {\n\
  return this.reactive.get(name);\n\
};\n\
\n\
/**\n\
 * Invoke `fn` on changes.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.change = function(fn) {\n\
  fn.call(this);\n\
\n\
  var self = this;\n\
  var reactive = this.reactive;\n\
  var val = this.el.getAttribute(this.name);\n\
\n\
  // interpolation\n\
  if (hasInterpolation(val)) {\n\
    var props = interpolationProps(val);\n\
    props.forEach(function(prop){\n\
      reactive.sub(prop, fn.bind(self));\n\
    });\n\
    return;\n\
  }\n\
\n\
  // bind to prop\n\
  var prop = val;\n\
  reactive.sub(prop, fn.bind(this));\n\
};\n\
//@ sourceURL=reactive/lib/binding.js"
));
require.register("reactive/lib/bindings.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var carry = require('carry');\n\
var classes = require('classes');\n\
var event = require('event');\n\
\n\
var each_binding = require('./each');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'class',\n\
  'style',\n\
  'width',\n\
  'value',\n\
  'height',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Events supported.\n\
 */\n\
\n\
var events = [\n\
  'change',\n\
  'click',\n\
  'dblclick',\n\
  'mousedown',\n\
  'mouseup',\n\
  'mouseenter',\n\
  'mouseleave',\n\
  'scroll',\n\
  'blur',\n\
  'focus',\n\
  'input',\n\
  'submit',\n\
  'keydown',\n\
  'keypress',\n\
  'keyup'\n\
];\n\
\n\
/**\n\
 * Apply bindings.\n\
 */\n\
\n\
module.exports = function(reactive){\n\
\n\
  reactive.bind('each', each_binding);\n\
\n\
  /**\n\
   * Generate attribute bindings.\n\
   */\n\
\n\
  attrs.forEach(function(attr){\n\
    reactive.bind('data-' + attr, function(el, name, obj){\n\
      this.change(function(){\n\
        el.setAttribute(attr, this.interpolate(name));\n\
      });\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Show binding.\n\
   */\n\
\n\
  reactive.bind('data-visible', function(el, name){\n\
    this.change(function(){\n\
      var val = this.value(name);\n\
      if (val) {\n\
        classes(el).add('visible').remove('hidden');\n\
      } else {\n\
        classes(el).remove('visible').add('hidden');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Hide binding.\n\
   */\n\
\n\
  reactive.bind('data-hidden', function(el, name){\n\
    this.change(function(){\n\
      var val = this.value(name);\n\
      if (val) {\n\
        classes(el).remove('visible').add('hidden');\n\
      } else {\n\
        classes(el).add('visible').remove('hidden');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Checked binding.\n\
   */\n\
\n\
  reactive.bind('data-checked', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        el.setAttribute('checked', 'checked');\n\
      } else {\n\
        el.removeAttribute('checked');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Text binding.\n\
   */\n\
\n\
  reactive.bind('data-text', function(el, name){\n\
    this.change(function(){\n\
      el.textContent = this.interpolate(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * HTML binding.\n\
   */\n\
\n\
  reactive.bind('data-html', function(el, name){\n\
    this.change(function(){\n\
      el.innerHTML = this.interpolate(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Generate event bindings.\n\
   */\n\
\n\
  events.forEach(function(name){\n\
    reactive.bind('on-' + name, function(el, method){\n\
      var self = this;\n\
      var view = self.reactive.view;\n\
      event.bind(el, name, function(e){\n\
        e.preventDefault();\n\
\n\
        var fn = view[method];\n\
        if (!fn) throw new Error('method .' + method + '() missing');\n\
        fn.call(view, e, self.reactive);\n\
      });\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Append child element.\n\
   */\n\
\n\
  reactive.bind('data-append', function(el, name){\n\
    var other = this.value(name);\n\
    el.appendChild(other);\n\
  });\n\
\n\
  /**\n\
   * Replace element, carrying over its attributes.\n\
   */\n\
\n\
  reactive.bind('data-replace', function(el, name){\n\
    var other = carry(this.value(name), el);\n\
    el.parentNode.replaceChild(other, el);\n\
  });\n\
};\n\
//@ sourceURL=reactive/lib/bindings.js"
));
require.register("reactive/lib/adapter.js", Function("exports, require, module",
"\n\
function Adapter(obj) {\n\
  if (!(this instanceof Adapter)) {\n\
    return new Adapter(obj);\n\
  }\n\
\n\
  var self = this;\n\
  self.obj = obj;\n\
}\n\
\n\
/**\n\
 * Default subscription method.\n\
 * Subscribe to changes on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 */\n\
\n\
Adapter.prototype.subscribe = function(prop, fn) {\n\
  var model = this.obj;\n\
  if (typeof model.on == 'function') {\n\
    model.on('change ' + prop, fn);\n\
  }\n\
};\n\
\n\
/**\n\
 * Default unsubscription method.\n\
 * Unsubscribe from changes on the model.\n\
 */\n\
\n\
Adapter.prototype.unsubscribe = function(prop, fn) {\n\
  var model = this.obj;\n\
  if (typeof model.off == 'function') {\n\
    model.off('change ' + prop, fn);\n\
  }\n\
};\n\
\n\
/**\n\
 * Remove all subscriptions on this adapter\n\
 */\n\
\n\
Adapter.prototype.unsubscribeAll = function() {\n\
  var model = this.obj;\n\
  if (typeof model.off == 'function') {\n\
    model.off();\n\
  }\n\
};\n\
\n\
/**\n\
 * Default setter method.\n\
 * Set a property on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 */\n\
\n\
Adapter.prototype.set = function(prop, val) {\n\
  var obj = this.obj;\n\
  if (!obj) return;\n\
  if ('function' == typeof obj[prop]) {\n\
    obj[prop](val);\n\
  }\n\
  else if ('function' == typeof obj.set) {\n\
    obj.set(prop, val);\n\
  }\n\
  else {\n\
    obj[prop] = val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Default getter method.\n\
 * Get a property from the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @return {Mixed}\n\
 */\n\
\n\
Adapter.prototype.get = function(prop) {\n\
  var obj = this.obj;\n\
  if (!obj) {\n\
    return undefined;\n\
  }\n\
\n\
  // split property on '.' access\n\
  // and dig into the object\n\
  var parts = prop.split('.');\n\
  var part = parts.shift();\n\
  do {\n\
    if (typeof obj[part] === 'function') {\n\
      obj = obj[part].call(obj);\n\
    }\n\
    else {\n\
      obj = obj[part];\n\
    }\n\
\n\
    if (!obj) {\n\
      return undefined;\n\
    }\n\
\n\
    part = parts.shift();\n\
  } while(part);\n\
\n\
  return obj;\n\
};\n\
\n\
module.exports = Adapter;\n\
//@ sourceURL=reactive/lib/adapter.js"
));
require.register("reactive/lib/each.js", Function("exports, require, module",
"// 'each' binding\n\
module.exports = function(el, val) {\n\
    var self = this;\n\
\n\
    // get the reactive constructor from the current reactive instance\n\
    // TODO(shtylman) port over adapter and bindings from instance?\n\
    var Reactive = self.reactive.constructor;\n\
\n\
    var val = val.split(/ +/);\n\
    el.removeAttribute('each');\n\
\n\
    var name = val[0];\n\
    var prop = val[0];\n\
\n\
    if (val.length > 1) {\n\
        name = val[0];\n\
        prop = val[2];\n\
    }\n\
\n\
    var parent = el.parentNode;\n\
\n\
    // use text node to hold where end of list should be\n\
    var placeholder = document.createTextNode('');\n\
    parent.insertBefore(placeholder, el);\n\
    parent.removeChild(el);\n\
\n\
    // the reactive views we created for our array\n\
    // one per array item\n\
    // the length of this MUST always match the length of the 'arr'\n\
    // and mutates with 'arr'\n\
    var views = [];\n\
\n\
    function childView(el, model) {\n\
        return Reactive(el, model, {\n\
            delegate: self.view,\n\
            adapter: self.reactive.opt.adapter,\n\
            bindings: self.reactive.bindings\n\
        });\n\
    }\n\
\n\
    var array;\n\
\n\
    // bind entire new array\n\
    function change(arr) {\n\
\n\
        // remove any old bindings/views\n\
        views.forEach(function(view) {\n\
            view.destroy();\n\
        });\n\
        views = [];\n\
\n\
        // remove any old array observers\n\
        if (array) {\n\
            unpatchArray(array);\n\
        }\n\
        patchArray(arr);\n\
        array = arr;\n\
\n\
        // handle initial array\n\
        var fragment = document.createDocumentFragment();\n\
        arr.forEach(function(obj) {\n\
            var clone = el.cloneNode(true);\n\
            var view = childView(clone, obj);\n\
            views.push(view);\n\
            fragment.appendChild(clone);\n\
        });\n\
        parent.insertBefore(fragment, placeholder);\n\
    }\n\
\n\
    function unpatchArray(arr) {\n\
        delete arr.splice;\n\
        delete arr.push;\n\
        delete arr.unshift;\n\
    }\n\
\n\
    function patchArray(arr) {\n\
        // splice will replace the current arr.splice function\n\
        // so that we can intercept modifications\n\
        var old_splice = arr.splice;\n\
        // idx -> index to start operation\n\
        // how many -> elements to remove\n\
        // ... elements to insert\n\
        // return removed elements\n\
        var splice = function(idx, how_many) {\n\
            var args = Array.prototype.slice.apply(arguments);\n\
\n\
            // new items to insert if any\n\
            var new_items = args.slice(2);\n\
\n\
            var place = placeholder;\n\
            if (idx < views.length) {\n\
                place = views[idx].el;\n\
            }\n\
\n\
            // make views for these items\n\
            var new_views = new_items.map(function(item) {\n\
                var clone = el.cloneNode(true);\n\
                return childView(clone, item);\n\
            });\n\
\n\
            var splice_args = [idx, how_many].concat(new_views);\n\
\n\
            var removed = views.splice.apply(views, splice_args);\n\
\n\
            var frag = document.createDocumentFragment();\n\
            // insert into appropriate place\n\
            // first removed item is where to insert\n\
            new_views.forEach(function(view) {\n\
                frag.appendChild(view.el);\n\
            });\n\
\n\
            // insert before a specific location\n\
            // the location is defined by the element at idx\n\
            parent.insertBefore(frag, place);\n\
\n\
            // remove after since we may need the element for 'placement'\n\
            // of the new document fragment\n\
            removed.forEach(function(view) {\n\
                view.destroy();\n\
            });\n\
\n\
            var ret = old_splice.apply(arr, args);\n\
\n\
            // set the length property of the array\n\
            // so that any listeners can pick up on it\n\
            self.reactive.set(prop + '.length', arr.length);\n\
            return ret;\n\
        };\n\
\n\
        /// existing methods can be implemented via splice\n\
\n\
        var push = function(el1, el2) {\n\
            var args = Array.prototype.slice.apply(arguments);\n\
            var len = arr.length;\n\
\n\
            var splice_args = [len, 0].concat(args)\n\
            splice.apply(arr, splice_args);\n\
            return arr.length;\n\
        };\n\
\n\
        var unshift = function(el1, el2) {\n\
            var args = Array.prototype.slice.apply(arguments);\n\
            var len = arr.length;\n\
\n\
            var splice_args = [0, 0].concat(args)\n\
            splice.apply(arr, splice_args);\n\
            return arr.length;\n\
        };\n\
\n\
        // use defineProperty to avoid making ownProperty fields\n\
        function set_prop(prop, fn) {\n\
            Object.defineProperty(arr, prop, {\n\
                enumerable: false,\n\
                writable: true,\n\
                configurable: true,\n\
                value: fn\n\
            });\n\
        }\n\
\n\
        set_prop('splice', splice);\n\
        set_prop('push', push);\n\
        set_prop('unshift', unshift);\n\
    }\n\
\n\
    change(self.reactive.get(prop) || []);\n\
    self.skip = true;\n\
\n\
    self.reactive.sub(prop, change);\n\
};\n\
\n\
//@ sourceURL=reactive/lib/each.js"
));
require.register("reactive/lib/walk.js", Function("exports, require, module",
"/**\n\
 * @api private\n\
 */\n\
module.exports = function walk(el, process, done) {\n\
  var end = done || function(){};\n\
  var nodes = [].slice.call(el.childNodes);\n\
\n\
  function next(stop){\n\
    if (stop || nodes.length === 0) {\n\
      return end();\n\
    }\n\
    walk(nodes.shift(), process, next);\n\
  }\n\
\n\
  process(el, next);\n\
}\n\
//@ sourceURL=reactive/lib/walk.js"
));
































require.alias("component-classes/index.js", "reactive/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "reactive/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-query/index.js", "reactive/deps/query/index.js");
require.alias("component-query/index.js", "query/index.js");

require.alias("component-emitter/index.js", "reactive/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("component-domify/index.js", "reactive/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("yields-carry/index.js", "reactive/deps/carry/index.js");
require.alias("yields-carry/index.js", "reactive/deps/carry/index.js");
require.alias("yields-carry/index.js", "carry/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-merge-attrs/index.js");
require.alias("component-classes/index.js", "yields-carry/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("yields-uniq/index.js", "yields-carry/deps/uniq/index.js");
require.alias("component-indexof/index.js", "yields-uniq/deps/indexof/index.js");

require.alias("yields-carry/index.js", "yields-carry/index.js");
require.alias("visionmedia-debug/index.js", "reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/index.js", "debug/index.js");

require.alias("component-model/lib/index.js", "reactive/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "reactive/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "reactive/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "reactive/deps/model/index.js");
require.alias("component-model/lib/index.js", "model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");

require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("component-assert/index.js", "reactive/deps/assert/index.js");
require.alias("component-assert/index.js", "assert/index.js");
require.alias("component-stack/index.js", "component-assert/deps/stack/index.js");

require.alias("jkroso-equals/index.js", "component-assert/deps/equals/index.js");
require.alias("jkroso-type/index.js", "jkroso-equals/deps/type/index.js");

require.alias("matthewmueller-array/index.js", "reactive/deps/array/index.js");
require.alias("matthewmueller-array/lib/array.js", "reactive/deps/array/lib/array.js");
require.alias("matthewmueller-array/lib/enumerable.js", "reactive/deps/array/lib/enumerable.js");
require.alias("matthewmueller-array/index.js", "array/index.js");
require.alias("component-emitter/index.js", "matthewmueller-array/deps/emitter/index.js");

require.alias("component-to-function/index.js", "matthewmueller-array/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");

require.alias("yields-isArray/index.js", "matthewmueller-array/deps/isArray/index.js");

require.alias("component-clone/index.js", "reactive/deps/clone/index.js");
require.alias("component-clone/index.js", "clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("reactive/lib/index.js", "reactive/index.js");