// Module to enumerate all CFG symbols for the human language for time

/**
 * Module Dependencies
 */

var maps = require('./maps.json')
var util = require('./util')

/**
 * Constructors for all types of symbols
 */
var symbolConstructors = {
  op: op,
  c: c,
  r: r,
  n: n,
  t: T,
  dt: T,
  T: T,
  f: f,
  o: o,
  rT: rT,
  cT: cT,
}

/**
 * Export `symbol`
 */

module.exports = symbol

/**
 * The symbol constructor, given a string, lemmatize it, then return a symbol from {∅=null,op,c,r,n,t,dt,T,f}.
 * i.e. str -> parseFloat(str) -> new n(str) -> return
 * or str -> lemma(str) -> new <symbol-name>(symbol-value) -> return
 * @param {string}  str       the input string
 * @return {*} The object from the class of symbols
 * @example
 * symbol('90')
 * // => n { value: 10 }
 * symbol('hour')
 * // a <dt> time difference object
 * // => dt { h: '1' }
 * symbol('tonight')
 * // or equivalently, takes the T string too
 * symbol('t:=9h,dt:12h')
 * // a T object containing <t>, <dt>
 * // => T { t: t { h: '=9' }, dt: dt { h: '12' } }
 * symbol('unrecognized')
 * // an unrecognized string yields the null symbol ∅
 * // => null
 */
function symbol (str) {
  var s
  if (str == null) {
    // null gets null
    s = null
  } else if (str['start'] && str['end']) {
    // range: with 'start' and 'end'
    s = new symbolConstructors['rT'](str)
  } else if (parseFloat(str) == str) {
    // 'n'
    s = new symbolConstructors['n'](str)
  } else if (str.match(util.reT)) {
    // if is of the T string format t:<val>,dt:<val>
    s = str.match(/\s+/g) ? null : new symbolConstructors['T'](str)
  } else {
    var lem = util.lemma(str)
    s = lem.name ? new symbolConstructors[lem.name](lem.value, lem.name) : null
    // set the canonical word from lemma
    if (s) { s.canon = lem.canon }
  // set the original token for reference
  }
  if (s) { s.token = str }
  return s
}

// console.log(symbol('10'))
// console.log(symbol('hour'))
// console.log(symbol('tonight'))
// console.log(symbol('t:=9h,dt:12h'))
// console.log(symbol('unrecognized'))

// ///////////////////
// the CFG symbols //
// ///////////////////

/**
 * The op for arithmetic operator.
 * note that since scaling(*,/) is very rare, we omit its implementation for now.
 */
function op (value) {
  this.value = value
}

/**
 * The origin operator.
 */
function o (value) {
  this.value = value
}

/**
 * The range operator.
 */
function r (value) {
  this.value = value
}

/**
 * The cron operator.
 */
function c (value) {
  this.value = value
}

/**
 * The n number. Calls parseFloat.
 */
function n (value) {
  this.value = parseFloat(value)
}

/**
 * The t for time t, i.e. a point in the timeline
 * units: ms, s, m, h, d, w, M, y
 * All values are string, to represent the "=" default in the units. so when performing numerical operation, use parseFloat.
 * @example
 * new t(undefined)
 * new t("")
 * // => t {}
 * new t("7h30m")
 * // => t { h: '7', m: '30' }
 * new t("7h=30m")
 * // => t { h: '7', m: '=30' }
 */
function t (value) {
  // guard against falsy input
  if (!value) {
    return null
  }
  // 1. see if unit is prepended with "=" for default, or set to ''
  // 2. then consume chunks of <number><timeUnit> like "30m"
  while (value) {
    var isDefault = (value.match(/^=/) || [])[0] || ''
    value = value.replace(/^=/, '')
    // default number is "1"
    var number = (value.match(/^\-?\d+(\.\d+)?/) || [])[0] || '1'
    value = value.replace(/^\-?\d+(\.\d+)?/, '')
    var unit = (value.match(/^[a-zA-Z]+/) || [])[0]
    value = value.replace(/^[a-zA-Z]+/, '')
    // prepend the number (string) with isDefault, i.e. "=" or ""
    this[unit] = isDefault + number
  }
}

/**
 * The dt for time t, i.e. a displacement in the timeline
 * units: ms, s, m, h, d, w, M, y
 * All values are string, to represent the "=" default in the units. so when performing numerical operation, use parseFloat.
 * Same keys as <t> to allow for component-wise operation, e.g. t + dt = { ms+(d)ms, s+(d)s, ... }
 */
function dt (value) {
  // guard against falsy input
  if (!value) {
    return null
  }
  // 1. see if unit is prepended with "=" for default, or set to ''
  // 2. then consume chunks of <number><timeUnit> like "30m"
  while (value) {
    var isDefault = (value.match(/^=/) || [])[0] || ''
    value = value.replace(/^=/, '')
    // default number is "1"
    var number = (value.match(/^\-?\d+(\.\d+)?/) || [])[0] || '1'
    value = value.replace(/^\-?\d+(\.\d+)?/, '')
    var unit = (value.match(/^[a-zA-Z]+/) || [])[0]
    value = value.replace(/^[a-zA-Z]+/, '')
    // prepend the number (string) with isDefault, i.e. "=" or ""
    this[unit] = isDefault + number
  }
}

// console.log(new t(undefined))
// console.log(new t(""))
// console.log(new t("7h30m"))
// console.log(new t("=7h30m"))
// console.log(new t().constructor.name)

/**
 * The T, implementation-specific, is a linear combination of <t> and <dt>.
 * Used to capture the human Ts, e.g. noon, afternoon, dawn, evening, today, tonight, Sunday, fortnight, weekdays, weekends, christmas, spring, summer, holidays etc.
 * To specify T in maps.json, follow the syntax:
 * `:` means "set", `=` means "default", use t:<value>,dt:<value> for the symbol-value, e.g. "t:=7h,dt:0h"
 * evening ~ t:=7h,dt:12h, read as "t set to default 7h, dt set to 12h"
 * later ~ t:,dt:=3h, read as "t set to nothing, dt set to default 3h"
 * beware, "" and "0" are diferent, the former is empty, the later a numerical value.
 * @param  {string} value from the Symbol.
 * @param  {string} [name] from the Symbol.
 * @example
 * var T = new symbol("t:=7h,dt:0h")
 * // => T { t: t { h: '=7' }, dt: dt { h: '0' } }
 * T.t
 * // => t { h: '=7' }
 * T.dt
 * // => t { h: '0' }
 */
function T (value, name) {
  if (name == 't') {
    this.t = new t(value)
    this.dt = new dt()
  } else if (name == 'dt') {
    this.t = new t()
    this.dt = new dt(value)
  } else {
    var split = value.split(','),
      _t = split[0].split(':').pop(),
      _dt = split[1].split(':').pop()
    this.t = new t(_t)
    this.dt = new dt(_dt)
  }
}

// var T = new T("t:=7h,dt:0h")
// console.log(T.t)
// console.log(T.dt)

/**
 * The product of <r><T>, gives a time interval
 */
function rT (interval) {
  this.start = interval.start
  this.end = interval.end
}

/**
 * The f to capture frequency for <c>.
 */
function f (value) {
  this.value = value
}

/**
 * The product of <c><T> or <c><rT>, gives a cron time
 */
function cT (cron) {
  this.cron = cron
}
