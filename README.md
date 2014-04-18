# fsj

## Node
```
var fsj = require('fsj')

fsj(entrypoints, options, ready)
```

- `entrypoints`: an array of system paths from which to start walking
- `options.links`: Boolean follow symbolic links
- `options.ignore`: RegExp for which files to ignore.

returns an object mapping (file|dir)name to contents. Each time a directory is
encountered, the value is an object with the same shape as the returned object.

## Command line:
```
  usage: fs-json [dirs|files]

    Writes a json blob to stdout, with all the contents of all the files in it.

    Options:

    -l, --links:

        follow symbolic links, recursively descending whatever the
        link points to, as well.

    -i, --ignore regex:

        Paths matching this JavaScript regex are excluded
```
