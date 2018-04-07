(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.date = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Expose `Date`
 */

module.exports = require('./lib/parser');

},{"./lib/parser":5}],2:[function(require,module,exports){
/**
 * Module Dependencies
 */

var debug = require('debug')('date:date')

/**
 * Time constants
 */

var _second = 1000
var _minute = 60 * _second
var _hour = 60 * _minute
var _day = 24 * _hour
var _week = 7 * _day
var _year = 56 * _week
var _daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * Expose `date`
 */

module.exports = date

/**
 * Initialize `date`
 *
 * @param {Date} offset (optional)
 * @return {Date}
 * @api publics
 */

function date (offset) {
  if (!(this instanceof date)) return new date(offset)
  this._changed = {}
  this.date = new Date(offset)
}

/**
 * Clone the current date
 */

date.prototype.clone = function () {
  return new Date(this.date)
}

/**
 * Has changed
 *
 * @param {String} str
 * @return {Boolean}
 */

date.prototype.changed = function (str) {
  if (this._changed[str] === undefined) return false
  return this._changed[str]
}

/**
 * add or subtract seconds
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.second = function (n) {
  var seconds = +n * _second
  this.update(seconds)
  this._changed['seconds'] = true
  return this
}

/**
 * add or subtract minutes
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.minute = function (n) {
  var minutes = +n * _minute
  this.update(minutes)
  this._changed['minutes'] = true
  return this
}

/**
 * add or subtract hours
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.hour = function (n) {
  var hours = +n * _hour
  this.update(hours)
  this._changed['hours'] = true
  return this
}

/**
 * add or subtract days
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.day = function (n) {
  var days = +n * _day
  this.update(days)
  this._changed['days'] = true
  return this
}

/**
 * add or subtract weeks
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.week = function (n) {
  var weeks = +n * _week
  this.update(weeks)
  this._changed['weeks'] = true
  return this
}

/**
 * add or subtract months
 *
 * @param {Number} n
 * @return {Date}
 */

date.prototype.month = function (n) {
  var d = this.date
  var day = d.getDate()
  d.setDate(1)
  var month = +n + d.getMonth()
  d.setMonth(month)

  // Handle dates with less days
  var dim = this.daysInMonth(month)
  d.setDate(Math.min(dim, day))
  return this
}

/**
 * get the days in the month
 */

date.prototype.daysInMonth = function (m) {
  var dim = _daysInMonth[m]
  var leap = leapyear(this.date.getFullYear())
  return (1 == m && leap) ? 29 : 28
}

/**
 * add or subtract years
 *
 * @param {Number} n
 * @return {date}
 */

date.prototype.year = function (n) {
  var yr = this.date.getFullYear()
  yr += +n
  this.date.setFullYear(yr)
  this._changed['years'] = true
  return this
}

/**
 * Set the time
 *
 * @param {String} h
 * @param {String} m
 * @param {String} s
 * @return {date}
 */

date.prototype.time = function (h, m, s, meridiem) {
  if (h === false) {
    h = this.date.getHours()
  } else {
    h = +h || 0
    this._changed['hours'] = h
  }

  if (m === false) {
    m = this.date.getMinutes()
  } else {
    m = +m || 0
    this._changed['minutes'] = m
  }

  if (s === false) {
    s = this.date.getSeconds()
  } else {
    s = +s || 0
    this._changed['seconds'] = s
  }

  this.date.setHours(h, m, s)
  return this
}

/**
 * Dynamically create day functions (sunday(n), monday(n), etc.)
 */

var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
days.forEach(function (day, i) {
  date.prototype[days[i]] = function (n) {
    this._changed['days'] = true
    this.updateDay(i, n)
  }
})

/**
 * go to day of week
 *
 * @param {Number} day
 * @param {Number} n
 * @return {date}
 */

date.prototype.updateDay = function (d, n) {
  n = +(n || 1)
  var diff = (d - this.date.getDay() + 7) % 7
  if (n > 0) --n
  diff += (7 * n)
  this.update(diff * _day)
  return this
}

/**
 * Update the date
 *
 * @param {Number} ms
 * @return {Date}
 * @api private
 */

date.prototype.update = function (ms) {
  this.date = new Date(this.date.getTime() + ms)
  return this
}

/**
 * leap year
 *
 * @param {Number} yr
 * @return {Boolean}
 */

function leapyear (yr) {
  return (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0
}

},{"debug":10}],3:[function(require,module,exports){
module.exports={
  "op": {
    "plus": ["and", "plus", "+", "add", "on"],
    "minus": ["minus", "subtract"],
    "times": ["times", "multiply"],
    "divide": ["divide"]
  },
  "o": {
    "plus": ["at", "in", "past", "late", "later", "after", "next", "from", "start", "starting", "since", "coming"],
    "minus": ["last", "minus", "subtract", "ago", "before", "from"]
  },
  "n": {
    "0.25": ["quarter"],
    "0.5": ["half", "1/2", "half an"],
    "0": ["zero"],
    "1": ["one", "a", "an", "first"],
    "2": ["two", "second"],
    "3": ["three", "third"],
    "4": ["four", "fourth"],
    "5": ["five", "fifth"],
    "6": ["six", "sixth"],
    "7": ["seven", "seventh"],
    "8": ["eight", "eighth"],
    "9": ["nine", "ninth"],
    "10": ["ten", "tenth"],
    "11": ["eleven", "eleventh"],
    "12": ["twelve", "twelveth"],
    "13": ["thirteen", "thirteenth"],
    "14": ["fourteen", "fourteenth"],
    "15": ["fifteen", "fifteenth"],
    "16": ["sixteen", "sixteenth"],
    "17": ["seventeen", "seventeenth"],
    "18": ["eighteen", "eighteenth"],
    "19": ["nineteen", "nineteenth"],
    "20": ["twenty", "twentieth"],
    "30": ["thirty", "thirtieth"],
    "40": ["fourty", "fourtieth"],
    "50": ["fifty", "fiftieth"],
    "60": ["sixty", "sixtieth"],
    "70": ["seventy", "seventieth"],
    "80": ["eighty", "eightieth"],
    "90": ["ninety", "ninetieth"],
    "100": ["hundred", "hundreds", "hundredth"],
    "1000": ["thousand", "thousands", "thousandth", "k", "K"]
  },
  "t": {
  },
  "dt": {
    "s": ["second", "seconds", "s", "sec", "secs"],
    "m": ["minute", "minutes", "m", "min", "mins"],
    "h": ["hour", "hours", "h", "hr", "hrs"],
    "d": ["day", "days", "d", "dai"],
    "w": ["week", "weeks", "w", "wk", "wks"],
    "M": ["month", "months", "monthes", "M", "mo", "moon", "moons"],
    "y": ["year", "years", "y", "yr", "yrs"]
  },
  "T": {
    "t:,dt:=3h": ["later", "soon"],
    "t:=1d,dt:": ["st", "nd", "rd", "th", "st day", "nd day", "rd day", "th day"],
    "t:,dt:1w": ["st week", "nd week", "rd week", "th week"],
    "t:,dt:14d": ["day", "fortnight"],
    "t:=0h=0m=0s1mer,dt:": ["pm", "p.m", "p.m.", "noon"],
    "t:,dt:1d": ["tomorrow", "tmr"],
    "t:,dt:-1d": ["yesterday", "ytd"],
    "t:,0dt:": ["today"],
    "t:=2h=0m=0s1mer,dt:": ["afternoon"],
    "t:=6h=0m=0s0mer,dt:": ["dawn"],
    "t:=7h=0m=0s0mer,dt:": ["am", "a.m", "a.m."],
    "t:=7h=0m=0s1mer,dt:": ["evening"],
    "t:=8h=0m=0s0mer,dt:": ["morning"],
    "t:=9h=0m=0s1mer,dt:": ["tonight", "night"],
    "t:=0h=0m=0s0mer,dt:1d": ["midnight"],
    "t:,dt:=0w0wd": ["sunday", "sun"],
    "t:,dt:=0w1wd": ["monday", "mon"],
    "t:,dt:=0w2wd": ["tuesday", "tue", "tues"],
    "t:,dt:=0w3wd": ["wednesday", "wed"],
    "t:,dt:=0w4wd": ["thursday", "thu", "thur", "thurs"],
    "t:,dt:=0w5wd": ["friday", "fri"],
    "t:,dt:=0w6wd": ["saturday", "sat"],
    "t:1M=1d,dt:": ["january", "jan"],
    "t:2M=1d,dt:": ["february", "feb"],
    "t:3M=1d,dt:": ["march", "mar"],
    "t:4M=1d,dt:": ["april", "apr"],
    "t:5M=1d,dt:": ["may"],
    "t:6M=1d,dt:": ["june", "jun"],
    "t:7M=1d,dt:": ["july", "jul"],
    "t:8M=1d,dt:": ["august", "aug"],
    "t:9M=1d,dt:": ["september", "sept", "sep"],
    "t:10M=1d,dt:": ["october", "oct"],
    "t:11M=1d,dt:": ["november", "nov"],
    "t:12M=1d,dt:": ["december", "dec"],
    "t:12M25d,dt:": ["christmas"]
  },
  "f": {
    "1": ["once"],
    "2": ["twice"]
  }
}

},{}],4:[function(require,module,exports){
// Production rule module for the CFG
// !leap year
// !proper carry considering # of days per month

/**
 * Module Dependencies
 */

var _ = require('./subdash')
var util = require('./util')
var symbol = require('./symbol')
var tokenize = require('./tokenize')

/**
 * Export `norm`
 */

module.exports = norm

// a partial implementation of norm
/**
 * Preprocess a string using the human language for time CFG, return a triple of original str, preprocessed tokens, and the normal forms (extracted dates in normal forms)
 */
function norm (str, offset) {
  try {
    // Production rules: CFG algorithm for human language for time
    var tokObj = tokenize(str)
    // console.log('p#0: parse normal forms', tokObj)
    var syms = pickTokens(tokObj.symbols) || []
    // console.log('p#0: remove nulls, pick tokens', syms)
    syms = reduce(syms, ['n', 'n'])
    // console.log('p#1: arithmetics: <n1>[<op>]<n2> ~ <n>, + if n1 > n2, * else', syms)
    syms = nTnRedistribute(syms)
    // console.log('p#2: redistribute, <n1><T1>[<op>]<n2><!T2> ~ <n1>[<op>]<n2> <T1>', syms)
    syms = reduce(syms, ['o', 'o'])
    // console.log('p#3: <o><o> ~ <o>*<o>', syms)

    // preprocessing ends, now format output
    var restored = restoreTokens(syms, tokObj)
    return restored
  } catch (e) {
    return {
      str: str,
      tokens: [],
      normals: []
    }
  }

}

/**
 * format a preprocessed array of symbols back into string, using some info from tokObj
 */
function restoreTokens (syms, tokObj) {
  var tokens = [],
    normals = [],
    tokensOut = tokObj.tokensOut,
    tokensIn = tokObj.tokensIn

  syms = util.removeTnPlus(syms)
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i],
      sName = util.sName(s),
      token = ''
    switch (sName) {
      case 'n':
        // if token is already numeric, use it
        token = (s.token.match(/^\s*[\d\.\-\+]+\s*$/)) ? s.token.trim() : s.value.toString()
        break
      case 'T':
        // handles shits like 1 am ~ t:1h00m,dt:, am (token returned)
        token = restoreNormal(s)
        break
      default:
        // the other cases like op, o, cron, range
        token = s.token.toString()
    }

    // extract the protected normal string
    if (typeof token == 'string') {
      tokens.push(token)
    } else {
      // get protected normal forms
      normals.push(token.normal)
    }
  }
  return {
    tokens: tokens,
    str: tokens.join(' ').replace(/\s+/g, ' '),
    normals: normals
  }
}

/**
 * Given a T symbol, try to restore its normal form (return wrapped in JSON if it's a complete date string {normal: <normal string>}), or just return the plain string as token
 */
function restoreNormal (T) {
  var token = T.token
  if (token.match(util.reT)) {
    // if it is normal form, convert back into the normal1 or normal2 strings
    var split = util.splitT(token)
    if (_.includes(split, undefined)) {
      // if it's normal2 form
      // either it's a date or time
      var dateArr = split.slice(0, 3),
        timeArr = split.slice(3)
      if (timeArr[0] != undefined) {
        // check time first, it's first signature (hour) is defined
        // return hh:mm
        return util.TtoStdT(token).match(/(\d+\:\d+)/)[1]
      } else {
        // else it's a date, parse arr and return complete stdT instead
        // return wrapped in JSON if it's a complete date string
        return { normal: util.TtoStdT(token) }
      }
    } else {
      // if it's normal1 form, use TtoStd
      // return wrapped in JSON if it's a complete date string
      return { normal: util.TtoStdT(token) }
    }
  } else if (!util.has_t(T) && util.has_dt(T) && util.has_pureTimeUnit(T)) {
    // handle pure dt: T that are purel displacement, e.g. week, fortnight
    var dtStr = '',
      units = _.keys(T.dt),
      dt = T.dt
    // accumulate dtStr
    for (var i = 0; i < units.length; i++) {
      var u = units[i],
        kval = parseFloat(dt[u]),
        // set number has default, or is 0, 1
        numStr = (kval != dt[u] || kval == 0 || Math.abs(kval) == 1) ? '' : dt[u].toString() + ' '

      // set canon from lemma only if it exists, and key is word, else use u
      var canon = u
      if (T.canon != undefined) {
        // and if it's also a timeUnit
        canon = T.canon
      } else {
        // get the lemma for u, its canon and key
        var lemma = util.lemma(u),
          lemmaCanon = lemma.canon,
          lemmaKey = lemma.value
        if (lemmaKey && lemmaKey.match(/^\w+$/)) { canon = lemmaCanon }
      }
      // set the units, number, and canonical form of the unit
      dtStr = dtStr + numStr + canon + ' '
    }
    return dtStr
  } else {
    // else it's just plain english, return
    return token
  }
}
// var fakes = { t: { h: '1', m: '00' }, dt: {}, token: 't:1h00m,dt:' }
// var fakes = { t: { M: '12', d: '25', m: '00' }, dt: {}, token: 't:12M25d00m,dt:' }
// console.log(restoreNormal(fakes))

/**
 * !Backburner for future extension: Main method: Run the CFG algorithm to parse the string, return JSON of {input, output, diffStr}. Normalize the string before Matt's algorithm runs it.
 * @example
 * var str = 'having lunch today at 3 hours after 9am'
 * norm(str)
 * // => { input: 'having lunch today at 3 hours after 9am',
 *  output: '2016-03-04T05:00:09Z',
 *  difference: 'having lunch' }
 */
function CFGproduce (str, offset) {
  // try all the below till all is elegantly fixed
  var diffStr = str,
    finalStr = null,
    output = str
  // Production rules: CFG algorithm for human language for time
  // p#0: tokenize, remove nulls, pick tokens
  var tokObj = tokenize(str)
  var syms = pickTokens(tokObj.symbols)
  // console.log('p#0: parse normal forms, remove nulls, pick tokens', tokObj)

  try {
    syms = reduce(syms, ['n', 'n'])
    // console.log('p#1: arithmetics: <n1>[<op>]<n2> ~ <n>, + if n1 > n2, * else', syms)
    syms = nTnRedistribute(syms)
    // console.log('p#2: redistribute, <n1><T1>[<op>]<n2><!T2> ~ <n1>[<op>]<n2> <T1>', syms)
    output = util.tokenToStr(syms)

    // !okay replace back the normal forms in the str

    // // !Till future completion: Mute from below
    // syms = reduce(syms, ['n', 'T'])
    // // console.log('p#3: <n>[<op>]<T> ~ <T>, * if dt, + if t', syms)
    // syms = reduce(syms, ['T', 'T'])
    // // console.log('p#4: <T>[<op>]<T> ~ <T>', syms)
    // syms = nDefTSyms(syms)
    // // console.log('p#5: defaulter <o> <n> <o> ~ <o> <T> <o>, d defaults to t:h', syms)
    // syms = reduce(syms, ['o', 'o'])
    // // console.log('p#6: <o><o> ~ <o>*<o>', syms)
    // syms = autoHourModding(syms)
    // syms = weekModding(syms, offset)
    // // console.log('p#7: modding: meridiem, weeks', syms)
    // syms = optReduce(syms, ['T', 'T'], ['o'], null, symbol(util.nowT(offset)))
    // // console.log('p#8: <T><o><T> ~ <T>', syms)

    // // !future:
    // // syms = reduce(syms, ['T'], ['r'])
    // // syms = reduce(syms, ['f', 'T', 'rT'], ['c'])

    // console.log('tokObj', tokObj)
    syms = finalizeT(syms, offset)
    // console.log('p#9: finalizeT with origin', syms)

    finalStr = symsToStdT(syms, offset)
    // console.log('finalStr', finalStr)

  } catch (e) {}
  // extract the tokens for difference string later
  // diffStr = util.unparsedStr(tokObj.str, tokObj.symbols)
  // console.log('diffStr', diffStr)
  // !convert dt into proper terms

  return {
    input: str,
    // output: new Date(finalStr),
    output: output,
    difference: diffStr
  }

}

/**
 * Production rule #0: pick tokens, remove nulls.
 * 1. break into chunks of arrs delimited by triple-null-or-more
 * 2. reorder chunks by arr length
 * 3.1 init candidate = []
 * 3.2 pull and push the chunks not containing <T> into candidate
 * 3.3 pull and push the chunks containing <T> into candidate
 * 4. pick the last candidate
 */
function pickTokens (syms) {
  // 1. 2. 3.
  var delimited = util.delimSyms(syms),
    chunks = util.splitSyms(delimited, 'trinull'),
    candidates = util.orderChunks(chunks)
  // 4.
  return candidates.pop()
}

/**
 * Reduce an array of symbols with binary operations between permissible symbols.
 * @param  {Array} syms   Array of input symbols
 * @param  {Array} varArr String names of permissible variables.
 * @param  {Array} opArr  String names of permissible operations.
 * @return {Array}        The reduced result.
 */
function reduce (syms, varArr, opArr) {
  if (syms.length < 2) {
    return syms
  }
  // the operator arrays
  var opArr = opArr || ['op']
  // endmark for handling last symbol
  syms.push('null')
  // the result, past-pointer(previous non-null symbol), default-op, current-op, and whether current-op is inter-symbol op, i.e. will not be used up
  var res = [],
    past = null,
    defOp = null,
    op = defOp,
    interOp = false
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (!past || !s) {
      // edge case or null
      if (i == 0) { past = s; }
    } else if (util.isSym(s, opArr)) {
      // s is an op. mark op as won't be used yet
      op = s
      interOp = true
    // the nDefT for when past = 'n', s = 'o'
    } else if (util.isSym(past, [varArr[0]]) && util.isSym(s, [varArr[1]])) {
      // s and past are operable variables specified by varArr
      past = execOp(past, op, s)
      // reset after op is used
      op = defOp
      interOp = false
    } else {
      // no further legal operation made, push and continue
      // change of class, past is finalized, push to res
      res.push(past)
      if (Array.isArray(past)) {
        // if past was returned from execOp as array (not executed), then flatten it and dont push op to res, since it's already included in op
        res = _.flatten(res)
      } else {
        // if inter-op (not used), push a clone (prevent overwrite later)
        if (interOp) { res.push(symbol(op.value)) }
      }
      // reset
      op = defOp
      interOp = false
      past = s
    }
  }
  return res
}

