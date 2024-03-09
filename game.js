class Snake {
  constructor(x = 0, y = 0) {
    objects.push(this);
    this.type = "snake";
    this.x = x;
    this.y = y;
    this.trail = [
      [x, y],
      [x, y],
    ];
    this.commandQueue = [];
    this.commandQueueLimit = 3;
    this.direction = "RIGHT";
    this.mapDirectionToInt = {
      UP: 0,
      RIGHT: 1,
      DOWN: 2,
      LEFT: 3,
    };
    this.clock = 0;
    this.moveInterval = 160; // in ms
  }

  reset() {
    this.trail = [
      [0, 0],
      [0, 0],
    ];
    this.direction = "RIGHT";
    this.x = 0;
    this.y = 0;
  }

  pushCmd(command) {
    if (this.commandQueue.length < this.commandQueueLimit) {
      this.commandQueue.push(command);
    }
  }

  update() {
    // If keys[Z] is pressed, go double speed
    const goDoubleSpeed = keyIsDown(90);
    const currentMoveInterval = goDoubleSpeed
      ? this.moveInterval / 2
      : this.moveInterval;

    // Time
    this.clock += deltaTime;
    if (this.clock < currentMoveInterval) return;
    this.clock -= currentMoveInterval;

    // Pop from command stack
    if (this.commandQueue.length > 0) {
      let isValidDirection = false;
      while (!isValidDirection && this.commandQueue.length > 0) {
        const nextDirection = this.commandQueue.shift();
        if (
          abs(
            this.mapDirectionToInt[this.direction] -
              this.mapDirectionToInt[nextDirection]
          ) != 2
        ) {
          this.direction = nextDirection;
          isValidDirection = true;
        }
      }
    }

    // Move
    let nextX, nextY;
    switch (this.direction) {
      case "UP":
        nextX = this.x;
        nextY = this.y - 1;
        break;

      case "DOWN":
        nextX = this.x;
        nextY = this.y + 1;
        break;

      case "LEFT":
        nextX = this.x - 1;
        nextY = this.y;
        break;

      case "RIGHT":
        nextX = this.x + 1;
        nextY = this.y;
        break;

      default:
        break;
    }
    nextX = (nextX + cols) % cols;
    nextY = (nextY + rows) % rows;
    this.trail.shift();
    this.trail.push([nextX, nextY]);
    this.x = nextX;
    this.y = nextY;

    // If snake hits itself
    for (let i = 0; i < this.trail.length - 1; i++) {
      const [x, y] = this.trail[i];
      if (x == this.x && y == this.y) {
        gameOver();
      }
    }

    // If snake hits apple
    for (let obj of objects) {
      if (obj.type != "apple") continue;
      for (let i = 0; i < this.trail.length; i++) {
        const [x, y] = this.trail[i];
        if (obj.x == x && obj.y == y) {
          score++;
          obj.randomizePosition();
          this.trail.push([this.x, this.y]);
        }
      }
    }
  }

  render() {
    fill(150);
    for (let i = 0; i < this.trail.length - 1; i++) {
      const [x, y] = this.trail[i];
      rect(x, y, 1, 1);
    }
    fill(180);
    rect(this.x, this.y, 1, 1);
  }
}

class Apple {
  constructor(x, y) {
    objects.push(this);
    this.type = "apple";
    this.x = x;
    this.y = y;
  }

  randomizePosition() {
    this.x = Math.floor(Math.random() * cols);
    this.y = Math.floor(Math.random() * rows);
  }

  update() {}

  render() {
    fill(200, 0, 0);
    rect(this.x, this.y, 1, 1);
  }
}

const objects = [];
let snake;
const cols = 20;
const rows = 20;
let score = 0;
let paused = true;
let isGameOver = false;

function gameOver() {
  isGameOver = true;
  paused = true;
  document.getElementById("hud").style.visibility = "visible";
  document.getElementById("status").textContent = "Game Over";
  document.getElementById("score").textContent = "Score: " + score;
}

function newGame() {
  isGameOver = false;
  score = 0;
  snake.reset();
  document.getElementById("status").textContent = "Paused"; // If user pauses mid-game
}

function setup() {
  console.log("setup");

  // Fullscreen
  createCanvas(windowWidth, windowHeight);

  // Init objects
  snake = new Snake(0, 0);
  for (let i = 0; i < 3; i++) {
    new Apple().randomizePosition();
  }
}

function keyPressed() {
  if (event.which == 37) snake.pushCmd("LEFT");
  else if (event.which == 38) snake.pushCmd("UP");
  else if (event.which == 39) snake.pushCmd("RIGHT");
  else if (event.which == 40) snake.pushCmd("DOWN");
  else if (event.which == 82) {
    // R
    newGame();
  } else if (event.which == 32) {
    // Space
    if (isGameOver) {
      newGame();
    }
    paused = !paused;
    if (paused) document.getElementById("hud").style.visibility = "visible";
    else document.getElementById("hud").style.visibility = "hidden";
  }
}

function draw() {
  // Transform to grid
  const w = width / cols;
  const h = height / rows;

  // Transform coords
  push();
  translate(20, 20);
  let span = min((width - 40) / cols, (height - 40) / rows);
  scale(span, span);

  // Update objects
  if (!paused) {
    for (let i = 0; i < objects.length; i++) {
      objects[i].update();
    }
  }

  // Draw grid
  background(20);
  strokeWeight(0.02);
  stroke(0, 255, 0);
  for (let i = 0; i <= cols; i++) {
    line(i, 0, i, rows);
  }
  for (let i = 0; i <= rows; i++) {
    line(0, i, cols, i);
  }
  noStroke();
  for (let i = 0; i < objects.length; i++) {
    objects[i].render();
  }
  pop();
}
