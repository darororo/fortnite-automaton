const TypeFA = Object.freeze({
    DFA: 0,
    NFA: 1,
})

// TODO: Change transitioning from state to state, 
// to transitioning via each state index 

class FA {
    alphabet = [];
    states = [];
    finalStates = [];
    type;
    output;

    createState() {
        let s = new State();
        this.states.push(s);
        console.log("state created");
    }

    // Doesn't actually delete the state, only removes related transitions
    // Deleting the state will mess up the indexing of the FA
    deleteTransitionToState(destIndex) {    
        let state = this.states[destIndex];
        if(!state) {
            console.log("State doesn't exist")
            return;
        };

        for(let i = 0; i < this.states.length; i++) {
            this.alphabet.forEach(char => {
                this.deleteTransition(i, destIndex, char);
            })

            this.deleteTransition(i, destIndex, "");
        }

    }

    createTransition(fromStateIndex, destStateIndex, char) {
        this.states[fromStateIndex].createTransition(char, this.states[destStateIndex]);
        this.createTransitionIndex(fromStateIndex, destStateIndex, char);
    }

    createTransitionIndex(fromStateIndex, destStateIndex, char) {
        this.states[fromStateIndex].createTransitionIndex(char, destStateIndex);
    }

    deleteTransition(fromStateIndex, destStateIndex, char) {
        let fromState = this.states[fromStateIndex]; 
        let destState = this.states[destStateIndex];

        if(!fromState || !destState) return;
        if(!fromState.allTransitions[char]) return;

        let index = fromState.allTransitions[char].indexOf(destState);
        if(index === -1) return;    // return when destination state doesn't exist
        fromState.allTransitions[char].splice(index, 1);

        index = fromState.allTransitionsIndex[char].indexOf(destStateIndex);
        fromState.allTransitionsIndex[char].splice(index, 1);

        if(fromState.allTransitionsIndex[char].length === 0) {
            delete(fromState.allTransitionsIndex[char])
            delete(fromState.allTransitions[char])
        }
    }

    deleteAllTransitionFrom(fromStateIndex) {
        let state = this.states[fromStateIndex];
        if(!state) return; 

        for(const [char, dest] of Object.entries(state.allTransitions)) {
            delete(state.allTransitions[char]);
            delete(state.allTransitionsIndex[char]);
        }

    }

    makeFinalState(state) {
        if(!(this.finalStates.includes(state))) this.finalStates.push(state)
    }

    deleteFinalState(state) {
        if(!this.finalStates.includes(state)) return;
        let index = this.finalStates.indexOf(state);
        this.finalStates.splice(index, 1);
    }

    isFinalState(state) {
        if(this.finalStates.includes(state)) return true;

        return false;
    }

