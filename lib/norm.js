// Production rule module for the CFG

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

// var str = "05 October 2011 14:48 UTC 08/11 2020 2012/12 event is at tonight 12/20- 23 12/22 - 12/23 12/22 - 12/25 05:30h 17:30 1730 1730pm 5pm 1 st"
// var str = "quarter pop pop pop four hour and half from 17 and half pm before 9 tonight after 7 tonight"

// var str = 'tonight'
// var str = str
// var str = 'tonight 3 hours after 9pm'
// yeah the mod n shits failing here, but let Matt take over for now
// var str = 'tonight at 3 hours after 9pm'
// var str = '2 days ago'
// var str = 'having lunch today later at 3 hours after 9am'
// var str = 'having lunch today at 3 hours after 9am'
// var str = '05 October 2011 14:48 UTC 08/11 2020 12/22-12/23 having lunch today at 3 hours after 9am'

// var res = norm(str)
// console.log(res)

/**
 * Main method: Run the CFG algorithm to parse the string, return JSON of {input, output, diffStr}. Normalize the string before Matt's algorithm runs it.
 * @example
 * var str = 'having lunch today at 3 hours after 9am'
 * norm(str)
 * // => { input: 'having lunch today at 3 hours after 9am',
 *  output: '2016-03-04T05:00:09Z',
 *  difference: 'having lunch' }
 */