/**
 * Optional reduce: similar to reduce() but either argument is optional.
 * algorithm: return a T
 * 1. for each t, dt, do:
 * 2. for each key in union of keys for Lt, Rt, do:
 * 3. _Rt = _Rt op _Lt
 * @param  {Array} syms   Array of input symbols
 * @param  {Array} varArr String names of permissible variables.
 * @param  {Array} opArr  String names of permissible operations.
 * @param  {symbol} Ldef   default for left argument
 * @param  {symbol} Rdef   default for right argument
 * @return {Array}        The reduced result.
 */
function optReduce (syms, varArr, opArr, Ldef, Rdef) {
  if (syms.length < 2) {
    return syms
  }
  // use peek
  var res = [],
    sum = null,
    L = null,
    R = null
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (util.isSym(s, opArr)) {
      if (sum == null) {
        L = syms[i - 1]
        sum = (util.isSym(L, [varArr[0]])) ? L : Ldef
      }
      R = syms[i + 1]
      // if is var skip it since will be consumed
      if (util.isSym(R, [varArr[1]])) { i++; }
      // else reset to default
      else { R = Rdef; }
      // compute:
      sum = execOp(sum, s, R)
      // before loop quits due to possible i++, push the last
      if (i == syms.length - 1) {
        res.push(sum)
      }
    } else {
      // s is not opArr, can't have been varArr either
      // edge case: at first dont push
      if (i > 0) {
        res.push(sum)
        res.push(s)
        sum = null
      }
    }
  }
  return res
}

