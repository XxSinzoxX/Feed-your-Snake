let snake, food;
let gridSize = 20;
let dir = 'RIGHT';

function setup() {
  createCanvas(windowWidth, windowHeight);
  snake = [{x: 10, y: 10}];
  spawnFood();
  frameRate(10);
}

function draw() {
  background(220);
  
  // حركة الثعبان
  let head = { ...snake[0] };
  if (dir === 'RIGHT') head.x++;
  if (dir === 'LEFT') head.x--;
  if (dir === 'UP') head.y--;
  if (dir === 'DOWN') head.y++;
  
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    spawnFood();
  } else {
    snake.pop();
  }

  // رسم الطعام
  fill(255, 0, 0);
  rect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // رسم الثعبان
  fill(0, 255, 0);
  for (let p of snake) {
    rect(p.x * gridSize, p.y * gridSize, gridSize, gridSize);
  }
}

function spawnFood() {
  food = { x: floor(random(width/gridSize)), y: floor(random(height/gridSize)) };
}

function touchStarted() {
  let head = snake[0];
  if (mouseX > width/2) dir = 'RIGHT'; else dir = 'LEFT';
  return false;
}
