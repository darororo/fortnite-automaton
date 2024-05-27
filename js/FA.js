const TypeFA = Object.freeze({
    DFA: 0,
    NFA: 1,
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
            let currentTransitionLength = Object.keys(this.states[i].allTransitions).length

            console.log("state: " + i + " transition length:" + currentTransitionLength)

            // if the number of transitions and the number of alphabets are not the same  
            // then it is an NFA 
            if(!(currentTransitionLength === this.alphabet.length)) {
                this.type = TypeFA.NFA
                return;
            }
        }

        for(let i = 0; i < this.states.length; i++) {
            // loops through each state

            for (const [input, possibleStates] of Object.entries(f1.states[i].allTransitions)) {
                // get all possible transition states of each input in the current state

                console.log(`input: ${input}, Possible states: ${possibleStates.length}`);

                if(this.states[i].allTransitions[input] === undefined) {
                    // if the input is not recognized, it's an NFA
                    this.type = TypeFA.NFA;
                    return;
                }

                if(possibleStates.length > 1) {
                    // if the current input has more than 1 possible state
                    // then it's an NFA
                    this.type = TypeFA.NFA;
                    return;
                }
            }
        }

        this.type = TypeFA.DFA;
    }

    getType() {
        if(this.type === undefined) {
            this.determineType();
        }

        switch(this.type) {
            case TypeFA.DFA :
                console.log("DFA")
                break;
            case TypeFA.NFA:
                console.log("NFA")
            break;
            default:
                console.log("invalid FA")
            break;
        }
    }

    transition(state, input) {

    }
 
}

class State {
    allTransitions = {}; // all transitions of a state

    createTransition(str, nextState) {
        // if there is no trasition for the current alphabet yet,  
        // initialize an array to store possible transitions
        if(!this.allTransitions[str]) { this.allTransitions[str] = [] }

        // append a next state to input 
        this.allTransitions[str].push(nextState);

        console.log("transition created")
    }

}

// test
let f1 = new FA();
console.log(TypeFA.DFA);

f1.alphabet = ["a", "b", "c"];
f1.createState();
f1.createState();

f1.states[0].createTransition("a", f1.states[1]);
f1.states[0].createTransition("b", f1.states[1]);
f1.states[1].createTransition("a", f1.states[1]);
f1.states[1].createTransition("b", f1.states[1]);

console.log("f1 type: " );
f1.getType();

let f2 = new FA();
f2.alphabet = ["a", "b"];
f2.createState();
f2.createState();

f2.states[0].createTransition("a", f2.states[1]);
f2.states[0].createTransition("b", f2.states[1]);
f2.states[1].createTransition("a", f2.states[1]);
f2.states[1].createTransition("b", f2.states[1]);

console.log("f2 type: " );
f2.getType();