/**
 * Execute non-commutative operation between 2 argument symbols and an op symbol; carry out respective ops according to symbol names.
 * @param  {symbol} L  Left argument
 * @param  {symbol} op operation
 * @param  {symbol} R  Right argument
 * @param  {str} offset The time origin offset
 * @return {symbol}    Result
 */
function execOp (L, op, R, offset) {
  var otype = util.opType(L, op, R),
    res = null
  if (_.includes(['nn'], otype)) {
    res = nnOp(L, op, R)
  } else if (_.includes(['nT'], otype)) {
    res = nTOp(L, op, R)
  } else if (_.includes(['TT'], otype)) {
    res = TTOp(L, op, R)
  } else if (_.includes(['ToT', 'oT', 'To'], otype)) {
    res = ToTOp(L, op, R, offset)
  } else if (_.includes(['oo'], otype)) {
    res = ooOp(L, R)
  } else if (_.includes(['rT', 'TrT'], otype)) {
    // has optional arg
    res = rTOp(L, R)
  } else if (_.includes(['cT', 'fcT', 'crT', 'fcrT'], otype)) {
    // has optional arg
    res = cTOp(L, R)
  } else {
    // not executable, e.g. not in the right order, return fully
    res = (op == null) ? [L, R] : [L, op, R]
  }
  return res
}

/**
 * Atomic binary arithmetic operation on the numerical level, with default overriding the argument prepended with '='.
 * @param  {string|Number} Lval The left argument value.
 * @param  {symbol} op   The op symbol
 * @param  {string|Number} Rval The right argument value.
 * @return {Number}      Result from the operation.
 */
function atomicOp (Lval, op, Rval, dontOp) {
  dontOp = dontOp || false
  var oName = op.value
  if (Lval == undefined) {
    // if L is missing, R must exist tho
    return (oName == 'minus') ? Rval.toString().replace(/(\d)/, '-$1') : Rval
  } else if (Rval == undefined) {
    // if L exists, be it def or not, R missing
    return Lval
  } else {
    // or R exist or is default (parse to NaN), L can be default too but ignore then
    var defL = Lval.toString().match(/^=/),
      defR = Rval.toString().match(/^=/)
    var l = parseFloat(Lval.toString().replace(/^=/, '')),
      r = parseFloat(Rval.toString().replace(/^=/, ''))
    if (defL && defR) {
      // if both are default, return r 'last come last serve'
      return r
    } else if (defL && !defR) {
      // if either default, return the non-default
      return r
    } else if (!defL && defR) {
      return l
    } else {
      // none default
      if (dontOp) {
        // if is a don't operate together, i.e. for t, just return l
        // 'first come first serve'
        return l
      } else {
        // make the into proper floats first
        if (oName == 'minus') {
          return l - r
        } else if (oName == 'plus') {
          return l + r
        } else if (oName == 'times') {
          return l * r
        } else if (oName == 'divide') {
          return l / r
        }
      }
    }
  }
}

/**
 * p#1: arithmetics: <n1>[<op>]<n2> ~ <n>, + if n1 > n2, * else
 */
function nnOp (L, op, R) {
  var l = L.value,
    r = R.value
  // set the default op according to value in nn op
  if (l > r) {
    op = op || symbol('plus')
  } else {
    op = op || symbol('times')
  }
  var res = atomicOp(l, op, r)
  return symbol(res)
}

/**
 * p#2: redistribute, <n1><T1>[<op>]<n2><!T2> ~ <n1>[<op>]<n2> <T1>
 * algorithm: note that from previous steps no <n>'s can occur adjacently
 * 1. scan array L to R, on each <n> found:
 * 2.1 if its R is <T>, continue
 * 2.2 else, this is the target. do:
 * 3.1 init carry = []. remove and push <n> into carry,
 * 3.2 if its L is <op>, remove and prepend <op> into carry,
 * 4.1 find the first <n> to the left, if not <n>, drop the carry and continue
 * 4.2 else merge the carry after the <n>
 * 5. At the end of loop, rerun production rule #1
 */
function nTnRedistribute (syms) {
  if (syms.length < 2) {
    return syms
  }
  // 1.
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (util.sName(s) != 'n') {
      continue
    }
    // 1.

    var R = syms[i + 1]
    if (util.sName(R) == 'T') {
      continue
    }
    // 2.2

    // 3.1 prepare the carry
    var carry = []
    // 3.2 the Left symbol
    var L = syms[i - 1],
      Li = -1
    if (util.sName(L) == 'op') {
      // if L is an 'op', remember to pull it later
      Li = i - 1
    }
    // 4.1
    // find L...L of L that is 'n'
    var LLi = _.findLastIndex(syms.slice(0, i - 1), function (Ls) {
      return util.sName(Ls) == 'n'
    })
    if (!syms[LLi] || util.sName(syms[LLi + 1]) != 'T') {
      // if can't find 'n' (index = -1), or the R of 'n' isn't T, abort mission
      // syms.splice(i, 0, carry)
    } else {
      // 4.2
      // else, pull s at [i], optional L at [Li], and push at LLi+1
      carry.push(_.pullAt(syms, i)[0])
      if (Li != -1) {
        carry.unshift(_.pullAt(syms, Li)[0])
      }
      syms.splice(LLi + 1, 0, carry)
      syms = _.flatten(syms)
    }
  }

  // 5. redo the <n><n> op
  syms = reduce(syms, ['n', 'n'])
  return syms
}

/**
 * p#3: <n>[<op>]<T> ~ <T>, * if dt, + if t
 * 1. if t can be overidden, start from the highest unit set to n, then return.
 * 2. otherwise, if <dt> not empty, <n><dt> = <n>*<dt>, then return
 * 3. else, if <t> not empty, <n><t> = <n>+<t>, then return
 */
function nTOp (nL, op, TR) {
  var tOverrideUnit = util.highestOverride(TR.t)
  if (tOverrideUnit) {
    // 1.
    TR.t[tOverrideUnit] = nL.value
  } else if (_.keys(TR.dt).length) {
    // 2.
    op = op || symbol('times')
    for (var k in TR.dt) {
      if (k == 'wd') {
        continue
      }
      TR.dt[k] = atomicOp(nL.value, op, TR.dt[k])
    }
  } else if (_.keys(TR.t).length) {
    // 3.
    op = op || symbol('plus')
    for (var k in TR.t) {
      TR.t[k] = atomicOp(nL.value, op, TR.t[k])
    }
  }
  return TR
}

/**
 * p#4: <T>[<op>]<T> ~ <T>
 */
function TTOp (TL, op, TR) {
  // set the default op
  op = op || symbol('plus')
  // util.sName
  // mutate into TL
  for (var k in TR.t) {
    // okay done add absolute time, just as you don't add origins together put u take gradual specificity, the 'true' param for dontOp if exist, return r
    // override default tho, taken care of by atomic
    TL.t[k] = atomicOp(TL.t[k], op, TR.t[k], true)
  }
  for (var k in TR.dt) {
    if (k == 'wd') {
      continue
    }
    TL.dt[k] = atomicOp(TL.dt[k], op, TR.dt[k])
  }
  return TL
}

/**
 * p#5: defaulter <o> <n> <o> ~ <o> <T> <o>, d defaults to t:h
 */
function nDefTSyms (syms) {
  var res = []
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    res.push(util.isSym(s, ['n']) ? nDefT(s) : s)
  }
  return res
}

/**
 * Helper: default a singlet n to T, i.e. next available hour
 */
function nDefT (n) {
  var deft = symbol('t:1h,dt:')
  var nVal = n.value
  var currentHour = new Date().getHours()
  var nextnVal = Math.floor(currentHour / 12) * 12 + nVal
  var tHour = execOp(symbol(nextnVal), symbol('times'), deft)
  return tHour
}

/**
 * <o><o> ~ <o>*<o>
 * To handle 'before next' etc.
 */
function ooOp (L, R) {
  var Lsign = (L.value == 'plus') ? +1 : -1,
    Rsign = (R.value == 'plus') ? +1 : -1,
    LRsign = Lsign * Rsign
  return (LRsign > 0) ? symbol('after') : symbol('before')
}

