
0.2.2 / 2016-01-25
==================

  * fix tonight with minutes issue #72, add test

0.2.1 / 2015-11-20
==================

  * fix(months): adds no extra day when months in the past

0.2.0 / 2014-02-21
==================

 * update the distributions
 * Fix rMonths reg exp
 * Unparsable strings return the current date instead of tomorrow. Better prediction if parsed date is close to now (same minute).
 * parsing of str's like `2 minutes ago` working now
 * Capturing the time unit minutes..months
 * added travis
 * correctly parse dates like "1st of March"
 * parsing of "1st of march" working
 * Extend at hour to support 24 hour clock and add support for hour.minute format
 * 12:30pm no longer resolves to 12:30am. fixes: #6
 * fixed an issue that prevented Monday at 10 am to be matched correctly

0.1.1 / 2013-05-21
==================

* fixed: infinite loop for non-matching characters

0.1.0 / 2013-05-20
==================

* fixed: dates in the past
* added: ago
* added: implied meridiem
* added: months
* added: tests

0.0.1 / 2013-05-13
==================

* initial commit
