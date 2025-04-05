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

        const stack: string[] = [];

        let curNodeId: number = -1;

        for(let ch of regex) {
            // prio = MAX 
            if (ch == '(') {
                stack.push(ch);
            } else if (ch == ')') {
                while(stack[stack.length - 1] != '(') {
                    const ch = stack.pop();
                    let nodeType: INodeType | undefined = undefined;
                    switch(ch) {
                        case '+':
                            nodeType = INodeType.NODE_ITER;
                            break;
                        case '*':
                            nodeType = INodeType.NODE_ZITER;
                            break;
                        case '@': 
                            nodeType = INodeType.NODE_ALT;
                            break;
                        case '(':
                            break;
                        default: 
                            throw new Error('unknown in stack: ' + ch);
                    }

                    if (nodeType) {
                        tree.nodes.push({
                            id: curNodeId++,
                            type: nodeType
                        });
                    }
                }
            }
            // prio = 2
            else if (ch == '+' || ch == '*') {
                while (stack.length > 0 && ['+', '*'].includes(stack[stack.length - 1])) {
                    const top = stack.pop()!;

                    tree.nodes.push({
                        id: curNodeId++,
                        type: top == '+' ? INodeType.NODE_ITER : INodeType.NODE_ZITER
                    });
                }

                stack.push(ch);
            }
            // prio = 0
            else if (ch == '|') {
                while (stack.length > 0) {
                    const top = stack.pop();
                    let nodeType: INodeType;

                    switch(top) {
                        case '+':
                            nodeType = INodeType.NODE_ITER;
                            break;
                        case '*':
                            nodeType = INodeType.NODE_ZITER;
                            break;
                        case '@': 
                            nodeType = INodeType.NODE_ALT;
                            break;
                        default: 
                            throw new Error('unknown in stack: ' + ch);
                    }

                    tree.nodes.push({
                        id: curNodeId++,
                        type: nodeType
                    });
                }

                stack.push(ch);
            // prio = 1
            } else {
                tree.nodes.push({
                    id: ++curNodeId,
                    type: INodeType.NODE_CHAR,
                    content: ch
                });

                if (tree.nodes.length > 0) {
                    while(
                        stack.length > 0 && 
                        ['@', '+', '*'].includes(stack[stack.length - 1].type)
                    ) {
                        const top = stack.pop();
                        let nodeType: INodeType;

                        switch(top) {
                            case '+':
                                nodeType = INodeType.NODE_ITER;
                                break;
                            case '*':
                                nodeType = INodeType.NODE_ZITER;
                                break;
                            case '@': 
                                nodeType = INodeType.NODE_ALT;
                                break;
                            default: 
                                throw new Error('unknown in stack: ' + ch);
                        }

                        tree.nodes.push({
                            id: curNodeId++,
                            type: nodeType
                        });
                    }

                    stack.push({
                        id: ++curNodeId,
                        type: INodeType.NODE_CONCAT,
                    });
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
