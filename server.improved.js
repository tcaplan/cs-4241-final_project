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

app.get('/random-word', (request, response) => {
    // word = generate()
    // console.log('in random-word: ' + word)
    response.json({word: 'hello'})
})

// set up the server
app.listen(`${process.env.PORT}`)


/************************************************************************/
