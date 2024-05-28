
let f3 = new FA();

f3.alphabet = ["0", "1"];
f3.createState();
f3.createState();
f3.createState();

f3.states[0].createTransition("0", f3.states[1]);
f3.states[0].createTransition("1", f3.states[0]);
f3.states[1].createTransition("0", f3.states[1]);
f3.states[1].createTransition("1", f3.states[2]);
f3.states[2].createTransition("0", f3.states[2]);
f3.states[2].createTransition("1", f3.states[2]);

console.log("f3 type: " );
f3.getType();