/**
 * Next available T', given an offset, by incrementing in dt the next unit ++1 from the current largest unit in t.
 */
function nextAvailable (T, offset) {
  // find the current largest and next largest unit
  var nextUnit = util.nextLargestUnit(T)

  // first finalized T
  var finT1 = finalizeT([T], offset)[0],
    stdStr1 = util.TtoStdT(finT1),
    UTC1 = Date.parse(stdStr1),
    UTCnow = Date.parse(new Date()),
    UTCdiff = UTC1 - UTCnow
  // if UTC1 is not in the future, add next unit
  if (UTCdiff < 0) {
    T.dt[nextUnit] = (T.dt[nextUnit] || 0) + 1
    var finT2 = finalizeT([T], offset)[0]
    return finT2
  } else {
    return finT1
  }
}

/**
 * p#6: <T><o><T> ~ <T>
 */
function ToTOp (L, op, R, offset) {
  if (L && !R) {
    // if R is missing, set to now
    R = symbol(util.nowT(offset))
  } else if (!L && R) {
    // if L missing
    if (util.has_t(R)) {
      // if R has t => part of origin, so L shd be the according dt
      var nextUnit = util.nextLargestUnit(R)
      R = nextAvailable(R, offset)
      // so arbitrarily set as 0.5 * next largest unit
      L = execOp(symbol(0.5), symbol('times'), symbol(nextUnit))
    } else {
      // R has dt only, make L an origin then
      L = symbol(util.nowT(offset))
    }
  } else if (!L && !R) {
    L = symbol(util.nowT(offset))
    R = symbol(util.nowT(offset))
  }

  var Ttype = ['t', 'dt']
  for (var i = 0; i < Ttype.length; i++) {
    var _Ttype = Ttype[i],
      // the dontOp for 't'
      dontOp = (_Ttype == 't')
    var concatKeys = _.keys(L[_Ttype]).concat(_.keys(R[_Ttype]))
    var keys = _.unique(concatKeys)
    for (var j = 0; j < keys.length; j++) {
      var k = keys[j]
      // run atomic op, note the reversed order of R op L
      R[_Ttype][k] = atomicOp(R[_Ttype][k], op, L[_Ttype][k], dontOp)
    }
  }
  return R
}

/**
 * p#7: auto-hour-modding: t:h mod 12
 * then add the meridiem to t:h if exist
 */
function autoHourModding (syms) {
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (util.isSym(s, ['T'])) {
      if (syms[i]['t']['h']) {
        // if t has 'h', mod it
        var value = syms[i]['t']['h'].toString()
        var isDefault = (value.match(/^=/) || [])[0] || ''
        value = parseFloat(value.replace(/^=/, ''))
        value = value > 12 ? value % 12 : value
        syms[i]['t']['h'] = isDefault + value
      }
      // apply the non-0 meridiem after modding:
      if (syms[i]['t']['mer']) {
        var dt_h = (syms[i]['dt']['h'] || '0').toString()
        // dump default at last
        dt_h = dt_h.replace(/^=/, '')
        if (syms[i]['t']['mer'] == 1) {
          syms[i]['dt']['h'] = parseFloat(dt_h) + 12
        }
        // delete mer
        delete syms[i]['t']['mer']
      }
    }
  }
  return syms
}

// do it at last, to use like '2nd week of march'
function weekModding (syms, offset) {
  // weekday of the offset to calculate dt:d
  var offsetWD = new Date(util.TtoStdT(util.nowT())).getDay()
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (util.isSym(s, ['T'])) {
      if (syms[i]['dt']['wd']) {
        // if dt has 'wd', mod it and turn into dt:d + %wd
        var WD = parseInt(syms[i]['dt']['wd'])
        var diffWD = (WD - offsetWD) % 7
        if (diffWD < 0) { diffWD = diffWD + 7 }
        syms[i]['dt']['d'] = (syms[i]['dt']['d'] || 0) + diffWD
        delete syms[i]['dt']['wd']
      }
    }
  }
  return syms
}

/**
 * p#8: Finalize each T in syms array:
 * 1. remove defaults from T
 * 2. add origin symbol.nowT() with given T.t, override missing units
 * 3. add t and dt
 */
function finalizeT (syms, offset) {
  // remove defaults
  for (var i = 0; i < syms.length; i++) {
    syms[i] = removeDefaults(syms[i])
  }
  // default with origin at end
  syms.push(symbol(util.nowT(offset)))
  syms = reduce(syms, ['T', 'T'])
  // combine t and dt
  var newSyms = []
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i],
      sum = tdtAdd(s)
    sum.token = util.TtoStr(sum)
    newSyms.push(tdtAdd(s))
  }
  return syms
}

/**
 * remove the defaults before adding with origin
 */
function removeDefaults (T) {
  for (var k in T.dt) {
    T.dt[k] = T.dt[k].toString().replace(/^=/, '')
  }
  for (var k in T.t) {
    T.t[k] = T.t[k].toString().replace(/^=/, '')
  }
  // delete meridiem too
  delete T['t']['mer']

  return T
}

/**
 * add t and dt within a T together, delete the dt keys
 */
function tdtAdd (T) {
  // guard for non-T
  if (!util.isSym(T, ['T'])) {
    return T
  }
  for (var k in T.dt) {
    // absolute add, disregard defaults
    var t_k = (T.t[k] == undefined) ? 0 : T.t[k],
      dt_k = T.dt[k]
    // cleanup the default
    t_k = t_k.toString().replace(/^=/, '')
    dt_k = dt_k.toString().replace(/^=/, '')
    var sum = parseFloat(t_k) + parseFloat(dt_k)
    // set the result, remove used dt
    T.t[k] = sum
    delete T.dt[k]
  }
  return T
}

/**
 * p#9: Convert an array of symbols to normalized stdT strings.
 * if token was normal form already, parse into stdT.
 * if is n: return n.value
 * else return org token
 */
function symsToStdT (syms, offset) {
  var tokens = []
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i],
      token = s.token.toString()
    // default, don't switch unless:
    if (util.isSym(s, ['n'])) {
      token = s.value
    } else if (token.match(util.reT)) {
      // is normal T form
      token = util.TtoStdT(token, offset)
    }
    tokens.push(token)
  }
  return tokens.join(' ')
}

/**
 * !to be implemented for range
 */
function rTOp (L, R) {
  var start, end
  if (!R) {
    start = symbol(util.nowT())
    end = L
  } else {
    start = L
    end = R
  }
  return symbol({ start: start, end: end })
}

/**
 * !to be implemented for cron
 */