    determineType() {

        for(let i = 0; i < this.states.length; i++) {
            let currentTransitionLength = Object.keys(this.states[i].allTransitions).length

            if(!(currentTransitionLength === this.alphabet.length)) {
                // if the number of transitions and the number of alphabets are not the same  
                // then it is an NFA 
                this.type = TypeFA.NFA
                return;
            }

        }

        let transitionCounts = 0;
        for(let i = 0; i < this.states.length; i++) {

            for(const [input, possibleStates] of Object.entries(this.states[i].allTransitions)) {
                // get all possible transition states of each input in the current state

                // console.log(`input: ${input}, Possible states: ${possibleStates.length}`);


                if(!(this.alphabet.includes(input))) {
                    // if the input is not in the alphabet, it's an NFA
                    this.type = TypeFA.NFA;
                    return;
                }

                if(possibleStates.length > 1) {
                    // if the current input has more than 1 possible state
                    // then it's an NFA
                    this.type = TypeFA.NFA;
                    return;
                }

                transitionCounts += possibleStates.length;
            }
        }

        if(transitionCounts == 0) {
            this.type = TypeFA.NFA;
            return
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

        // Check if any character is not in the alphabet
        if(str != "") {
            for(let i = 0; i < str.length; i++) {
                if( !(this.alphabet.includes(str.charAt(i))) ) {
                    this.output = 0;
                }
            }
        }

        if(this.finalStates.length == 0) { 
            this.output = 0;
            console.log(str + ": Rejected: Empty Final State");
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
            this.output = 1;

        } else {
            console.log("FUCK NO");
            this.output = 0;
        }

    }

    checkStrNFA(str) {
        let currentStates = [this.states[0]];

        // Empty string input
        if(str.length === 0) {
            currentStates = currentStates[0].epsilonClosure();
        }

        for(let i = 0; i < str.length; i++) {
            let nextStates = []

            for(let j = 0; j < currentStates.length; j++) {

                // check if the current state has any transitions using the current character
                let hasTransition = !(currentStates[j].transitionFrom(str.charAt(i)) === undefined);

                if(hasTransition){
                    currentStates[j].epsilonClosure().forEach(state => {
                        if( !(state.transitionFrom(str.charAt(i)) === undefined) ) {
                            state.transitionFrom(str.charAt(i)).forEach( nextState => {
                                if( !(nextStates.includes(nextState)) ) nextStates.push(nextState);
                            })
                        }
                    })

                    nextStates.forEach(state => {
                        state.epsilonClosure().forEach(s => {
                            if( !(nextStates.includes(s)) ) nextStates.push(s);
                        })
                    })
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
            this.output = 1;

        } else {
            console.log("FUCK NO");
            this.output = 0;
        }

        console.log("final state counts: " + finalStateCounts)
    }

    getNFAtoDFA() {
        if(this.type == undefined) this.determineType();

        if(this.type == TypeFA.DFA) return;

        if(this.type == TypeFA.NFA) {
            let dfa = new FA();
            let input;
            dfa.createState();

            let dfaSets = []; 
            let q0 = this.states[0].epsilonClosure();   // q-ith is an equivalent DFA state to one or more states in the NFA
            dfaSets.push(q0);

            for(let setIndex = 0; setIndex < dfaSets.length; setIndex++) {
                
                for(let charIndex = 0; charIndex < this.alphabet.length; charIndex++) {
                    let qi = [];
                    input = this.alphabet[charIndex];

                    // console.log("TRANS: " + this.alphabet[charIndex])

                    // make transition using the current input of each state in the current set
                    // and get the epsilon closure of every state from the transition
                    dfaSets[setIndex].forEach(state => {
                        state.transitionFrom(input).forEach( ss => {
                            ss.epsilonClosure().forEach(s => {
                                if(!(qi.includes(s))) qi.push(s);
                            })
                        })
                    })

                    let sameSet = false; // Flag for if qi is in dfaSets or not

                    if(qi.length === 0) {
                        // if qi is empty, 
                        // check if qi is in dfaSets
                        for(let i = 0; i < dfaSets.length; i++) {
                            if(dfaSets[i].length == 0) {
                                sameSet = true;
                            }
                        }

                    } else {
                        // if qi is not empty, 
                        // check if qi is in dfaSets
                        for(let i = 0; i < dfaSets.length; i++) {
                            // loops through each set in dfaSets

                            if(dfaSets[i].length == qi.length) {    
                                // proceed if the length of current set and qi are the same

                                if(qi.every(state => dfaSets[i].includes(state))) {
                                    // if every state in qi is also in the current set
                                    // qi is already in dfaSets
                                    sameSet = true;
                                    break;
                                }
                            };
                        }
                    }

                    if(!sameSet) {
                        // if dfaSets don't have qi
                        dfaSets.push(qi);
                        dfa.createState();
                    } 

                    // Find qi in dfaSets // 
                    let qiFound = false;
                    let qiIndex;    // index of qi in the supersets; also the index of a new DFA state 

                    for(let i = 0; i < dfaSets.length; i++) {   // Refactor: Might be able to put in the above loop or use indexing instead
                        if(qi.length == 0) {
                            if(dfaSets[i].length == qi.length) qiFound = true;
                        } else if(dfaSets[i].length == qi.length) {
                            if(qi.every(state => dfaSets[i].includes(state))) qiFound = true;
                        }

                        if(qiFound) {
                            qiIndex = i;
                            break;
                        }

                    }

                    if(qiFound) {
                        // dfa.states[setIndex].createTransition(input, dfa.states[qiIndex]) // Current index of DFA state is the same as the current set index
                        dfa.createTransition(setIndex, qiIndex, input) // Current index of DFA state is the same as the current set index
                        this.finalStates.forEach(state => {
                            if(qi.includes(state)) {
                                // if qi has any of the final states of the NFA
                                dfa.makeFinalState(dfa.states[qiIndex]);
                            }
                        })
                    }
                }
            }

            dfa.alphabet = this.alphabet;
            dfa.determineType();
                
            return dfa;
        }
    }

    getMinimizedDFA() {
        if(this.type == undefined) this.determineType();

        if(this.type == TypeFA.NFA) return;

        let accessibleStates = [this.states[0]];

        let allStatesReached = false;
        while(!allStatesReached) {
            allStatesReached = true;
            for(let i = 0; i < this.alphabet.length; i++) {
                let char = this.alphabet[i];
                accessibleStates.forEach(state => {
                    if( !(accessibleStates.includes(state.transitionFrom(char)[0])) ) {
                        accessibleStates.push(state.transitionFrom(char)[0]);
                        allStatesReached = false;
                    }
               })
            }
        }

        let accessibleIndex = []
        let finalStateIndex = []

        accessibleStates.forEach(state => accessibleIndex.push(this.states.indexOf(state)));
        this.finalStates.forEach(state => finalStateIndex.push(this.states.indexOf(state)));

        let StatePairs = [];


        // Initialize Table for the table filling method
        // Unmarked: False; Marked: True
        for(let i = 0; i < this.states.length; i++) {
            let pair = [];

            for(let j = 0; j < this.states.length; j++) {
                pair.push(false);
            }

            StatePairs.push(pair)
        }

        // First iteration: mark every pair with a final state; don't mark pairs with 2 final states
        for(let i = 0; i < StatePairs.length; i++) {
            for(let j = i + 1; j < StatePairs[i].length; j++) {
                if(!accessibleIndex.includes(i) || !accessibleIndex.includes(j)) continue;

                if(i == j) continue;

                if(finalStateIndex.includes(i) && finalStateIndex.includes(j)) continue;
                if(finalStateIndex.includes(i) || finalStateIndex.includes(j)) StatePairs[i][j] = true;
            }
        }


        // Next iterations; check every unmarked pairs
        for(let cIndex = 0; cIndex < this.alphabet.length; cIndex++) {
            let char = this.alphabet[cIndex];
            
            for(let i = 0; i < StatePairs.length; i++) {
                if(!accessibleIndex.includes(i)) continue;

                for(let j = i + 1; j < StatePairs[i].length; j++) {
                    if(!accessibleIndex.includes(j)) continue;

                    if(!StatePairs[i][j]) {
                        let s1 = this.states[i].transitionFrom(char)[0];
                        let s2 = this.states[j].transitionFrom(char)[0];
                        
                        // index of the pair recieved from the transition of an unmarked pair
                        let i1 = this.states.indexOf(s1);
                        let i2 = this.states.indexOf(s2);

                        if(StatePairs[i1][i2]) {
                            // if the transition of a pair gives a marked pair
                            // Mark the pair that perform the transition
                            StatePairs[i][j] = true;
                        }
                    }
                }
            }
        }


        let minimizedDFA = new FA();
        let minStates = [];
        minimizedDFA.alphabet = this.alphabet;

        for(let i = 0; i < StatePairs.length; i++) {
            if(!accessibleIndex.includes(i)) continue;

            let stateExisted = false;   // if the current state already exists in a previous state group
            minStates.forEach(states => {
                if(states.includes(i)) {
                    stateExisted = true
                } 
            })
            
            if(stateExisted) continue;

            let group = [i];
    
            for(let j = i + 1; j < StatePairs[i].length; j++) {
                // check the states along the i-th column

                if(!accessibleIndex.includes(j)) continue;

                if(!StatePairs[i][j]) {
                    group.push(j); // if a pair is unmarked; add it to the current state group

                    for(let k = i + 1; k < j; k++) {
                        // check the states along the j-th row

                        if(!accessibleIndex.includes(k)) continue;

                        if(!StatePairs[k][j]) {
                            group.push(k); // if a pair is unmarked; add it to the current state group
                        }
                    }
                }
            }

            minStates.push(group)
        }


        // Create states for the minimized DFA
        for(let i = 0; i < minStates.length; i++) {
            minimizedDFA.createState();
            finalStateIndex.forEach(index => {
                if(minStates[i].includes(index)) {
                    minimizedDFA.makeFinalState(minimizedDFA.states[i]);
                }   
            })
        }

        // Create transitions for each state of the minimized DFA
        for(let i = 0; i < accessibleIndex.length; i++) {
            let stateIndex = accessibleIndex[i];

            for(let cIndex = 0; cIndex < this.alphabet.length; cIndex++) {
                let char = this.alphabet[cIndex];

                let trans = this.states[stateIndex].transitionFrom(char)[0];
                let transIndex = this.states.indexOf(trans);

                let minIndex; let minTransIndex;

                for(let k = 0; k < minStates.length; k++) {
                    if(minStates[k].includes(stateIndex)){
                        minIndex = k;
                    }
                     
                    if(minStates[k].includes(transIndex)){
                        minTransIndex = k;
                    }
                }

                minimizedDFA.createTransition(minIndex, minTransIndex, char);
            }
        }
        
        return minimizedDFA;
    }

    // addState(state){
    //     this.states.push(state);
    // }

    // addTransition(transition){
    //     this.addTransition.push(transition);
    // }

    getFAData(){
        let States = [];

        let finalStateIndex = [];

        for(let i = 0; i < this.states.length; i++) {
            let data = {...this.states[i]};
            delete(data.allTransitions);
            States.push(data);
        }

        this.finalStates.forEach(state => {
            let index = this.states.indexOf(state);
            finalStateIndex.push(index);
        })

        return {
            states: States,
            finalStateIndex : finalStateIndex,
            alphabet: this.alphabet
        };
    }
 
}

class State {
    allTransitions = {}; 
    allTransitionsIndex = {};

    // Deprecated; Call this function from a FA object
    createTransition(str, nextState) {
        // if there is no trasition for the current alphabet yet,  
        // initialize an array to store possible transitions
        if(!this.allTransitions[str]) { this.allTransitions[str] = [] }

        // do nothing if the same transition using the str already exists
        if(this.allTransitions[str].includes(nextState)) { return; }

        // add a next state to the possible transitions of the current input 
        this.allTransitions[str].push(nextState);
    }

    createTransitionIndex(str, destIndex) { // Indexes are easier to load
        // if there is no trasition for the current alphabet yet,  
        // initialize an array to store possible transitions
        if(!this.allTransitionsIndex[str]) { this.allTransitionsIndex[str] = [] }

        // do nothing if the same transition using the str already exists
        if(this.allTransitionsIndex[str].includes(destIndex)) { return; }

        // add a next state to the possible transitions of the current input 
        this.allTransitionsIndex[str].push(destIndex);
        
    }

    transitionFrom(str) {
        if(this.allTransitions[str]) return this.allTransitions[str]; // Returns an Array of States

        return [];
    }

    // Return a list of all states connected by epsilons to the state this method is called on
    epsilonClosure() {  
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
                            // if not add it to our lists

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

    getTransitionData() {
        return this.allTransitionsIndex;
    }

}

// test
let f1 = new FA();
console.log(TypeFA.DFA);

f1.alphabet = ["a", "b", "c"];
f1.createState();
f1.createState();

f1.makeFinalState(f1.states[1]);

f1.createTransition(0, 1, "a");
f1.createTransition(0, 1, "b");

f1.createTransition(1, 1, "a");
f1.createTransition(1, 1, "b");


// console.log("f1 type: " );
// f1.getType();

// let f2 = new FA();
// f2.alphabet = ["a", "b", "c"];
// f2.createState();
// f2.createState();
// f2.createState();
// f2.createState();

// f2.makeFinalState(f2.states[2])
// f2.makeFinalState(f2.states[3])


// console.log(f2.finalStates.length)

// f2.states[0].createTransition("", f2.states[2]);

// f2.states[1].createTransition("a", f2.states[1]);
// f2.states[1].createTransition("b", f2.states[1]);
// f2.states[1].createTransition("", f2.states[2]);
// f2.states[2].createTransition("", f2.states[3]);


// console.log("f2 type: " );
// f2.getType();

// f2.checkStr("")



//NFA
// console.log("F3")
let f3 = new FA();

f3.alphabet = ["0", "1", "2"];
f3.createState();
f3.createState();
f3.createState();
f3.createState();

f3.makeFinalState(f3.states[1]);
f3.makeFinalState(f3.states[3]);

f3.createTransition(0, 1, "0");
f3.createTransition(0, 2 ,"1");
f3.createTransition(0, 3, "");


f3.createTransition(1,1,"0");
f3.createTransition(1,3,"");

f3.createTransition(2,2,"0");
f3.createTransition(1,2,"1");

f3.createTransition(3,2,"");

// console.log("f3 type: " );
// f3.getType();

// f3.NFAtoDFA();



// console.log(f3.states[0].epsilonClosure())

// f3.checkStr("0")           // FUCK YES
// f3.checkStr("")            // FUCK YES

// f3.checkStr("1")           // FUCK NO
// f3.checkStr("11")           // FUCK NO

// console.log(f3.NFAtoDFA());


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


// let f5 = new FA();
// f5.createState();
// f5.createState();
// f5.createState();
// f5.alphabet = ["a"]

// f5.states[0].createTransition("", f5.states[0])
// f5.states[0].createTransition("", f5.states[1])
// f5.states[1].createTransition("", f5.states[0])
// f5.createTransition(0, 0, "");
// f5.createTransition(0, 1, "");

// f5.createTransition(1, 0, "");

// f5.states[0].epsilonClosure();

// console.log(f5.states[0].epsilonClosure())

// f5.checkStr("b")
// console.log(f5.states[0]);
// f5.states[0].deleteAllTransition();
// console.log(f5.states[0]);


// Chapter 5 homework NFA To DFA 1
// Accept strings containing abb
// let f6 = new FA();
// f6.alphabet = ["a", "b"];
// f6.createState();
// f6.createState();
// f6.createState();
// f6.createState();

// f6.states[0].createTransition("a", f6.states[0]);
// f6.states[0].createTransition("b", f6.states[0]);
// f6.states[0].createTransition("a", f6.states[1]);

// f6.states[1].createTransition("b", f6.states[2]);

// f6.states[2].createTransition("b", f6.states[3]);

// f6.states[3].createTransition("a", f6.states[3]);
// f6.states[3].createTransition("b", f6.states[3]);

// f6.makeFinalState(f6.states[3]);
// f6.getType()
// f6.checkStr("abab") //FUCK NO
// f6.checkStr("ababb") //FUCK YEAH
// f6.checkStr("ababba") //FUCK YEAH



// let f6DFA = f6.getNFAtoDFA();   // 4 states when turned into DFA
// f6DFA.getType()

// f6DFA.checkStr("abab") //FUCK NO
// f6DFA.checkStr("ababb") //FUCK YEAH
// f6DFA.checkStr("ababba") //FUCK YEAH



// Chapter 5 homework NFA To DFA 2
// Starts with ab; end with ba
// let f7 = new FA();
// f7.alphabet = ["a", "b"];

// f7.createState();
// f7.createState();
// f7.createState();
// f7.createState();
// f7.createState();

// f7.makeFinalState(f7.states[4]);


// f7.states[0].createTransition("a", f7.states[1]);

// f7.states[1].createTransition("b", f7.states[2]);

// f7.states[2].createTransition("a", f7.states[2]);
// f7.states[2].createTransition("b", f7.states[2]);
// f7.states[2].createTransition("b", f7.states[3]);

// f7.states[3].createTransition("a", f7.states[4]);


// f7.makeFinalState(f7.states[4]);

// f7.getType()

// f7.checkStr("baaba");   // FUCK NO
// f7.checkStr("aba");   // FUCK NO

// f7.checkStr("ababaaba"); // FUCK YEAH
// f7.checkStr("abba"); // FUCK YEAH



// let f7DFA = f7.getNFAtoDFA(); // 6 states when turned into DFA

// console.log("DFA STATES: " + f7DFA.states.length)
// f7DFA.getType();

// f7DFA.checkStr("baaba");   // FUCK NO
// f7DFA.checkStr("aba");   // FUCK NO


// f7DFA.checkStr("ababaaba"); // FUCK YEAH
// f7DFA.checkStr("abba"); // FUCK YEAH


// let f8 = new FA();

// f8.alphabet = ["a", "b"];

// f8.createState();
// f8.createState();

// f8.states[0].createTransition("a", f8.states[1]);

// f8.getType()

// f8.makeFinalState(f8.states[1])

// f8.checkStr("a")
// f8.checkStr("b")


// let f8DFA = f8.getNFAtoDFA();

// // console.log(f8DFA);
// f8DFA.checkStr("a")
// f8DFA.checkStr("b")

// Chapter 5 homework NFA To DFA 3

let f9 = new FA();
f9.alphabet = ["a", "b"];

for(let i = 0; i < 6; i++) f9.createState();

f9.makeFinalState(f9.states[3]);

// f9.states[0].createTransition("b", f9.states[1]);

f9.createTransition(0, 1, "b"); // new wrapper function

f9.createTransition(1, 2, "a"); 
f9.createTransition(1, 5, "b"); 
f9.createTransition(1, 2, ""); 

f9.createTransition(2, 1, "b"); 
f9.createTransition(2, 3, "b"); 

f9.createTransition(3, 4, "a"); 

f9.createTransition(4, 3, ""); 
f9.createTransition(4, 2, "b"); 
f9.createTransition(4, 5, "a"); 

f9.createTransition(5, 2, ""); 
f9.createTransition(5, 3, "a"); 


// console.log(f9);

// let f9DFA = f9.getNFAtoDFA();   // 8 states, 4 final states; like in the homework

// console.log(f9DFA)

// console.log(f9.type);

// DFA minimization TEST


// Chapter 5 Homework Minimize DFA 1
// let f10 = new FA();
// f10.alphabet = ["a", "b"];

// for(let i = 0; i < 5; i++) f10.createState();
// f10.makeFinalState(f10.states[1]);
// f10.makeFinalState(f10.states[3]);

// f10.createTransition(0, 1, "a");
// f10.createTransition(0, 1, "b");

// f10.createTransition(1, 2, "a");
// f10.createTransition(1, 2, "b");

// f10.createTransition(2, 3, "a");
// f10.createTransition(2, 3, "b");

// f10.createTransition(3, 2, "a");
// f10.createTransition(3, 2, "b");

// f10.createTransition(4, 3, "a");
// f10.createTransition(4, 2, "b");

// f10.getType();

// f10.checkStr("a");
// f10.checkStr("ab");
// f10.checkStr("aba");
// f10.checkStr("aaa")

// let f10Min = f10.getMinimizedDFA();
// f10Min.getType();

// f10Min.checkStr("a");
// f10Min.checkStr("ab");
// f10Min.checkStr("aba");
// f10Min.checkStr("aaa")


// // Chapter 5 Homework Minimize DFA 2
// let f11 = new FA();
// f11.alphabet = ["0", "1"]

// for(let i = 0; i < 6; i++) f11.createState();
// f11.makeFinalState(f11.states[2]);
// f11.makeFinalState(f11.states[3]);

// f11.createTransition(0, 1, "0");
// f11.createTransition(0, 2, "1");

// f11.createTransition(1, 0, "0");
// f11.createTransition(1, 3, "1");

// f11.createTransition(2, 4, "0");
// f11.createTransition(2, 5, "1");

// f11.createTransition(3, 4, "0");
// f11.createTransition(3, 5, "1");

// f11.createTransition(4, 4, "0");
// f11.createTransition(4, 5, "1");

// f11.createTransition(5, 5, "0");
// f11.createTransition(5, 5, "1");

// f11.getType();

// f11.checkStr("1");      // FUCK YEAH
// f11.checkStr("01");     // FUCK YEAH
// f11.checkStr("0001");   // FUCK YEAH
// f11.checkStr("011");    // FUCK NO
// f11.checkStr("010");    // FUCK NO


// let f11Min = f11.getMinimizedDFA();
// f11.getType()

// f11Min.checkStr("1");      // FUCK YEAH
// f11Min.checkStr("01");     // FUCK YEAH
// f11Min.checkStr("0001");   // FUCK YEAH
// f11Min.checkStr("011");    // FUCK NO
// f11Min.checkStr("010");    // FUCK NO

let f12 = new FA();
f12.alphabet = ['0', '1'];

for(let i = 0; i < 6; i++) f12.createState();

f12.makeFinalState(f12.states[3]);
f12.makeFinalState(f12.states[4]);


f12.createTransition(0, 1, '0');
f12.createTransition(0, 2, '1');

f12.createTransition(1, 0, '0');
f12.createTransition(1, 3, '1');

f12.createTransition(2, 4, '0');
f12.createTransition(2, 5, '1');

f12.createTransition(3, 4, '0');
f12.createTransition(3, 5, '1');
// f12.createTransition(3, 3, '1');


f12.createTransition(4, 4, '0');
f12.createTransition(4, 5, '1');

f12.createTransition(5, 5, '0');
f12.createTransition(5, 5, '1');

// f12.getType();


// console.log(f12.states[2]);
// console.log(f12.states[3]);
// console.log(f12.states[5]);
// console.log(f12.states[2]);
// console.log(f12.states[3]);
// console.log(f12.states[5]);

// console.log(f12.states[5]);
// console.log(f12.states[4]);
// f12.deleteAllTransitionFrom(5);
// console.log(f12.states[5]);
// console.log(f12.states[4]);


f12.checkStr("01") // accept
f12.checkStr("0100") // accept


f12.checkStr("01101") // reject
f12.checkStr("01001") // reject



let f12Min = f12.getMinimizedDFA();
console.log(f12Min.states.length);

f12Min.checkStr("01") // accept
f12Min.checkStr("0100") // accept

f12Min.checkStr("01101") // reject
f12Min.checkStr("01001") // reject

f12Min.states.forEach(state => console.log(state))

