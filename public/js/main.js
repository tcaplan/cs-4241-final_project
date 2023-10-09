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

MARGIN = 100
WIDTH = 0
HEIGHT = 0
SLICED_COLOR = 'grey'
MAX_SLICES = 4

var engine
var render

words = {}
bodies = []

// global variables
mousePressed = false
slicing = false

sliced = event => {
    if(mousePressed === true && slicing === false) {
        slicing = true
        bodiesAtPos = Matter.Query.point(bodies, event.mouse.position);

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
            projectile = pair.bodyA.label === 'the floor' ? pair.bodyB : pairBodyA
            // check if a bomb collided with the floor
            if(projectile.label !== 'bomb' && Body.getVelocity(projectile).y < 0) {
                lives--
                document.getElementById('lives').innerHTML = lives
            }
            World.remove(engine.world, projectile)
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
        element.isStatic = true
    });
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
    imageCanvas.width = word.length * 15
    imageCanvas.height = 30
    var ctx2 = imageCanvas.getContext('2d')
    ctx2.font = "30px Arial"
    ctx2.fillStyle = color
    ctx2.fillText(word, 10, 25, 150)

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

window.onload = async () => {

    document.getElementById('counter').innerHTML = score
    document.getElementById('lives').innerHTML = lives
    document.getElementById('money').innerHTML = money

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
        disableScroll()

        /* MATTER JS INITIALIZATION */

        // create an engine
        engine = Engine.create({
        });

        // set gravity strength // change for increased speed of game
        engine.gravity.y = 0.2
        
        // create a renderer
        render = Render.create({
            element: document.getElementById('canvas'),
            engine: engine,
            showCollisions: true,
            options: {
                wireframeBackground: 'green',
                wireframes: false,
                width: window.innerWidth - MARGIN,
                height: window.innerHeight - MARGIN,
                background: 'yellow'
            },
        });

        // set canvas size
        WIDTH = window.innerWidth - MARGIN
        HEIGHT = window.innerHeight - MARGIN
        render.canvas.setAttribute('width', WIDTH + "px")
        render.canvas.setAttribute('height', HEIGHT + "px")

        // add mouse control
        var mouse = Mouse.create(render.canvas)
        var mouseConstraint = MouseConstraint.create(engine, {
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

        // add the floor to the world
        floor = getFloor()
        World.add(engine.world, floor)

        
        //  resize canvas if window resizes
        addEventListener('resize', (event) => {
            WIDTH = window.innerWidth - MARGIN
            HEIGHT = window.innerHeight - MARGIN
            render.canvas.setAttribute('width', WIDTH + "px")
            render.canvas.setAttribute('height', HEIGHT + "px")
            World.remove(engine.world, floor)
            floor = getFloor()
            World.add(engine.world, floor)
        })

        Matter.Events.on(engine, 'collisionStart', collisionDetected)

        // run the engine
        Runner.run(engine);

        // run the renderer
        Render.run(render);

        // start the game
        update()  
    })

}

update = async function() {

    if(lives > 0) {
        waittime = Math.random() * 3000 + 1000
        await delay(waittime).then()
        
        // temporal recursion, call the function in the future
        window.requestAnimationFrame( update )
    
        switch (Math.floor(Math.random() * 10)) {
            case 0: // normal word
                body = getRandomWordProjectile()
                bodies.push(body);
                break;
            case 1: // money word
                body = getMoneyProjectile()
                bodies.push(body);
                break;
            case 2: // bomb
                body = getBombProjectile()
                bodies.push(body);
                break;
            default: // normal word
                body = getRandomWordProjectile()
                bodies.push(body);
                break;
        }
        
        World.add(engine.world, body)
    }
}
  