function cTOp (L, R) {}

},{"./subdash":6,"./symbol":7,"./tokenize":8,"./util":9}],5:[function(require,module,exports){
/**
 * Module Dependencies
 */

var debug = require('debug')('date:parser')
var date = require('./date')
var norm = require('./norm')

/**
 * Days
 */

var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
  'october', 'november', 'december'
]

/**
 * Regexs
 */

// 5, 05, 5:30, 5.30, 05:30:10, 05:30.10, 05.30.10, at 5
var rMeridiem = /^(\d{1,2})([:.](\d{1,2}))?([:.](\d{1,2}))?\s*([ap]m)/
var rHourMinute = /^(\d{1,2})([:.](\d{1,2}))([:.](\d{1,2}))?/
var rAtHour = /^at\s?(\d{1,2})$/
var rDays = /\b(sun(day)?|mon(day)?|tues(day)?|wed(nesday)?|thur(sday|s)?|fri(day)?|sat(urday)?)s?\b/
var rMonths = /^((\d{1,2})\s*(st|nd|rd|th))\s(day\s)?(of\s)?(january|february|march|april|may|june|july|august|september|october|november|december)/i
var rPast = /\b(last|yesterday|ago)\b/
var rDayMod = /\b(morning|noon|afternoon|night|evening|midnight)\b/
var rAgo = /^(\d*)\s?\b(second|minute|hour|day|week|month|year)[s]?\b\s?ago$/

/**
 * Expose `parser`
 */

module.exports = parser

/**
 * Initialize `parser`
 *
 * @param {String} str
 * @return {Date}
 * @api publics
 */

function parser (str, offset) {
  if (!(this instanceof parser)) return new parser(str, offset)
  if (typeof offset == 'string') offset = parser(offset)

  // CFG preprocessing into normalized format,
  // get {str, tokens, normals}
  // !future: return multiple parsed times, some from it
  var prepro = norm(str, offset)
  // console.log(prepro)
  // reset the str to prepro str
  str = prepro.str
  // if proprocessed doesn't leave any str to be processed (non-date-time) format, check normals
  if (!str) {
    if (prepro.normals.length) {
      // if there's normal date parsed already,
      // !return the first
      return new Date(prepro.normals[0])
    } else {
      // otherwise go back to below to return proper Error
      str = str
    }
  }

  var d = offset || new Date
  this.date = new date(d)
  this.original = str
  this.str = str.toLowerCase()
  this.stash = []
  this.tokens = []
  while (this.advance() !== 'eos')
  debug('tokens %j', this.tokens)
  this.nextTime(d)
  if (this.date.date == d) throw new Error('Invalid date')
  return this.date.date
}

/**
 * Advance a token
 */

parser.prototype.advance = function () {
  var tok = this.eos()
    || this.space()
    || this._next()
    || this.last()
    || this.dayByName()
    || this.monthByName()
    || this.timeAgo()
    || this.ago()
    || this.yesterday()
    || this.tomorrow()
    || this.noon()
    || this.midnight()
    || this.night()
    || this.evening()
    || this.afternoon()
    || this.morning()
    || this.tonight()
    || this.meridiem()
    || this.hourminute()
    || this.athour()
    || this.week()
    || this.month()
    || this.year()
    || this.second()
    || this.minute()
    || this.hour()
    || this.day()
    || this.number()
    || this.string()
    || this.other()

  this.tokens.push(tok)
  return tok
}

/**
 * Lookahead `n` tokens.
 *
 * @param {Number} n
 * @return {Object}
 * @api private
 */

parser.prototype.lookahead = function (n) {
  var fetch = n - this.stash.length
  if (fetch == 0) return this.lookahead(++n)
  while (fetch-- > 0) this.stash.push(this.advance())
  return this.stash[--n]
}

/**
 * Lookahead a single token.
 *
 * @return {Token}
 * @api private
 */

parser.prototype.peek = function () {
  return this.lookahead(1)
}

/**
 * Fetch next token including those stashed by peek.
 *
 * @return {Token}
 * @api private
 */

parser.prototype.next = function () {
  var tok = this.stashed() || this.advance()
  return tok
}

/**
 * Return the next possibly stashed token.
 *
 * @return {Token}
 * @api private
 */

parser.prototype.stashed = function () {
  var stashed = this.stash.shift()
  return stashed
}

/**
 * Consume the given `len`.
 *
 * @param {Number|Array} len
 * @api private
 */

parser.prototype.skip = function (len) {
  this.str = this.str.substr(Array.isArray(len) ? len[0].length : len)
}

/**
 * EOS
 */

parser.prototype.eos = function () {
  if (this.str.length) return
  return 'eos'
}

/**
 * Space
 */

parser.prototype.space = function () {
  var captures
  if (captures = /^([ \t]+)/.exec(this.str)) {
    this.skip(captures)
    return this.advance()
  }
}

/**
 * Second
 */

parser.prototype.second = function () {
  var captures
  if (captures = /^s(ec|econd)?s?/.exec(this.str)) {
    this.skip(captures)
    return 'second'
  }
}

/**
 * Minute
 */

parser.prototype.minute = function () {
  var captures
  if (captures = /^m(in|inute)?s?/.exec(this.str)) {
    this.skip(captures)
    return 'minute'
  }
}

/**
 * Hour
 */

parser.prototype.hour = function () {
  var captures
  if (captures = /^h(r|our)s?/.exec(this.str)) {
    this.skip(captures)
    return 'hour'
  }
}

/**
 * Day
 */

parser.prototype.day = function () {
  var captures
  if (captures = /^d(ay)?s?/.exec(this.str)) {
    this.skip(captures)
    return 'day'
  }
}

/**
 * Day by name
 */

parser.prototype.dayByName = function () {
  var captures
  var r = new RegExp('^' + rDays.source)
  if (captures = r.exec(this.str)) {
    var day = captures[1]
    this.skip(captures)
    this.date[day](1)
    return captures[1]
  }
}

/**
 * Month by name
 */

parser.prototype.monthByName = function () {
  var captures
  if (captures = rMonths.exec(this.str)) {
    var day = captures[2]
    var month = captures[6]
    this.date.date.setMonth((months.indexOf(month)))
    if (day) this.date.date.setDate(parseInt(day))
    this.skip(captures)
    return captures[0]
  }
}

parser.prototype.timeAgo = function () {
  var captures
  if (captures = rAgo.exec(this.str)) {
    var num = captures[1]
    var mod = captures[2]
    this.date[mod](-num)
    this.skip(captures)
    return 'timeAgo'
  }
}

/**
 * Week
 */

parser.prototype.week = function () {
  var captures
  if (captures = /^w(k|eek)s?/.exec(this.str)) {
    this.skip(captures)
    return 'week'
  }
}

/**
 * Month
 */

parser.prototype.month = function () {
  var captures
  if (captures = /^mon(th)?(es|s)?\b/.exec(this.str)) {
    this.skip(captures)
    return 'month'
  }

}

/**
 * Week
 */

parser.prototype.year = function () {
  var captures
  if (captures = /^y(r|ear)s?/.exec(this.str)) {
    this.skip(captures)
    return 'year'
  }
}

/**
 * Meridiem am/pm
 */

parser.prototype.meridiem = function () {
  var captures
  if (captures = rMeridiem.exec(this.str)) {
    this.skip(captures)
    this.time(captures[1], captures[3], captures[5], captures[6])
    return 'meridiem'
  }
}

/**
 * Hour Minute (ex. 12:30)
 */

parser.prototype.hourminute = function () {
  var captures
  if (captures = rHourMinute.exec(this.str)) {
    this.skip(captures)
    this.time(captures[1], captures[3], captures[5], this._meridiem)
    return 'hourminute'
  }
}

/**
 * At Hour (ex. at 5)
 */

parser.prototype.athour = function () {
  var captures
  if (captures = rAtHour.exec(this.str)) {
    this.skip(captures)
    this.time(captures[1], 0, 0, this._meridiem)
    this._meridiem = null
    return 'athour'
  }
}

/**
 * Time set helper
 */

parser.prototype.time = function (h, m, s, meridiem) {
  var d = this.date
  var before = d.clone()

  if (meridiem) {
    // convert to 24 hour
    h = ('pm' == meridiem && 12 > h) ? +h + 12 : h; // 6pm => 18
    h = ('am' == meridiem && 12 == h) ? 0 : h; // 12am => 0
  }

  m = (!m && d.changed('minutes')) ? false : m
  s = (!s && d.changed('seconds')) ? false : s
  d.time(h, m, s)
}

/**
 * Best attempt to pick the next time this date will occur
 *
 * TODO: place at the end of the parsing
 */

parser.prototype.nextTime = function (before) {
  var d = this.date
  var orig = this.original

  if (before <= d.date || rPast.test(orig)) return this

  // If time is in the past, we need to guess at the next time
  if (rDays.test(orig)) {
    d.day(7)
  } else if ((before - d.date) / 1000 > 60) {
    // If it is a month in the past, don't add a day
    if (rMonths.test(orig)) {
      d.day(0)
    } else {
      d.day(1)
    }
  }

  return this
}

/**
 * Yesterday
 */

parser.prototype.yesterday = function () {
  var captures
  if (captures = /^(yes(terday)?)/.exec(this.str)) {
    this.skip(captures)
    this.date.day(-1)
    return 'yesterday'
  }
}

/**
 * Tomorrow
 */

parser.prototype.tomorrow = function () {
  var captures
  if (captures = /^tom(orrow)?/.exec(this.str)) {
    this.skip(captures)
    this.date.day(1)
    return 'tomorrow'
  }
}

/**
 * Noon
 */

parser.prototype.noon = function () {
  var captures
  if (captures = /^noon\b/.exec(this.str)) {
    this.skip(captures)
    var before = this.date.clone()
    this.date.date.setHours(12, 0, 0)
    return 'noon'
  }
}

/**
 * Midnight
 */

parser.prototype.midnight = function () {
  var captures
  if (captures = /^midnight\b/.exec(this.str)) {
    this.skip(captures)
    var before = this.date.clone()
    this.date.date.setHours(0, 0, 0)
    return 'midnight'
  }
}

/**
 * Night (arbitrarily set at 7pm)
 */

parser.prototype.night = function () {
  var captures
  if (captures = /^night\b/.exec(this.str)) {
    this.skip(captures)
    this._meridiem = 'pm'
    var before = this.date.clone()
    this.date.date.setHours(19, 0, 0)
    return 'night'
  }
}

/**
 * Evening (arbitrarily set at 5pm)
 */

parser.prototype.evening = function () {
  var captures
  if (captures = /^evening\b/.exec(this.str)) {
    this.skip(captures)
    this._meridiem = 'pm'
    var before = this.date.clone()
    this.date.date.setHours(17, 0, 0)
    return 'evening'
  }
}

/**
 * Afternoon (arbitrarily set at 2pm)
 */

parser.prototype.afternoon = function () {
  var captures
  if (captures = /^afternoon\b/.exec(this.str)) {
    this.skip(captures)
    this._meridiem = 'pm'
    var before = this.date.clone()

    if (this.date.changed('hours')) return 'afternoon'

    this.date.date.setHours(14, 0, 0)
    return 'afternoon'
  }
}

/**
 * Morning (arbitrarily set at 8am)
 */

parser.prototype.morning = function () {
  var captures
  if (captures = /^morning\b/.exec(this.str)) {
    this.skip(captures)
    this._meridiem = 'am'
    var before = this.date.clone()
    if (!this.date.changed('hours')) this.date.date.setHours(8, 0, 0)
    return 'morning'
  }
}

/**
 * Tonight
 */

parser.prototype.tonight = function () {
  var captures
  if (captures = /^tonight\b/.exec(this.str)) {
    this.skip(captures)
    this._meridiem = 'pm'
    return 'tonight'
  }
}

/**
 * Next time
 */

parser.prototype._next = function () {
  var captures
  if (captures = /^next/.exec(this.str)) {
    this.skip(captures)
    var d = new Date(this.date.date)
    var mod = this.peek()

    // If we have a defined modifier, then update
    if (this.date[mod]) {
      this.next()
      // slight hack to modify already modified
      this.date = date(d)
      this.date[mod](1)
    } else if (rDayMod.test(mod)) {
      this.date.day(1)
    }

    return 'next'
  }
}

/**
 * Last time
 */

parser.prototype.last = function () {
  var captures
  if (captures = /^last/.exec(this.str)) {
    this.skip(captures)
    var d = new Date(this.date.date)
    var mod = this.peek()

    // If we have a defined modifier, then update
    if (this.date[mod]) {
      this.next()
      // slight hack to modify already modified
      this.date = date(d)
      this.date[mod](-1)
    } else if (rDayMod.test(mod)) {
      this.date.day(-1)
    }

    return 'last'
  }
}

/**
 * Ago
 */

parser.prototype.ago = function () {
  var captures
  if (captures = /^ago\b/.exec(this.str)) {
    this.skip(captures)
    return 'ago'
  }
}

/**
 * Number
 */

parser.prototype.number = function () {
  var captures
  if (captures = /^(\d+)/.exec(this.str)) {
    var n = captures[1]
    this.skip(captures)
    var mod = this.peek()

    // If we have a defined modifier, then update
    if (this.date[mod]) {
      if ('ago' == this.peek()) n = -n
      this.date[mod](n)
    } else if (this._meridiem) {
      // when we don't have meridiem, possibly use context to guess
      this.time(n, 0, 0, this._meridiem)
      this._meridiem = null
    } else if (this.original.indexOf('at') > -1) {
      this.time(n, 0, 0, this._meridiem)
      this._meridiem = null
    }

    return 'number'
  }
}

/**
 * String
 */

parser.prototype.string = function () {
  var captures
  if (captures = /^\w+/.exec(this.str)) {
    this.skip(captures)
    return 'string'
  }
}

/**
 * Other
 */

parser.prototype.other = function () {
  var captures
  if (captures = /^./.exec(this.str)) {
    this.skip(captures)
    return 'other'
  }
}

},{"./date":2,"./norm":4,"debug":10}],6:[function(require,module,exports){
/**
 * Substitutes for lodash methods
 */

exports.difference = function (bigArr, smallArr) {
  var diff = []
  for (var i = 0; i < bigArr.length; i++) {
    var ele = bigArr[i]
    if (smallArr.indexOf(ele) == -1) {
      diff.push(ele)
    }
  }
  return diff
}

exports.flatten = function (arr) {
  return [].concat.apply([], arr)
}

exports.find = function (arr, fn) {
  var found = null
  for (var i = 0; i < arr.length; i++) {
    if (fn(arr[i])) {
      found = arr[i]
      break
    }
  }
  return found
}

exports.findLastIndex = function (arr, fn) {
  var found = -1
  for (var i = arr.length - 1; i >= 0; i--) {
    if (fn(arr[i])) {
      found = i
      break
    }
  }
  return found
}

exports.includes = function (arr, item) {
  var found = false
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === item) {
      found = true
      break
    }
  }
  return found
}

