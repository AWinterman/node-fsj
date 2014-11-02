# fsj

## Command line:

%s

## Node
```
var fsj = require('fsj')

fsj(stream, options, ready)
```

- `stream`: a readable stream which emits paths to walk
- `options`: options keyed and defined by the logform of the command line
  arguments listed below
- `ready`: a callback when its all been walked. Will be called with the json
  blob defined in the command line section
