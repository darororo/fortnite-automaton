const TypeFA = Object.freeze({
    DFA: 0,
    NFA: 1,
})

class FA {
    alphabet = [];
    states = [];
    finalStates = [];
    type;
    output;

    createState() {
        let s = new State();
        this.states.push(s);
    }

    makeFinalState(state) {
        if(!(this.finalStates.includes(state))) this.finalStates.push(state)
    }

    determineType() {

        for(let i = 0; i < this.states.length; i++) {
            let currentTransitionLength = Object.keys(this.states[i].allTransitions).length

            console.log("state: " + i + " transition length:" + currentTransitionLength)

            if(!(currentTransitionLength === this.alphabet.length)) {
                // if the number of transitions and the number of alphabets are not the same  
                // then it is an NFA 
                this.type = TypeFA.NFA
                return;
            }

        }

        for(let i = 0; i < this.states.length; i++) {
            // loops through each state

            for(const [input, possibleStates] of Object.entries(this.states[i].allTransitions)) {
                // get all possible transition states of each input in the current state

                console.log(`input: ${input}, Possible states: ${possibleStates.length}`);


                if(!(this.alphabet.includes(input))) {
                    // if the input is not in the alphabet, it's an NFA
                    this.type = TypeFA.NFA;
                    return;
                }

                // if(this.states[i].allTransitions[input] === undefined) {
                //     // if the input is not recognized, it's an NFA
                //     this.type = TypeFA.NFA;
                //     return;
                // }

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
        if(this.type === undefined) this.determineType();

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

    checkStr(str) {

        if(this.type === undefined) this.determineType();

        if(str != "") {
            for(let i = 0; i < str.length; i++) {
                if( !(this.alphabet.includes(str.charAt(i))) ) {
                    this.output = "Reject: Character not in alphabet"
                }
            }
        }

        if(this.finalStates.length == 0) { 
            this.output = "Rejected: Empty Final State";
            console.log(str + ": " + this.output)
            return;
        }

        if(this.type == TypeFA.DFA) this.checkStrDFA(str);

        if(this.type == TypeFA.NFA) this.checkStrNFA(str);
    } 

    checkStrDFA(str) {

        let currentState = this.states[0];
        for(let i = 0; i < str.length; i++) {
            let nextState = currentState.transitionFrom(str.charAt(i))[0];
            currentState = nextState;
        }

        if(this.finalStates.includes(currentState)) {
            console.log("FUCK YEAH");
            this.output = "Accepted"

        } else {
            console.log("FUCK NO");
            this.output = "Rejected";
        }

    }

    // Not yet supported epsilon transition 
    checkStrNFA(str) {
        let currentStates = [this.states[0]];

        // Empty string input
        if(str.length === 0) {
            currentStates = currentStates[0].epsilonTransition();
        }

        for(let i = 0; i < str.length; i++) {
            let nextStates = []

            for(let j = 0; j < currentStates.length; j++) {

                // check if the current state has any transitions using the current character
                let hasTransition = !(currentStates[j].transitionFrom(str.charAt(i)) === undefined);

                if(hasTransition){

                    currentStates[j].epsilonTransition().forEach( state => {
                        if( !(state.transitionFrom(str.charAt(i)) === undefined) ) {
                            state.transitionFrom(str.charAt(i)).forEach( s => {
                                if( !(nextStates.includes(s)) ) nextStates.push(s)
                            })
                        }
                    })

                    currentStates[j].transitionFrom(str.charAt(i)).forEach( state => {

                        state.epsilonTransition().forEach( s => {
                            if( !(nextStates.includes(s)) ) nextStates.push(s)
                        })

                    });
                }
            }

            // all next states are our new current states 
            currentStates = nextStates;
        }

        let finalStateCounts = 0;
        currentStates.forEach( state => {
            if(this.finalStates.includes(state)) finalStateCounts++;
        })

        if(finalStateCounts > 0) {
            console.log("FUCK YEAH");
            this.output = "Accepted"

        } else {
            console.log("FUCK NO");
            this.output = "Rejected";
        }

        console.log("final state counts: " + finalStateCounts)
    }

    NFAtoDFA() {
        if(this.type == TypeFA.NFA) {
            
        }
    }
 
}

class State {

    allTransitions = {}; // all transitions of a state

    createTransition(str, nextState) {
        // if there is no trasition for the current alphabet yet,  
        // initialize an array to store possible transitions
        if(!this.allTransitions[str]) { this.allTransitions[str] = [] }

        // do nothing if the same transition using the str already exists
        if(this.allTransitions[str].includes(nextState)) { return; }

        // add a next state to the possible transitions of the current input 
        this.allTransitions[str].push(nextState);

        console.log("transition created")
    }

    transitionFrom(str) {
        return this.allTransitions[str];    // Returns an Array of States
    }

    // Return a list of all states connected by epsilons
    epsilonTransition() {  
        let currentStates = [this]
    
        let lastState = false;
        while(!lastState) {                         
            let hasTransition = false;  // True, if at least one state in currentStates have epsilon transition  
            currentStates.forEach( state => {
                if(!(state.transitionFrom("") === undefined)) { 
                    // If each state in the current state has epsilon transition
                    // then add each state from the transition to our current state list

                    state.transitionFrom("").forEach( s => {
                        if(!(currentStates.includes(s))) {
                            // Check if the state is already visited
                            // if not add it to our list

                            currentStates.push(s)
                            // Found a new state, set hasTransition flag to true to restart our loop
                            // for check every state in currentStates for any epsilon transition 
                            hasTransition = true;   

                        }
                    })
                };
            })

            if(!hasTransition) {
                lastState = true;
            }
        }
        return currentStates;
    }


}

// test
// let f1 = new FA();
// console.log(TypeFA.DFA);

// f1.alphabet = ["a", "b", "c"];
// f1.createState();
// f1.createState();

// f1.states[0].createTransition("a", f1.states[1]);
// f1.states[0].createTransition("b", f1.states[1]);
// f1.states[1].createTransition("a", f1.states[1]);
// f1.states[1].createTransition("b", f1.states[1]);

// console.log("f1 type: " );
// f1.getType();

let f2 = new FA();
f2.alphabet = ["a", "b", "c"];
f2.createState();
f2.createState();
f2.createState();
f2.createState();

f2.makeFinalState(f2.states[2])
f2.makeFinalState(f2.states[3])


console.log(f2.finalStates.length)

f2.states[0].createTransition("", f2.states[2]);

f2.states[1].createTransition("a", f2.states[1]);
f2.states[1].createTransition("b", f2.states[1]);
f2.states[1].createTransition("", f2.states[2]);
f2.states[2].createTransition("", f2.states[3]);


console.log("f2 type: " );
f2.getType();

f2.checkStr("")



//NFA
console.log("F3")
let f3 = new FA();

f3.alphabet = ["0", "1", "2"];
f3.createState();
f3.createState();
f3.createState();
f3.createState();

f3.makeFinalState(f3.states[1]);
f3.makeFinalState(f3.states[3]);

f3.states[0].createTransition("0", f3.states[1]);
f3.states[0].createTransition("1", f3.states[2]);
f3.states[0].createTransition("", f3.states[3])


f3.states[1].createTransition("0", f3.states[1]);
f3.states[1].createTransition("", f3.states[3]);

f3.states[2].createTransition("0", f3.states[2]);
f3.states[2].createTransition("1", f3.states[2]);

f3.states[3].createTransition("", f3.states[1]);

console.log("f3 type: " );
f3.getType();


// console.log(f3.states[0].epsilonTransition())

f3.checkStr("0")           // FUCK YES
f3.checkStr("")            // FUCK YES

f3.checkStr("1")           // FUCK NO
f3.checkStr("11")           // FUCK NO






// DFA
// let f4 = new FA();
// f4.alphabet = ["a", "b"];
// f4.createState();
// f4.createState();
// f4.createState();

// f4.states[0].createTransition("a", f4.states[1]);
// f4.states[0].createTransition("b", f4.states[2]);
// f4.states[1].createTransition("a", f4.states[2]);
// f4.states[1].createTransition("b", f4.states[1]);

// f4.states[2].createTransition("a", f4.states[0]);
// f4.states[2].createTransition("b", f4.states[1]);

// f4.makeFinalState(f4.states[2]);

// console.log("f4 type: ");
// f4.getType();


// f4.checkStr("aa");  // FUCK YEAH
// f4.checkStr("aaa"); // FUCK NO
// f4.checkStr("aaaaa"); // FUCK YEAH


let f5 = new FA();
f5.createState();
f5.createState();
f5.createState();
f5.alphabet = ["a"]

f5.states[0].createTransition("", f5.states[0])
f5.states[0].createTransition("", f5.states[1])
f5.states[1].createTransition("", f5.states[0])

f5.states[0].epsilonTransition();

console.log(f5.states[0].epsilonTransition())

f5.checkStr("b")