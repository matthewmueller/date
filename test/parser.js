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

/**
 * Minutes
 */

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

  it('10 minutes from now', function () {
    var date = parse('10 minutes from now', mon);
    assert('1:40:00' == t(date));
    assert('5/13/13' == d(date));
  });

  it('10 minutes starting tomorrow', function () {
    var date = parse('10 minutes starting tomorrow', mon);
    assert('1:40:00' == t(date));
    assert('5/14/13' == d(date));
  });
});

/**
 * Hours
 */

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

/**
 * Days
 */

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

/**
 * Dates
 */

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

/**
 * Tomorrow
 */

describe('tomorrow', function () {
  it('tomorrow at 3pm', function () {
    var date = parse('tomorrow at 3pm', mon);
    assert('15:00:00' == t(date));
    assert('5/14/13' == d(date));
  });
});

/**
 * Yesterday
 */

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

/**
 * Tonight
 */

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

/**
 * Noon
 */

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

/**
 * Weeks
 */

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

/**
 * Night
 */

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

  it('tomorrow night at 9', function () {
    var date = parse('tomorrow night at 9', mon);
    assert('21:00:00' == t(date));
    assert('5/14/13' == d(date));
  });

  it('last night', function () {
    var date = parse('last night', mon);
    assert('17:00:00' == t(date));
    assert('5/12/13' == d(date));
  });
})

/**
 * Afternoon
 */

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

/**
 * Morning
 */

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

/**
 * Months
 */

describe('months', function () {
  it('this month', function () {
    var date = parse('this month', mon);
    assert('1:30:00' == t(date));
    assert('5/13/13' == d(date));
  });

  it('next month', function () {
    var date = parse('next month', mon);
    assert('1:30:00' == t(date));
    assert('6/13/13' == d(date));
  });

  it('last month', function () {
    var date = parse('last month', mon);
    assert('1:30:00' == t(date));
    assert('4/13/13' == d(date));
  });

  it('2 months from tomorrow', function () {
    var date = parse('2 months from tomorrow', mon);
    assert('1:30:00' == t(date));
    assert('7/14/13' == d(date));
  });

  it('2 monthes from tomorrow (misspelling)', function () {
    var date = parse('2 monthes from tomorrow', mon);
    assert('1:30:00' == t(date));
    assert('7/14/13' == d(date));
  });

  it('should handle months with less days', function () {
    var date = parse('1 month', new Date('01/31/2011'));
    assert('2/28/11' == d(date))
  });

  it('should handle leap year', function () {
    var date = parse('1 month', new Date('01/31/2012'));
    assert('2/29/12' == d(date));
  });

  it('tomorrow afternoon at 4:30pm 1 month from now', function () {
    var date = parse('tomorrow afternoon at 4:30pm 1 month from now', mon);
    assert('16:30:00' == t(date));
    assert('6/14/13' == d(date));
  });
});

/**
 * Year
 */

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

  it('2 years ago', function() {
    var date = parse('2 years ago', mon);
    assert('1:30:00' == t(date));
    assert('5/13/11' == d(date));
  })

  it('2 years ago tomorrow', function() {
    var date = parse('2 years ago tomorrow', mon);
    assert('1:30:00' == t(date));
    assert('5/14/11' == d(date));
  })
});

/**
 * Dates in the past
 */

describe('dates in the past', function() {
  var past = new Date('May 13, 2013 18:00:00')

  it('tomorrow afternoon', function() {
    var date = parse('tomorrow afternoon', past);
    assert('14:00:00' == t(date));
    assert('5/14/13' == d(date));
  });

  it('tomorrow afternoon at 3pm', function() {
    var date = parse('tomorrow afternoon at 3pm', past);
    assert('15:00:00' == t(date));
    assert('5/14/13' == d(date));
  });

  // Need to place .nextTime() at the end

  it('3pm tomorrow afternoon', function () {
    var date = parse('3pm tomorrow afternoon', past);
    assert('15:00:00' == t(date));
    assert('5/14/13' == d(date));
  });
});

/**
 * Ignore other input
 */

describe('other inputs', function () {
  it('yesterday, 2 years ago--.', function() {
    var date = parse('yesterday, 2 years ago--.', mon);
    assert('1:30:00' == t(date));
    assert('5/12/11' == d(date))
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

