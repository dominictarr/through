var through = require("..")
    , input = through()
    , output = through(function write(chunk) {
        console.log("chunk", chunk)
    })
    , transform = through(function write(chunk, buffer) {
        buffer.push(chunk * 2)
    }, function read(bytes, buffer) {
        return buffer.shift() * 2
    })

input.pipe(transform)
transform.pipe(output)

input.write(1)
input.write(2)
input.write(3)