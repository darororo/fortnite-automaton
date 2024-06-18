let canvasParent;
let boxCounter = 0;
let SuperFA = new FA();

//get button elements from html
const resetbutton = document.getElementById("reset");
const getTypeBtn = document.getElementById("testfa");
const minimizeBtn = document.getElementById("minimize");
const convertBtn = document.getElementById("convertNFA");
const testStringInp = document.getElementById("textInput");
const testStringBtn = document.getElementById("teststr");
const alphabetInp = document.getElementById('alphabet-input');
const alphabetResult = document.getElementById("alphabet-result");
const loadBtn = document.getElementById("load-btn");


// Empty boxlist array if user clicks reset
resetbutton.addEventListener("click", () => {resetFAcanvas()});

// load FA JSON
loadBtn.addEventListener('click', () => {loadFAfromJson();})

// Handle Alphabet Setup
alphabetInp.addEventListener("change", setAlphabetFA);

minimizeBtn.onclick = () => {
  let minDFA = SuperFA.getMinimizedDFA();
  popupCanvas(minDFA)
}

convertBtn.onclick = () => {
  let DFA = SuperFA.getNFAtoDFA();
  popupCanvas(DFA)
}

minimizeBtn.disabled = true;
convertBtn.disabled = true;


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
  
  renderFA(f3);
  // renderFA(f12);  //dfa
  // renderFA(f9);   //nfa
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
  saveFAToJSON(SuperFA);
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

let boxList = [];
let lineList = [];
let currentLine = null;

// renderFA(f1);

function draw() {
  background(255);
  for (let i = 0; i < boxList.length; i++) {
    boxList[i].update();
    boxList[i].over();
    boxList[i].show();
    // boxList[i].checkbox.changed(() => {
    //   updateFinalStates(boxList[i]);
    // })
  }
  for (let line of lineList) {
    line.show();
  }
  if (currentLine) {
    currentLine.update(mouseX, mouseY);
    currentLine.show();
  }

  // console.log(boxList[0].checkbox)

}



testStringBtn.addEventListener('click', function(){
  console.log(testStringInp.value);
  SuperFA.checkStr(testStringInp.value);

  if(SuperFA.output == 0){
    document.getElementById("str-result").innerText = "Reject";
  }else{
    document.getElementById("str-result").innerText = "Accept";
  }
  document.getElementById("str-result").style.display = "inline";

})

getTypeBtn.addEventListener('click', function(){
  if(SuperFA.states.length == 0) {
    alert("oh may gah")
  } else {
    SuperFA.determineType();
    showFAType();
  }    
})

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
    console.log(mouseY);
  } else {
    console.log("not allowed");
  }
}

function showFAType() {
  let NFAEle = document.querySelectorAll('.fa span')[0];
  let DFAEle = document.querySelectorAll('.fa span')[1];

  // After Reset, set to default color 
  if(boxCounter == 0) {
    DFAEle.style.backgroundColor = "#9faec1";
    NFAEle.style.backgroundColor = "#9faec1";
    return;
  }

  if(SuperFA.type == TypeFA.NFA) {
    DFAEle.style.backgroundColor = "#9faec1";
    NFAEle.style.backgroundColor = "Green";

    convertBtn.disabled = false;
    convertBtn.style.backgroundColor = "orange"
    
    minimizeBtn.disabled = true;
    minimizeBtn.style.backgroundColor = "#9faec1";
  } 
  if(SuperFA.type == TypeFA.DFA){
    DFAEle.style.backgroundColor = "Green";
    NFAEle.style.backgroundColor = "#9faec1";

    minimizeBtn.disabled = false;
    minimizeBtn.style.background = "orange"; 

    convertBtn.disabled = true;
    convertBtn.style.backgroundColor = "#9faec1";
  }
  
}

function setAlphabetFA() {
  let chars = alphabetInp.value;
  chars = chars.split(',');
  for(let i = 0; i < chars.length; i++) chars[i] = chars[i].trim();
  chars = new Set(chars); // Remove duplicates

  let alphabetSet = Array.from(chars);
  alphabetSet = alphabetSet.filter(char => char.length == 1); 
  
  SuperFA.alphabet = alphabetSet; 
  alphabetResult.innerText = `[${SuperFA.alphabet}]`;
  alphabetResult.style.display = "inline";
  
  console.log(fa.alphabet);
}


function popupCanvas(faObject) {
  let win = window.open('view/popup/canvas.html', null, 'popup, width=800, height=600');
  win.onload = () => {
    win.postMessage({"FA" : faObject})
  }
  console.log("Sending")
  console.log(faObject);
  
}

function loadFAfromJson(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = e =>{
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event){
      resetFAcanvas();
      const faData = JSON.parse(event.target.result);
      let FAobject = setFAdata(faData);
      renderFA(FAobject);
    };
    reader.readAsText(file);
  };
  input.click();
}

function setFAdata(FAjson) {
  let FAobject = new FA();
  FAobject.alphabet = FAjson.alphabet;

  let states = FAjson.states;
  let finalStateIndex = FAjson.finalStateIndex;

  states.forEach(state => {
    FAobject.createState();
  })

  for(let i = 0; i < states.length; i++) {
    console.log("state: ", i)
    let transitions = states[i].allTransitionsIndex;
    for(let [char, destIndexes] of Object.entries(transitions)) {
      destIndexes.forEach(index => {
        FAobject.createTransition(i, index, char);
      })
    }
  }

  finalStateIndex.forEach(index => {
    FAobject.makeFinalState(FAobject.states[index]);
  })

  return FAobject;
}

function resetFAcanvas() {
  console.log("clicked");

  boxList.forEach(box => {
    box.removeCheckbox();
  });

  boxList = [];
  boxCounter = 0;
  lineList = [];
  showFAType(); // reset color of type labels
  SuperFA = new FA();

  minimizeBtn.disabled = true;
  minimizeBtn.style.backgroundColor = "grey";
  
  convertBtn.disabled = true;
  convertBtn.style.backgroundColor = "grey";

  alphabetResult.style.display = 'none';

  document.getElementById("str-result").style.display = "none";
}

document.getElementById("bulk").addEventListener("click", function(){
  const getAccept = document.getElementById('acc_input').value;
  const acceptValue = getAccept.split('\n');
  const getReject = document.getElementById('rej_input').value;
  const rejectValue = getReject.split('\n');

  const resultEle = document.querySelector(".result");


  console.log(acceptValue);
  console.log(rejectValue);

  let testResult = [];

  acceptValue.forEach(str => {
    SuperFA.checkStr(str)
    let res;
    if(SuperFA.output == 0) {
      res = str + " Failed"
    } else{
      res = str + " Passed"
    }
    testResult.push(res);
  })

  rejectValue.forEach(str => {
    SuperFA.checkStr(str)
    let res;
    if(SuperFA.output == 0) {
      res = str + " Passed"
    } else{
      res = str + " Failed"
    }
    testResult.push(res);
  })


  testResult.forEach(result => {
    let spanText = document.createElement("span");
    spanText.innerText = result;

    resultEle.appendChild(spanText);
  })

})
