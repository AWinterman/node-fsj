var path = require('path')
var result = {}

module.exports = function nest(obj) {
  var keys = Object.keys(obj)
  var output = {}
  var pointer
  var parent_dir
  var relative_path
  var dir
  var key

  parent_dir = compute_parent_dir(keys)
  pointer = output

  while(keys.length) {
    key = keys.shift()

    relative_path = path.relative(parent_dir, key).split(path.sep)
    dir = relative_path.shift()

    pointer = output
    while(relative_path.length) {
      if(pointer[dir] === undefined) {
        pointer[dir] = {}
      }

      pointer = pointer[dir]

      dir = relative_path.shift()
    }

    pointer[dir] = obj[key]
  }

  return output
}

function compute_parent_dir(pathnames) {
  var keys = pathnames.map(function(d) {
    return d.split(path.sep)
  })

  var common_subset = keys.shift()
  var candidates
  var current

  while(keys.length) {
    current = keys.shift()

    candidates = []

    for(var i = 0; i < common_subset.length; ++i) {
      if(current[i] === common_subset[i]) {
        candidates.push(current[i])

        continue
      }

      break
    }

    common_subset = candidates.slice()
  }

  return common_subset.join(path.sep)
}
