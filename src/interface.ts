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
    type: INodeType;
    left?: INode;
    right?: INode;
    content?: string;
};

export interface ITreeBuilder {
    buildTree(regex: string): Promise<INode>;
};
