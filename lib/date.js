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
  var seconds = n * _second;
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
  var minutes = n * _minute;
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
  var hours = n * _hour;
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
  var days = n * _day;
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
  var weeks = n * _week;
  this.update(weeks);
  this._changed['weeks'] = true;
  return this;
}

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

date.prototype.time = function(h, m, s) {
  h = (h === false) ? this.date.getHours() : (+h || 0);
  m = (m === false) ? this.date.getMinutes() : (+m || 0);
  s = (s === false) ? this.date.getSeconds() : (+s || 0);
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
  n = n || 1;
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

