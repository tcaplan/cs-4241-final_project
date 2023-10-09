const http = require( 'http' ),
      fs   = require( 'fs' ),
      express = require('express'),
      dotenv = require("dotenv"),
      app = express()
      
// allows use of environment variables
dotenv.config()

// use express.urlencoded to get data sent by default form actions
// or GET requests
app.use( express.urlencoded({ extended: true }) )

// public directory
app.use(express.static('./public'))
app.use(express.json())

app.use((request, response, next) => {
    console.log(request.url)
    next()
  });

app.get('/words', (request, response) => {
    fs.readFile('./public/libraries/words.txt', 'utf-8', (err, data) => {
        if(err) {
            console.log(err)
        } else {
            // console.log(data)
            response.json({"words": data})
        }
    })
})

// set up the server
app.listen(`${process.env.PORT}`)


/************************************************************************/
