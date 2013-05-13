/**
 * Module Dependencies
 */

var parse = require('../lib/parser');
var assert = require('better-assert');

/**
 * Some predefined dates
 */

var mon = new Date('May 13, 2013 01:30:00');

/**
 * Test parser
 */

describe('parse', function () {

  describe('minutes', function () {
    it('10m', function () {
      var date = parse('10m', mon);
      assert('1:40:00' == t(date));
    });

    it('10min', function () {
      var date = parse('10min', mon);
      assert('1:40:00' == t(date));
    });

    it('10 minutes', function () {
      var date = parse('10 minutes', mon);
      assert('1:40:00' == t(date));
    });
  });

});


/**
 * Time helper function
 */

function t(date) {
  var t = date.toTimeString().split(' ')[0];
  t = ('0' == t[0]) ? t.slice(1) : t;
  return t;
}

/**
 * Date helper function
 */

function d(date) {
  var d = date.toString();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var year = '' + date.getFullYear();
  return [month, day, year.slice(2)].join('/');
}

