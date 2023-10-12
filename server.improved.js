
const express = require('express'),
      dotenv = require("dotenv"),
      app = express(),
      { MongoClient, ObjectId } = require('mongodb'),
      cookie  = require( 'cookie-session' ),
      crypto = require('crypto'),
      fs   = require( 'fs' )
      
// allows use of environment variables
dotenv.config()

// public directory
app.use(express.static('./public'))
app.use(express.json())


const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.kxz0njx.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient( url )

let logins = null
let highScores = null
let currencies = null

async function run() {
  await client.connect()
  logins = await client.db("database").collection("logins")
  highScores = await client.db("database").collection("highScores")
  currencies = await client.db("database").collection("currencies")
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
          
            req.session.login = true;
            req.session.username = username;

            console.log("Registration successful");
            res.json({ success: true, message: 'Registration successful' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get('/currency', async (req, res) => {
    try {
        const username = req.session.username;
        // Query the currency table to find the currency associated with the specified username
        const currencyData = await currencies.findOne({ username });

        if (currencyData) {
            // If currency data is found, send it as a JSON response
            res.json({ currency: currencyData.currency });
        } else {
            // If the username is not found, return a currency of 0
            res.json({ currency: 0 });
        }
    } catch (error) {
        console.error('Error retrieving currency:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST request to update or create currency for a specific user
app.post('/currency', async (req, res) => {
    try {
        const currency = req.body.currency;
        console.log("Currency: ");
        console.log(currency);
        console.log(req.body);
        const username = req.session.username;

        // Check if the username already exists in the currency table
        const existingUser = await currencies.findOne({ username });

        if (existingUser) {
            // Username already exists, update the currency value
            await currencies.updateOne({ username }, { $set: { currency } });

            console.log("Currency updated successfully");
            res.json({ success: true, message: 'Currency updated successfully' });
        } else {
            // Username is not found, create a new entry in the currency table
            const newUser = {
                username,
                currency
            };

            await currencies.insertOne(newUser);

            console.log("User added with currency");
            res.json({ success: true, message: 'User added with currency' });
        }
    } catch (error) {
        console.error('Error during currency update:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get('/highScore', async (req, res) => {
  console.log("in here")
    try {
        const username = req.session.username;
        console.log("Username: ");
        console.log(req.session.username);

        // Query the highScore table to find the high score associated with the specified username
        const highScoreData = await highScores.findOne({ username });
        console.log(highScoreData);

        if (highScoreData) {
            console.log("In here 2");
            // If high score data is found, send it as a JSON response
            res.json({ score: highScoreData.score });
        } else {
            // If the username is not found, return a score of 0
            res.json({ score: 0 });
        }
    } catch (error) {
        console.error('Error retrieving high score:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST request to update or create high score for a specific user
app.post('/highScore', async (req, res) => {
    try {
        const score = req.body.score;
        const username = req.session.username;
        
        // Check if the username already exists in the highScore table
        const existingUser = await highScores.findOne({ username });

        if (existingUser) {
            // Username already exists, update the high score if the new score is greater
            if (score > existingUser.score) {
                await highScores.updateOne({ username }, { $set: { score } });
                console.log("High score updated successfully");
                res.json({ success: true, message: 'High score updated successfully' });
            } else {
                console.log("New score is not greater than the current high score");
                res.json({ success: false, message: 'New score is not greater than the current high score' });
            }
        } else {
            // Username is not found, create a new entry in the highScore table
            const newUser = {
                username,
                score
            };

            await highScores.insertOne(newUser);
            console.log("User added with high score");
            res.json({ success: true, message: 'User added with high score' });
        }
    } catch (error) {
        console.error('Error during high score update:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// set up the server
app.listen(3000 || `${process.env.PORT}`)