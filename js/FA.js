const TypeFA = Object.freeze({
    DFA: 0,
    NFA: 1
})

class FA {
    alphabet = [];
    states = [];
    startState;
    finalStates = [];
    type;

    createState() {
        let s = new State();
        this.states.push(s);
    }

    determineType() {
        for(let i = 0; i < this.states.length; i++) {
            if(this.states[i].transitions.length === this.alphabet.length) {
                this.type = TypeFA.DFA
            } else {
                this.type = TypeFA.NFA
            }
        }
    }

    getType() {
        switch(this.type) {
            case TypeFA.DFA :
                console.log("DFA")
                break;
            case TypeFA.NFA:
                console.log("NFA")
            break;
        }
    }

    transition(state, input) {

    }
 
}

class State {
    transitions = {}; // all transitions of a state

    createTransition(str, nextState) {
        this.transitions[str] = nextState
    }

}

// test
let f1 = new FA();
f1.createState();
console.log(f1.states[0].transitions[0]);
console.log(f1.startState);
console.log(TypeFA.DFA);

f1.alphabet = ["a"];

f1.states[0].createTransition();
f1.determineType()

console.log(f1.type)
f1.getType()