#through

[![build status](https://secure.travis-ci.org/dominictarr/through.png)](http://travis-ci.org/dominictarr/through)

Easy way to create a `Stream` that is both `readable` and `writable`. Pass in optional `write`, `read` and `end` methods.

this function is the basis for most of the syncronous streams in [event-stream](http://github.com/dominictarr/event-stream).

``` js
var through = require('through')

through(function write(data, buffer) {
    buffer.push(data)
  },
  function read (bytes, buffer) {
    return buffer.shift()
  },
  function end () { //optional
    this.emit('end')
  })
```

## License

MIT / Apache2
