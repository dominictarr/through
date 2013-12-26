var from = require('from')
var through = require('../')
var concat = require('concat-stream')

var tape = require('tape')

tape('simple async example', function (t) {
 
  var n = 0, expected = [1,2,3,4,5]
  from(expected)
  .pipe(through(function(data) {
    this.pause()
    n ++
    setTimeout(function(){
      console.log('pushing data', data)
      this.push(data)
//      if(!--n) this.resume()
      this.resume()
    }.bind(this), 300)
  })).pipe(through(function(data) {
    console.log('pushing data second time', data);
    this.push(data)
  })).pipe(concat(function(result) {
    console.log("voila", result)

    t.deepEqual(result, expected)
    t.end()
  }))

})
