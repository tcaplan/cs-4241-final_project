// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Collision = Matter.Collision,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Composite = Matter.Composite,
    Events = Matter.Events

// game settings
lives = 3
money = 0
score = 0

paused = false

MARGIN = 0
WIDTH = 0
HEIGHT = 0
SLICED_COLOR = 'grey'
MAX_SLICES = 4

var engine
var render
var mouse
var mouseConstraint

words = {}
projectiles = []
aliveProjectiles = {}

// global variables
mousePressed = false
slicing = false

// blade variables
let bladeCanvas
let bladeCTX
let isDown=false
let startX
let startY
let offsetX
let offsetY

currentBlade2 = null

bladeMouseMoveText = (text, font, color='random') => {
    return (
    event => {
        if(!isDown){return;}
        event.preventDefault();
        
        mouseX=parseInt(event.clientX-offsetX);
        mouseY=parseInt(event.clientY-offsetY);
        
        bladeCTX.fillStyle = color === 'random' ? rainbowColor() : color
        bladeCTX.font = font
        bladeCTX.fillText(text, startX, startY)
        startX=mouseX;
        startY=mouseY;

        bladeCTX.fillStyle = "rgba(145, 199, 177, 0.2)";
        bladeCTX.fillRect(0, 0, bladeCanvas.width, bladeCanvas.height);
    
    })
}

baseBlade = new Blade(
    event => {
        if(!isDown){return;}
        // event.preventDefault();
        
        mouseX=parseInt(event.clientX-offsetX);
        mouseY=parseInt(event.clientY-offsetY);
        
        bladeCTX.beginPath();  // use beginPath for every segment of the line
        bladeCTX.moveTo(startX,startY);
        bladeCTX.lineTo(mouseX,mouseY);
        bladeCTX.fillStyle = 'black'
        bladeCTX.stroke();
        startX=mouseX;
        startY=mouseY;
    }
)
emojiBlade = new Blade(bladeMouseMoveText(':D', '10px Arial', 'black'))
rainbowEmojiBlade = new Blade(bladeMouseMoveText(':D', '10px Arial'))
dotBlade = new Blade(bladeMouseMoveText('.', '30px Arial', 'black'))
rainbowDotBlade = new Blade(bladeMouseMoveText('.', '30px Arial'))
emoticonBlade = new Blade(bladeMouseMoveText('\\_(^o^)_/', '15px Arial', 'black'))
rainbowEmoticonBlade = new Blade(bladeMouseMoveText('\\_(^o^)_/', '15px Arial'))

let bladelist = [dotBlade, rainbowDotBlade, emojiBlade, rainbowEmojiBlade, emoticonBlade, rainbowEmoticonBlade]

function Blade(move) {
    this.down = event => {
        event.preventDefault();
        startX=parseInt(event.clientX-offsetX);
        startY=parseInt(event.clientY-offsetY);
        isDown=true;
    }
    this.up = (event=null) => {
        if(event) {
            event.preventDefault()
        }
        isDown = false
        bladeCTX.clearRect(0, 0, bladeCanvas.width, bladeCanvas.height);    
    }
    this.move = move
    this.enable = () => {
        document.getElementById('matter-js-canvas').addEventListener('mousedown', this.down)
        document.getElementById('matter-js-canvas').addEventListener('mouseup', this.up)
        document.getElementById('matter-js-canvas').addEventListener('mousemove', this.move)
    }
    this.disable = () => {
        this.up()
        document.getElementById('matter-js-canvas').removeEventListener('mousedown', this.down)
        document.getElementById('matter-js-canvas').removeEventListener('mouseup', this.up)
        document.getElementById('matter-js-canvas').removeEventListener('mousemove', this.move)
    }
}

