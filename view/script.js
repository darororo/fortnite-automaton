let canvasParent;
const resetbutton = document.getElementById("reset");
let boxCounter = 0;
let fa = new FA();

// Empty boxlist array if user clicks reset
resetbutton.addEventListener("click", function () {
  boxList = [];
  boxCounter = 0;
  lines = [];
});

//Set up canvas using p5js
function setup() {
  // Get the parent container element
  canvasParent = document.getElementById("canvasParent");

  // Set initial canvas size based on div parent container
  const mycanvas = createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
  mycanvas.parent("canvasParent");

  windowResized();
}

// Adding resize function for responsiveness
function windowResized() {
  const width = canvasParent.offsetWidth;
  const height = canvasParent.offsetHeight;
  resizeCanvas(width, height);

  console.log(width);
  console.log(height);
}

window.addEventListener("resize", windowResized);

// Draggable class
class Draggable {
  constructor(posX, posY) {
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?

    //Set initial position
    this.x = posX;
    this.y = posY;

    // Dimensions of the rectangle we're going to make
    this.w = 125;
    this.h = 50;

    //Add small box inside the rectangle as an anchor for line
    this.smallBoxSize = 20;
    this.smallBoxX = this.x + this.w - this.smallBoxSize - 10;
    this.smallBoxY = this.y + (this.h - this.smallBoxSize) / 2;

    // Array to keep track of lines connected to this box
    this.lines = [];

    // Store initial mouse position
    this.initialMouseX = 0;
    this.initialMouseY = 0;

    // Store initial object position
    this.initialX = 0;
    this.initialY = 0;

    // Assign label based on box counter
    this.label = "S - " + boxCounter;
    boxCounter++; // Increment box counter for the next box
  }

  //create state based on FA.js algo
  createState() {
    this.state = fa.createState();
  }

  over() {
    // detect if mouse is within the state postion
    if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
      this.rollover = true;
    } else {
      this.rollover = false;
    }
  }

  update() {
    // Adjust location if being dragged
    if (this.dragging) {
      let newX = this.initialX + (mouseX - this.initialMouseX);
      let newY = this.initialY + (mouseY - this.initialMouseY);

      // Add constraint
      this.x = constrain(newX, 0, width - this.w);
      this.y = constrain(newY, 0, height - this.h);

      // Update small box position
      this.smallBoxX = this.x + this.w - this.smallBoxSize - 10;
      this.smallBoxY = this.y + (this.h - this.smallBoxSize) / 2;

      // Update positions of connected lines
      for (let line of this.lines) {
        line.update();
      }
    }
  }

  show() {
    stroke(0);
    strokeWeight(3);

    // Different fill based on state dragging state/hovering state/static state
    if (this.dragging) {
      fill(255, 95, 21);
    } else if (this.rollover) {
      fill(204, 85, 0);
    } else {
      fill(255, 165, 0);
    }
    rect(this.x, this.y, this.w, this.h, 10);

    // write state label
    fill(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);

    // Draw small box
    fill(0, 0, 0);
    rect(this.smallBoxX, this.smallBoxY, this.smallBoxSize, this.smallBoxSize, 5);
  }

  pressed() {
    // Check if mouse is within the small box position
    if (mouseX > this.smallBoxX && mouseX < this.smallBoxX + this.smallBoxSize && mouseY > this.smallBoxY && mouseY < this.smallBoxY + this.smallBoxSize) {
      console.log("small box clicked");
      startLine(this);
    } else if ( mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) { //Check if the mouse is within the state position
      this.dragging = true;
      
      // Store initial mouse position and object position
      this.initialMouseX = mouseX;
      this.initialMouseY = mouseY;
      this.initialX = this.x;
      this.initialY = this.y;
    }
  }

  released() {
    // Quit dragging
    this.dragging = false;
  }
}

let boxList = [];
let lines = [];
let currentLine = null;

function draw() {
  background(255);
  for (let i = 0; i < boxList.length; i++) {
    boxList[i].update();
    boxList[i].over();
    boxList[i].show();
  }
  for (let line of lines) {
    line.show();
  }
  if (currentLine) {
    currentLine.update(mouseX, mouseY);
    currentLine.show();
  }
}

// Handle mouse pressed event
function mousePressed() {
  for (let i = 0; i < boxList.length; i++) {
    boxList[i].pressed();
  }
}

// Handle mouse released event
function mouseReleased() {
  for (let i = 0; i < boxList.length; i++) {
    boxList[i].released();
  }
  if (currentLine) {
    completeLine();
  }
}

// Handle double-clicked event
function doubleClicked() {
  if (mouseX >= 0 && mouseX <= canvasParent.offsetWidth && mouseY >= 0 && mouseY <= canvasParent.offsetHeight) { //check if the mouse position is within the canvas width and height
    let box = new Draggable(mouseX, mouseY);
    boxList.push(box);
    box.pressed(); // Allow dragging immediately after creation
    box.createState();

    console.log("created");
    console.log(mouseX);
  } else {
    console.log("not allowed");
  }
}

//handling line
class Line {
  constructor(startBox) {
    this.startBox = startBox;
    this.endBox = null;
    this.controlOffset = 50;
    // Initialize starting coordinates based on the current position of startBox
    this.updateStartCoordinates();
    startBox.lines.push(this);
  }

  updateStartCoordinates() {
    this.startX = this.startBox.smallBoxX + this.startBox.smallBoxSize / 2;
    this.startY = this.startBox.smallBoxY + this.startBox.smallBoxSize / 2;
  }

  update(x, y) {
    if (this.endBox) {
      this.endX = this.endBox.smallBoxX + this.endBox.smallBoxSize / 2;
      this.endY = this.endBox.smallBoxY + this.endBox.smallBoxSize / 2;
    } else {
      this.endX = x;
      this.endY = y;
    }
    // Update starting coordinates if startBox is moved
    this.updateStartCoordinates();
  }

  complete(endBox) {
    this.endBox = endBox;
    this.endX = endBox.smallBoxX + endBox.smallBoxSize / 2;
    this.endY = endBox.smallBoxY + endBox.smallBoxSize / 2;
    endBox.lines.push(this);
  }

  show() {
    stroke(0);
    strokeWeight(2);
    noFill();
    beginShape();
    vertex(this.startX, this.startY);
    bezierVertex(
      this.startX + this.controlOffset,
      this.startY,
      this.endX - this.controlOffset,
      this.endY,
      this.endX,
      this.endY
    );
    endShape();

    // Draw arrowhead
   let angle = atan2(this.endY - this.startY, this.endX - this.startX);
   let arrowSize = 15; 
   let x1 = this.endX - arrowSize * cos(angle - QUARTER_PI);
   let y1 = this.endY - arrowSize * sin(angle - QUARTER_PI);
   let x2 = this.endX - arrowSize * cos(angle + QUARTER_PI);
   let y2 = this.endY - arrowSize * sin(angle + QUARTER_PI);

   fill(255, 0, 0); // Set triangle color
   triangle(this.endX, this.endY, x1, y1, x2, y2);
  }
}

function startLine(box) {
  currentLine = new Line(box);
}

function completeLine() {
  for (let box of boxList) {
    if (
      mouseX > box.smallBoxX &&
      mouseX < box.smallBoxX + box.smallBoxSize &&
      mouseY > box.smallBoxY &&
      mouseY < box.smallBoxY + box.smallBoxSize
    ) {
      currentLine.complete(box);
      lines.push(currentLine);
      currentLine = null;
      return;
    }
  }
  currentLine = null; // Discard the line if not completed
}
