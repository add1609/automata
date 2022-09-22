import { recognize, toNFAFromInfixExp } from "./nfa";

function createMatcher(exp: string) {
    // Generates an NFA by constructing a parse tree
    // No explicit concatenation operator required
    const nfa = toNFAFromInfixExp(exp);

    return (word: string) => recognize(nfa, word);
}

export {
    createMatcher,
};