sliced = event => {
    if(mousePressed === true && slicing === false) {
        slicing = true
        bodiesAtPos = Matter.Query.point(projectiles, event.mouse.position);

        bodiesAtPos.forEach(body => {
            if(body.isStatic === false && lives > 0) {
                body.isStatic = true
                if(body.label === 'money') {
                    body.parts[0].render.sprite.texture = generateWordImage('money', SLICED_COLOR)
                    money += 20
                    document.getElementById('money').innerHTML = money
                    document.getElementById('money2').innerHTML = money
                } else if (body.label === 'bomb') {
                    body.parts[0].render.sprite.texture = generateWordImage('bomb', SLICED_COLOR)
                    lives = 0
                    currentBlade2.disable()
                    document.getElementById('lives').innerHTML = lives
                    gameOver();
                } else {
                    score++
                    if((body.label === 'bread\r') || (body.label === 'bread')){
                        setQuest(1) // bread quest
                    }
                    body.parts[0].render.sprite.texture = words[body.label].sliced
                    document.getElementById('counter').innerHTML = score 
                    document.getElementById('counter2').innerHTML = score                   
                }
                body.parts[0].render.opacity = 0.5
            }
        })
        slicing = false
    }
}

collisionDetected = event => {
    const pairs = event.pairs
    for(i = 0; i < pairs.length; i++) {
        const pair = pairs[i]

        // check if was collision with the floor
        if(pair.bodyA.label === 'the floor' || pair.bodyB.label === 'the floor') {
            projectile = pair.bodyA.label === 'the floor' ? pair.bodyB : pair.bodyA
            // check if a bomb collided with the floor
            if(projectiles.filter(p => p.label === projectile.label).length > 0) {
                if(projectile.label !== 'bomb' /* && Body.getVelocity(projectile).y > 0 */ && lives > 0) {
                    lives--
                    document.getElementById('lives').innerHTML = lives
                }

                projectiles = projectiles.filter(p => p.label !== projectile.label)
                World.remove(engine.world, projectile)
            }
        }
    }
    if (lives === 0) {
        gameOver();
    }
}

let totalmoney = 0;
let user = "GUEST";
let highscore = 0;

let blades = [
    [true, 0],
    [false, 20],
    [false, 40],
    [false, 60],
    [false, 80],
    [false, 100]
    ];

let quests = [];

let currentBlade = 0;

//menus for hiding/showing
const mainMenu = document.getElementById("main");
const shopMenu = document.getElementById("shop");
const questMenu = document.getElementById("quests");
const log = document.getElementById("log");
const scores = document.getElementById("scores");
const pauseMenu = document.getElementById("pauseMenu");
const gameHeader = document.getElementById("gameHeader");
const gameEnd = document.getElementById("gameEnd");

//start or unpause game
function playButton(start) {
    mainMenu.style.display = "none";
    pauseMenu.style.display = "none";
    gameEnd.style.display = "none";
    gameHeader.style.display = "block";

    //if start = true, start from beginning, else unpause
    //canvas stuff here
    if (start === true) {
        gameReset(false)
    }
    play();
}

function pauseButton() {
    pauseMenu.style.display = "flex";
    gameHeader.style.display = "none";
    paused = true;
    pause(projectiles);
    //canvas stuff here
}

function gameOver() {
    mousePressed = false;
    slicing = false;
    isDown = false;
    paused = true;
  
    totalmoney += money;
    const shopmoneytext = document.getElementById("shopm");
    shopmoneytext.innerHTML = "MONEY: " + totalmoney;
    updateCurrency(totalmoney);
    
    if(score > highscore) {
      const highScoreElement = document.getElementById("highscore");
        highscore = score;
        highScoreElement.innerHTML = `High Score: ${highscore}`; 
        updateHighScore(highscore);
    }
  
    gameReset(true);
    gameEnd.style.display = "flex";
    gameHeader.style.display = "none";
}

function shop() {
    mainMenu.style.display = "none";
    shopMenu.style.display = "flex";

    const shopmoneytext = document.getElementById("shopm");
    shopmoneytext.innerHTML = "MONEY: " + totalmoney;
}

function questM() {
    mainMenu.style.display = "none";
    questMenu.style.display = "flex";
}

function setQuest(questNum) {
    if(!quests[questNum][0]) {
        quests[questNum][0] = true;
        totalmoney += quests[questNum][1];
        updateQuest(questNum);
    
        const curQuest = document.getElementById("qs" + questNum);
        curQuest.innerHTML = 'COMPLETE';
        curQuest.style.backgroundColor = '#91C7B1';
    }
}

function loginScreen() {
    mainMenu.style.display = "none";
    log.style.display = "flex";
}

