/**
 * Module Dependencies
 */

var Clock = require('clock');
var Calendar = require('calendar');
var event = require('event');
var debounce = require('debounce');
var date = require('date');

/**
 * Handle input
 */

var input = document.getElementById('date-input');
input.oninput = debounce(parse, 200);

/**
 * Parse the time
 */

function parse() {
  var val = input.value;
  var d = date(val);
  cal.select(d);
  time.innerHTML = t(d);
}

/**
 * Handle suggestions
 */

var table = document.getElementsByTagName('table')[0];
event.bind(table, 'click', function(e) {
  var target = e.target;
  if ('TD' !== target.nodeName) return;
  input.value = target.innerText;
  parse()
});

/**
 * Place the calendar
 */

var cal = new Calendar;
cal.el.appendTo('.calendar-container');

/**
 * Place a clock in the nav bar
 */

var navClock = document.querySelector('.nav-clock');
var clock = new Clock();
clock.refresh();
navClock.appendChild(clock.el);
setInterval(function() {
  clock.refresh();
}, 1000);

/**
 * Time
 */

var time = document.querySelector('#demo .time');
time.innerHTML = t(new Date);

function t(date) {
  var t = date.toTimeString().split(' ')[0];
  var meridiem = 'am';
  var parts = t.split(':');
  parts.pop();
  if (parts[0] > 12) {
    parts[0] = parts[0] - 12;
    meridiem = 'pm';
  }
  t = parts.join(':');
  t = ('0' == t[0]) ? t.slice(1) : t;
  t += meridiem;
  return t;
}
