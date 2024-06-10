let canvasParent;
const resetbutton = document.getElementById("reset");
let boxCounter = 0;

//empty boxlist array if user click reset
resetbutton.addEventListener('click', function(){
    boxList = [];
    boxCounter = 0;
})


function setup() {
  // Get the parent container element
  canvasParent = document.getElementById("canvasParent");

  // Set initial canvas size based on parent container
  const mycanvas = createCanvas(
    canvasParent.offsetWidth,
    canvasParent.offsetHeight
  );
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

    this.x = posX;
    this.y = posY;
    // Dimensions
    this.w = 125;
    this.h = 50;
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

  over() {
    // Is mouse over object
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
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

    //add constraint
    this.x = constrain(newX, 0, width - this.w);
    this.y = constrain(newY, 0, height - this.h);
  }
  }

  show() {
    stroke(0);
    strokeWeight(3);
    // Different fill based on state
    if (this.dragging) {
      fill(255, 95, 21);
    } else if (this.rollover) {
      fill(204, 85, 0);
    } else {
      fill(255, 165, 0);
    }
    rect(this.x, this.y, this.w, this.h, 10);

    //show label
    fill(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  pressed() {
    // Did I click on the rectangle?
    if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
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

function draw() {
  background(255);
  for (let i = 0; i < boxList.length; i++) {
    boxList[i].update();
    boxList[i].over();
    boxList[i].show();
  }
}

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
}

// Handle double-clicked event
function doubleClicked() {
    if(mouseX >= 0 && mouseX <= canvasParent.offsetWidth && mouseY >= 0 && mouseY <= canvasParent.offsetHeight){
        let box = new Draggable(mouseX, mouseY);
        boxList.push(box);
        box.pressed(); // Start dragging immediately after creation
        console.log('created')
        console.log(mouseX)
    }else{
        console.log('not allowed')
    }
}