async function showScores() {
    mainMenu.style.display = "none";
    scores.style.display = "flex";
    let topten = [];
    try {
        const response = await fetch('/top10', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Got top 10 scores")

            // Iterate through the top 10 scores and display them
            data.forEach((score, index) => {
                console.log(`${index + 1}. ${score.username}: ${score.score}`);
                topten.push([score.username, score.score]);
            });
        } else {
            console.error("Failed to retrieve top 10 scores.");
        }
    } catch (error) {
        console.error('Error while fetching top 10 scores:', error);
    }
  
    const table = document.querySelector("#data");
    table.innerHTML = '';

    for (let i = 0; i < topten.length; i++) {
        const newThread = document.createElement("tr");
        table.appendChild(newThread);

        const placeText = document.createElement("td");
        placeText.innerText = i + 1;
        placeText.id = 'place' + i;
        newThread.appendChild(placeText);

        const userText = document.createElement("td");
        userText.innerText = topten[i][0];
        userText.id = 'user' + i;
        newThread.appendChild(userText);

        const scoreText = document.createElement("td");
        scoreText.innerText = topten[i][1];
        scoreText.id = 'score' + i;
        newThread.appendChild(scoreText);
    }
}

//back to main menu (or pause menu)
function back() {
    gameReset(true);

    mainMenu.style.display = "flex";
    shopMenu.style.display = "none";
    questMenu.style.display = "none";
    log.style.display = "none";
    scores.style.display = "none";
    pauseMenu.style.display = "none";
    gameEnd.style.display = "none";
}

//buy blade
function buy(bladeNum) {
    if (blades[bladeNum][1] > totalmoney) {
        error("Not enough money!");
    }
    else {
        const curBlade = document.getElementById("shopbtn" + bladeNum);
        curBlade.style.display = "none";

        blades[bladeNum][0] = true;

        const useBtn = document.getElementById("bladebtn" + bladeNum);
        useBtn.innerHTML = 'USE';
        useBtn.disabled = false;
        useBtn.style.display = "block";
        useBtn.style.pointerEvents = "auto"; 

        totalmoney -= blades[bladeNum][1];

        const shopmoneytext = document.getElementById("shopm");
        shopmoneytext.innerHTML = "Money: " + totalmoney;
        updateCurrency(totalmoney);
      
        updateBladePurchase(bladeNum);
    }
}

//use blade
function blade(bladeNum) {
    const curBlade = document.getElementById("bladebtn" + bladeNum);
    curBlade.innerHTML = 'CURRENT';
    curBlade.disabled = true;
    curBlade.style.pointerEvents = "none"; 

    const lastBlade = document.getElementById("bladebtn" + currentBlade);
    lastBlade.innerHTML = 'USE';
    lastBlade.disabled = false;
    lastBlade.style.pointerEvents = "auto"; 

    currentBlade = bladeNum;
  
    updateCurrentBlade(bladeNum);
}

