import { INode, INodeType, ITree, ITreeBuilder } from "../interface";

export class TreeBuilder implements ITreeBuilder {
    constructor() {

    }

    async buildTree(regex: string): Promise<ITree> {
        regex = regex.trim();

        const tree: ITree = {
            nodes: [],
            parents: {}
        };

        let curNodeId: number = -1;

        for(let ch of regex) {
            if (ch == '|') {
                tree.nodes.push({
                    id: ++curNodeId,
                    type: INodeType.NODE_ALT
                });
                
                tree.parents[curNodeId - 1] = [curNodeId, false];
            } else {
                tree.nodes.push({
                    id: ++curNodeId,
                    type: INodeType.NODE_CHAR,
                    content: ch
                });

                if (curNodeId > 0) {
                    tree.nodes.push({
                        id: ++curNodeId,
                        type: INodeType.NODE_CONCAT,
                    });

                    tree.parents[curNodeId - 1] = [curNodeId, true];
                    tree.parents[curNodeId - 2] = [curNodeId, false];
                }
            }
        }

        return tree;
    }
}
