# date [![Build Status](https://travis-ci.org/matthewmueller/date.svg?branch=master)](https://travis-ci.org/matthewmueller/date) [![Libscore](http://img.shields.io/badge/libscore-35-brightgreen.svg?style=flat-square)](http://libscore.com/#date)

Date is an english language date parser for node.js and the browser. For examples and demos, see: [http://matthewmueller.github.io/date/](http://matthewmueller.github.io/date/)

**Update:** date.js now has much better NLP support thanks to [@kengz](https://github.com/kengz)

## Job Board

Looking for a career upgrade? Check out the available Node.js & Javascript positions at these innovative companies.

<a href="https://astro.netlify.com/automattic"><img src="https://astro.netlify.com/static/automattic.png"></a>
<a href="https://astro.netlify.com/segment"><img src="https://astro.netlify.com/static/segment.png"></a>
<a href="https://astro.netlify.com/auth0"><img src="https://astro.netlify.com/static/auth0.png"/></a>

## Installation

### On the server or in the browser:

    npm install date.js

#### Standalone:

* development: [date.js](https://raw.github.com/MatthewMueller/date/master/dist/date.js)
* minified: [date.min.js](https://raw.github.com/MatthewMueller/date/master/dist/date.min.js)

> Standalone is also AMD-compatible

## Examples

```js
date('10 minutes from now')
date('in 5 hours')
date('at 5pm')
date('at 12:30')
date('at 23:35')
date('in 2 days')
date('tuesday at 9am')
date('monday at 1:00am')
date('last monday at 1:00am')
date('tomorrow at 3pm')
date('yesterday at 12:30am')
date('5pm tonight')
date('tomorrow at noon')
date('next week tuesday')
date('next week tuesday at 4:30pm')
date('2 weeks from wednesday')
date('tomorrow night at 9')
date('tomorrow afternoon')
date('this morning at 9')
date('at 12:30pm')
date('tomorrow at 9 in the morning')
date('2 years from yesterday at 5pm')
date('last month')
date('2nd of January')
date('1st of March')
date('1 st of March')
date('31st of September 4:00am')
date('1st of January 4:00am')
date('9th of December 4:00am')
date('tomorrow afternoon at 4:30pm 1 month from now')
date('10 seconds ago')
date('1 minute ago')
date('2 hours ago')
date('5 weeks ago')
date('2 months ago')
date('1 year ago')
date('an hour later')
date('2w from wednesday')
date('2nd day of January')
date('two hours later')
date('a fortnight from wednesday')
date('a minute ago')

date('at 12:30')
date('at 12.30')
date('tuesday at 9')
date('tomorrow at 15')
```

## API

### date(str, [offset])

Create a `Date` from a `str`. You may also supply an optional `offset` to the starting date. `offset` defaults to the current date and time.

## Tests

To run the tests, you'll need node.js:

    npm install
    make test

## Contributors

```
 project  : date
 repo age : 2 years, 10 months
 active   : 39 days
 commits  : 87
 files    : 17
 authors  :
    27  Matt Mueller       31.0%
    12  Bulkan Evcimen     13.8%
     8  kengz              9.2%
     3  Eero Norri         3.4%
     2  thomas             2.3%
     2  Patrick Stadler    2.3%
     1  Christopher Blum   1.1%
     1  Federico Rampazzo  1.1%
     1  Timothy Cyrus      1.1%
     1  chencheng          1.1%
     1  HipsterBrown       1.1%
     1  Jimmy Gaussen      1.1%
```

## License

(The MIT License)

Copyright (c) 2013 Matt Mueller <mattmuelle@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