//set user specific text after login
async function setAll() {
    const usertext = document.getElementById("user");
    usertext.innerHTML = user;
    
     //change login button to logout
    const logInOut = document.getElementById("log-btn");
    logInOut.innerHTML = "LOGOUT";
    logInOut.onclick = (event) => {
        event.preventDefault();
        logout();
    };
    
    // Reset blades and currentBlade to default before loading info
    blades = [
    [true, 0],
    [false, 20],
    [false, 40],
    [false, 60],
    [false, 80],
    [false, 100]
    ];
  
    currentBlade = 0;
    
    
    
    // Fetch the high score for the current user
    try {
        const response = await fetch('/highScore', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        const highScoreElement = document.getElementById("highscore");
        
        if (data.score !== undefined) {
            // Update the high score element with the retrieved high score
            highscore = data.score;
            highScoreElement.innerHTML = `High Score: ${highscore}`;
        } 
      
        const currencyResponse = await fetch('/currency', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const currencyData = await currencyResponse.json();

        if (currencyData.currency !== undefined) {
            totalmoney = currencyData.currency;
            const shopmoneytext = document.getElementById("shopm");
            shopmoneytext.innerHTML = "MONEY: " + totalmoney;
        }
        
        // Get current blade
        const currentBladeResponse = await fetch('/currentBlades', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const currentBladeData = await currentBladeResponse.json();

        if (currentBladeData.bladeNumber !== undefined) {
            currentBlade = currentBladeData.bladeNumber;
        }
      
        // Fetch the list of owned blades for the current user
        const ownedBladesResponse = await fetch('/ownedBlades', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const ownedBladesData = await ownedBladesResponse.json();
        const ownedBladesList = ownedBladesData.blades;
        
        ownedBladesList.forEach(index => {
            if (index >= 0 && index < blades.length) {
                blades[index][0] = true;
            }
        });
      
      
        for (let i = 0; i < blades.length; i++) {
        const curBlade = document.getElementById("shopbtn" + i);
        const useBtn = document.getElementById("bladebtn" + i);
        
        curBlade.style.display = "block";
        if (blades[i][0] == true) {
            curBlade.style.display = "none";

            useBtn.style.display = "block";
            
            if (currentBlade == i) {
                useBtn.innerHTML = 'CURRENT';
                useBtn.disabled = true;
                useBtn.style.pointerEvents = "none"; 
            }
            else {
                useBtn.innerHTML = 'USE';
                useBtn.disabled = false;
            }
        } 
        else {
            useBtn.style.display = "none";

            curBlade.innerHTML = 'BUY $' + blades[i][1];
            curBlade.disabled = false;
        }
    }
      
    //call get quests and update quests
    
    // Fetch the list of quests for the current user
    const questsResponse = await fetch('/quests', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }});
    const questsData = await questsResponse.json();
    const questsList = questsData.quests;
      
    questsList.forEach(index => {
          if (index >= 0 && index < quests.length) {
              quests[index][0] = true;
          }
    });
      
    
    for (let i = 0; i < quests.length; i++) {
        const curQuest = document.getElementById("qs" + i);
        if (quests[i][0] == true) {
            curQuest.innerHTML = 'COMPLETE';
            curQuest.style.backgroundColor = '#91C7B1';
        } 
        else {
            curQuest.innerHTML = 'INCOMPLETE';
            curQuest.style.backgroundColor = '#54494B';
        }
    }
    

    } catch (error) {
        console.error('Error in SetAll', error);
        // Handle the error as needed
    }
}

async function setAllGuest() {
    const usertext = document.getElementById("user");
    user = "GUEST"
    usertext.innerHTML = user;
    
    // Reset blades and currentBlade to default before loading info
    blades = [
    [true, 0],
    [false, 20],
    [false, 40],
    [false, 60],
    [false, 80],
    [false, 100]
    ];
  
    
  
    const highScoreElement = document.getElementById("highscore");
    highscore = 0;
    highScoreElement.innerHTML = `High Score: ${highscore}`;
    
    const shopmoneytext = document.getElementById("shopm");
    totalmoney = 0;
    shopmoneytext.innerHTML = "MONEY: " + totalmoney;  
    
    currentBlade = 0;
    
  
    for (let i = 0; i < blades.length; i++) {
        const curBlade = document.getElementById("shopbtn" + i);
        const useBtn = document.getElementById("bladebtn" + i);
        
        curBlade.style.display = "block";
        if (blades[i][0] == true) {
            curBlade.style.display = "none";

            useBtn.style.display = "block";
            
            if (currentBlade == i) {
                useBtn.innerHTML = 'CURRENT';
                useBtn.disabled = true;
                useBtn.style.pointerEvents = "none"; 
            }
            else {
                useBtn.innerHTML = 'USE';
                useBtn.disabled = false;
            }
        } 
        else {
            useBtn.style.display = "none";

            curBlade.innerHTML = 'BUY $' + blades[i][1];
            curBlade.disabled = false;
        }
    } 
    
    for (let i = 0; i < quests.length; i++) {
        const curQuest = document.getElementById("qs" + i);
          curQuest.innerHTML = 'INCOMPLETE';
          curQuest.style.backgroundColor = '#54494B';
        }
}

        

// TODO: doesnt work
function disableScroll() {
    // Get the current page scroll position
    scrollTop = window.scrollY || document.documentElement.scrollTop;
    scrollLeft = window.scrollY || document.documentElement.scrollLeft;

    // if any scroll is attempted, set this to the previous value
    window.onscroll = function() {
        window.scrollTo(scrollLeft, scrollTop);
    };
}

/**
 * Makes all Matter-JS Bodies passed in static
 */
function pause(list) {
    i = 0
    list.forEach(element => {
        if(element.isStatic === false) {
            v = Body.getVelocity(element)
            aliveProjectiles[i++] = {
                object: element,
                v_x: v.x,
                v_y: v.y
            }
        }
        element.isStatic = true
    });
}

/**
 * Makes all Matter-JS Bodies passed in dynamic
 */
function play() {
    paused = false
    Object.keys(aliveProjectiles).forEach(key => {
        p = aliveProjectiles[key].object
        Body.setVelocity(p, {x: aliveProjectiles[key].v_x, y: aliveProjectiles[key].v_y})
        p.isStatic = false
    });
    aliveProjectiles = {}
    update()
}

function randomColor() {
    switch (Math.floor(Math.random() * 4)) {
        case 0: return '#F1F7ED'
        case 1: return '#54494B'
        case 2: return '#B33951'
        case 3: return '#E3D081'
        default: 
            return 'black'        
    }
}

rainbownext = 6;
function rainbowColor() {
    if (rainbownext === 6) {
        rainbownext = 0;
    }
    else {
        rainbownext++;
    }
    switch (rainbownext) {
        case 0: return '#fc1703'
        case 1: return '#fc9803'
        case 2: return '#fce803'
        case 3: return '#6bfc03'
        case 4: return '#03ecfc'
        case 5: return '#6203fc'
        case 6: return '#ba03fc'
        default: 
            return 'black'        
    }
}

function getNumberOfWords(text) {
    var nLines = 0;
    for( var i = 0, n = text.length;  i < n;  ++i ) {
        if( text[i] === '\n' ) {
            ++nLines;
        }
    }
    return nLines;
}

function generateWordImage(word, color) {
    var imageCanvas = document.createElement('canvas')
    imageCanvas.style.zIndex = -1;
    var ctx2 = imageCanvas.getContext('2d')
    ctx2.font = "30px Iceland"
    imageCanvas.width = ctx2.measureText(word).width;
    imageCanvas.height = 30
    ctx2.font = "30px Iceland"
    ctx2.fillStyle = color
    ctx2.fillText(word, 0, 25)

    return imageCanvas.toDataURL('image/png')
}

function getRandomWordProjectile() {
    keys = Object.keys(words)
    index = Math.floor(Math.random() * keys.length)
    word = Object.keys(words)[index] || 'filler'
    sprite = new Image()
    if(words[word]) {
        if(words[word].alive) {
            sprite.src = words[word].alive
        }
    }

    x = Math.random() * (WIDTH - 200) + 100
    y = HEIGHT// + Math.random() * 1000
    body = Bodies.rectangle(x, y, 50, 50,
                            {
                                label: word,
                                render: {
                                    sprite: {
                                       texture: sprite.src,
                                       xScale: 1,
                                       yScale: 1
                                    },
                                },
                                collisionFilter: { // no collision
                                    'group': -1,
                                    'category': 2,
                                    'mask': 1,
                                },
                                mass: 1
                            })

    Body.setVelocity(body, {    x: Math.max(0.2, Math.random()) * 5 * (x > (WIDTH / 2) ? -1 : 1), 
                                y: Math.max(0.5, Math.random()) * -1 * (Math.sqrt(2 * y * engine.gravity.y))
    })
    Body.setAngularVelocity(body, Math.min(0.2, Math.random()) * (Math.random() > 0.5 ? -1 : 1))

    return body
}

function getMoneyProjectile() {
    word = 'money'
    sprite = generateWordImage(word, 'green')

    x = Math.random() * (WIDTH - 200) + 100
    y = HEIGHT// + Math.random() * 1000
    body = Bodies.rectangle(x, y, 50, 50,
                            {
                                label: word,
                                render: {
                                    sprite: {
                                       texture: sprite,
                                       xScale: 1,
                                       yScale: 1
                                    },
                                },
                                collisionFilter: { // no collision
                                    'group': -1,
                                    'category': 2,
                                    'mask': 1,
                                },
                                mass: 1
                            })

    Body.setVelocity(body, {    x: Math.max(0.2, Math.random()) * 5 * (x > (WIDTH / 2) ? -1 : 1), 
                                y: Math.max(0.4, Math.random()) * -1 * Math.sqrt(2 * y * engine.gravity.y)
    })
    Body.setAngularVelocity(body, Math.min(0.2, Math.random()) * (Math.random() > 0.5 ? -1 : 1))

    return body
}

function getBombProjectile() {
    word = 'bomb'
    sprite = generateWordImage(word, 'black')

    x = Math.random() * (WIDTH - 200) + 100
    y = HEIGHT// + Math.random() * 1000
    body = Bodies.rectangle(x, y, 50, 50,
                            {
                                label: word,
                                render: {
                                    sprite: {
                                       texture: sprite,
                                       xScale: 1,
                                       yScale: 1
                                    },
                                },
                                collisionFilter: { // no collision
                                    'group': -1,
                                    'category': 2,
                                    'mask': 1,
                                },
                                mass: 1
                            })

    Body.setVelocity(body, {    x: Math.max(0.2, Math.random()) * 5 * (x > (WIDTH / 2) ? -1 : 1), 
                                y: Math.max(0.3, Math.random()) * -1 * Math.sqrt(2 * y * engine.gravity.y)
    })
    Body.setAngularVelocity(body, Math.min(0.2, Math.random()) * (Math.random() > 0.5 ? -1 : 1))

    return body
}

function getFloor() {
    return Bodies.rectangle(0, HEIGHT+100, WIDTH*2, 1, {
        label: 'the floor',
        isStatic: true,
        collisionFilter: {
            group: 4,
            category: 1,
            mask: 2
        }
    })
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resizeCanvases() {
    WIDTH = window.innerWidth - MARGIN
    HEIGHT = window.innerHeight - MARGIN
    render.canvas.setAttribute('width', WIDTH + "px")
    render.canvas.setAttribute('height', HEIGHT + "px")
    bladeCanvas.setAttribute('width', WIDTH + "px")
    bladeCanvas.setAttribute('height', HEIGHT + "px")
    bladeCTX = bladeCanvas.getContext('2d')
    offsetX=bladeCanvas.offsetLeft
    offsetY=bladeCanvas.offsetTop
}

function getCurrentBlade() {
    return bladelist[currentBlade];
}

function gameInit() {
    // create an engine
    engine = Engine.create({
    });

    // set gravity strength // change for increased speed of game
    engine.gravity.y = 0.2
    
    // create a renderer
    render = Render.create({
        element: document.getElementById('canvases'),
        engine: engine,
        showCollisions: true,
        options: {
            wireframeBackground: 'green',
            wireframes: false,
            width: window.innerWidth - MARGIN,
            height: window.innerHeight - MARGIN,
            background: 'transparent'
        },
    });

    // set canvas size
    resizeCanvases()

    //document.getElementById('reset').onclick = gameReset
    /* document.getElementById('pause').onclick = () => {
        paused = !paused
        if(paused) { 
            play(projectiles)
            document.getElementById('pause').innerHTML = 'Pause'
        } else {
            pause(projectiles)
            document.getElementById('pause').innerHTML = 'Play'
        }
    } */

    // add mouse control
    mouse = Mouse.create(render.canvas)
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            },
            category: 1
        }
    });
    Events.on(mouseConstraint, 'mousedown', () => mousePressed = true) 
    Events.on(mouseConstraint, 'mouseup', () => mousePressed = false) 
    Events.on(mouseConstraint, 'mousemove', sliced) 

    // add mouse contraint to world
    Composite.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;
    
    //  resize canvas if window resizes
    addEventListener('resize', (event) => {
        resizeCanvases()
        World.remove(engine.world, floor)
        floor = getFloor()
        World.add(engine.world, floor)
    })

    // collision event
    Matter.Events.on(engine, 'collisionStart', collisionDetected)

    // run the engine
    Runner.run(engine);

    // run the renderer
    Render.run(render);

    // set game values
    gameReset(true)

    // start the game
    update()
}

