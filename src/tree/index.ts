import { INode, INodeType, ITreeBuilder } from "../interface";

export class TreeBuilder implements ITreeBuilder {
    constructor() {

    }

    async buildTree(regex: string): Promise<INode> {
        regex = regex.trim();

        let node: INode | undefined = undefined;

        for(let ch of regex) {
            node = {
                type: INodeType.NODE_CONCAT,
                left: node,
                right: {type: INodeType.NODE_CHAR, content: ch}
            };
        }

        return node!;
    }
}
