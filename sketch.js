let snake = [];
let foods = [];
let maxFoods = 3;
let walls = [];
let dir = 'RIGHT';
let moveBuffer = []; 
let score = 0;
let level = 1;
let isRunning = false;
let isPaused = false; 
let gridSize = 20;
let cols, rows;
let slowMoTime = 0;
let startX, startY;
let screenShake = 0; 

const TARGET_RATIO = 9 / 16;

function setup() {
  let w = windowWidth, h = windowHeight;
  if (w / h > TARGET_RATIO) w = h * TARGET_RATIO; else h = w / TARGET_RATIO;
  let canvas = createCanvas(w, h);
  canvas.style('display', 'block');
  canvas.style('margin', 'auto');
  
  let canvasElem = document.querySelector('canvas');
  canvasElem.addEventListener('touchstart', (e) => e.preventDefault(), {passive: false});

  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
  initGame();
}

function draw() {
  background(245, 248, 250);
  
  if (screenShake > 0) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.8;
  }

  if (!isRunning) { showStartScreen(); return; }
  drawElements();
  drawUI();
  if (isPaused) { showPauseScreen(); return; }

  let gameSpeed = (slowMoTime > 0) ? 5 : (10 + floor(level/2));
  frameRate(gameSpeed);
  if (slowMoTime > 0) slowMoTime--;
  updateSnake();
}

function updateSnake() {
  if (moveBuffer.length > 0) dir = moveBuffer.shift();
  let head = { ...snake[0] };
  if (dir === 'RIGHT') head.x++;
  else if (dir === 'LEFT') head.x--;
  else if (dir === 'UP') head.y--;
  else if (dir === 'DOWN') head.y++;

  if (head.x < 0) head.x = cols - 1;
  else if (head.x >= cols) head.x = 0;
  if (head.y < 2) head.y = rows - 1; 
  else if (head.y >= rows) head.y = 2;

  if (checkCollision(head)) { 
    screenShake = 10;
    endGame(); 
    return; 
  }

  snake.unshift(head);
  let ate = false;
  for (let i = foods.length - 1; i >= 0; i--) {
    if (head.x === foods[i].x && head.y === foods[i].y) {
      applyFoodEffect(foods[i].type);
      foods.splice(i, 1);
      ate = true;
      break;
    }
  }

  if (ate) {
    if (score > 0 && score % 4 === 0) { level++; spawnWall(); }
    spawnFood(); 
  } else {
    snake.pop();
  }
}

function touchStarted() {
  if (mouseX > width - 60 && mouseY < 50) {
    if (isRunning) { isPaused = !isPaused; return false; }
  }
  if (!isRunning) { isRunning = true; isPaused = false; return false; }
  startX = mouseX; startY = mouseY;
  return false;
}

function touchEnded() {
  if (isPaused) return;
  let dx = mouseX - startX;
  let dy = mouseY - startY;
  let threshold = 15;
  let nextMove = '';
  if (abs(dx) > abs(dy) && abs(dx) > threshold) {
    nextMove = dx > 0 ? 'RIGHT' : 'LEFT';
  } else if (abs(dy) > threshold) {
    nextMove = dy > 0 ? 'DOWN' : 'UP';
  }
  if (nextMove) {
    let lastM = moveBuffer.length > 0 ? moveBuffer[moveBuffer.length - 1] : dir;
    if (nextMove === 'RIGHT' && lastM !== 'LEFT') moveBuffer.push('RIGHT');
    if (nextMove === 'LEFT' && lastM !== 'RIGHT') moveBuffer.push('LEFT');
    if (nextMove === 'UP' && lastM !== 'DOWN') moveBuffer.push('UP');
    if (nextMove === 'DOWN' && lastM !== 'UP') moveBuffer.push('DOWN');
  }
}

function checkCollision(obj) {
  for (let i = 1; i < snake.length; i++) {
    if (obj.x === snake[i].x && obj.y === snake[i].y) return true;
  }
  for (let w of walls) {
    if (obj.x === w.x && obj.y === w.y) return true;
  }
  return false;
}

function spawnFood() {
  while (foods.length < maxFoods) {
    let r = random(100);
    let type = 'Normal';
    if (level > 1) {
      if (r < 75) type = 'Normal';
      else if (r < 85) type = 'Gold';
      else if (r < 92) type = 'Blue';
      else type = 'Purple';
    }
    let newFood, valid = false;
    while (!valid) {
      newFood = { x: floor(random(1, cols - 1)), y: floor(random(3, rows - 1)), type: type };
      valid = !checkCollision(newFood);
    }
    foods.push(newFood);
  }
}

function drawElements() {
  stroke(220); strokeWeight(1); noFill();
  rect(1, gridSize * 2, width-2, height - (gridSize * 2)-1, 5);
  noStroke();
  fill(120);
  walls.forEach(w => rect(w.x * gridSize + 1, w.y * gridSize + 1, gridSize - 2, gridSize - 2, 4));
  let pulse = sin(frameCount * 0.2) * 2;
  foods.forEach(f => {
    if (f.type === 'Normal') fill(255, 70, 70);
    else if (f.type === 'Gold') fill(255, 215, 0);
    else if (f.type === 'Blue') fill(50, 150, 255);
    else fill(180, 50, 255);
    ellipse(f.x * gridSize + gridSize/2, f.y * gridSize + gridSize/2, (gridSize - 6) + pulse);
  });
  snake.forEach((p, i) => {
    let col = i === 0 ? color(46, 204, 113) : color(39, 174, 96, 200);