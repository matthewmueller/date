;(function(){

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
require.register("visionmedia-debug/index.js", function(exports, require, module){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

});
require.register("date/index.js", function(exports, require, module){
/**
 * Expose `Date`
 */

module.exports = require('./lib/parser');

});
require.register("date/lib/date.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('date:date');

/**
 * Time constants
 */

var _second = 1000;
var _minute = 60 * _second;
var _hour = 60 * _minute;
var _day = 24 * _hour;
var _week = 7 * _day;
var _year = 56 * _week;
var _daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Expose `date`
 */

module.exports = date;

/**
 * Initialize `date`
 *
 * @param {Date} offset (optional)
 * @return {Date}
 * @api publics
 */

function date(offset) {
  if(!(this instanceof date)) return new date(offset);
  this._changed = {};
  this.date = new Date(offset);
};

/**
 * Clone the current date
 */

date.prototype.clone = function() {
  return new Date(this.date);
}

/**
 * Has changed
 *
 * @param {String} str
 * @return {Boolean}
 */

date.prototype.changed = function(str) {
  if (this._changed[str] === undefined) return false;
  return this._changed[str];
};

/**
 * add or subtract seconds
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.second = function(n) {
  var seconds = +n * _second;
  this.update(seconds);
  this._changed['seconds'] = true;
  return this;
}

/**
 * add or subtract minutes
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.minute = function(n) {
  var minutes = +n * _minute;
  this.update(minutes);
  this._changed['minutes'] = true;
  return this;
}

/**
 * add or subtract hours
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.hour = function(n) {
  var hours = +n * _hour;
  this.update(hours);
  this._changed['hours'] = true;
  return this;
}

/**
 * add or subtract days
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.day = function(n) {
  var days = +n * _day;
  this.update(days);
  this._changed['days'] = true;
  return this;
}

/**
 * add or subtract weeks
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.week = function(n) {
  var weeks = +n * _week;
  this.update(weeks);
  this._changed['weeks'] = true;
  return this;
}

/**
 * add or subtract months
 *
 * @param {Number} n
 * @return {Date}
 */

date.prototype.month = function(n) {
  var d = this.date;
  var day = d.getDate();
  d.setDate(1);
  var month = +n + d.getMonth();
  d.setMonth(month);

  // Handle dates with less days
  var dim = this.daysInMonth(month)
  d.setDate(Math.min(dim, day));
  return this;
};

/**
 * get the days in the month
 */

date.prototype.daysInMonth = function(m) {
  var dim = _daysInMonth[m];
  var leap = leapyear(this.date.getFullYear());
  return (1 == m && leap) ? 29 : 28;
};

/**
 * add or subtract years
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.year = function(n) {
  var yr = this.date.getFullYear();
  yr += +n;
  this.date.setFullYear(yr);
  this._changed['years'] = true;
  return this;
}

/**
 * Set the time
 *
 * @param {String} h
 * @param {String} m
 * @param {String} s
 * @return {date}
 */

date.prototype.time = function(h, m, s, meridiem) {
  if (h === false) {
    h = this.date.getHours();
  } else {
    h = +h || 0;
    this._changed['hours'] = h;
  }

  if (m === false) {
    m = this.date.getMinutes();
  } else {
    m = +m || 0;
    this._changed['minutes'] = m;
  }

  if (s === false) {
    s = this.date.getSeconds();
  } else {
    s = +s || 0;
    this._changed['seconds'] = s;
  }

  this.date.setHours(h, m, s);
  return this;
};

/**
 * Dynamically create day functions (sunday(n), monday(n), etc.)
 */

var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
days.forEach(function(day, i) {
  date.prototype[days[i]] = function(n) {
    this._changed['days'] = true;
    this.updateDay(i, n);
  };
});

/**
 * go to day of week
 *
 * @param {Number} day
 * @param {Number} n
 * @return {date}
 */

date.prototype.updateDay = function(d, n) {
  n = +(n || 1);
  var diff = (d - this.date.getDay() + 7) % 7;
  if (n > 0) --n;
  diff += (7 * n);
  this.update(diff * _day);
  return this;
}

/**
 * Update the date
 *
 * @param {Number} ms
 * @return {Date}
 * @api private
 */

date.prototype.update = function(ms) {
  this.date = new Date(this.date.getTime() + ms);
  return this;
};

/**
 * leap year
 *
 * @param {Number} yr
 * @return {Boolean}
 */

function leapyear(yr) {
  return (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
}

});
require.register("date/lib/parser.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var date = require('./date');
var debug = require('debug')('date:parser');

/**
 * Days
 */

var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
              'october', 'november', 'december' ]

/**
 * Regexs
 */

// 5, 05, 5:30, 5.30, 05:30:10, 05:30.10, 05.30.10, at 5
var rMeridiem = /^(\d{1,2})([:.](\d{1,2}))?([:.](\d{1,2}))?\s*([ap]m)/;
var rHourMinute = /^(\d{1,2})([:.](\d{1,2}))([:.](\d{1,2}))?/;
var rAtHour = /^at\s?(\d{1,2})$/;
var rDays = /\b(sun(day)?|mon(day)?|tues(day)?|wed(nesday)?|thur(sday|s)?|fri(day)?|sat(urday)?)s?\b/;
var rMonths = /^((\d{1,2})(st|nd|rd|th))\sof\s(january|february|march|april|may|june|july|august|september|october|november|december)/;
var rPast = /\b(last|yesterday|ago)\b/;
var rDayMod = /\b(morning|noon|afternoon|night|evening|midnight)\b/;
var rAgo = /^(\d*)\s?\b(second|minute|hour|day|week|month|year)[s]?\b\s?ago$/;

/**
 * Expose `parser`
 */

module.exports = parser;

/**
 * Initialize `parser`
 *
 * @param {String} str
 * @return {Date}
 * @api publics
 */

function parser(str, offset) {
  if(!(this instanceof parser)) return new parser(str, offset);
  if(typeof offset == 'string') offset = parser(offset);
  var d = offset || new Date;
  this.date = new date(d);
  this.original = str;
  this.str = str.toLowerCase();
  this.stash = [];
  this.tokens = [];
  while (this.advance() !== 'eos');
  debug('tokens %j', this.tokens)
  this.nextTime(d);
  if (this.date.date == d) throw new Error('Invalid date');
  return this.date.date;
};

/**
 * Advance a token
 */

parser.prototype.advance = function() {
  var tok = this.eos()
    || this.space()
    || this._next()
    || this.last()
    || this.dayByName()
    || this.monthByName()
    || this.timeAgo()
    || this.ago()
    || this.yesterday()
    || this.tomorrow()
    || this.noon()
    || this.midnight()
    || this.night()
    || this.evening()
    || this.afternoon()
    || this.morning()
    || this.tonight()
    || this.meridiem()
    || this.hourminute()
    || this.athour()
    || this.week()
    || this.month()
    || this.year()
    || this.second()
    || this.minute()
    || this.hour()
    || this.day()
    || this.number()
    || this.string()
    || this.other();

  this.tokens.push(tok);
  return tok;
};

/**
 * Lookahead `n` tokens.
 *
 * @param {Number} n
 * @return {Object}
 * @api private
 */

parser.prototype.lookahead = function(n){
  var fetch = n - this.stash.length;
  if (fetch == 0) return this.lookahead(++n);
  while (fetch-- > 0) this.stash.push(this.advance());
  return this.stash[--n];
};

/**
 * Lookahead a single token.
 *
 * @return {Token}
 * @api private
 */

parser.prototype.peek = function() {
  return this.lookahead(1);
};

/**
 * Fetch next token including those stashed by peek.
 *
 * @return {Token}
 * @api private
 */

parser.prototype.next = function() {
  var tok = this.stashed() || this.advance();
  return tok;
};

/**
 * Return the next possibly stashed token.
 *
 * @return {Token}
 * @api private
 */

parser.prototype.stashed = function() {
  var stashed = this.stash.shift();
  return stashed;
};

/**
 * Consume the given `len`.
 *
 * @param {Number|Array} len
 * @api private
 */

parser.prototype.skip = function(len){
  this.str = this.str.substr(Array.isArray(len)
    ? len[0].length
    : len);
};

/**
 * EOS
 */

parser.prototype.eos = function() {
  if (this.str.length) return;
  return 'eos';
};

/**
 * Space
 */

parser.prototype.space = function() {
  var captures;
  if (captures = /^([ \t]+)/.exec(this.str)) {
    this.skip(captures);
    return this.advance();
  }
};

/**
 * Second
 */

parser.prototype.second = function() {
  var captures;
  if (captures = /^s(ec|econd)?s?/.exec(this.str)) {
    this.skip(captures);
    return 'second';
  }
};

/**
 * Minute
 */

parser.prototype.minute = function() {
  var captures;
  if (captures = /^m(in|inute)?s?/.exec(this.str)) {
    this.skip(captures);
    return 'minute';
  }
};

/**
 * Hour
 */

parser.prototype.hour = function() {
  var captures;
  if (captures = /^h(r|our)s?/.exec(this.str)) {
    this.skip(captures);
    return 'hour';
  }
};

/**
 * Day
 */

parser.prototype.day = function() {
  var captures;
  if (captures = /^d(ay)?s?/.exec(this.str)) {
    this.skip(captures);
    return 'day';
  }
};

/**
 * Day by name
 */

parser.prototype.dayByName = function() {
  var captures;
  var r = new RegExp('^' + rDays.source);
  if (captures = r.exec(this.str)) {
    var day = captures[1];
    this.skip(captures);
    this.date[day](1);
    return captures[1];
  }
};


/**
 * Month by name
 */

parser.prototype.monthByName = function() {
  var captures;
  if (captures = rMonths.exec(this.str)) {
    var day = captures[2]
    var month = captures[4];
    this.date.date.setMonth((months.indexOf(month)));
    if (day) this.date.date.setDate(parseInt(day) - 1);
    this.skip(captures);
    return captures[0];
  }
};


parser.prototype.timeAgo = function() {
  var captures;
  if (captures = rAgo.exec(this.str)) {
    var num = captures[1];
    var mod = captures[2];
    this.date[mod](-num);
    this.skip(captures);
    return 'timeAgo';
  }
};

/**
 * Week
 */

parser.prototype.week = function() {
  var captures;
  if (captures = /^w(k|eek)s?/.exec(this.str)) {
    this.skip(captures);
    return 'week';
  }
};

/**
 * Month
 */

parser.prototype.month = function() {
  var captures;
  if (captures = /^mon(th)?(es|s)?\b/.exec(this.str)) {
    this.skip(captures);
    return 'month';
  }

};

/**
 * Week
 */

parser.prototype.year = function() {
  var captures;
  if (captures = /^y(r|ear)s?/.exec(this.str)) {
    this.skip(captures);
    return 'year';
  }
};

/**
 * Meridiem am/pm
 */

parser.prototype.meridiem = function() {
  var captures;
  if (captures = rMeridiem.exec(this.str)) {
    this.skip(captures);
    this.time(captures[1], captures[3], captures[5], captures[6]);
    return 'meridiem';
  }
};

/**
 * Hour Minute (ex. 12:30)
 */

parser.prototype.hourminute = function() {
  var captures;
  if (captures = rHourMinute.exec(this.str)) {
    this.skip(captures);
    this.time(captures[1], captures[3], captures[5]);
    return 'hourminute';
  }
};

/**
 * At Hour (ex. at 5)
 */

parser.prototype.athour = function() {
  var captures;
  if (captures = rAtHour.exec(this.str)) {
    this.skip(captures);
    this.time(captures[1], 0, 0, this._meridiem);
    this._meridiem = null;
    return 'athour';
  }
};

/**
 * Time set helper
 */

parser.prototype.time = function(h, m, s, meridiem) {
  var d = this.date;
  var before = d.clone();

  if (meridiem) {
    // convert to 24 hour
    h = ('pm' == meridiem && 12 > h) ? +h + 12 : h; // 6pm => 18
    h = ('am' == meridiem && 12 == h) ? 0 : h; // 12am => 0
  }

  m = (!m && d.changed('minutes')) ? false : m;
  s = (!s && d.changed('seconds')) ? false : s;
  d.time(h, m, s);
};

/**
 * Best attempt to pick the next time this date will occur
 *
 * TODO: place at the end of the parsing
 */

parser.prototype.nextTime = function(before) {
  var d = this.date;
  var orig = this.original;

  if (before <= d.date || rPast.test(orig)) return this;

  // If time is in the past, we need to guess at the next time
  if (rDays.test(orig)) d.day(7);
  else if ((before - d.date) / 1000 > 60) d.day(1);

  return this;
};

/**
 * Yesterday
 */

parser.prototype.yesterday = function() {
  var captures;
  if (captures = /^(yes(terday)?)/.exec(this.str)) {
    this.skip(captures);
    this.date.day(-1);
    return 'yesterday';
  }
};

/**
 * Tomorrow
 */

parser.prototype.tomorrow = function() {
  var captures;
  if (captures = /^tom(orrow)?/.exec(this.str)) {
    this.skip(captures);
    this.date.day(1);
    return 'tomorrow';
  }
};

/**
 * Noon
 */

parser.prototype.noon = function() {
  var captures;
  if (captures = /^noon\b/.exec(this.str)) {
    this.skip(captures);
    var before = this.date.clone();
    this.date.date.setHours(12, 0, 0);
    return 'noon';
  }
};

/**
 * Midnight
 */

parser.prototype.midnight = function() {
  var captures;
  if (captures = /^midnight\b/.exec(this.str)) {
    this.skip(captures);
    var before = this.date.clone();
    this.date.date.setHours(0, 0, 0);
    return 'midnight';
  }
};

/**
 * Night (arbitrarily set at 7pm)
 */

parser.prototype.night = function() {
  var captures;
  if (captures = /^night\b/.exec(this.str)) {
    this.skip(captures);
    this._meridiem = 'pm';
    var before = this.date.clone();
    this.date.date.setHours(19, 0, 0);
    return 'night'
  }
};

/**
 * Evening (arbitrarily set at 5pm)
 */

parser.prototype.evening = function() {
  var captures;
  if (captures = /^evening\b/.exec(this.str)) {
    this.skip(captures);
    this._meridiem = 'pm';
    var before = this.date.clone();
    this.date.date.setHours(17, 0, 0);
    return 'evening'
  }
};

/**
 * Afternoon (arbitrarily set at 2pm)
 */

parser.prototype.afternoon = function() {
  var captures;
  if (captures = /^afternoon\b/.exec(this.str)) {
    this.skip(captures);
    this._meridiem = 'pm';
    var before = this.date.clone();

    if (this.date.changed('hours')) return 'afternoon';

    this.date.date.setHours(14, 0, 0);
    return 'afternoon';
  }
};


/**
 * Morning (arbitrarily set at 8am)
 */

parser.prototype.morning = function() {
  var captures;
  if (captures = /^morning\b/.exec(this.str)) {
    this.skip(captures);
    this._meridiem = 'am';
    var before = this.date.clone();
    if (!this.date.changed('hours')) this.date.date.setHours(8, 0, 0);
    return 'morning';
  }
};

/**
 * Tonight
 */

parser.prototype.tonight = function() {
  var captures;
  if (captures = /^tonight\b/.exec(this.str)) {
    this.skip(captures);
    this._meridiem = 'pm';
    return 'tonight';
  }
};

/**
 * Next time
 */

parser.prototype._next = function() {
  var captures;
  if (captures = /^next/.exec(this.str)) {
    this.skip(captures);
    var d = new Date(this.date.date);
    var mod = this.peek();

    // If we have a defined modifier, then update
    if (this.date[mod]) {
      this.next();
      // slight hack to modify already modified
      this.date = date(d);
      this.date[mod](1);
    } else if (rDayMod.test(mod)) {
      this.date.day(1);
    }

    return 'next';
  }
};

/**
 * Last time
 */

parser.prototype.last = function() {
  var captures;
  if (captures = /^last/.exec(this.str)) {
    this.skip(captures);
    var d = new Date(this.date.date);
    var mod = this.peek();

    // If we have a defined modifier, then update
    if (this.date[mod]) {
      this.next();
      // slight hack to modify already modified
      this.date = date(d);
      this.date[mod](-1);
    } else if (rDayMod.test(mod)) {
      this.date.day(-1);
    }

    return 'last';
  }
};

/**
 * Ago
 */

parser.prototype.ago = function() {
  var captures;
  if (captures = /^ago\b/.exec(this.str)) {
    this.skip(captures);
    return 'ago';
  }
};

/**
 * Number
 */

parser.prototype.number = function() {
  var captures;
  if (captures = /^(\d+)/.exec(this.str)) {
    var n = captures[1];
    this.skip(captures);
    var mod = this.peek();

    // If we have a defined modifier, then update
    if (this.date[mod]) {
      if ('ago' == this.peek()) n = -n;
      this.date[mod](n);
    } else if (this._meridiem) {
      // when we don't have meridiem, possibly use context to guess
      this.time(n, 0, 0, this._meridiem);
      this._meridiem = null;
    } else if (this.original.indexOf('at') > -1 ) {
      this.time(n, 0, 0, this._meridiem);
      this._meridiem = null;
    }

    return 'number';
  }
};

/**
 * String
 */

parser.prototype.string = function() {
  var captures;
  if (captures = /^\w+/.exec(this.str)) {
    this.skip(captures);
    return 'string';
  }
};

/**
 * Other
 */

parser.prototype.other = function() {
  var captures;
  if (captures = /^./.exec(this.str)) {
    this.skip(captures);
    return 'other';
  }
};

});
require.alias("visionmedia-debug/index.js", "date/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "date/deps/debug/debug.js");
require.alias("visionmedia-debug/index.js", "debug/index.js");

require.alias("date/index.js", "date/index.js");if (typeof exports == "object") {
  module.exports = require("date");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("date"); });
} else {
  this["date"] = require("date");
}})();