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
  this.date = new Date(offset);
};

/**
 * Clone the current date
 */

date.prototype.clone = function() {
  return new Date(this.date);
}

/**
 * add or subtract seconds
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.second = function(n) {
  this.update(n * _second);
  return this;
}

/**
 * add or subtract minutes
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.minute = function(n) {
  this.update(n * _minute);
  return this;
}

/**
 * add or subtract hours
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.hour = function(n) {
  this.update(n * _hour);
  return this;
}

/**
 * add or subtract days
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.day = function(n) {
  this.update(n * _day);
  return this;
}

/**
 * add or subtract weeks
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.week = function(n) {
  this.update(n * _week);
  return this;
}

/**
 * add or subtract years
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.year = function(n) {
  this.update(n * _year);
  return this;
}

/**
 * AM
 */

date.prototype.am = function(h, m, s) {
  h = +h || 0;
  m = +m || 0;
  s = +s || 0;
  h = (12 == h) ? 0 : h;
  this.date.setHours(h, m, s);
  return this;
};

/**
 * PM
 */

date.prototype.pm = function(h, m, s) {
  h = +h || 0;
  m = +m || 0;
  s = +s || 0;
  this.date.setHours(h + 12, m, s);
  return this;
};

/**
 * Dynamically create day functions (sunday(n), monday(n), etc.)
 */

var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
days.forEach(function(day, i) {
  date.prototype[days[i]] = function(n) {
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
  diff += (7 * --n);
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

