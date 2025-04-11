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
        let ch = '';
        let nextCh = regex[0];

        for(let i = 0; i < regex.length; ++i) {
            ch = nextCh;

            if (i === regex.length - 1 || '(|@'.includes(ch) || '|+*)'.includes(regex[i + 1])) {
                nextCh = regex[i + 1];
            } else {
                i--;
                nextCh = '@';
            }

            if (ch === '(') {
                stack.push({id: -1, type: INodeType.NODE_OPENING_BRACE});
            } else if (ch === ')') {
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

                prevTop = stack[stack.length - 1];

                if (top) {
                    if (prevTop) {
                        tree.parents[top.id] = [prevTop.id, true];
                    }

                    stack.push({id: top.id, type: INodeType.NODE_CLOSING_BRACE});
                }
            } else if (ch === '+' || ch === '*') {
                const top = stack.pop()!;
                const prevTop = stack.pop();

                const node = {
                    id: ++curNodeId, 
                    type: ch == '+' ? INodeType.NODE_ITER : INodeType.NODE_ZITER
                };

                tree.nodes[node.id] = node;

                if (prevTop) {
                    stack.push(prevTop);
                }
                stack.push(node);
                if (tree.parents[top.id]) {
                    tree.parents[node.id] = tree.parents[top.id];
                }

                tree.parents[top.id] = [node.id, false];
            } else if (ch === '|') {
                const node = {
                    id: ++curNodeId,
                    type: INodeType.NODE_ALT
                };
                tree.nodes[node.id] = node;

                let top: INode | undefined = undefined;
                let prevTop: INode | undefined = undefined;

                while(stack.length > 0 && stack[stack.length - 1].type !== INodeType.NODE_OPENING_BRACE) {
                    top = stack.pop()!;

                    if (prevTop) {
                        tree.parents[prevTop.id] = [top.id, true];
                    }

                    prevTop = top;
                }

                if (!top) {
                    throw new Error('Incorrect regex');
                }

                tree.parents[top.id] = [node.id, false];

                stack.push(node);
            } else if (ch === '@') {
                const node = {
                    id: ++curNodeId,
                    type: INodeType.NODE_CONCAT
                };
                tree.nodes[node.id] = node;

                const top = stack.pop();

                if (!top) {
                    throw new Error('Invalid regex, | without left-hand side');
                }

                tree.parents[top.id] = [node.id, false];

                stack.push(node);
            } else {
                const node = {id: ++curNodeId, type: INodeType.NODE_CHAR, content: ch === 'э' ? 'eps' : ch};
                tree.nodes[node.id] = node;
                
                stack.push(node);
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
