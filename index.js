var spawn = require('child_process').spawn
  , concat = require('concat-stream')
  , nest = require('./nest')
  , walk = require('findit')
  , path = require('path')
  , fs = require('fs')

module.exports = blobify

var blob = {}

function blobify(entry_points, options, ready) {
  if(typeof options === 'function') {
    ready = options
    options = {}
  }

  var ended
  var inflight = 0

  entry_points.on('end', function() {
    ended = true

    maybe_done()
  })

  entry_points.on('data', function(data) {
    if(!data) {
      return
    }

    data = data.toString()

    inflight++
    blob_one(data, options, done_one)
  })

  function done_one(err, data) {
    if(err) {
      return ready(err)
    }

    inflight--
    maybe_done()
  }

  function maybe_done() {
    var result

    if(Object.keys(blob).length) {
      result = options.flat ? blob : nest(blob)
    } else {
      result = {}
    }

    if(!inflight && ended) {
      ready(null, result)
    }
  }
}

function blob_one(entry_point, options, ready) {
  var ended = false
    , pending = 0

  var absolute_path = path.resolve(entry_point)

  walker = walk(absolute_path, {followSymLinks: options.links})

  walker
    .on('file', onfile_found)
    .on('end', onend)
    .on('error', ready)

  if(options.links) {
    walker.on('link', onlink)
  }

  function onfile_found(to, stat) {
    pending++

    if(options.ignore && options.ignore.test(to)) {
      return
    }

    var aggregator_stream = concat(function(data) {
      blob[to] = data.toString()

      pending--

      return maybe_done()
    })

    var readstream = fs.createReadStream(to)

    if(!options['file-transform']) {
      return readstream.pipe(aggregator_stream)
    }

    var command = options['file-transform'].split(' ')[0]
      , args = options['file-transform'].split(' ').slice(1)

    var child = spawn(command, args)

    child.stdout
      .on('error', ready)
      .pipe(aggregator_stream)

    readstream.pipe(child.stdin)
  }

  function onend() {
    ended = true

    maybe_done()
  }

  function maybe_done() {
    if(!pending && ended) {
      ready(null, blob[''] || blob)
    }
  }
}
