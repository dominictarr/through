var Stream = require('readable-stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

through.read = defaultRead
through.write = defaultWrite
through.end = defaultEnd

module.exports = through

//create a readable writable stream.

function through (write, read, end) {
  write = write || defaultWrite
  end = end || defaultEnd
  read = read || defaultRead

  var ended = false, destroyed = false
  var stream = new Stream()
  var buffer = []
  stream.readable = stream.writable = true
  stream.write = function (data) {
    var result = write.call(stream, data, buffer)
    if (buffer.length === 1) {
      stream.emit("readable")
    }
    return result === false ? false : true
  }
  stream.read = function (bytes) {
    var result = read.call(stream, bytes, buffer)
    return result === undefined ? null : result
  }
  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  stream.once('end', function () {
    stream.readable = false
    if(!stream.writable)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  stream.end = function (data) {
    if(ended) return
    //this breaks, because pipe doesn't check writable before calling end.
    //throw new Error('cannot call end twice')
    ended = true
    if(arguments.length) stream.write(data)
    stream.writable = false
    end.call(stream)
    if(!stream.readable)
      stream.destroy()
  }
  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    stream.writable = stream.readable = false
    stream.emit('close')
  }
  return stream
}

function defaultWrite(data, buffer) {
  buffer.push(data)
}

function defaultEnd() {
  this.emit('end')
}

function defaultRead(bytes, buffer) {
  return buffer.shift()
}