### Issues currently under work:
- 71: "3.99" is interpreted as 4.39am: justified
- 70, 66, 63, 18: full CFG and unit-specific arithmetics
- 27, 26, 13: default, e.g. tonight, tomorrow at 11 -> at 11am, at midnight etc
- 55, 52, 25, 2: causality, before, after, ago, from now, <bar> ops
- 32: ranges
- CFG pending takeover: month-specific carry into days, defaults (tomorrow = 9am), leap year

0.3.1 / 2016-03-02
==================

  * remove lodash dep

0.3.0 / 2016-03-02
==================

  * update the readme
  * update dist
  * remove map
  * fix travis. include only the lodash methods that we need. minor tweaks to be more consistent with the rest of the project.
  * update lodash to find the latest available
  * remove template string for legacy support
  * remove template string for legacy support
  * natural language normalization, fixes #66, 64, 28, 16, 15, 11, 4
  * normalize string at parser using norm.js; add lodash as dep
  * add issues under work
  * fix npm i warning by adding MIT license field

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
