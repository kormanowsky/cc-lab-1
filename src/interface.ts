import { exitCode } from "process";

export interface IRegexReader {
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
}

export interface ITreeBuilder {
    buildTree(regex: string): Promise<ITree>;
};

export interface ITreePrinter {
    printTree(tree: ITree): Promise<void>;
}

export interface ITreeFuncComputer {
    computeTreeFuncs(tree: ITree): Promise<ITreeFuncs>;
}
