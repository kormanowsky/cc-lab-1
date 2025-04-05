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

        const stack: INode[] = [];

        let curNodeId: number = -1;

        for(let ch of regex) {
            // prio = MAX 
            if (ch == '(') {
                stack.push({id: curNodeId++, type: INodeType.NODE_OPENING_BRACE});
            } else if (ch == ')') {
                while(stack[stack.length - 1].type != INodeType.NODE_OPENING_BRACE) {
                    const top = stack.pop()!;
                    tree.nodes.push(top);
                }
            }
            // prio = 2
            else if (ch == '+' || ch == '*') {
                while (
                    stack.length > 0 && 
                    [INodeType.NODE_ITER, INodeType.NODE_ZITER].includes(stack[stack.length - 1].type)
                ) {
                    const top = stack.pop()!;
                    tree.nodes.push(top);
                }

                stack.push({id: ++curNodeId, type: ch == '+' ? INodeType.NODE_ITER : INodeType.NODE_ZITER});
            }
            // prio = 0
            else if (ch == '|') {
                while (stack.length > 0) {
                    const top = stack.pop()!;
                    tree.nodes.push(top);
                }

                stack.push({id: curNodeId++, type: INodeType.NODE_ALT});
            // prio = 1
            } else {
                const node = {id: curNodeId++, type: INodeType.NODE_CHAR, content: ch};

                // stack.push(node);

                tree.nodes.push(node);

                if (tree.nodes.length > 0) {
                    while(
                        stack.length > 0 && 
                        [
                            INodeType.NODE_CONCAT,
                            INodeType.NODE_ITER,
                            INodeType.NODE_ZITER,
                        ].includes(stack[stack.length - 1].type)
                    ) {
                        const top = stack.pop()!;
                        tree.nodes.push(top);
                    }

                    stack.push({id: ++curNodeId, type: INodeType.NODE_CONCAT});
                }
            }
        }

        while (stack.length > 0) {
            const top = stack.pop()!;
            tree.nodes.push(top);
        }

        return tree;
    }
}