exports.isNaN = function (n) {
  return Number.isNaN(n)
}

exports.keys = function (obj) {
  return Object.keys(obj)
}

exports.pullAt = function (arr, i) {
  var res = arr.splice(i, 1)
  return res
}

exports.unique = function (arr, i) {
  return arr.filter(function (elem, pos) {
    return arr.indexOf(elem) == pos
  })
}

},{}],7:[function(require,module,exports){
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

},{"./maps.json":3,"./util":9}],8:[function(require,module,exports){
// Module to tokenize a string into CFG symbols

/**
 * Module Dependencies
 */
var util = require('./util')
var symbol = require('./symbol')
var maps = require('./maps.json')

/**
 * regexes for Subnormal forms
 */

var re = {
  // 12/20 - 12/21, 2012/12 - 2013/12
  MMsDDdMMsDD: /(?!\d{1,4}\/\d{1,4}\s*-\s*\d{1,4}\/\d{1,4}\/)(\d{1,4})\/(\d{1,4})\s*-\s*(\d{1,4})\/(\d{1,4})/g,
  // 12/22 - 23, 2012/10 - 12
  MMsDDdDD: /(?!\d{1,4}\/\d{1,4}\s*-\s*\d{1,4}\/)(\d{1,4})\/(\d{1,4})\s*-\s*(\d{1,4})/g,
  // 12/24, 2012/12
  MMsDD: /(?!\d{1,4}\/\d{1,4}\/)(\d{1,4})\/(\d{1,4})/g,
  // 05:30pm, 0530pm, 1730, 1730pm, 1730[re:h], remove the [re:h]
  hhcmm: /(\s+\d{1,2}|^\d{1,2})\:?(\d{2})\s*(\S+)*/g
}

/**
 * Export `tokenize`
 */

module.exports = tokenize

/**
 * Parse and tokenize a string into array of valid CFG symbols, in these steps:
 * 1. parse normal forms
 * 2. parse subnormal forms
 * 3. parse english forms
 * @param  {string} str The input string.
 * @return {JSON}     {str, tokensIn, tokensOut, symbols}
 */
function tokenize (str) {
  // split num from alphabets
  str = (' ' + str)
    .replace(/\s+(\d+)([a-zA-Z]+)/g, ' $1 $2')
    .replace(/\s+([a-zA-Z]+)(\d+)/g, ' $1 $2')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')
  // 1. 2. parse normal and subnormal forms
  var p = parseNormal12(str),
    pStr = p.str,
    tokens = pStr.split(' '),
    symbols = []
  // clean the non-normal tokens a bit, allow to be wrapped by words only
  for (var i = 0; i < tokens.length; i++) {
    if (!tokens[i].match(util.reT)) {
      tokens[i] = tokens[i].replace(/^\W+/, '').replace(/\W+$/, '')
    }
  }

  // 3. parse english forms
  for (var i = 0; i < tokens.length; i++) {
    var tok = tokens[i]
    var oneGram = tok,
      twoGram = tok + ' ' + (tokens[i + 1] || ''),
      oneSym = symbol(oneGram),
      twoSym = symbol(twoGram)
    if (twoSym && twoSym.value == oneSym.value) {
      // if lemmatization must happen for both,
      // pick the longer, skip next token
      // skip this once, reset skip
      i++
      symbols.push(symbol(twoGram))
    } else {
      symbols.push(symbol(oneGram))
    }
  }
  return {
    str: pStr,
    tokensOut: p.tokensOut,
    tokensIn: p.tokensIn,
    symbols: symbols
  }
}

/**
 * Run 1. parseNormal then 2. parseNormal2, return the parsed string with T-format tokens.
 * @private
 * @param  {string} str The input string
 * @return {JSON}     Parsed string
 */
function parseNormal12 (str) {
  var p1 = parseNormal1(str)
  // find tokens that are purely normal, and reinject into string
  var p1TokensOut = p1.tokensOut.filter(notSubnormal)
  var p1Str = injectNormal(str, p1TokensOut)
  // now parse the subnormal
  var p2 = parseNormal2(p1Str, [], [])
  // the tokens that taken out, and their replacements, in order
  var pTokensOut = p1.tokensOut.concat(p2.tokensOut)
  var pTokensIn = p1.tokensIn.concat(p2.tokensIn)
  return {
    str: p2.str,
    tokensOut: pTokensOut,
    tokensIn: pTokensIn
  }
}

/**
 * 1. Parse normal forms. Try to parse and return a normal Date, parseable from new Date(str), by continuously trimming off its tail and retry until either get a valid date, or string runs out.
 * Doesn't parse string with length <5
 * @private
 * @param  {string} str The input string.
 * @return {string}     A Date in stdT string, or null.
 */
function parseNormal1 (str) {
  // keep chopping off tail until either get a valid date, or string runs out
  // array of parsed date and the string consumed
  var tokensIn = [],
    tokensOut = []
  // ensure single spacing
  str = str.replace(/\s+/g, ' ')
  // tokenize by space
  var strArr = str.split(/\s+/g)

  // init the normalDate and head string used
  var normalDate = null,
    head = ''
  // do while there's still string to go
  while (strArr.length) {
    head = (head + ' ' + strArr.shift()).trim()
    try {
      normalDate = util.stdT(new Date(head))
      // Extend head: if parse successful, extend continuously until failure, then that's the longest parseable head string, ...<date>
      var advanceHead = head + ' ' + strArr[0]
      while (1) {
        try {
          var advanceDate = util.stdT(new Date(advanceHead))
          if (advanceDate != 'Invalid Date') {
            // if advanceDate is parseable, set to current, update heads
            var normalDate = advanceDate
            head = head + ' ' + strArr.shift()
            advanceHead = advanceHead + ' ' + strArr[0]
          } else {
            break
          }
        } catch (e) {
          // when fail, just break
          break
        }
      }
      // Shrink head: from the whole parseable head ...<date>, trim front till we get <date>
      while (1) {
        try {
          if (util.stdT(new Date(head.replace(/^\s*\S+\s*/, ''))) != normalDate) {
            // front token eaten causes change, dont update head
            break
          } else {
            // update head
            head = head.replace(/^\s*\S+\s*/, '')
          }
        } catch (e) {
          break
        }
      }
      // only consider a valid parse if the parsed str is long enough
      if (head.length > 6) {
        tokensIn.push(normalDate)
        // get head = <date> only, then reset
        tokensOut.push(head)
      }
      head = ''
    } catch (e) {}
  }
  return { tokensIn: tokensIn, tokensOut: tokensOut }
}

/**
 * 2. Parse subnormal forms after parseNormal. Gradually replace tokens of the input string while parseable.
 * @private
 */
function parseNormal2 (str, tokensIn, tokensOut) {
  var m, res
  if (m = re.MMsDDdMMsDD.exec(str)) {
    // 12/20 - 12/21
    var yMd1 = yMdParse(m[1], m[2])
    var yMd2 = yMdParse(m[3], m[4])
    res = ' t:' + yMd1 + ',dt: - t:' + yMd2 + ',dt: '
  } else if (m = re.MMsDDdDD.exec(str)) {
    // 12/22 - 23
    var yMd1 = yMdParse(m[1], m[2])
    var yMd2 = yMdParse(m[1], m[3])
    res = ' t:' + yMd1 + ',dt: - t:' + yMd2 + ',dt: '
  } else if (m = re.MMsDD.exec(str)) {
    // if year
    var yMd = yMdParse(m[1], m[2])
    // 12/24
    res = ' t:' + yMd + ',dt: '
  } else if (m = re.hhcmm.exec(str)) {
    // 05:30pm, 0530pm, 1730, 1730pm, 1730[re:h], remove the [re:h]
    res = ' t:' + m[1].trim() + 'h' + m[2] + 'm' + ',dt: ' + (m[3] || '')
  } else {
    // exit recursion if hits here
    return {
      str: str,
      tokensIn: tokensIn,
      tokensOut: tokensOut
    }
  }
  // recurse down till no more substitution (CFG is not cyclic, so ok)
  tokensOut.push(m[0])
  tokensIn.push(res)
  str = parseNormal2(str.replace(m[0], res), tokensIn, tokensOut).str
  return {
    str: str,
    tokensIn: tokensIn,
    tokensOut: tokensOut
  }
}

// ////////////////////
// Helper functions //
// ////////////////////

/**
 * Try to parse two tokens for T form into MM/dd, or MM/yyyy if either token hsa length 4.
 * @private
 * @param  {string} token1
 * @param  {string} token2
 * @return {string}        in the form <y><M><d>
 */
function yMdParse (token1, token2) {
  var part0 = [token1, token2].filter(function (token) {
    return token.length == 4
  })
  var part1 = [token1, token2].filter(function (token) {
    return token.length != 4
  })
  var y = part0[0] ? part0[0] + 'y' : ''
  var M = part1[0] + 'M'
  var d = part1[1] ? part1[1] + 'd' : ''
  return y + M + d
}

/**
 * Check if the dateStr is strictly normal and not subnormal. Used to extract parseNormal2 overrides.
 * @private
 * @param  {string} dateStr
 * @return {Boolean}
 */
function notSubnormal (dateStr) {
  var subnormalStr = parseNormal2(dateStr, [], []).str
  // remove T and see if still has words
  var noT = subnormalStr.replace(/t\:\S*,dt\:\S*(\s*-\s*t\:\S*,dt\:\S*)?/, '')
  return /\w+/g.exec(noT) != null
}

/**
 * Given a string and array of its parsed phrases, convert them into T stdT then T format, and inject into the original string, return.
 * @private
 * @param  {string} str       The original string.
 * @param  {Array} parsedArr The parsed phrases from the string.
 * @return {string}           The string with parsed phrases replaced in T format.
 *
 * @example
 * injectNormal('05 October 2011 14:48 UTC 08/11 2020', [ '05 October 2011 14:48 UTC', '08/11 2020' ])
 * // => 't:2011y10M05d14h48m00.000s,dt: t:2020y08M11d04h00m00.000s,dt: '
 */
function injectNormal (str, parsedArr) {
  for (var i = 0; i < parsedArr.length; i++) {
    var parsed = parsedArr[i]
    var T = util.stdTtoT(util.stdT(new Date(parsed)))
    str = str.replace(parsed, T)
  }
  return str
}

},{"./maps.json":3,"./symbol":7,"./util":9}],9:[function(require,module,exports){
/**
 * Module Dependencies
 */

var _ = require('./subdash')
var maps = require('./maps.json')

/**
 * The T string regex, e.g. "t:=9h,dt:12h", to encode T = <t> <dt>. Is case sensitive.
 */

var reT = /t\:\S*,dt\:\S*/g

/**
 * The ordering of time units, large to small,
 * 'mer' is the meridiem, 0 for am, 1 for pm
 * and the units used for carrying
 */

var timeUnitOrder = ['y', 'M', 'w', 'd', 'h', 'm', 's', 'ms']
var canonTimeUnitOrder = []
for (var i = 0; i < timeUnitOrder.length; i++) {
  var unit = timeUnitOrder[i]
  canonTimeUnitOrder.push(lemma(unit).canon)
}
var tOrdering = ['y', 'M', 'd', 'h', 'm', 's']
var tFactor = [365, 30, 24, 60, 60]

/**
 * Delimiters for stdT string
 */

var stdTdelim = ['-', '-', ' ', ':', ':', '']

/**
 * Export `util`
 */

module.exports = {
  TtoStdT: TtoStdT,
  TtoStr: TtoStr,
  delimSyms: delimSyms,
  hasSym: hasSym,
  has_dt: has_dt,
  has_pureTimeUnit: has_pureTimeUnit,
  has_t: has_t,
  highestOverride: highestOverride,
  isSym: isSym,
  largestUnit: largestUnit,
  lemma: lemma,
  nextLargestUnit: nextLargestUnit,
  nowT: nowT,
  opType: opType,
  orderChunks: orderChunks,
  removeTnPlus: removeTnPlus,
  reT: reT,
  sName: sName,
  splitByArr: splitByArr,
  splitSyms: splitSyms,
  splitT: splitT,
  stdT: stdT,
  stdTdelim: stdTdelim,
  stdTtoT: stdTtoT,
  tOrdering: tOrdering,
  timeUnitOrder: timeUnitOrder,
  canonTimeUnitOrder: canonTimeUnitOrder,
  tokenToStr: tokenToStr,
  unparsedStr: unparsedStr,
}

/**
 * Convert a T string to stdT string, with default filled by nowT().
 * @example
 * TtoStdT('t:10M05d14h48m00.000s,dt:')
 * // => 2016-10-05 14:48:00
 */
function TtoStdT (str, offset) {
  if (typeof str != 'string') {
    str = TtoStr(str)
  }
  var nowStr = nowT(offset),
    nowArr = splitT(nowStr),
    strArr = splitT(str)
  var resArr = []
  for (var i = 0; i < nowArr.length; i++) {
    var val = parseFloat(strArr[i])
    if (Number.isNaN(val)) { val = parseFloat(nowArr[i]) }
    resArr.push(val)
  }
  var resStr = ''
  for (var i = 0; i < stdTdelim.length; i++) {
    var num = resArr[i].toString()
    // e.g. '5.123' tends to be '05.123', fix it
    var predecimal = /(\d+)(\.\d+)?/.exec(num)[1],
      postdecimal = /(\d+)\.?(\d+)?/.exec(num)[2]
    if (predecimal.length == 1) { num = '0' + num }
    if (postdecimal != null) {
      for (var j = 0; j < 3 - postdecimal.length; j++) {
        num = num + '0'
      }
    }
    resStr += (num + stdTdelim[i])
  }
  // console.log('resStr', resStr)
  return resStr
}
// console.log(TtoStdT('t:10M05d14h48m00.010s,dt:'))

/**
 * Convert a T symbol into its T string.
 */
function TtoStr (T) {
  var tStr = 't:',
    dtStr = ',dt:'
  for (var i = 0; i < timeUnitOrder.length; i++) {
    var tUnit = timeUnitOrder[i]
    // if unit exist, write to str
    if (T['t'][tUnit] != undefined) {
      tStr += T['t'][tUnit] + tUnit
    }
    if (T['dt'][tUnit] != undefined) {
      dtStr += T['dt'][tUnit] + tUnit
    }
  }
  return tStr + dtStr
}

/**
 * Delimit the array of timeChunk symbols by combining consecutive nulls (>3) into one, and dumping those shorter. Result is then delimited by 'trinull'.
 * @param  {Array} syms Of parsed symbols aka time chunks.
 * @return {Array}      symbols delimited by 'trinull'
 */
function delimSyms (syms) {
  // 1.
  // contract the nulls into trinulls in a single array
  var newSyms = [],
    count = 0
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (s == null) {
      count++
    } else {
      if (count > 2) {
        newSyms.push('trinull')
      }
      newSyms.push(s)
      count = 0
    }
  }
  return newSyms
}
// console.log(delimSyms([1, 2, null, null, null, 3]))

/**
 * Check if arr has symbol whose name is listen in symArr.
 * @param  {Array}  arr    Array of symbols.
 * @param  {Array}  symArr Array of symbol names.
 * @return {Boolean}
 */
function hasSym (syms, symArr) {
  var found = false
  for (var i = 0; i < syms.length; i++) {
    if (isSym(syms[i], symArr)) {
      found = true
      break
    }
  }
  return found
}

/**
 * Check if T.dt is not empty
 */
function has_dt (T) {
  return _.keys(T.dt).length > 0
}

/**
 * Check if T has only t, dt with units from timeUnitOrder
 */
function has_pureTimeUnit (T) {
  var dt = T.dt,
    t = T.t
  var pure = true
  for (var k in dt) {
    if (!_.includes(timeUnitOrder, k)) {
      pure = false
      break
    }
  }
  for (var k in t) {
    if (!_.includes(timeUnitOrder, k)) {
      pure = false
      break
    }
  }
  return pure
}

/**
 * Check if T.t is not empty
 */
function has_t (T) {
  return _.keys(T.t).length > 0
}

/**
 * find the lowest overridable unit in t or dt
 */
function highestOverride (t) {
  var lowestOverable = null
  for (var i = 0; i < tOrdering.length; i++) {
    var unit = tOrdering[i]
    if (/^=/.exec(t[unit])) {
      lowestOverable = unit
      break
    }
  }
  return lowestOverable
}

/**
 * Check if arr has the symbol name of s.
 * @param  {symbol}  s   symbol object
 * @param  {Array}  arr Of string symbol names
 * @return {Boolean}
 */
function isSym (s, arr) {
  return _.includes(arr, sName(s))
}

/**
 * Find the largest enumerated unit in T.t, or if none, in T.dt
 */
function largestUnit (T) {
  var lu = _.find(tOrdering, function (unit) {
    return T.t[unit]
  })
  if (lu == null) {
    lu = _.find(tOrdering, function (unit) {
      return T.dt[unit]
    })
  }
  return lu
}

/**
 * Return the lemma symbol of a word string, i.e. the name and value of the symbol it belongs to in the CFG. Uses ./maps.json.
 * NLP Lemmatization refers here: htp://nlp.stanford.edu/Ir-book/html/htmledition/stemming-and-lemmatization-1.html. Inflections = all possible alternative words of a lemma.
 * @param  {string} str To lemmatize.
 * @return {JSON}     Lemma symbol {name, value} for CFG
 * @example
 * lemma('zero')
 * // => { value: '0', name: 'n' }
 */
function lemma (str) {
  // change all to lower case except for 'M' for month
  str = (str == 'M') ? str : str.toLowerCase()
  var lem = {},
    name = null,
    value = null,
    canon = str
  var mapsKeys = _.keys(maps)
  for (var i = 0; i < mapsKeys.length; i++) {
    var sMap = maps[mapsKeys[i]],
      sMapKeys = _.keys(sMap)
    for (var j = 0; j < sMapKeys.length; j++) {
      var inflectionArr = sMap[sMapKeys[j]]
      if (_.includes(inflectionArr, str)) {
        // set the canonical form as the first in inflectionArr
        canon = inflectionArr[0]
        // if str is in inflections
        value = sMapKeys[j]
        break
      }
    }
    if (value != null) {
      name = mapsKeys[i]
      break
    }
  }
  // set value
  lem['name'] = name
  lem['value'] = value
  lem['canon'] = canon
  return lem
}
// console.log(lemma('zero'))

/**
 * Find the next largest enumerated unit in T.t, or if none, in T.dt
 */
function nextLargestUnit (T) {
  var lu = largestUnit(T)
  return tOrdering[tOrdering.indexOf(lu) - 1]
}

/**
 * Convenient method to get current time in T format.
 * @return {string} T format string.
 */
function nowT (offset) {
  var dateStr = (offset == undefined) ? stdT(new Date()) : stdT(offset)
  return stdTtoT(dateStr)
}

/**
 * Determine the op type based on arguments
 */
function opType (L, op, R) {
  var LsName = sName(L) || '',
    RsName = sName(R) || ''
  var opsName = sName(op)
  if (opsName != 'o' && opsName != 'r' && opsName != 'c') { opsName = '' }
  return LsName + opsName + RsName
}

/**
 * Order time chunks by not containing T, short to long, then containing T, short to long. Used for .pop() to get the candidate timechunk for parsing.
 */
function orderChunks (matrix) {
  // 2.
  // ok partition first then sort
  var hasNoT = matrix.filter(function (row) {
    return !hasSym(row, ['T'])
  })
  var hasT = matrix.filter(function (row) {
    return hasSym(row, ['T'])
  })
  // matrix, sorted short to long
  var lengthSortedNotTMat = hasNoT.sort(function (a, b) {
    return a.length - b.length
  })
  var lengthSortedTMat = hasT.sort(function (a, b) {
    return a.length - b.length
  })
  // 3.1 3.2 3.3
  return lengthSortedNotTMat.concat(lengthSortedTMat)
}

/**
 * !remove the defaul <o|op> that is 'plus' between <T>, <n> for defaulting to plus.
 * !is a quickfix for mat
 */
function removeTnPlus (syms) {
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (isSym(s, ['op']) && s.value == 'plus' && isSym(syms[i + 1], ['n'])) {
      syms.splice(i, 1)
    }
  }
  return syms
}

