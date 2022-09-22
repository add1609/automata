/*
  Thompson NFA Construction and Search.
*/

/*
  A state in Thompson's NFA can either have
   - a single symbol transition to a state
    or
   - up to two epsilon transitions to another states
  but not both.
*/
import { toParseTree, TreeNode } from "./parser";

type FA_State = {
    isEnd: boolean,
    transition: { [index: string]: FA_State },
    epsilonTransitions: FA_State[]
}

type NFA = {
    start: FA_State,
    end: FA_State
}

function createState(isEnd: boolean) {
    return {
        isEnd: isEnd,
        transition: {},
        epsilonTransitions: [],
    };
}

function addEpsilonTransition(from: FA_State, to: FA_State) {
    from.epsilonTransitions.push(to);
}

/*
  Thompson's NFA state can have only one transition to another state for a given symbol.
*/
function addTransition(from: FA_State, to: FA_State, symbol: string) {
    from.transition[symbol] = to;
}

/*
  Construct an NFA that recognizes only the empty string.
*/
function fromEpsilon() {
    const start = createState(false);
    const end = createState(true);
    addEpsilonTransition(start, end);

    return {start, end};
}

/*
   Construct an NFA that recognizes only a single character string.
*/
function fromSymbol(symbol: string) {
    const start = createState(false);
    const end = createState(true);
    addTransition(start, end, symbol);

    return {start, end};
}

/*
   Concatenates two NFAs.
*/
function concat(first: NFA, second: NFA) {
    addEpsilonTransition(first.end, second.start);
    first.end.isEnd = false;

    return {start: first.start, end: second.end};
}

/*
   Unions two NFAs.
*/
function union(first: NFA, second: NFA) {
    const start = createState(false);
    addEpsilonTransition(start, first.start);
    addEpsilonTransition(start, second.start);

    const end = createState(true);

    addEpsilonTransition(first.end, end);
    first.end.isEnd = false;
    addEpsilonTransition(second.end, end);
    second.end.isEnd = false;

    return {start, end};
}


/*
   Apply Closure (Kleene's Star) on an NFA.
*/
function closure(nfa: NFA) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return {start, end};
}

/*
    Zero-or-one of an NFA.
*/

function zeroOrOne(nfa: NFA) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    nfa.end.isEnd = false;

    return {start, end};
}

/*
    One on more of an NFA.
*/

function oneOrMore(nfa: NFA) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, nfa.start);
    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return {start, end};
}

/*
  Converts a postfix regular expression into a Thompson NFA.
*/
function toNFA(postfixExp: string) {
    if(postfixExp === "") {
        return fromEpsilon();
    }

    const stack: { start: any; end: any }[] = [];

    for(const token of postfixExp) {
        if(token === "*") {
            const s0 = stack.pop();
            if(typeof s0 !== "undefined") {
                stack.push(closure(s0));
            }
        } else if(token === "?") {
            const s0 = stack.pop();
            if(typeof s0 !== "undefined") {
                stack.push(zeroOrOne(s0));
            }
        } else if(token === "+") {
            const s0 = stack.pop();
            if(typeof s0 !== "undefined") {
                stack.push(oneOrMore(s0));
            }
        } else if(token === "|") {
            const right = stack.pop();
            const left = stack.pop();
            if(typeof right !== "undefined" && typeof left !== "undefined") {
                stack.push(union(left, right));
            }
        } else if(token === ".") {
            const right = stack.pop();
            const left = stack.pop();
            if(typeof right !== "undefined" && typeof left !== "undefined") {
                stack.push(concat(left, right));
            }
        } else {
            stack.push(fromSymbol(token));
        }
    }

    return stack.pop();
}

/*
  Regex to NFA construction using a parse tree.
*/
function toNFAfromParseTree(root: TreeNode): NFA {
    if(typeof root.children !== "undefined") {

        if(root.label === "Expr") {
            const term = toNFAfromParseTree(root.children[0]);
            if(root.children.length === 3) // Expr -> Term '|' Expr
            {
                return union(term, toNFAfromParseTree(root.children[2]));
            }
            return term; // Expr -> Term
        }

        if(root.label === "Term") {
            const factor = toNFAfromParseTree(root.children[0]);
            if(root.children.length === 2) // Term -> Factor Term
            {
                return concat(factor, toNFAfromParseTree(root.children[1]));
            }
            return factor; // Term -> Factor
        }

        if(root.label === "Factor") {
            const atom = toNFAfromParseTree(root.children[0]);
            if(root.children.length === 2) { // Factor -> Atom MetaChar
                const meta = root.children[1].label;
                if(meta === "*") {
                    return closure(atom);
                }
                if(meta === "+") {
                    return oneOrMore(atom);
                }
                if(meta === "?") {
                    return zeroOrOne(atom);
                }
            }
            return atom; // Factor -> Atom
        }

        if(root.label === "Atom") {
            if(root.children.length === 3) // Atom -> '(' Expr ')'
            {
                return toNFAfromParseTree(root.children[1]);
            }
            return toNFAfromParseTree(root.children[0]); // Atom -> Char
        }

        if(root.label === "Char") {
            if(root.children.length === 2) // Char -> '\' AnyChar
            {
                return fromSymbol(root.children[1].label);
            }
            return fromSymbol(root.children[0].label); // Char -> AnyCharExceptMeta
        }
    }
    throw new Error("Unrecognized node label " + root.label);
}

function toNFAFromInfixExp(infixExp: string): NFA {
    if(infixExp === "") {
        return fromEpsilon();
    }

    return toNFAfromParseTree(toParseTree(infixExp));
}

/*
   Follows through the epsilon transitions of a state until reaching
   a state with a symbol transition which gets added to the set of next states.
*/
function addNextState(state: FA_State, nextStates: FA_State[], visited: FA_State[]): void {
    if(state.epsilonTransitions.length) {
        for(const st of state.epsilonTransitions) {
            if(!visited.find(vs => vs === st)) {
                visited.push(st);
                addNextState(st, nextStates, visited);
            }
        }
    } else {
        nextStates.push(state);
    }
}

/*
  Process a string through an NFA. For each input symbol it transitions into in multiple states at the same time.
  The string is matched if after reading the last symbol, is has transitioned into at least one end state.
  For an NFA with N states in can be at at most N states at a time. This algorighm finds a match by processing the input word once.
*/
function search(nfa: NFA, word: string): boolean {
    let currentStates: FA_State[] = [];
    /* The initial set of current states is either the start state or
       the set of states reachable by epsilon transitions from the start state */
    addNextState(nfa.start, currentStates, []);

    for(const symbol of word) {
        const nextStates: FA_State[] = [];

        for(const state of currentStates) {
            const nextState = state.transition[symbol];
            if(nextState) {
                addNextState(nextState, nextStates, []);
            }
        }

        currentStates = nextStates;
    }

    return typeof currentStates.find(s => s.isEnd) !== "undefined";

}

function recognize(nfa: NFA, word: string): boolean {
    return search(nfa, word);
}

export {
    toNFA,
    toNFAFromInfixExp,
    recognize,
};
