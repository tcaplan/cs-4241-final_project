const express = require('express'),
      //dotenv = require("dotenv"),
      app = express(),
      { MongoClient, ObjectId } = require('mongodb'),
      cookie  = require( 'cookie-session' ),
      crypto = require('crypto')

// allows use of environment variables
// dotenv.config()

// public directory
app.use(express.static('./public'))
app.use(express.json())

const url = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.kxz0njx.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient( url )

let logins = null
let highScores = null

async function run() {
  await client.connect()
  logins = await client.db("database").collection("logins")
  highScores = await client.db("database").collection("highScores")
}

run()

app.use( express.urlencoded({ extended:true }) )

// Generate random keys
const key1 = crypto.randomBytes(32).toString('hex');
const key2 = crypto.randomBytes(32).toString('hex');

app.use(cookie({
  name: 'session',
  keys: [key1, key2]
}));


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Query the database to check if the username and password match
        const user = await logins.findOne({ username, password });

        if (user) {
            // Authentication successful
            req.session.login = true;
            req.session.username = username;
            console.log("Successful login");
            console.log(req.session);

            res.json({ success: true, message: 'Successful login' });
        } else {
            console.log("Invalid login");
            res.status(401).json({ success: false, message: 'Invalid login' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists in the database
        const existingUser = await logins.findOne({ username });

        if (existingUser) {
            // Username already exists
            console.log("Username already exists");
            res.status(400).json({ success: false, message: 'Username already exists' });
        } else {
            // Username is not found, create a new entry in the database
            const newUser = {
                username,
                password 
            };

            await logins.insertOne(newUser);

            console.log("Registration successful");
            res.json({ success: true, message: 'Registration successful' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



// set up the server
app.listen(`${process.env.PORT}`)