function gameReset(isPaused) {
    document.getElementById('counter2').innerHTML = score
    document.getElementById('money2').innerHTML = money

    // game settings
    lives = 3
    money = 0
    score = 0
    paused = isPaused;
    //document.getElementById('pause').innerHTML = 'Pause'
    document.getElementById('counter').innerHTML = score
    document.getElementById('lives').innerHTML = lives
    document.getElementById('money').innerHTML = money

    projectiles = [];
    aliveProjectiles = {}
    World.remove(engine.world, Composite.allBodies(engine.world))

    // add the floor to the world
    floor = getFloor()
    World.add(engine.world, floor)

    // enable current blade
    if (currentBlade2 != null) {
        currentBlade2.disable()
    }
    currentBlade2 = getCurrentBlade()
    currentBlade2.enable()

    if (isPaused === false) {
        update();
    }
}

window.onload = async () => {

    switchLogRegister();

    addQuest('Login', 'log in to play.', 20)
    addQuest('Slice Bread', 'its the greatest thing.', 100)

    const curUser = await fetch('/checkLog', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const name = await curUser.json();
    if (name !== null) {
        user = name.username;
        setAll();
    }
    
    bladeCanvas = document.getElementById('canvas-blade')
    bladeCTX = bladeCanvas.getContext('2d')

    // get the word list from the server
    await fetch('words').then(response => {
        return response.json()
    })
    .then(json => {

        // map words to images
        word_array = json.words.trim().split('\n');
        for(i = 0; i < word_array.length; i++) {
            words[word_array[i]] = { 'alive': generateWordImage(word_array[i], rainbowColor()),
                            'sliced': generateWordImage(word_array[i], SLICED_COLOR) }
        }

        // turn off scroll
        //disableScroll()

        /* MATTER JS INITIALIZATION */ 
        gameInit()
    })

}

update = async function() {

    if(!paused && lives > 0) {
        waittime = Math.random() * 3000 + 1000
        await delay(waittime).then()
        
        // check again after delay
        if(!paused && lives > 0) {
            // temporal recursion, call the function in the future
            window.requestAnimationFrame( update )
                
            switch (Math.floor(Math.random() * 10)) {
                case 0: // normal word
                    body = getRandomWordProjectile()
                    projectiles.push(body);
                    break;
                case 1: // money word
                    body = getMoneyProjectile()
                    projectiles.push(body);
                    break;
                case 2: // bomb
                    body = getBombProjectile()
                    projectiles.push(body);
                    break;
                default: // normal word
                    body = getRandomWordProjectile()
                    projectiles.push(body);
                    break;
            }
        }
       
        World.add(engine.world, body)
    }
}


function switchLogRegister() {
    const form = document.querySelector( '#loginForm' );
    form.reset()
  
    const logtitle = document.querySelector('#logtitle');
    const logtext = document.querySelector('#logtext');
    const logbtn = document.querySelector('#submitLogin');
  
    if (logtitle.innerHTML === "LOGIN") {
      logtitle.innerHTML = "REGISTER";
      logtext.innerHTML = "Already have an account? <span class='linktext' id = 'textbtn' role='button'>Login</span>";
      logbtn.onclick = (event) => {
        event.preventDefault();
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;
        form.reset();
        register(username, password);
      };
    }
    else {
      logtitle.innerHTML = "LOGIN";
      logtext.innerHTML = "Don't have an account? <span class='linktext' id = 'textbtn' role='button'>Register</span>";
      logbtn.onclick = (event) => {
        event.preventDefault();
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;
        form.reset();
        login(username, password);
      };
    }
    const textbtn = document.querySelector('#textbtn');
      textbtn.onclick = (event) => {
        event.preventDefault();
        switchLogRegister();
    };
}

async function login(u, p) {
    try {
        if (u === '' || p === '') {
            error("Username and Password are required fields!");
            return;
        }

        if (u.toLowerCase() === 'guest') {
            error("Username taken!");
            return;
        }

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: u, password: p })
        });

        const loginAttempt = await response.json();
        console.log(loginAttempt);

        if (loginAttempt.success) {
            console.log("Login successful.");
            user = u;
            setAll();
            setQuest(0);
            back();
        } else {
            console.log("Login failed:", loginAttempt.message);
            error("Incorrect Username and Password.");
        }
    } catch (error) {
        console.error('Error in login:', error.message);
    }
}

