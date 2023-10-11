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

MARGIN = 100
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
        
        bladeCTX.fillStyle = color === 'random' ? randomColor() : color
        bladeCTX.font = font
        bladeCTX.fillText(text, startX, startY)
        startX=mouseX;
        startY=mouseY;
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
                } else if (body.label === 'bomb') {
                    body.parts[0].render.sprite.texture = generateWordImage('bomb', SLICED_COLOR)
                    lives = 0
                    currentBlade2.disable()
                    document.getElementById('lives').innerHTML = lives
                } else {
                        score++
                        body.parts[0].render.sprite.texture = words[body.label].sliced
                        document.getElementById('counter').innerHTML = score                    
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
            if(projectile.label !== 'bomb' && Body.getVelocity(projectile).y > 0 && lives > 0) {
                lives--
                document.getElementById('lives').innerHTML = lives
            }
            World.remove(engine.world, projectile)
            projectiles.filter(p => p.label !== projectile.label)
        }
    }
}

// let money = 0;
let user = "GUEST";
let highscore = 0;

let blades = [
    [true, 0],
    [false, 50]
    ];

let quests = [
    [false, 20],
    [false, 50]
    ];

let currentBlade = 0;

//menus for hiding/showing
const mainMenu = document.getElementById("main");
const shopMenu = document.getElementById("shop");
const questMenu = document.getElementById("quests");
const log = document.getElementById("log");
const scores = document.getElementById("scores");
const pauseMenu = document.getElementById("pauseMenu");
const pauseBtn = document.getElementById("pause");

//start or unpause game
function playButton(start) {
    mainMenu.style.display = "none";
    pauseMenu.style.display = "none";
    pauseBtn.style.display = "block";

    //if start = true, start from beginning, else unpause
    //canvas stuff here
    if (start === true) {
        gameReset()
    }
    play(projectiles);
}

function pauseButton() {
    pauseMenu.style.display = "flex";
    pauseBtn.style.display = "none";
    pause(projectiles);
    //canvas stuff here
}

function gameOver() {
    mainMenu.style.display = "flex";
    pauseBtn.style.display = "none";

    const playbtn = document.getElementById("play");
    playbtn.setAttribute('onclick',"playButton(true)");
    playbtn.innerHTML = 'PLAY AGAIN';

    const mainText = document.getElementById("maintext");
    mainText.innerHTML = 'GAME OVER';
}

function shop() {
    mainMenu.style.display = "none";
    shopMenu.style.display = "flex";

    const shopmoneytext = document.getElementById("shopm");
    shopmoneytext.innerHTML = "MONEY: " + money;
}

function questM() {
    mainMenu.style.display = "none";
    questMenu.style.display = "flex";
}

function setQuest(questNum) {
    quests[questNum][0] = true;
    money += quests[questNum][1];

    const curQuest = document.getElementById("qs" + questNum);
    curQuest.innerHTML = 'COMPLETE';
    curQuest.style.backgroundColor = '#91C7B1';
}

function loginScreen() {
    mainMenu.style.display = "none";
    log.style.display = "flex";
}

function showScores() {
    mainMenu.style.display = "none";
    scores.style.display = "flex";
}

//back to main menu (or pause menu)
function back() {

    mainMenu.style.display = "flex";
    shopMenu.style.display = "none";
    questMenu.style.display = "none";
    log.style.display = "none";
    scores.style.display = "none";
    pauseMenu.style.display = "none";
}

//buy blade
function buy(bladeNum) {
    if (blades[bladeNum][1] > money) {
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

        money -= blades[bladeNum][1];

        const shopmoneytext = document.getElementById("shopm");
        shopmoneytext.innerHTML = "Money: " + money;
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
}

//set user specific text after login
function setAll() {
    const usertext = document.getElementById("user");
    usertext.innerHTML = user;

    for (let i = 0; i < blades.length; i++) {
        const curBlade = document.getElementById("shopbtn" + i);
        const useBtn = document.getElementById("bladebtn" + i);
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

            curBlade.innerHTML = 'BUY';
            curBlade.disabled = false;
        }
    }

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
    list.forEach(element => {
        element.isStatic = true
    });
}

/**
 * Makes all Matter-JS Bodies passed in dynamic
 */
function play(list) {
    list.forEach(element => {
        element.isStatic = false
    });
    update()
}

function randomColor() {
    switch (Math.floor(Math.random() * 5)) {
        case 0: return 'blue'
        case 1: return 'purple'
        case 2: return 'orange'
        case 3: return 'red'
        case 4: return 'cyan'
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
    ctx2.font = "30px Arial"
    imageCanvas.width = ctx2.measureText(word).width;
    imageCanvas.height = 30
    ctx2.font = "30px Arial"
    ctx2.fillStyle = color
    ctx2.fillText(word, 0, 25, 150)

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
    return rainbowEmojiBlade
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

    document.getElementById('reset').onclick = gameReset
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
    gameReset()

    // start the game
    update() 
}

function gameReset() {
    // game settings
    lives = 3
    money = 0
    score = 0
    paused = false
    document.getElementById('pause').innerHTML = 'Pause'
    document.getElementById('counter').innerHTML = score
    document.getElementById('lives').innerHTML = lives
    document.getElementById('money').innerHTML = money

    World.remove(engine.world, Composite.allBodies(engine.world))

    // add the floor to the world
    floor = getFloor()
    World.add(engine.world, floor)

    // enable current blade
    currentBlade2 = getCurrentBlade()
    currentBlade2.enable()

    update()
}

window.onload = async () => {

    switchLogRegister();
    
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
            words[word_array[i]] = { 'alive': generateWordImage(word_array[i], randomColor()),
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
    //server stuff here

    if ((u === '') || (p === '')) {
        error("Username and Password are required fields!");
    }
    if (u == 'GUEST' || u == 'guest') {
        error("Username taken!");
    }

    //setAll();
}

async function register(u, p) {
    //server stuff here

    if ((u === '') || (p === '')) {
        error("Username and Password are required fields!");
    }
    if (u == 'GUEST' || u == 'guest') {
        error("Username taken!");
    }

    setAll();
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