let canvasParent;
let boxCounter = 0;
let SuperFA = new FA();
let alphabetResult = null;



function setup() {
    canvasParent = document.getElementById("canvasParent");
    
    const mycanvas = createCanvas(
        canvasParent.offsetWidth,
        canvasParent.offsetHeight
      );

    mycanvas.parent("canvasParent");

    window.addEventListener('message', (e) => {
      console.log("RECEIVING")
      console.log(e.data);
      let newFA = e.data["FA"];
      SuperFA.states = newFA.states;
      SuperFA.finalStates = newFA.finalStates;
      renderFA(SuperFA);
    })    
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

let boxList = [];
let lineList = [];
let currentLine = null;

function draw() {
  background(255);
  for (let i = 0; i < boxList.length; i++) {
    boxList[i].update();
    boxList[i].over();
    boxList[i].show();
  }
  for (let line of lineList) {
    line.show();
  }
  if (currentLine) {
    currentLine.update(mouseX, mouseY);
    currentLine.show();
  }

  push();
  fill(165,247,0)
  stroke(0);
  strokeWeight(3);
  if(boxList.length > 0) {
    text("start", boxList[0].x, boxList[0].y)
  }
  pop();
}

