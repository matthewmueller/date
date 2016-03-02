/**
 * Module Dependencies
 */

var maps = require('./maps.json')

/**
 * Convert ISO UTC string to T format.
 * @param {string} str ISO UTC date string
 *
 * @example
 * ISOtoT('2011-10-05T14:48:00.000Z')
 * // => 't:08M11d,dt:'
 */
function ISOtoT(str) {
  var datetime = str.replace('Z', '').split('T')
  var date = datetime[0].split('-'),
    time = datetime[1].split(':');
  return 't:' + date[0] + 'y' + date[1] + 'M' + date[2] + 'd' + time[0] + 'h' + time[1] + 'm' + time[2] + 's,dt:'
}

/**
 * Convenient method to get current time in T format.
 * @return {string} T format string.
 */
function nowT() {
  var dateStr = new Date().toISOString();
  return ISOtoT(dateStr)
}

// The ordering of time units, small to large
var timeUnitOrder = ["ms", "s", "m", "h", "d", "w", "M", "y"]


module.exports = {
  ISOtoT: ISOtoT,
  nowT: nowT,
  timeUnitOrder: timeUnitOrder,
}