/**
 * Return the name of a symbol: {op,c,r,n,T,f}
 * @param  {Symbol} symbol A CFG symbol.
 * @return {string}        name of the symbol.
 */
function sName (symbol) {
  return symbol ? symbol.constructor.name : null
}

/**
 * Split a string by an array of tokens.
 * @param  {string} str       The input string.
 * @param  {Array} tokenArr Array of tokens to split the string by.
 * @return {Array}           The split string array.
 */
function splitByArr (str, tokenArr) {
  var delim = '#{REPLACE}'
  // inject into tokens
  for (var i = 0; i < tokenArr.length; i++) {
    var token = tokenArr[i]
    str = str.replace(token, delim)
  }
  // split into arr
  return str.split(delim)
}
// console.log(splitByArr('lorem 1 ipsum 2 dolor 3', [1,2,3]))

/**
 * Split an array of symbols by delimiter into matrix.
 * @param  {Array} syms      The input array
 * @param  {string|symbol} delimiter To split the array by
 * @return {matrix}           delimited arrays.
 */
function splitSyms (syms, delimiter) {
  // split the single array into matrix
  var matrix = [],
    newRow = []
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (s == delimiter || sName(s) == delimiter) {
      // delimit and push to matrix
      matrix.push(newRow)
      newRow = []
    } else if (i == syms.length - 1) {
      // edge case, push res
      newRow.push(s)
      matrix.push(newRow)
    } else {
      // accumulate in row
      newRow.push(s)
    }
  }
  return matrix
}

