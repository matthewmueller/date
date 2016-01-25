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
var rMonths = /^((\d{1,2})(st|nd|rd|th))\sof\s(january|february|march|april|may|june|july|august|september|october|november|december)/i;
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
    if (day) this.date.date.setDate(parseInt(day));
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
    this.time(captures[1], captures[3], captures[5], this._meridiem);
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
  if (rDays.test(orig)) {
    d.day(7);
  } else if ((before - d.date) / 1000 > 60) {
    // If it is a month in the past, don't add a day
    if (rMonths.test(orig)) {
      d.day(0);
    } else {
      d.day(1);
    }
  }

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
