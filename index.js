var Stream = require('stream')
// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

exports.from = from 

//create a readable writable stream.

function through (write, end) {
  write = write || function (data) { this.emit('data', data) }
  end = (
    'sync'== end || !end
  //use sync end. (default)
  ? function () { this.emit('end') }
  : 'async' == end || end === true 
  //use async end.
  //must eventually call drain if paused.
  //else will not end.
  ? function () {
      if(!this.paused)
        return this.emit('end')
     var self = this
     this.once('drain', function () {
        self.emit('end')
      })
    }
  //use custom end function
  : end 
  )
  var ended = false, destroyed = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false  
  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }
  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here. 
  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  stream.end = function (data) {
    if(ended) throw new Error('cannot call end twice')
    ended = true
    if(arguments.length) stream.write(data)
    this.writable = false
    end.call(this)
    if(!this.readable)
      this.destroy()
  }
  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    stream.writable = stream.readable = false
    stream.emit('close')
  }
  stream.pause = function () {
    stream.paused = true
  }
  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('drain')
    }
  }
  return stream
}

//create a readable stream.

function from (source) {
  if(Array.isArray(source))
    return from (function (i) {
      if(source.length)
        this.emit('data', source.shift())
      else
        this.emit('end')
      return true
    })

  var s = new Stream(), i = 0, ended = false, started = false
  s.readable = true
  s.writable = false
  s.paused = false
  s.pause = function () {
    started = true
    s.paused = true
  }
  function next () {
    var n = 0, r = false
    if(ended) return
    while(!ended && !s.paused && source.call(s, i, function () {
      if(!n++ && !s.ended && !s.paused)
          next()
    }))
      ;
  }
  s.resume = function () {
    started = true
    s.paused = false
    next()
  }
  s.on('end', function () {
    ended = true
    s.readable = false
    process.nextTick(s.destroy)
  })
  s.destroy = function () {
    ended = true
    s.emit('close') 
  }
  /*
    by default, the stream will start emitting at nextTick
    if you want, you can pause it, after pipeing.
    you can also resume before next tick, and that will also
    work.
  */
  process.nextTick(function () {
    if(!started) s.resume()
  })
  return s
}


//create a writable stream.
function to () {

}
