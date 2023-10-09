// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Composite = Matter.Composite,
    Events = Matter.Events

WIDTH = 600
HEIGHT = 500
sliceCount = 0
let words = []
SLICED_COLOR = 'grey'

var engine
var render

// bodies
bodies = []

// global variables
mousePressed = false
slicing = false


sliced = event => {
    if(mousePressed === true && slicing === false) {
        slicing = true
        bodiesAtPos = Matter.Query.point(bodies, event.mouse.position);

        bodiesAtPos.forEach(body => {
            if(body.isStatic === false) {
                console.log(body.position.x + " " + body.position.y)
                body.isStatic = true
                body.parts[0].render.text.color = SLICED_COLOR
                sliceCount++
                document.getElementById('counter').innerHTML = sliceCount

            }
        })
        slicing = false
    }
}

/**
 * Returns a Body with the param values
 * @param {*} x x coordinate for body to start at
 * @param {*} y y coordinate for body to start at
 * @param {*} v_x initial velocity in the x-direction
 * @param {*} v_y initial velocity in the y-direction
 */
function makeWord(x, y, size, v_x, v_y, text, color=null) {
    // create body
    body = Bodies.text(x, y, text, size, {
        collisionFilter: { // no collision
            'group': -1,
            'category': 2,
            'mask': 1,
        },
        color: color,
        mass: 1
        
    })

    Body.setVelocity(body, {x: v_x, y: v_y})
    // Body.setAngularVelocity(body, 5)

    return body
}

// Not in use
function drawSlicedWord(old) {
    // create body
    body = Bodies.text(old.position.x, 
        old.position.y, 
        old.parts[0].render.text.content, 
        old.parts[0].render.text.size, {
        collisionFilter: { // no collisions
            'group': -1,
            'category': 3,
            'mask': 5,
        },
        isStatic: true,
        // opacity: 0.5
    })

    World.add(engine.world, body)
}

// Not in use
function drawSlicedWordOLD(x, y, oldBody) {
    text = oldBody.render.text.content

    // create body
    body_left = Bodies.text(x, 
                            y, 
                            oldBody.render.text.content, 
                            oldBody.render.text.size,
                            {isStatic: true})
    body_right = Bodies.text(x+50+25, 
                            y, 
                            oldBody.render.text.content, 
                            oldBody.render.text.size,
                            {isStatic: true})
    // no collisions
    body_left.collisionFilter = {
        'group': -1,
        'category': 3,
        'mask': 5,
        };
    body_right.collisionFilter = {
    'group': -1,
    'category': 3,
    'mask': 5,
    };

    World.add(engine.world, body_left)
    World.add(engine.world, body_right)
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

function setColor(body, color) {
    body.parts[0].render.text.color = color
}
function setText(body, text) {
    body.parts[0].render.text.content = text
}
function setSize(body, size) {
    body.parts[0].render.text.size = size
}

function randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16)
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

function getRandomWordProjectile()  {
    c = Math.floor(Math.random() * (words.length))
    index = Math.floor(Math.random() * 150)
    word = words[index] || 'filler'

    x = Math.random() * (WIDTH - 200) + 100
    y = HEIGHT// + Math.random() * 1000
    w = makeWord(   x, 
                    y, 
                    30,
                    // 0, -10, 
                    Math.random() * 5 * (x > (WIDTH / 2) ? -1 : 1), 
                    Math.max(0.2, Math.random()) * -1 * Math.sqrt(2 * engine.gravity.y * y),
                    // Math.random() * (-1 * engine.gravity.y * (7 + y * -10)) - 10, 
                    word,
                    randomColor())
    // w.isStatic = true
    return w;
}

window.onload = () => {

    document.getElementById('counter').innerHTML = sliceCount

    // get all the possible words from the text file
    fetch('./libraries/words.txt').then(response => {
        return response.text()
    }).then(fileContent => {
        words = fileContent.trim().split('\n');
    }).then(r => { 
        // create an engine
        engine = Engine.create({
        });

        for(i = 0; i < 10; i++) {
            body = getRandomWordProjectile()
            bodies.push(body);
        }
        bodies.push(Bodies.rectangle(0, HEIGHT, WIDTH*2, 10, {
            isStatic: true
        }))
        
        body = Bodies.rectangle(300, 300, 100, 200, {
            collisionFilter: { // no collision
                'group': -1,
                'category': 2,
                'mask': 1,
            },
            // isStatic: true
        })
        Body.setVelocity(body, {x: 1, y: -2})
        // Body.setAngularSpeed(body, 0.1)
        bodies.push(body)
    }).then(r2 => {

        // create a renderer
        render = Render.create({
            element: document.body,
            engine: engine,
            showCollisions: true,
            options: {
                wireframeBackground: 'green',
                wireframes: true,
                width: WIDTH,
                height: HEIGHT,
                background: 'transparent'
            },
        });

        engine.gravity.y = 0.2

        // add mouse control
        var mouse = Mouse.create(render.canvas)
        // mouse.collisionFilter.group = 0
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


        Composite.add(engine.world, mouseConstraint);

        // keep the mouse in sync with rendering
        render.mouse = mouse;

        // add all of the bodies to the world
        World.add(engine.world, bodies);

        // run the engine
        Runner.run(engine);

        // run the renderer
        Render.run(render);
    })

}