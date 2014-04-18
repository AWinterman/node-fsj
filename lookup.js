module.exports = lookup

function lookup(arr) {
  var keys = arr.slice()

  return function(obj) {
    while(keys.length) {
      var key = keys.shift()

      obj = obj[key]

      if(obj === null || obj === undefined) {
        return undefined
      }
    }

    return obj
  }
}