function norm(str) {
  // Production rules: CFG algorithm for human language for time 
  // p#0: tokenize, remove nulls, pick tokens
  var symTokens = tokenize(str);
  // console.log('p#00', symTokens);
  // extract the tokens for difference string later
  var tokens = util.getTokens(symTokens);
  syms = pickTokens(symTokens);
  // console.log('p#0', syms);
  // p#1: arithmetics: <n1>[<op>]<n2> ~ <n>, + if n1 > n2, * else
  syms = reduce(syms, ['n', 'n']);
  // console.log('p#1', syms);
  // p#2: redistribute, <n1><T1>[<op>]<n2><!T2> ~ <n1>[<op>]<n2> <T1>
  syms = nTnRedistribute(syms);
  // console.log('p#2', syms);

  // p#3: <n>[<op>]<T> ~ <T>, * if dt, + if t
  syms = reduce(syms, ['n', 'T']);
  // console.log('p#3', syms);
  // p#4: <T>[<op>]<T> ~ <T>
  syms = reduce(syms, ['T', 'T']);
  // console.log('p#4', syms);
  // p#5: defaulter <o> <n> <o> ~ <o> <T> <o>, d defaults to t:h
  syms = nDefTSyms(syms);
  // console.log('p#5', syms);
  // p#6: <T><o><T> ~ <T>
  syms = optReduce(syms, ['T', 'T'], ['o'], symbol('t:,dt:=0s'), symbol(util.nowT()));
  // console.log('p#6', syms);
  // p#7: auto-hour-modding: t:h mod 12
  syms = autoHourModding(syms);
  // console.log('p#7', syms);
  syms = finalizeT(syms);
  // console.log('p#8', syms);

  // future:
  // syms = reduce(syms, ['T'], ['r'])
  // syms = reduce(syms, ['f', 'T', 'rT'], ['c'])

  var finalStr = symsToNorm(syms);
  var diffStr = util.unparsedStr(str, tokens);
  // console.log('finalStr', finalStr);
  // console.log('diffStr', diffStr);

  return {
    input: str,
    output: finalStr,
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
function pickTokens(syms) {
  // 1. 2. 3.
  var delimited = util.delimSyms(syms),
    chunks = util.splitSyms(delimited, 'trinull'),
    candidates = util.orderChunks(chunks);
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
function reduce(syms, varArr, opArr) {
  // the operator arrays
  var opArr = opArr || ['op'];
  // endmark for handling last symbol
  syms.push('null');
  // the result, past-pointer(previous non-null symbol), default-op, current-op, and whether current-op is inter-symbol op, i.e. will not be used up
  var res = [],
    past = null,
    defOp = null,
    op = defOp,
    interOp = false;
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (!past || !s) {
      // edge case or null
      if (i == 0) { past = s; }
    } else if (util.isSym(s, opArr)) {
      // s is an op. mark op as won't be used yet
      op = s;
      interOp = true;
      // the nDefT for when past = 'n', s = 'o'
    } else if (util.isSym(past, [varArr[0]]) && util.isSym(s, [varArr[1]])) {
      // s and past are operable variables specified by varArr
      past = execOp(past, op, s);
      // reset after op is used
      op = defOp;
      interOp = false;
    } else {
      // no further legal operation made, push and continue
      // change of class, past is finalized, push to res
      res.push(past);
      if (Array.isArray(past)) {
        // if past was returned from execOp as array (not executed), then flatten it and dont push op to res, since it's already included in op
        res = _.flatten(res)
      } else {
        // if inter-op (not used), push a clone (prevent overwrite later)
        if (interOp) { res.push(symbol(op.value)) };
      }
      // reset
      op = defOp;
      interOp = false;
      past = s;
    }
  }
  return res;
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
function optReduce(syms, varArr, opArr, Ldef, Rdef) {
  if (syms.length == 1) {
    return syms
  }
  // use peek
  var res = [],
    sum = null,
    L = null,
    R = null;
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i];
    if (util.isSym(s, opArr)) {
      if (sum == null) {
        L = syms[i - 1];
        sum = (util.isSym(L, [varArr[0]])) ? L : Ldef;
      };
      R = syms[i + 1];
      // if is var skip it since will be consumed
      if (util.isSym(R, [varArr[1]])) { i++; }
      // else reset to default
      else { R = Rdef; }
      // compute:
      sum = execOp(sum, s, R);
      // before loop quits due to possible i++, push the last
      if (i == syms.length - 1) {
        res.push(sum)
      };
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
  return res;
}

/**
 * Execute non-commutative operation between 2 argument symbols and an op symbol; carry out respective ops according to symbol names.
 * @param  {symbol} L  Left argument
 * @param  {symbol} op operation
 * @param  {symbol} R  Right argument
 * @return {symbol}    Result
 */
function execOp(L, op, R) {
  var otype = util.opType(L, op, R),
    res = null;
  if (_.includes(['nn'], otype)) {
    res = nnOp(L, op, R)
  } else if (_.includes(['nT'], otype)) {
    res = nTOp(L, op, R);
  } else if (_.includes(['TT'], otype)) {
    res = TTOp(L, op, R);
  } else if (_.includes(['ToT', 'oT', 'To'], otype)) {
    res = ToTOp(L, op, R);
  } else if (_.includes(['rT', 'TrT'], otype)) {
    // has optional arg
    res = rTOp(L, R);
  } else if (_.includes(['cT', 'fcT', 'crT', 'fcrT'], otype)) {
    // has optional arg
    res = cTOp(L, R);
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
function atomicOp(Lval, op, Rval, dontOp) {
  dontOp = dontOp || false;
  var oName = op.value;
  if (Lval == undefined) {
    // if L is missing, R must exist tho
    return (oName == 'minus') ? Rval.replace(/(\d)/, '-$1') : Rval;
  } else if (Rval == undefined) {
    // if L exists, be it def or not, R missing
    return Lval;
  } else {
    // or R exist or is default (parse to NaN), L can be default too but ignore then
    var defL = Lval.toString().match(/^=/),
      defR = Rval.toString().match(/^=/);
    var l = parseFloat(Lval.toString().replace(/^=/, '')),
      r = parseFloat(Rval.toString().replace(/^=/, ''));
    if (defL && defR) {
      // if both are default, return r 'last come last serve'
      return r
    } else
    if (defL && !defR) {
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
function nnOp(L, op, R) {
  var l = L.value,
    r = R.value;
  // set the default op according to value in nn op
  if (l > r) {
    op = op || symbol('plus')
  } else {
    op = op || symbol('times')
  }
  var res = atomicOp(l, op, r);
  return symbol(res)
}

/**
 * p#2: redistribute, <n1><T1>[<op>]<n2><!T2> ~ <n1>[<op>]<n2> <T1>
 * algorithm: note that from previous steps no <n>'s can occur adjacently
 * 1. scan array L to R, on each <n> found:
 * 2.1 if its R is <T>, continue;
 * 2.2 else, this is the target. do:
 * 3.1 init carry = []. remove and push <n> into carry,
 * 3.2 if its L is <op>, remove and prepend <op> into carry,
 * 4.1 find the first <n> to the left, if not <n>, drop the carry and continue;
 * 4.2 else merge the carry after the <n>
 * 5. At the end of loop, rerun production rule #1
 */
function nTnRedistribute(syms) {
  // 1.
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (util.sName(s) != 'n') {
      continue;
    };
    // 1.

    var R = syms[i + 1]
    if (util.sName(R) == 'T') {
      continue;
    };
    // 2.2

    // 3.1
    var carry = [];
    carry.push(_.pullAt(syms, i));
    // 3.2
    var L = syms[i - 1]
    if (util.sName(L) == 'op') {
      carry.unshift(_.pullAt(syms, i - 1))
    };
    carry = _.flatten(carry)

    // 4.1
    var LLi = _.findLastIndex(syms.slice(0, i), function(Ls) {
      return util.sName(Ls) == 'n'
    })
    if (!syms[LLi] || util.sName(syms[LLi + 1]) != 'T') {
      continue;
    };

    // 4.2
    syms.splice(LLi + 1, 0, carry)
    syms = _.flatten(syms)
  }

  // 5.
  syms = reduce(syms, ['n', 'n'])
  return syms;
}

/**
 * p#3: <n>[<op>]<T> ~ <T>, * if dt, + if t
 * 1. if t can be overidden, start from the highest unit set to n, then return.
 * 2. otherwise, if <dt> not empty, <n><dt> = <n>*<dt>, then return
 * 3. else, if <t> not empty, <n><t> = <n>+<t>, then return
 */
function nTOp(nL, op, TR) {
  var tOverrideUnit = util.highestOverride(TR.t);
  if (tOverrideUnit) {
    // 1.
    TR.t[tOverrideUnit] = nL.value
  } else if (_.keys(TR.dt).length) {
    // 2.
    op = op || symbol('times')
    for (var k in TR.dt) {
      TR.dt[k] = atomicOp(nL.value, op, TR.dt[k])
    }
  } else if (_.keys(TR.t).length) {
    // 3.
    op = op || symbol('plus')
    for (var k in TR.t) {
      TR.t[k] = atomicOp(nL.value, op, TR.t[k])
    }
  };
  return TR
}

/**
 * p#4: <T>[<op>]<T> ~ <T>
 */
function TTOp(TL, op, TR) {
  // set the default op
  op = op || symbol('plus');
  // util.sName
  // mutate into TL
  for (var k in TR.t) {
    // okay done add absolute time, just as you don't add origins together put u take gradual specificity, the 'true' param for dontOp if exist, return r
    // override default tho, taken care of by atomic
    TL.t[k] = atomicOp(TL.t[k], op, TR.t[k], true)
  }
  for (var k in TR.dt) {
    TL.dt[k] = atomicOp(TL.dt[k], op, TR.dt[k])
  }
  return TL
}

/**
 * p#5: defaulter <o> <n> <o> ~ <o> <T> <o>, d defaults to t:h
 */
function nDefTSyms(syms) {
  var res = []
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    res.push(util.isSym(s, ['n']) ? nDefT(s) : s)
  }
  return res;
}

/**
 * Helper: default a singlet n to T, i.e. next available hour
 */
function nDefT(n) {
  var deft = symbol('t:1h,dt:');
  var nVal = n.value;
  var currentHour = new Date().getHours();
  var nextnVal = Math.floor(currentHour / 12) * 12 + nVal;
  var tHour = execOp(symbol(nextnVal), symbol('times'), deft);
  return tHour
}

/**
 * p#6: <T><o><T> ~ <T>
 */
function ToTOp(L, op, R) {
  var Ttype = ['t', 'dt']
  for (var i = 0; i < Ttype.length; i++) {
    var _Ttype = Ttype[i],
      // the dontOp for 't'
      dontOp = (_Ttype == 't');
    var concatKeys = _.keys(L[_Ttype]).concat(_.keys(R[_Ttype]))
    var keys = concatKeys.filter(function(elem, pos) {
      return concatKeys.indexOf(elem) == pos;
    })
    for (var j = 0; j < keys.length; j++) {
      var k = keys[j];
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
function autoHourModding(syms) {
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i]
    if (util.isSym(s, ['T'])) {
      if (syms[i]['t']['h']) {
        // if t has 'h', mod it
        var value = syms[i]['t']['h'].toString()
        var isDefault = (value.match(/^=/) || [])[0] || '';
        value = value.replace(/^=/, '');
        value = parseFloat(value) % 12;
        syms[i]['t']['h'] = isDefault + value;
      };
      // apply the non-0 meridiem after modding:
      if (syms[i]['t']['mer']) {
        var dt_h = (syms[i]['dt']['h'] || '0').toString();
        // dump default at last
        dt_h = dt_h.replace(/^=/, '')
        syms[i]['dt']['h'] = parseFloat(dt_h) + 12;
        // delete mer
        delete syms[i]['t']['mer']
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
function finalizeT(syms) {
  // remove defaults
  for (var i = 0; i < syms.length; i++) {
    syms[i] = removeDefaults(syms[i])
  }
  // default with origin at end
  syms.push(symbol(util.nowT()));
  syms = reduce(syms, ['T', 'T']);
  // combine t and dt
  var newSyms = [];
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i],
      sum = tdtAdd(s)
    sum.token = util.TtoStr(sum);
    newSyms.push(tdtAdd(s))
  }
  return syms
}

/**
 * remove the defaults before adding with origin
 */
function removeDefaults(T) {
  for (var k in T.dt) {
    T.dt[k] = T.dt[k].toString().replace(/^=/, '');
  }
  for (var k in T.t) {
    T.t[k] = T.t[k].toString().replace(/^=/, '');
  }
  return T
}

/**
 * add t and dt within a T together, delete the dt keys
 */
function tdtAdd(T) {
  // guard for non-T
  if (!util.isSym(T, ['T'])) {
    return T;
  }
  for (var k in T.dt) {
    // absolute add, disregard defaults
    var t_k = (T.t[k] == undefined) ? 0 : T.t[k],
      dt_k = T.dt[k];
    // cleanup the default
    t_k = t_k.toString().replace(/^=/, '');
    dt_k = dt_k.toString().replace(/^=/, '');
    var sum = parseFloat(t_k) + parseFloat(dt_k);
    // set the result, remove used dt
    T.t[k] = sum
    delete T.dt[k]
  }
  return T
}

/**
 * p#9: Convert an array of symbols to normalized ISO UTC strings.
 * if token was normal form already, parse into ISO.
 * if is n: return n.value
 * else return org token
 */
function symsToNorm(syms) {
  var tokens = [];
  for (var i = 0; i < syms.length; i++) {
    var s = syms[i],
      token = s.token.toString();
    // default, don't switch unless:
    if (util.isSym(s, ['n'])) {
      token = s.value
    } else if (token.match(util.reT)) {
      // is normal T form
      token = util.TtoISO(token)
    };
    tokens.push(token);
  }
  return tokens.join(' ')
}

/**
 * !to be implemented for range
 */
function rTOp(L, R) {
  var start, end;
  if (!R) {
    start = symbol(util.nowT());
    end = L;
  } else {
    start = L;
    end = R;
  }
  return symbol({ start: start, end: end })
}

/**
 * !to be implemented for cron
 */
function cTOp(L, R) {}
