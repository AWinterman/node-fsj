var spawn = require('child_process').spawn
  , concat = require('concat-stream')
  , lookup = require('./lookup')
  , walk = require('findit')
  , path = require('path')
  , fs = require('fs')

module.exports = blobify

function blobify(entry_points, output, options, ready) {
  if(entry_points.length) {
    console.error(ready.toString())
  }

  if(!entry_points.length) {
    ready(null, output)

    return
  }

  var current = entry_points.shift()

  blob_one(current, options, done_one)

  function done_one(err, data) {
    if(err) {
      return ready(err)
    }

    output[current] = data

    blobify(entry_points, output, options, ready)
  }
}

function blob_one(entry_point, options, ready) {
  var ticker = 0
    , final_blob = {}
    , blob = {}

  handle(entry_point)

  function handle(fs_object) {
    var ended = false
      , pending = 0

    var absolute_path = path.resolve(fs_object)

    walker = walk(absolute_path, {followSymLinks: options.links})

    walker
      .on('directory', ondir)
      .on('file', onfile_found)
      .on('end', onend)
      .on('error', ready)

    if(options.links) {
      walker.on('link', onlink)
    }

    function ondir(to, stat, stop) {
      if(options.ignore && options.ignore.test(to)) {
        return stop()
      }

      var next = get_obj(to)
        , name = next.name
        , obj = next.obj

      if(name) {
        obj[name] = {}
      }
    }

    function onfile_found(to, stat) {
      pending++

      if(options.ignore && options.ignore.test(to)) {
        return
      }

      var next = get_obj(to)
        , name = next.name
        , obj = next.obj

      if(!options['file-transform']) {
        return fs.readFile(to, handle_file(obj, name))
      }

      var command = options['file-transform'].split(' ')[0]
        , args = options['file-transform'].split(' ').slice(1)

      var child = spawn(command, args)

      child.stdout.pipe(concat(function(data) {
         obj[name] = data.toString()

         pending--

         return maybe_done()
      }))

      fs.createReadStream(to).pipe(child.stdin)
    }


    function onend() {
      ended = true

      maybe_done()
    }

    function handle_file(obj, name) {
      return on_file

      function on_file(err, data) {
        if(err) {
          ready(err)
        }

        obj[name] = data.toString()
        pending--

        return maybe_done()
      }
    }

    function maybe_done() {
      if(!pending && ended) {
        ready(null, blob[''] || blob)
      }
    }

    function get_obj(to) {
      var relative_path = path.relative(absolute_path, to)
            .split(path.sep)

      var full_path = to.split(path.sep)

      var name = relative_path[relative_path.length - 1]
        , dotpath = relative_path.slice(0, -1)
        , obj = blob

      if(dotpath.length) {
        obj = lookup(dotpath)(blob)
      }

      return {obj: obj, name: name}
    }
  }
}
