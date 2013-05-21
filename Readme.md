
# date

Date is an english language date parser for node.js and the browser. For examples and demos, see: [http://matthewmueller.github.io/date/](http://matthewmueller.github.io/date/)

## Installation

### On the server (node.js):

    npm install date.js

### In the browser:

#### Using component:

    component install matthewmueller/date

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
date('2 years from yesterday at 5pm')
date('last month')
date('tomorrow afternoon at 4:30pm 1 month from now')
```

## API

### date(str, [offset])

Create a `Date` from a `str`. You may also supply an optional `offset` to the starting date. `offset` defaults to the current date and time.

## Tests

To run the tests, you'll need node.js:

    npm install
    make test
