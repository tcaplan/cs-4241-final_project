
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
let ownedBlades = null
let currentBlades = null
let quests = null

async function run() {
  await client.connect()
  logins = await client.db("database").collection("logins")
  highScores = await client.db("database").collection("highScores")
  currencies = await client.db("database").collection("currencies")
  ownedBlades = await client.db("database").collection("ownedBlades")
  currentBlades = await client.db("database").collection("currentBlades")
  quests = await client.db("database").collection("quests")
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
    try {
        const username = req.session.username;

        // Query the highScore table to find the high score associated with the specified username
        const highScoreData = await highScores.findOne({ username });

        if (highScoreData) {
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

app.post('/ownedBlades', async (req, res) => {
    try {
        const blade = req.body.blade;
        const username = req.session.username;

        // Create a new entry in the ownedBlades table with the specified username and blade
        const newUser = {
            username,
            blade
        };

        await ownedBlades.insertOne(newUser);

        console.log("User added with owned blades");
        res.json({ success: true, message: 'User added with owned blades' });
    } catch (error) {
        console.error('Error during owned blades update:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/ownedBlades', async (req, res) => {
    try {
        const username = req.session.username;

        // Query the ownedBlades table to find all blades associated with the specified username
        const ownedBladesData = await ownedBlades.find({ username }).toArray();

        // Extract the list of blade numbers from the data
        const ownedBladesList = ownedBladesData.map((entry) => entry.blade);

        res.json({ success: true, blades: ownedBladesList });
    } catch (error) {
        console.error('Error retrieving owned blades:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.post('/currentBlades', async (req, res) => {
    try {
        const bladeNumber = req.body.bladeNumber;
        const username = req.session.username;

        // Check if the username already exists in the currentBlades table
        const existingUser = await currentBlades.findOne({ username });

        if (existingUser) {
            // Username already exists, update the blade number
            await currentBlades.updateOne({ username }, { $set: { bladeNumber } });

            console.log("Blade number updated successfully");
            res.json({ success: true, message: 'Blade number updated successfully' });
        } else {
            // Username is not found, create a new entry in the currentBlades table
            const newUser = {
                username,
                bladeNumber
            };

            await currentBlades.insertOne(newUser);

            console.log("User added with blade number");
            res.json({ success: true, message: 'User added with blade number' });
        }
    } catch (error) {
        console.error('Error during blade number update:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/currentBlades', async (req, res) => {
    try {
        const username = req.session.username;

        // Query the currentBlades table to find the bladeNumber associated with the specified username
        const currentBladeData = await currentBlades.findOne({ username });

        if (currentBladeData) {
            // If the data is found, send the bladeNumber as a response
            res.json({ bladeNumber: currentBladeData.bladeNumber });
        } else {
            // If the username is not found, return 0 as the default blade number
            res.json({ bladeNumber: 0 });
        }
    } catch (error) {
        console.error('Error retrieving current blade number:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/top10', async (req, res) => {
  try {
    // Query the highScore table to find the top ten highest scores
    const top10Scores = await highScores.find().sort({ score: -1 }).limit(10).toArray();

    // Extract the usernames and scores from the results
    const top10List = top10Scores.map(item => ({
      username: item.username,
      score: item.score
    }));

    res.json(top10List);
  } catch (error) {
    console.error('Error retrieving top 10 scores:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


app.post('/quests', async (req, res) => {
    try {
        const quest = req.body.quest;
        const username = req.session.username;

        // Create a new entry in the quests table with the specified username and quest
        const newUser = {
            username,
            quest
        };

        await quests.insertOne(newUser);

        console.log("User added with quests");
        res.json({ success: true, message: 'User added with quests' });
    } catch (error) {
        console.error('Error during quest update:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/quests', async (req, res) => {
    try {
        const username = req.session.username;

        // Query the quests table to find all quests associated with the specified username
        const questsData = await quests.find({ username }).toArray();

        // Extract the list of quest numbers from the data
        const questsList = questsData.map((entry) => entry.quest);

        res.json({ success: true, quests: questsList });
    } catch (error) {
        console.error('Error retrieving quests:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get('/checkLog', async (req, res) => {
    try {
        if (req.session.login === true) {
            // If user is logged in, send username as a JSON response
            res.json({ username: req.session.username });
        } else {
            // If user isn't logged in, return null
            res.json(null);
        }
    } catch (error) {
        console.error('Error checking login', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/logout', async (req, res) => {
    try {
        req.session.login = false;
        req.session.username = null;
        console.log("User logged out");
        res.json({ success: true, message: 'User logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// set up the server
app.listen(3000 || `${process.env.PORT}`)