async function register(u, p) {
    try {
        if (u === '' || p === '') {
            error("Username and Password are required fields!");
            return; 
        }

        if (u.toLowerCase() === 'guest') {
            error("Username taken!");
            return;
        }

        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: u, password: p })
        });

        const registrationAttempt = await response.json();
        console.log(registrationAttempt);

        if (registrationAttempt.success) {
            console.log("Registration successful.");
            user = u;
            setAll();
            setQuest(0) // login quest
            back();
        } else {
            if (response.status === 400) {
                error("Username taken!");
            } else {
                error("Registration failed.")
            }
        }
    } catch (error) {
        console.error('Error in registration:', error.message);
    }
}

async function logout() {
    //change login button to logout
    const logInOut = document.getElementById("log-btn");
    logoutSession();
    setAllGuest();
    logInOut.innerHTML = "LOGIN";
    logInOut.onclick = (event) => {
        event.preventDefault();
        loginScreen();
    };
}

async function logoutSession() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user })
        });

        const logout = await response.json();
        if (logout.success) {
            console.log("User logged out successfully");
        } else {
            console.error("Failed to log out:", logout.message);
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
    
}

function error(text) {
    const t = document.querySelector("#errorText");
    t.textContent = text;
    const popup = document.querySelector( '#errorPop' );
    popup.style.display = "flex";
}

