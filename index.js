var spawn = require('child_process')
  , lookup = require('./lookup')
  , walk = require('findit')
  , path = require('path')
  , fs = require('fs')

module.exports = blobify

function blobify(entry_points, options, ready) {
  var args = [].slice.call(arguments)

  var ticker = 0
    , blob = {}
    , next

  entry_points.forEach(handle)

  function handle(fs_object, index, array) {
    var absolute_path = path.resolve(fs_object)

    walker = walk(absolute_path, {followSymLinks: options.links})

    walker
      .on('directory', ondir)
      .on('file', onfile)
      .on('stop', console.log.bind(console, 'stopped', 'blob'))
      .on('end', onend)
      .on('error', function(error) {
        ready(error)
      })


    if(options.links) {
      walker.on('link', onlink)
    }

    function ondir(to, stat, stop) {
      if(options.ignore && options.ignore.test(to)) {
        return stop()
      }

      var relative_path = path.relative(absolute_path, to)
          .split(path.sep)

      var name = relative_path[relative_path.length - 1]
        , dotpath = relative_path.slice(0, -1)
        , obj = blob

      if(dotpath.length) {
        obj = lookup(dotpath)(blob)
      }

      if(name) {
        obj[name] = {}
      }
    }

    function onfile(to, stat) {
      if(options.ignore && options.ignore.test(to)) {
        return
      }

      var relative_path = path.relative(absolute_path, to)
            .split(path.sep)

      var name = relative_path[relative_path.length - 1]
        , dotpath = relative_path.slice(0, -1)
        , obj = blob

      if(dotpath.length) {
        obj = lookup(dotpath)(blob)
      }

      try {
        obj[name] = fs.readFileSync(to).toString()
      } catch(e) {
        console.log(blob, dotpath, name, obj[name])
      }
    }

    function onend() {
      ready(null, blob)
    }
  }
}


