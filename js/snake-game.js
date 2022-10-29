/*
  File: snake-game.js
  Author: m0chael
  Description: A snake game written in Javascript, please click inside the screen and use the arrow keys for navigation
*/

// The size of the board, if this changes, it must change the css appropriately too to switch sizes of the grid
const SIZE = 30;

// The size of how many blocks it will grow by
const SIZE_OF_SNAKE_GROWING_AMOUNT = 2;

// Direction mapping as an object
const DIRECTIONS = {
  "S" : [0,1],
  "E" : [1,0],
  "N" : [0,-1],
  "W" : [-1,0]
};

// This q function returns a document.querySelector for ease of use
function q(incoming) { return document.querySelector(incoming); };

// getRandomInt returns a number up to a maximum amount
function getRandomInt(maximum) { return Math.floor(Math.random() * Math.floor(maximum)); };

// The interval object which is used to hold setInterval and also clear the interval in gameplay
let SNAKE_INTERVAL;

// The starting direction of the snake
let direction = "S"
// The grid which holds the board array of arrays (2D array)
let grid = [];

// Counting the apples eaten
let appleEatenCount = 0;

// The apple segments which are the coordinates of the current apple that needs to be eaten, in this game it's a selkirk logo
let appleSegments = [[getRandomInt(SIZE), getRandomInt(SIZE)]];

// The snakeSegments of the snake, which the first segment is the 'head' of the snake which directs and may collide with things
let snakeSegments = [[15,15]];

// Control switch for when the snake is growing or not to add a new block when isGrowing is true
let isGrowing = true;

// Saving the growing location for when adding a new segment to the snake
let savedGrowingLocation;

// Counts the growing blocks to add 2 blocks on a level increase (eating an apple)
let countGrowing = 0;

// Assigns new coordinates for an apple
function newApple() {
  appleSegments = [[getRandomInt(SIZE), getRandomInt(SIZE)]];
};

// The move functionality which handles the current direction
function moveTheSnake() {
  let directionCoord = DIRECTIONS[direction];

  // Adds element to the beginning of the array with coordinates of the next step moving forward in the right direction
  snakeSegments.unshift(plusNewSegmentLocationForMovingSnake(snakeSegments[0], directionCoord));

  if (isGrowing && countGrowing < SIZE_OF_SNAKE_GROWING_AMOUNT) {
    snakeSegments.push(savedGrowingLocation);
    countGrowing += 1;
  } else {
    countGrowing = 0;
    isGrowing = false;
  }

  snakeSegments.pop();
};

// Grow function which saves the first item of the snake to know where to insert more blocks to grow
function grow() {
  savedGrowingLocation = snakeSegments[0];
};

// Direction setting function to save in global variable direction
function turnSnakeTo(incomingDirection) {
  direction = incomingDirection;
};

// Plus function which saves the coordinates with the new direction
function plusNewSegmentLocationForMovingSnake(incomingCoordinates, incomingDirectionCoordinates) {
  let x = incomingCoordinates[0] + incomingDirectionCoordinates[0];
  let y = incomingCoordinates[1] + incomingDirectionCoordinates[1];
  return [x,y];
};

// Check for when an apple is found at specific coordinates, returning truue or false
function isAppleFound(incomingCoordinates) {
  let found = false;

  appleSegments.forEach(function(apple_segment) {
    if (apple_segment[0] == incomingCoordinates[0] && apple_segment[1] == incomingCoordinates[1]) {
      found = true;
      console.log("Found apple.");
    }
  });
  return found;
};

// Check for when the snake is found at specific coordinates, returning true or false
function isSnakeFound(incomingCoordinates) {
  let found = false;

  snakeSegments.forEach(function(segment){
    if (segment[0] == incomingCoordinates[0] && segment[1] == incomingCoordinates[1]) {
      found = true;
      console.log("Found snake.");
    }
  });
  return found;
};

// Check if the incoming position is out of bounds
function outOfBounds(incomingPosition) {
  let x = incomingPosition[0];
  let y = incomingPosition[1];
  let wasOutOfBounds = false;

  if (x < 0 || x >= SIZE) { wasOutOfBounds = true }

  if (y < 0 || y >= SIZE) { wasOutOfBounds = true; }

  console.log("Out of bounds was: " + wasOutOfBounds);
  return wasOutOfBounds;
};

