
let money = 0;
let user = "GUEST";
let highscore = 0;

let blades = [
    [false, 0],
    [false, 50]
    ];

let quests = [
    [false, 20],
    [false, 50]
    ];

let currentBlade = 0;

const mainMenu = document.getElementById("main");
const shopMenu = document.getElementById("shop");
const questMenu = document.getElementById("quests");
const log = document.getElementById("log");
const pauseBtn = document.getElementById("pause");

//start or unpause game
function play(start) {
    mainMenu.style.display = "none";
    pauseBtn.style.display = "block";

    //if start = true, start from beginning, else unpause
    //canvas stuff here
}

function pause() {
    mainMenu.style.display = "flex";
    pauseBtn.style.display = "none";

    const playbtn = document.getElementById("play");
    playbtn.setAttribute('onclick',"play(false)");
    playbtn.innerHTML = 'RESUME';


    const mainText = document.getElementById("maintext");
    mainText.innerHTML = 'PAUSED';

    //canvas stuff here
}

function gameOver() {
    mainMenu.style.display = "flex";
    pauseBtn.style.display = "none";

    const playbtn = document.getElementById("play");
    playbtn.setAttribute('onclick',"play(true)");
    playbtn.innerHTML = 'PLAY AGAIN';

    const mainText = document.getElementById("maintext");
    mainText.innerHTML = 'GAME OVER';
}

function shop() {
    mainMenu.style.display = "none";
    shopMenu.style.display = "flex";

    const shopmoneytext = document.getElementById("shopm");
    shopmoneytext.innerHTML = "Money: " + money;
}

function questM() {
    mainMenu.style.display = "none";
    questMenu.style.display = "flex";
}

function setQuest(questNum) {
    quests[questNum][0] = true;
    money += quests[questNum][1];
}

function loginScreen() {
    mainMenu.style.display = "none";
    log.style.display = "flex";
}

//back to main menu (or pause menu)
function back() {
    mainMenu.style.display = "flex";
    shopMenu.style.display = "none";
    questMenu.style.display = "none";
    log.style.display = "none";
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
        const curBlade = document.getElementById("shopbtn" + (i+1));
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
            curQuest.style.backgroundColor = 'green';
        } 
        else {
            curQuest.innerHTML = 'INCOMPLETE';
        }
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
    try {
        // Check if username and password are provided
        if ((u === '') || (p === '')) {
            error("Username and Password are required fields!");
            return;
        }

        // Check if the username is 'GUEST' or 'guest'
        if (u.toLowerCase() === 'guest') {
            error("Username taken!");
            return;
        }

        const loginAttempt = await attemptLogin(u, p); 

        if (loginAttempt.success) {
            console.log("Login successful.");
            user = u;
            setAll();
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
        // Check if username and password are provided
        if ((u === '') || (p === '')) {
            error("Username and Password are required fields!");
            return; 
        }

        // Check if the username is 'GUEST' or 'guest'
        if (u.toLowerCase() === 'guest') {
            error("Username taken!");
            return;
        }

        const registrationAttempt = await attemptRegister(u, p);
      
        if (registrationAttempt.success) {
            console.log("Registration successful.");
            user = u;
            setAll();
        } else {
            if (registrationAttempt.status === 400) {
                error("Username taken!");
            } else {
                error("Registration failed.")
            }
        }
    } catch (error) {
        console.error('Error in registration:', error.message);
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

window.onload = function() {
    switchLogRegister();

    //insert cookie stuff here
    //probably setAll() after cookies set variables 
}


async function attemptLogin(u, p) {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: u, password: p })
        });

        const data = await response.json();
        console.log(data);

        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}


async function attemptRegister(u, p) {
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: u, password: p })
        });

        const data = await response.json();
        console.log(data);

        return data;
    } catch (error) {
        console.error('Error during registration:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}