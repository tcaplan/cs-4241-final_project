# Word Slice
link: https://word-slice.glitch.me/

## Description
Word Slice is a game based on the hit sensation game Fruit Ninja. It is aimed for people with nostalgia for Fruit Ninja, as well as users who enjoy simple yet fun online games. The game uses a persistent database, so users are given the option to play as a guest, or log in and save their progress. There is also a high score board to display the high score as well as the top 10 scores and users.

In the game, words are tossed in the air randomly and the user must "slice" the words with their cursor, or lose the game. Each play of the game gives the user 3 lives. For each missed word, the user loses one life. If the user slices a "bomb" (the word bomb), they automatically lose all lives. If the user slices "money" (the word money), they gain $20. Money can be used in the shop to buy cool blades. A quest feature gives users goals to achieve while playing the game, such as "Slice Bread". Money is earned for completing quests, which can be used in the shop.

## Additional Instructions

Pre-existing Account Login Info:
Username: testBlades
Password: test

## Technologies Used
1. JavaScript - language for development
2. MongoDB - persistent database
3. Node.js - used for server-side development
4. express - library used for server-side development
5. Matter.js - physics library for game mechanics
6. Canvas - library used for the generation of word sprite images and blade display.

## Challenges
Matter.js as a physics library is helpful, however for graphics library has much room for improvement. Figuring out layering the Matter.js canvas with the rest of our interface took a lot of trial, error, and time. Many bugs such as one object causing multiple collisions or invisible projectiles were difficult to find and solve as well. Matter.js also has poor documentation that involves minimal examples, so figuring out proper implementation what challenging. Error handling on the server-side, especially when referencing the database was very time-consuming, and getting cookies functional so that users will stay logged in was also difficult. Overall, the hardest part of development was integration between our separate branches: game functionality, UI, and server-side.

## Responsibilities

### Thea Caplan
Worked on game functionality, implementing the Matter.js library to create the trajectories of the words. Implemented collision events for "slicing" words, money, and bombs. Implemented base blade designs and functionality. Implemented the randomized projectile launching. Implemented quest functionality.

### Jade Logan
Worked on menu interfaces and styling. Handled integrating the canvas elements with menus so that menu functionality is not impeded by the canvas and menu buttons and displays can interact with the game. Implemented functions to update different pages using user data. Implemented shop functionality.

### Brendan Mannion
Worked on database and login functionality. Used MongoDB database to store tables for various parts of game such as logins, highscores, bladesOwned, and currency. Wrote the backend functions using NodeJS and helped connect them to front end. Also set up cookie-sessions to make sure users can stay logged in upon refresh or rejoining page.

## Project Video
https://drive.google.com/file/d/1FVamZEz5-_DgfwHt2ZKbecVwq_R7SutQ/view?usp=sharing
