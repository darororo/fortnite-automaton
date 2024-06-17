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

      this.checkbox = createCheckbox("f");
      this.checkbox.position(this.x + canvasParent.offsetLeft, this.y + canvasParent.offsetTop + 10 );
      this.checkbox.changed(() => {
        updateFinalStates(this);
      }) 
      
    }

    // Called when user pressed reset
    removeCheckbox(){
      this.checkbox.remove();
    }
  
    // Create state based on FA.js algo
    createState() {
      SuperFA.createState();
      this.state = SuperFA.states[boxCounter-1];
      
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

        //Update Checkbox position
        this.checkbox.position(this.x + canvasParent.offsetLeft, this.y + canvasParent.offsetTop + 10);
  
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
      push();
      fill(60, 60, 60);
      rect(
        this.smallBoxX,
        this.smallBoxY,
        this.smallBoxSize,
        this.smallBoxSize,
        5
      );
      pop();
      text("δ", this.smallBoxX + this.smallBoxSize/2, this.smallBoxY - 5)
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

    lineCombine() {
      let startLines = this.lines.filter((v, i) => {
        if(v.startBox == this) {
          console.log(i);
          return v;
        }
      })

      console.log(startLines);
    }

  }
  
  
// Handling line
class Line {
  constructor(startBox) {
    this.startBox = startBox;
    this.endBox = null;
    this.controlOffset = 150;
    this.label; // Initialize label

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
        if(aboveEndbox && rightOfEndbox) {
          this.startX = this.startBox.x;
          this.startY = this.startBox.y + this.startBox.h / 2;
        } else if(aboveEndbox && leftOfEndbox) {
          this.startX = this.startBox.x + this.startBox.w;
          this.startY = this.startBox.y + this.startBox.h / 2;
        } else if(aboveEndbox) {
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
        if(aboveEndbox && rightOfEndbox) {
          this.endX = this.endBox.x + this.endBox.w;
          this.endY = this.endBox.y + this.endBox.h/2;
        } else if(aboveEndbox && leftOfEndbox) {
          this.endX = this.endBox.x;
          this.endY = this.endBox.y + this.endBox.h/2;
        } else if(aboveEndbox) {
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
    if(this.label === undefined) openNewFrame(this);
  }

  setLabel(label) {
    if(label == "") label = "ε";
    this.label = label;
  }

  show() {
    stroke(0);
    strokeWeight(2);
    noFill();
    beginShape();
    vertex(this.startX, this.startY);
    let bezier;
    if(this.startBox == this.endBox) {
      bezier = bezierVertex(
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
      bezier = bezierVertex(
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
  let mouseOverBox;

  for (let box of boxList) {
    mouseOverBox = mouseX > box.x &&
                  mouseX < box.x + box.w &&
                  mouseY > box.h &&
                  mouseY < box.y + box.h; 

    if (mouseOverBox) {
      currentLine.complete(box);
      lineList.push(currentLine);

      currentLine = null;
      return;
    }
  }
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
      lineList.pop();
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
  SuperFA.createTransition(fromIndex, destIndex, char);
}



function updateFinalStates(box) {
  //Check if checkbox is ticked to make final state
  console.log("updating final")
  if(box.checkbox.checked()) {
    SuperFA.makeFinalState(box.state);
    console.log(box.state);
    console.log(box.checkbox.checked())
    console.log("making final")
  } else {
    SuperFA.deleteFinalState(box.state);
    console.log("deleting final")
  }
  console.log(SuperFA.finalStates)
  
}

function renderFA(faObject) {
  let states = faObject.states;
  let rate = 1;

  for(let i = 0; i < states.length; i++) {
    rate *= -1;
    let change = 80;
    let box = new Draggable(200 * Math.floor(i/2), 200 + rate*change);
    boxList.push(box);
    boxList[i].state = states[i];
    box.pressed(); // Allow dragging immediately after creation
  }

  for(let i = 0; i < states.length; i++) {
    console.log("state: ", i)
    let transitions = states[i].allTransitionsIndex;
    for(let [char, destIndexes] of Object.entries(transitions)) {
      destIndexes.forEach(index => {
        let line = new Line(boxList[i]); 
        line.setLabel(char);
        line.complete(boxList[index]);
        lineList.push(line);
      })
    }
    
    // if the current state is a final state, check its checkbox
    if(faObject.isFinalState(states[i])) {
      boxList[i].checkbox.elt.childNodes[0].childNodes[0].checked = true;
    }

  }

  SuperFA = faObject;
  if(alphabetResult) {
    alphabetResult.innerText = `[${SuperFA.alphabet}]`;
    alphabetResult.style.display = "inline";  
  }
}