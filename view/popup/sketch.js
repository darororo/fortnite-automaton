let canvasParent;
let boxCounter = 0;


function setup() {
    canvasParent = document.getElementById("canvasParent");
    
    const mycanvas = createCanvas(
        canvasParent.offsetWidth,
        canvasParent.offsetHeight
      );

    mycanvas.parent("canvasParent");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
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

