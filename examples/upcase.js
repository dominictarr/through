var http = require('http')
var through = require('through')

http.createServer(function(request, response){
  var upcase = through(function(data){
    this.queue(data.toString().toUpperCase());
  })

  request.pipe(upcase).pipe(response)
}).listen(8080)

// $ curl -d 'banana' http://localhost:8080
// "BANANA"