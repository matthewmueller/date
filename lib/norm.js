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
