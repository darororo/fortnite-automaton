let canvasParent;
let boxCounter = 0;
let fa = new FA();

//get button elements from html
const resetbutton = document.getElementById("reset");
const getTypeBtn = document.getElementById("testfa");
const minimizeBtnn = document.getElementById("minimize");
const convertBtn = document.getElementById("convertNFA");
const testStringInp = document.getElementById("textInput");
const testStringBtn = document.getElementById("teststr");
const alphabetInp = document.getElementById('alphabet-input');
const alphabetResult = document.getElementById("alphabet-result");

// Empty boxlist array if user clicks reset
resetbutton.addEventListener("click", function () {
  boxList = [];
  boxCounter = 0;
  lines = [];
  showFAType(); // reset color of type labels
  fa = new FA();
  fa.alphabet = ["a", "b"];

  minimizeBtnn.disabled = true;
  minimizeBtnn.style.backgroundColor = "grey";
  
  convertBtn.disabled = true;
  convertBtn.style.backgroundColor = "grey";

  alphabetResult.style.display = 'none';
});

// Handle Alphabet Setup
alphabetInp.addEventListener("change", setAlphabetFA);


// Set up canvas using p5js
function setup() {
  // Get the parent container element
  canvasParent = document.getElementById("canvasParent");

  // Set initial canvas size based on div parent container
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


document.getElementById("save").addEventListener("click", function () {
  saveFAToJSON(fa);
});

function saveFAToJSON(fa) {
  const faData = fa.getFAData();
  const jsonString = JSON.stringify(faData, null, 2);
  downloadJSON(jsonString, "fa_data.json");
}

function downloadJSON(content, filename) {
  const a = document.createElement("a");
  const file = new Blob([content], {type: "application/json"});
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
}

// Draggable class
class Draggable {
  constructor(posX, posY) {
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?

    // Set initial position
    this.x = posX;
    this.y = posY;

    // Dimensions of the rectangle we're going to make
    this.w = 125;
    this.h = 50;

    // Add small box inside the rectangle as an anchor for line
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
    this.label = "S " + boxCounter;
    boxCounter++; // Increment box counter for the next box
  }

  // Create state based on FA.js algo
  createState() {
    this.state = fa.createState();
  }

  over() {
    // detect if mouse is within the state position
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
    rect(
      this.smallBoxX,
      this.smallBoxY,
      this.smallBoxSize,
      this.smallBoxSize,
      5
    );
  }

  pressed() {
    // Check if mouse is within the small box position
    if (
      mouseX > this.smallBoxX &&
      mouseX < this.smallBoxX + this.smallBoxSize &&
      mouseY > this.smallBoxY &&
      mouseY < this.smallBoxY + this.smallBoxSize
    ) {
      console.log("small box clicked");
      startLine(this);
    } else if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      // Check if the mouse is within the state position
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
  if (
    mouseX >= 0 &&
    mouseX <= canvasParent.offsetWidth &&
    mouseY >= 0 &&
    mouseY <= canvasParent.offsetHeight
  ) {
    // Check if the mouse position is within the canvas width and height
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

// Handling line
class Line {
  constructor(startBox) {
    this.startBox = startBox;
    this.endBox = null;
    this.controlOffset = 150;
    this.label = ""; // Initialize label

    // Initialize starting coordinates based on the current position of startBox
    this.updateStartCoordinates();
    startBox.lines.push(this);
  }

  updateStartCoordinates() {

    if(this.endBox) {
      let aboveEndbox = this.startBox.y + this.startBox.h < this.endBox.y;
      let underEndbox = this.startBox.y + this.startBox.h > this.endBox.y;
      let rightOfEndbox = this.startBox.x > this.endBox.x + this.endBox.w;
      let leftOfEndbox = this.startBox.x + this.startBox.w < this.endBox.x;

      if(this.endBox == this.startBox) {  // Self transition
        this.startX = this.startBox.x + this.startBox.w / 2 - 20;
        this.startY = this.startBox.y;
      } else {
        if(aboveEndbox) {
          this.startX = this.startBox.x + this.startBox.w / 2;
          this.startY = this.startBox.y + this.startBox.h;
        } else if(underEndbox && rightOfEndbox) {
          this.startX = this.startBox.x;
          this.startY = this.startBox.y + this.startBox.h / 2;
        } else if(underEndbox && leftOfEndbox) {
          this.startX = this.startBox.x + this.startBox.w;
          this.startY = this.startBox.y + this.startBox.h / 2;
        } else if(underEndbox) {
          this.startX = this.startBox.x + this.startBox.w/2;
          this.startY = this.startBox.y;
        }
      }

      

    } else {
      this.startX = this.startBox.smallBoxX + this.startBox.smallBoxSize / 2;
      this.startY = this.startBox.smallBoxY + this.startBox.smallBoxSize / 2;
    }

  }

  update(x, y) {

    if(this.endBox) { 
      let aboveEndbox = this.startBox.y + this.startBox.h < this.endBox.y;
      let underEndbox = this.startBox.y + this.startBox.h > this.endBox.y;
      let rightOfEndbox = this.startBox.x > this.endBox.x + this.endBox.w;
      let leftOfEndbox = this.startBox.x + this.startBox.w < this.endBox.x;

      if(this.endBox == this.startBox) { // Self transition
        this.endX = this.startBox.x + this.startBox.w / 2 + 20;
        this.endY = this.startBox.y;
      } else {
        if(aboveEndbox) {
          this.endX = this.endBox.x + this.endBox.w/2;
          this.endY = this.endBox.y;
        } else if(rightOfEndbox && underEndbox) {
          this.endX = this.endBox.x + this.endBox.w;
          this.endY = this.endBox.y + this.endBox.h/2;
        } else if(leftOfEndbox && underEndbox) {
          this.endX = this.endBox.x;
          this.endY = this.endBox.y + this.endBox.h/2;
        } else if(underEndbox) {
          this.endX = this.endBox.x + this.endBox.w/2;
          this.endY = this.endBox.y + this.endBox.h;
        }  
      }

      


      // this.endX = this.endBox.smallBoxX + this.endBox.smallBoxSize / 2;
      // this.endY = this.endBox.smallBoxY + this.endBox.smallBoxSize / 2;
      // this.endX = this.endBox.x;
      // this.endY = this.endBox.y + this.endBox.h/2;
    } else {
      this.endX = x;
      this.endY = y;
    }
    // Update starting coordinates if startBox is moved
    this.updateStartCoordinates();
  }

  complete(endBox) {
    this.endBox = endBox;

    if(this.endBox == this.startBox)  {
      this.startX = endBox.x + endBox.w / 2 - 20.
      this.startY = endBox.y;
      this.endX = endBox.x + endBox.w / 2 + 20;
      this.endY = endBox.y;
    } else {
      // this.endX = endBox.smallBoxX + endBox.smallBoxSize / 2;
      // this.endY = endBox.smallBoxY + endBox.smallBoxSize / 2;
      this.endX = endBox.x;
      this.endY = endBox.y + endBox.h/2;
    }

    endBox.lines.push(this);
    
    // Open the new frame for the user to enter the label
    openNewFrame(this);
  }

  setLabel(label) {
    this.label = label;
  }

  show() {
    stroke(0);
    strokeWeight(2);
    noFill();
    beginShape();
    vertex(this.startX, this.startY);
    if(this.startBox == this.endBox) {
      bezierVertex(
        // this.startX + this.controlOffset,
        this.startX - 20,
        this.startY - 60,
        // this.endX - this.controlOffset,
        this.endX + 20,
        this.endY - 60,
        this.endX,
        this.endY
      );
    } else {
      bezierVertex(
        // this.startX + this.controlOffset,
        this.startX,
        this.startY,
        // this.endX - this.controlOffset,
        this.startX,
        this.endY,
        this.endX,
        this.endY
      );
    }
    
    endShape();

    // Draw arrowhead
    let angle = atan2(this.endY - this.startY, this.endX - this.startX);
    let arrowSize = 10;
    let x1 = this.endX - arrowSize * cos(angle - QUARTER_PI);
    let y1 = this.endY - arrowSize * sin(angle - QUARTER_PI);
    let x2 = this.endX - arrowSize * cos(angle + QUARTER_PI);
    let y2 = this.endY - arrowSize * sin(angle + QUARTER_PI);

    fill(255, 0, 0); // Set triangle color
    triangle(this.endX, this.endY, x1, y1, x2, y2);

    // Display the label
    if (this.label) {
      noStroke();
      fill(0);
      textAlign(CENTER, CENTER);
      text(
        this.label,
        (this.startX + this.endX) / 2 ,
        (this.startY + this.endY) / 2 
      );
    }
  }
}

function startLine(box) {
  currentLine = new Line(box);
}
 
function completeLine() {
  // let mouseOverSmallBox;
  let mouseOverBox;

  for (let box of boxList) {
    // mouseOverSmallBox = mouseX > box.smallBoxX &&
    //               mouseX < box.smallBoxX + box.smallBoxSize &&
    //               mouseY > box.smallBoxY &&
    //               mouseY < box.smallBoxY + box.smallBoxSize;

    mouseOverBox = mouseX > box.x &&
                  mouseX < box.x + box.w &&
                  mouseY > box.h &&
                  mouseY < box.y + box.h; 

    if (mouseOverBox) {
      currentLine.complete(box);
      lines.push(currentLine);
      currentLine = null;
      return;
    }
  }
  currentLine = null; // Discard the line if not completed
}

function openNewFrame(line) {
  // Create a new frame
  let frame = document.createElement("div");
  frame.style.position = "fixed";
  frame.style.left = "50%";
  frame.style.top = "50%";
  frame.style.transform = "translate(-50%, -50%)";
  frame.style.width = "400px";
  frame.style.height = "300px";
  frame.style.backgroundColor = "white";
  frame.style.border = "2px solid black";
  frame.style.zIndex = "1000";
  frame.style.padding = "20px";
  frame.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

  // Add content to the frame
  frame.innerHTML = `
    <h2>Label Your Transition</h2>
    <span>Transition: </span>
    <input type = "text" id = "transitName">
    <br></br> 
  `;

  // Add a save button
  let saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.onclick = () => {
    let inputValue = document.getElementById("transitName").value;
    if(inputValue == "") {
      line.setLabel("ε");
    } else {
      line.setLabel(inputValue);
    }
    document.body.removeChild(frame);

    CreateLineTransition(line);  
    console.log(line.label);
  };
  frame.appendChild(saveButton);

    // Add a close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.marginLeft = "10px";
    closeButton.onclick = () => {
      document.body.removeChild(frame);
      lines.pop();
    };
    frame.appendChild(closeButton);

    // Append the frame to the body
    document.body.appendChild(frame);  
}

// Create Transition between 2 states connected by a line
function CreateLineTransition(line) {
  let char = line.label;
  let fromIndex = boxList.indexOf(line.startBox);
  let destIndex = boxList.indexOf(line.endBox);
  if(char == 'ε') char = '';
  console.log("From ", fromIndex, " to ", destIndex, " on ", char);
  fa.createTransition(fromIndex, destIndex, char);
  fa.makeFinalState(fa.states[0])
}

testStringBtn.addEventListener('click', function(){
  console.log(testStringInp.value);
  fa.checkStr(testStringInp.value);

  if(fa.output == 0){
    document.getElementById("str-result").innerText = "Reject";
  }else{
    document.getElementById("str-result").innerText = "Accept";
  }
  document.getElementById("str-result").style.display = "inline";

})


getTypeBtn.addEventListener('click', function(){
  if(fa.states.length == 0) {
    alert("oh may gah")
  } else {
    fa.determineType();
    showFAType();
  }    
})

function showFAType() {
  let NFAEle = document.querySelectorAll('.fa span')[0];
  let DFAEle = document.querySelectorAll('.fa span')[1];

  // After Reset, set to default color 
  if(boxCounter == 0) {
    DFAEle.style.backgroundColor = "#9faec1";
    NFAEle.style.backgroundColor = "#9faec1";
    return;
  }

  if(fa.type == TypeFA.NFA) {
    DFAEle.style.backgroundColor = "#9faec1";
    NFAEle.style.backgroundColor = "Green";

    convertBtn.disabled = false;
    convertBtn.style.backgroundColor = "orange"
  } 
  if(fa.type == TypeFA.DFA){
    DFAEle.style.backgroundColor = "Green";
    NFAEle.style.backgroundColor = "#9faec1";

    minimizeBtnn.disabled = false;
    minimizeBtnn.style.background = "orange"; 
  }
  
}

function setAlphabetFA() {
  let chars = alphabetInp.value;
  chars = chars.split(',');
  for(let i = 0; i < chars.length; i++) chars[i] = chars[i].trim();
  chars = new Set(chars); // Remove duplicates

  let alphabetSet = Array.from(chars);
  alphabetSet = alphabetSet.filter(char => char.length == 1); 
  
  fa.alphabet = alphabetSet; 
  alphabetResult.innerText = `[${fa.alphabet}]`;
  alphabetResult.style.display = "inline";
  
  console.log(fa.alphabet);
}