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
};

export interface INode {
    id: number;
    type: INodeType;
    content?: string;
};

export interface ITree {
    nodes: INode[];
    parents: Record<number, [number, boolean] | undefined>;
};

export interface ITreeBuilder {
    buildTree(regex: string): Promise<ITree>;
};

export interface ITreePrinter {
    printTree(tree: ITree): Promise<void>;
}