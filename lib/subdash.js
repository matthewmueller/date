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
