import { INode, INodeType, ITree, ITreeBuilder } from "../interface";

export class TreeBuilder implements ITreeBuilder {
    constructor() {

    }

    async buildTree(regex: string): Promise<ITree> {
        regex = regex.trim();

        const tree: ITree = {
            nodes: {},
            parents: {}
        };

        const stack: INode[] = [];

        let curNodeId = -1;
        let prevCh = '';
        let ch = '';
        let nextCh = regex[0];

        for(let i = 0; i < regex.length; ++i) {
            prevCh = ch;
            ch = nextCh;
            nextCh = regex[i + 1];

            if (ch == '(') {
                stack.push({id: -1, type: INodeType.NODE_OPENING_BRACE});
            } else if (ch == ')') {
                let top: INode | undefined = undefined;
                let prevTop: INode | undefined = undefined;

                while(stack.length > 0 && stack[stack.length - 1].type !== INodeType.NODE_OPENING_BRACE) {
                    top = stack.pop()!;

                    if (prevTop) {
                        tree.parents[prevTop.id] = [top.id, true];
                    }

                    prevTop = top;
                }

                stack.pop();

                if (top) {
                    stack.push(top);
                }
            } else if (ch == '+' || ch == '*') {
                const top = stack.pop()!;
                const prevTop = stack.pop();

                const node = {
                    id: ++curNodeId, 
                    type: ch == '+' ? INodeType.NODE_ITER : INodeType.NODE_ZITER
                };

                tree.nodes[node.id] = node;

                if (
                    prevTop && 
                    prevTop.type !== INodeType.NODE_OPENING_BRACE && 
                    prevTop.type !== INodeType.NODE_ALT
                ) {
                    const concatNode = {id: ++curNodeId, type: INodeType.NODE_CONCAT};

                    stack.push(concatNode);
                    tree.nodes[concatNode.id] = concatNode;

                    tree.parents[concatNode.id] = tree.parents[top.id];
                    tree.parents[node.id] = [concatNode.id, true];
                    tree.parents[prevTop.id] = [concatNode.id, false];
                } else {
                    if (prevTop) {
                        stack.push(prevTop);
                    }
                    stack.push(node);
                    tree.parents[node.id] = tree.parents[top.id];
                }

                tree.parents[top.id] = [node.id, true];
            } else if (ch == '|') {
                const node = {
                    id: ++curNodeId,
                    type: INodeType.NODE_ALT
                };

                while(
                    stack.length > 0 && 
                    stack[stack.length - 1].type !== INodeType.NODE_OPENING_BRACE && 
                    stack[stack.length - 1].type !== INodeType.NODE_ALT
                ) {
                    const top = stack.pop()!;
                    
                    tree.parents[top.id] = [node.id, false];
                }

                stack.push(node);
                tree.nodes[node.id] = node;
            } else {
                const node = {id: -1, type: INodeType.NODE_CHAR, content: ch};

                if ((prevCh == ')' || !'(|'.includes(prevCh)) && !'+*'.includes(nextCh)) {
                    const top = stack.pop()!;
                    const concatNode = {id: ++curNodeId, type: INodeType.NODE_CONCAT};

                    node.id = ++curNodeId;

                    stack.push(concatNode);
                    tree.nodes[concatNode.id] = concatNode;

                    tree.parents[top.id] = [concatNode.id, false];
                    tree.parents[node.id] = [concatNode.id, true];
                } else {
                    node.id = ++curNodeId;
                    stack.push(node);
                }

                tree.nodes[node.id] = node;
            }
        }

        let prevTop: INode | undefined = undefined;

        while(stack.length > 0) {
            const top = stack.pop()!;

            if (prevTop) {
                tree.parents[prevTop.id] = [top.id, true];
            }

            prevTop = top;
        }

        return tree;
    }
}
