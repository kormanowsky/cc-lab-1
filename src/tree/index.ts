import { INode, INodeType, ITreeBuilder } from "../interface";

export class TreeBuilder implements ITreeBuilder {
    constructor() {

    }

    async buildTree(regex: string): Promise<INode> {
        return {type: INodeType.NODE_CONCAT};
    }
}
