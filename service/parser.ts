/*
    Recursive descent parser for regular expressions. Implements the following grammar:
    Expr -> Term | Term '|' Expr
    Term -> Factor | Factor Term
    Factor -> Atom | Atom MetaChar
    Atom -> Char | '(' Expr ')'
    Char -> AnyCharExceptMeta | '\' AnyChar
    MetaChar -> '?' | '*' | '+'
*/

type TreeNode = {
    label: string,
    children?: TreeNode[]
}

let pattern = "";
let pos = 0;

const peek = () => pattern[pos];
const hasMoreChars = () => pos < pattern.length;
const isMetaChar = (ch: string) => ch === "*" || ch === "+" || ch === "?";

function match(ch: string) {
    if(peek() !== ch) {
        throw new Error(`Unexpected symbol ${ch}`);
    }
    pos++;
}

function next(): string {
    let ch = peek();
    match(ch);

    return ch;
}

function expr(): TreeNode {
    const trm = term();

    if(hasMoreChars() && peek() === "|") {
        match("|");
        const exp = expr();
        return {label: "Expr", children: [trm, {label: "|"}, exp]};
    }

    return {label: "Expr", children: [trm]};
}

function term(): TreeNode {
    const factr = factor();

    if(hasMoreChars() && peek() !== ")" && peek() !== "|") {
        const trm = term();
        return {label: "Term", children: [factr, trm]};
    }

    return {label: "Term", children: [factr]};
}

function factor(): TreeNode {
    const atm = atom();

    if(hasMoreChars() && isMetaChar(peek())) {
        const meta = next();
        return {label: "Factor", children: [atm, {label: meta}]};
    }

    return {label: "Factor", children: [atm]};
}

function atom(): TreeNode {
    if(peek() === "(") {
        match("(");
        const exp = expr();
        match(")");
        return {label: "Atom", children: [{label: "("}, exp, {label: ")"}]};
    }

    const ch = char();
    return {label: "Atom", children: [ch]};
}

function char(): TreeNode {
    if(isMetaChar(peek())) {
        throw new Error(`Unexpected meta char ${peek()}`);
    }

    if(peek() === "\\") {
        match("\\");
        return {label: "Char", children: [{label: "\\"}, {label: next()}]};
    }

    return {label: "Char", children: [{label: next()}]};
}

function toParseTree(regex: string) {
    pattern = regex;
    pos = 0;

    return expr();
}

export type { TreeNode };
export { toParseTree };

