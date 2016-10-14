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