/**
 * Split a T string into array of [_y, _M, _d, _h, _m, _s]
 */
function splitT (str) {
  if (!str.match(reT)) {
    return null
  }
  var _y = (/(\d+(\.\d+)?)y/.exec(str) || [])[1],
    _M = (/(\d+(\.\d+)?)M/.exec(str) || [])[1],
    _w = (/(\d+(\.\d+)?)w/.exec(str) || [])[1],
    _d = (/(\d+(\.\d+)?)d/.exec(str) || [])[1],
    _h = (/(\d+(\.\d+)?)h/.exec(str) || [])[1],
    _m = (/(\d+(\.\d+)?)m/.exec(str) || [])[1],
    _s = (/(\d+(\.\d+)?)s/.exec(str) || [])[1]

  // The Time Object
  var TO = {
    y: _y,
    M: _M,
    w: _w,
    d: _d,
    h: _h,
    m: _m,
    s: _s
  }
  // do the carries
  TO = carry(TO)

  // compose results
  var res = []
  for (var i = 0; i < tOrdering.length; i++) {
    var k = tOrdering[i]
    res.push(TO[k])
  }
  return res
}

/**
 * Function to properly down- and up- carry Time Object
 * 1. dumpweek, 2. carryDown, 3. carryUp
 */
function carry (TO) {
  TO = dumpWeek(TO)
  TO = carryDown(TO)
  TO = carryUp(TO)
  return TO
}

/**
 * 1. dumpWeek
 */
function dumpWeek (TO) {
  var _w = parseFloat(TO['w'] || '0'),
    _d = parseFloat(TO['d'] || '0')
  TO['d'] = _d + (_w * 7)
  delete TO['w']
  return TO
}

/**
 * 2. carryDown
 */
function carryDown (TO) {
  // shall reverse the ordering and factors for opp direction
  var ordering = tOrdering,
    factor = tFactor
  var carry = 0
  for (var i = 0; i < ordering.length; i++) {
    // the time unit in the ordering
    var u = ordering[i]
    // skip the rest of loopbody if this unit is undefined and nothing to carry
    if (TO[u] == undefined && carry == 0) {
      continue
    }
    // carry
    TO[u] = parseFloat(TO[u] || '0') + carry
    // dont go in after the last one
    if (i == ordering.length - 1) {
      // overlong s decimal will be fixed in TtoStdT
      break
    }
    var decimal = parseFloat(TO[u] || '0') - parseInt(TO[u] || '0')
    if (decimal > 0) {
      // set next carry
      carry = decimal * factor[i]
      // update current u
      TO[u] = parseInt(TO[u])
    } else {
      // else reset to 0 if no carry
      carry = 0
    }
  }
  return TO
}

/**
 * 3. carryUp
 */
function carryUp (TO) {
  // shall reverse the ordering and factors for opp direction
  var ordering = tOrdering.slice().reverse(),
    factor = tFactor.slice().reverse()
  var carry = 0
  for (var i = 0; i < ordering.length; i++) {
    // the time unit in the ordering
    var u = ordering[i]
    // skip the rest of loopbody if this unit is undefined and nothing to carry
    if (TO[u] == undefined && carry == 0) {
      continue
    }
    // carry
    TO[u] = parseFloat(TO[u] || '0') + carry
    // dont go in after the last one
    if (i == ordering.length - 1) {
      break
    }
    var deci = parseInt(parseFloat(TO[u] || '0') / factor[i])
    if (deci > 0) {
      // set next carry
      carry = deci
      // update current u
      TO[u] = parseFloat(TO[u] || '0') % factor[i]
    } else {
      // else reset to 0 if no carry
      carry = 0
    }
  }
  return TO
}

/**
 * Take a date or string, parse it into standard format as yyyy-MM-dd hh:mm:ss.sss
 */
function stdT (date) {
  if (typeof date == 'string') {
    date = new Date(date)
  }
  var _y = date.getFullYear(),
    _M = date.getMonth() + 1,
    _d = date.getDate(),
    _date = [_y, _M, _d].join('-')
  _time = /(\d\S+)/.exec(date.toTimeString())[1],
  format = _date + ' ' + _time
  return format
}

/**
 * Convert std time string to T string.
 * @example
 * stdTtoT('2011-10-05T14:48:00.000')
 * // => 't:2011y10M05d14h48m00.000s,dt:'
 */
function stdTtoT (str) {
  var datetime = str.split(' ')
  var date = datetime[0].split('-'),
    time = datetime[1].split(':')
  return 't:' + date[0] + 'y' + date[1] + 'M' + date[2] + 'd' + time[0] + 'h' + time[1] + 'm' + time[2] + 's,dt:'
}
// console.log(stdTtoT('2011-10-05T14:48:00.000Z'))

/**
 * Recombine array of symbols back into str
 */
function tokenToStr (syms) {
  var tokens = []
  for (var i = 0; i < syms.length; i++) {
    tokens.push(syms[i].token)
  }
  return tokens.join(' ')
}

/**
 * Extract unparsedTokens from str and parsed syms then join them
 */
function unparsedStr (str, syms) {
  var inputTokens = str.split(/\s+/)
  var tokens = []
  for (var i = 0; i < syms.length; i++) {
    if (syms[i] == null) {
      tokens.push(inputTokens[i])
    }
  }
  return tokens.join(' ')
}

},{"./maps.json":3,"./subdash":6}],10:[function(require,module,exports){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":11}],11:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":12}],12:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}]},{},[1])(1)
});