// Function to check whether the snake collides with an apple
function didSnakeCollideWithApple() {
  return (appleSegments[0][0] == snakeSegments[0][0] && appleSegments[0][1] == snakeSegments[0][1]);
}

// Function to return the true or false when the snake collides with itself past the first index which is the head of the snake
function snakeCollidesWithSelf() {
  let isCollided = false;
  snakeSegments.forEach(function(segment, index) {
    if (index > 0) {
      if (snakeSegments[0][0] == segment[0] && snakeSegments[0][1] == segment[1]) {
        isCollided = true;
      }
    }
  });
  return isCollided;
}

// Step functionality which runs the game loop basically. It will check if the game is over just like a while loop with an if
function gameLoopStep() {
  moveTheSnake();

  // Check for out of bounds or game over by colliding with itself for the snake
  if (outOfBounds(snakeSegments[0]) || snakeCollidesWithSelf()) {
    console.log("Out of bounds or over.");
    q(".notification-title").innerHTML = "You got to level " + appleEatenCount + "! &#x2601; Refresh the page to play again.";
    // Stop the game cleanly by clearing the interval
    clearInterval(SNAKE_INTERVAL);
  }

  // Check if the snake collides with an apple otherwise and increase the apple count for being eaten
  if (didSnakeCollideWithApple()) {
    appleEatenCount += 1;

    // If eaten is 3 then it increases the speed to make it more difficult
    if (appleEatenCount == 3) {
      clearInterval(SNAKE_INTERVAL);
      setGameInterval(175);

    // If eaten is 6, then it increases the speed again to make it more difficult
    } else if (appleEatenCount == 6) {
      clearInterval(SNAKE_INTERVAL);
      setGameInterval(150);

      // If eaten is 9 then it reached the max speed of the game at 100ms per gameLoopStep
    } else if (appleEatenCount == 9) {
      clearInterval(SNAKE_INTERVAL);
      setGameInterval(100);
    }

    // Since the apple was eaten, make sure to "grow" the snake and spawn a new apple
    q(".notification-title").innerHTML = "Nice! At size + " + appleEatenCount;
    isGrowing = true;
    grow();
    console.log("Ate an apple.");
    newApple();
  }

  // Rebuild the game board completely to 'render' movement
  buildBoard();
};

// Building the board based on the grid using arrays of arrays (2D arrays)
function buildBoard() {
  grid = [];
  q(".snake-board").innerHTML = "";

  for (let i = 0; i < SIZE; i++) {
    grid.push([]);
  }

  for (let k = 0; k < SIZE; k++) {
    for (let j = 0; j < SIZE; j++) {
      grid[k].push([j,k]);
    }
  }

  let boardBuilder = '<ul>';

  // Go through the grid and then each row to insert the type of block that is required at the specific place
  grid.forEach(function(row){
    row.forEach(function(tile){
      if (isSnakeFound([tile[0], tile[1]])) {
        boardBuilder += '<li class="tile snake"></li>';
      } else if (isAppleFound([tile[0], tile[1]])) {
        boardBuilder += '<li class="tile apple" style="padding:0;height:20px;width:20px;"></li>';
      } else {
        boardBuilder += '<li class="tile"></li>';
      }
    });
  });

  boardBuilder += '</ul>';

  // Insert the prebuilt game board component into the game as a render
  q(".snake-board").innerHTML = boardBuilder;
}

// Set game interval to the gameLoopStep
function setGameInterval(incomingSpeed) {
  SNAKE_INTERVAL = setInterval(function() {
    gameLoopStep();
  }, incomingSpeed);
};

// Key listeners to turn the snake in different directions based on keyCodes for arrow keys
function keyListener() {
  document.addEventListener("keyup", function(event) {
    if (event.keyCode == 38) {
      turnSnakeTo('N');
    } else if (event.keyCode == 40) {
      turnSnakeTo('S');
    } else if (event.keyCode == 39) {
      turnSnakeTo('E');
    } else if (event.keyCode == 37) {
      turnSnakeTo('W');
    }
  });
};

// Launch game loading functions
function launchGame() {
  keyListener();
  setGameInterval(200);
  buildBoard();
};

launchGame();