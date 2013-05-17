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
      assert('5/13/13' == d(date));
    });

    it('10min', function () {
      var date = parse('10min', mon);
      assert('1:40:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('10 minutes', function () {
      var date = parse('10 minutes', mon);
      assert('1:40:00' == t(date));
      assert('5/13/13' == d(date));
    });
  });

  describe('hours', function() {
    it('in 5 hours', function () {
      var date = parse('in 5 hours', mon);
      assert('6:30:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('at 5am', function () {
      var date = parse('5am', mon);
      assert('5:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('at 5pm', function () {
      var date = parse('5pm', mon);
      assert('17:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('at 12:30', function () {
      var date = parse('at 12:30', mon);
      assert('12:30:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('at 23:35', function () {
      var date = parse('at 23:35', mon);
      assert('23:35:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('at 0:30', function () {
      var date = parse('at 0:30', mon);
      assert('0:30:00' == t(date));
      assert('5/14/13' == d(date));
    });
  });

  describe('days', function () {
    it('in 2 days', function () {
      var date = parse('in 2 days', mon);
      assert('1:30:00' == t(date));
      assert('5/15/13' == d(date));
    });

    it('in 2d', function () {
      var date = parse('in 2d', mon);
      assert('1:30:00' == t(date));
      assert('5/15/13' == d(date));
    });
  });

  describe('dates', function () {
    it('tuesday at 9am', function () {
      var date = parse('tuesday at 9am', mon);
      assert('9:00:00' == t(date));
      assert('5/14/13' == d(date));
    });

    it('monday at 9am', function () {
      var date = parse('monday at 9am', mon);
      assert('9:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('monday at 1:00am', function () {
      var date = parse('monday at 1:00am', mon);
      assert('1:00:00' == t(date));
      assert('5/20/13' == d(date));
    });

    it('next monday at 1:00am', function () {
      var date = parse('next monday at 1:00am', mon);
      assert('1:00:00' == t(date));
      assert('5/20/13' == d(date));
    });

    it('last monday at 1:00am', function () {
      var date = parse('last monday at 1:00am', mon);
      assert('1:00:00' == t(date));
      assert('5/6/13' == d(date));
    });
  });

  describe('tomorrow', function () {
    it('tomorrow at 3pm', function () {
      var date = parse('tomorrow at 3pm', mon);
      assert('15:00:00' == t(date));
      assert('5/14/13' == d(date));
    });
  });

  describe('yesterday', function () {
    it('yesterday at 3pm', function () {
      var date = parse('yesterday at 3pm', mon);
      assert('15:00:00' == t(date));
      assert('5/12/13' == d(date));
    });

    it('yesterday at 12:30am', function () {
      var date = parse('yesterday at 12:30am', mon);
      assert('0:30:00' == t(date));
      assert('5/12/13' == d(date));
    });
  });

  describe('tonight', function () {
    it('5pm tonight', function () {
      var date = parse('5pm tonight', mon);
      assert('17:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('tonight at 5pm', function () {
      var date = parse('tonight at 5pm', mon);
      assert('17:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('tonight at 5', function () {
      var date = parse('tonight at 5', mon);
      assert('17:00:00' == t(date));
      assert('5/13/13' == d(date));
    });
  });

  describe('noon', function () {
    it('noon', function () {
      var date = parse('noon', mon);
      assert('12:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('tomorrow at noon', function () {
      var date = parse('tomorrow at noon', mon);
      assert('12:00:00' == t(date));
      assert('5/14/13' == d(date));
    });

    it('noon (@ 1:30pm)', function () {
      var afternoon = new Date('May 13, 2013 13:30:00')
      var date = parse('noon', afternoon);
      assert('12:00:00' == t(date));
      assert('5/14/13' == d(date));
    });
  });

  describe('weeks', function () {
    it('next week tuesday', function () {
      var date = parse('next week tuesday', mon);
      assert('1:30:00' == t(date));
      assert('5/21/13' == d(date));
    });

    it('next wk tuesday', function () {
      var date = parse('next week tuesday', mon);
      assert('1:30:00' == t(date));
      assert('5/21/13' == d(date));
    });

    it('next week tuesday at 4:30pm', function () {
      var date = parse('next week tuesday at 4:30pm', mon);
      assert('16:30:00' == t(date));
      assert('5/21/13' == d(date));
    });

    it('2 weeks from wednesday', function () {
      var date = parse('2 weeks from wednesday', mon);
      assert('1:30:00' == t(date));
      assert('5/29/13' == d(date));
    });
  });

  describe('night', function() {
    it('night', function () {
      var date = parse('night', mon);
      assert('17:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('tomorrow night', function () {
      var date = parse('tomorrow night', mon);
      assert('17:00:00' == t(date));
      assert('5/14/13' == d(date));
    });

    it('last night', function () {
      var date = parse('last night', mon);
      assert('17:00:00' == t(date));
      assert('5/12/13' == d(date));
    });
  })

  describe('afternoon', function() {
    it('afternoon', function () {
      var date = parse('afternoon', mon);
      assert('14:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('tomorrow afternoon', function () {
      var date = parse('tomorrow afternoon', mon);
      assert('14:00:00' == t(date));
      assert('5/14/13' == d(date));
    });

    it('last afternoon', function () {
      var date = parse('last afternoon', mon);
      assert('14:00:00' == t(date));
      assert('5/12/13' == d(date));
    });
  })

  describe('morning', function() {
    it('morning', function () {
      var date = parse('morning', mon);
      assert('8:00:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('tomorrow morning', function () {
      var date = parse('tomorrow morning', mon);
      assert('8:00:00' == t(date));
      assert('5/14/13' == d(date));
    });

    it('last morning', function () {
      var date = parse('last morning', mon);
      assert('8:00:00' == t(date));
      assert('5/12/13' == d(date));
    });

    it('this morning at 9', function () {
      var date = parse('this morning at 9', mon);
      assert('9:00:00' == t(date));
      assert('5/13/13' == d(date));
    });
  })

  describe('year', function() {
    it('this year', function() {
      var date = parse('year', mon);
      assert('1:30:00' == t(date));
      assert('5/13/13' == d(date));
    });

    it('next year', function () {
      var date = parse('next year', mon);
      assert('1:30:00' == t(date));
      assert('5/13/14' == d(date));
    });

    it('last year', function () {
      var date = parse('last year', mon);
      assert('1:30:00' == t(date));
      assert('5/13/12' == d(date));
    });

    it('2 years from yesterday at 5pm', function () {
      var date = parse('2 years from yesterday at 5pm', mon);
      assert('17:00:00' == t(date));
      assert('5/12/15' == d(date));
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