function exitPopup() {
    const popup = document.querySelector( '#errorPop' );
    popup.style.display = "none";
  }

async function updateHighScore(score) {
    if (user === "GUEST") { return; }
    try {
        const response = await fetch('/highScore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ score })
        });

        const data = await response.json();
        if (data.success) {
            console.log("High score updated successfully");
        } else {
            console.error("Failed to update high score:", data.message);
        }
    } catch (error) {
        console.error('Error updating high score:', error);
    }
}

async function updateCurrency(currency) {
    if (user === "GUEST") { return; }
    try {
        const response = await fetch('/currency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currency })
        });

        const data = await response.json();
        if (data.success) {
            console.log("Currency updated successfully");
        } else {
            console.error("Failed to update currency:", data.message);
        }
    } catch (error) {
        console.error('Error updating currency:', error);
    }
}

async function updateBladePurchase(blade) {
    if (user === "GUEST") { return; }
    try {
        const response = await fetch('/ownedBlades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ blade })
        });

        const data = await response.json();
        if (data.success) {
            console.log("Blade purchase updated successfully");
        } else {
            console.error("Failed to update blade purchase:", data.message);
        }
    } catch (error) {
        console.error('Error updating blade purchase:', error);
    }
}

async function updateCurrentBlade(bladeNumber) {
    if (user === "GUEST") { return; }
    try {
        const response = await fetch('/currentBlades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bladeNumber })
        });

        const data = await response.json();
        if (data.success) {
            console.log("Current blade updated successfully");
        } else {
            console.error("Failed to update current blade:", data.message);
        }
    } catch (error) {
        console.error('Error updating current blade:', error);
    }
}

async function updateQuest(questNumber) {
    if (user === "GUEST") { return; }
    try {
        const response = await fetch('/quests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quest: questNumber })
        });

        const data = await response.json();
        if (data.success) {
            console.log("Quest updated successfully");
        } else {
            console.error("Failed to update quest:", data.message);
        }
    } catch (error) {
        console.error('Error updating quest:', error);
    }
}

function addQuest(name, description, reward, func=()=>{}) {
    questList = document.getElementById('quest-list')
    wrapper = document.createElement('div')
    wrapper.classList.add('listitem')
    
    wrapper2 = document.createElement('div')
    wrapper2.classList.add('menu-txt')

    title = document.createElement('h3')
    title.innerHTML = name

    subtext = document.createElement('p')
    subtext.innerHTML = description + ' $' + reward 

    wrapper2.appendChild(title)
    wrapper2.appendChild(subtext)

    display = document.createElement('div')
    display.classList.add('quest-status')
    display.id = 'qs' + quests.length
    display.innerHTML= 'INCOMPLETE'
    quests.push([false, reward])

    wrapper.appendChild(wrapper2)
    wrapper.appendChild(display)

    questList.append(wrapper)

    func()
}