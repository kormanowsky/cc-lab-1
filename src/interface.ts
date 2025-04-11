export interface IReader {
    readString(): Promise<string>;
    readRegex(): Promise<string>;
};

export enum INodeType {
    NODE_CHAR,
    NODE_CONCAT,
    NODE_ALT,
    NODE_ITER,
    NODE_ZITER,
    NODE_OPENING_BRACE,
    NODE_CLOSING_BRACE
};

export interface INode {
    id: number;
    type: INodeType;
    content?: string;
};

export interface ITree {
    nodes: Record<number, INode>;
    parents: Record<number, [number, boolean] | undefined>;
};

export interface ITreeFuncs {
    nullable: Record<number, boolean>;
    firstpos: Record<number, Set<number>>;
    lastpos: Record<number, Set<number>>;
    followpos: Record<number, Set<number>>;
    root: number;
}

export interface IFSMState {
    id: number;
    positions: Set<number>;
}

export interface IFSM {
    states: Array<IFSMState>;
    transitionFunction: Record<number, Record<string, number>>;
    initialState: number;
    finalStates: number[];
    alphabet: string;
}

export interface IFSMSimResult {
    accepted: boolean;
    error?: Error;
    steps: Array<{id: number; curStateId: number; char: string; isInitial: boolean; isFinal: boolean}>;
}

export interface ITreeBuilder {
    buildTree(regex: string): Promise<ITree>;
};

export interface IPrinter {
    printTree(tree: ITree): Promise<void>;
    printFSM(fsm: IFSM): Promise<void>;
}

export interface ITreeFuncComputer {
    computeTreeFuncs(tree: ITree): Promise<ITreeFuncs>;
}

export interface IFiniteStateMachineBuilder {
    buildFSM(tree: ITree, funcs: ITreeFuncs, alphabet: string): Promise<IFSM>;
    buildMinifiedFSM(fsm: IFSM): Promise<IFSM>;
}

export interface IFiniteStateMachineSimulator {
    simulateFSM(fsm: IFSM, input: string): Promise<IFSMSimResult>;
}