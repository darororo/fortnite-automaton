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