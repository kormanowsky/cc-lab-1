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

        let curNodeId = -1;
        // let letters = 0;

        // for(let ch of regex) {
        //     // prio = MAX 
        //     if (ch == '(') {
        //         stack.push({id: ++curNodeId, type: INodeType.NODE_OPENING_BRACE});
        //     } else if (ch == ')') {
        //         while(
        //             stack.length > 0 && 
        //             stack[stack.length - 1].type != INodeType.NODE_OPENING_BRACE
        //         ) {
        //             const top = stack.pop()!;
        //             tree.nodes.push(top);
        //         }
        //     }
        //     // prio = 2
        //     else if (ch == '+' || ch == '*') {
        //         const top = stack.pop()!;
        //         const iterNode = {id: ++curNodeId, type: ch == '+' ? INodeType.NODE_ITER : INodeType.NODE_ZITER};
        //         stack.push(iterNode);

        //         tree.parents[iterNode.id] = tree.parents[top.id];
        //         tree.parents[top.id] = [iterNode.id, false];

        //         if (letters >= 2) {
        //             const concatNode = {id: ++curNodeId, type: INodeType.NODE_CONCAT};

        //             while(
        //                 stack.length > 0 && 
        //                 [
        //                     INodeType.NODE_CONCAT,
        //                     INodeType.NODE_ITER,
        //                     INodeType.NODE_ZITER,
        //                     INodeType.NODE_CHAR,
        //                 ].includes(stack[stack.length - 1].type)
        //             ) {
        //                 const top = stack.pop()!;
        //                 tree.nodes.push(top);
        //                 tree.parents[top.id] = [concatNode.id, false];
        //             }

        //             stack.push(concatNode);
        //         }
        //     }
        //     // prio = 0
        //     else if (ch == '|') {
        //         const altNode = {id: ++curNodeId, type: INodeType.NODE_ALT};

        //         while (stack.length > 0) {
        //             const top = stack.pop()!;
        //             tree.nodes.push(top);
        //             tree.parents[top.id] = [altNode.id, false];
        //         }

        //         stack.push(altNode);
        //         letters = 0;
        //     // prio = 1
        //     } else {
        //         const node = {id: ++curNodeId, type: INodeType.NODE_CHAR, content: ch};
        //         tree.nodes.push(node);
        //         stack.push(node);
        //         letters++;

        //         if (letters >= 2) {
        //             const concatNode = {id: ++curNodeId, type: INodeType.NODE_CONCAT};

        //             while(
        //                 stack.length > 0 && 
        //                 [
        //                     INodeType.NODE_CONCAT,
        //                     INodeType.NODE_ITER,
        //                     INodeType.NODE_ZITER,
        //                     INodeType.NODE_CHAR,
        //                 ].includes(stack[stack.length - 1].type)
        //             ) {
        //                 const top = stack.pop()!;
        //                 tree.nodes.push(top);
        //                 tree.parents[top.id] = [concatNode.id, false];
        //             }

        //             stack.push(concatNode);
        //         }
        //     }
        // }

        // while (stack.length > 0) {
        //     const top = stack.pop()!;
        //     tree.nodes.push(top);

        //     if (stack.length > 0) {
        //         tree.parents[top.id] = [stack[stack.length - 1].id, false];
        //     }
        // }

        let prevCh = '';
        let ch = '';
        let nextCh = regex[0];

        for(let i = 0; i < regex.length; ++i) {
            prevCh = ch;
            ch = nextCh;
            nextCh = regex[i + 1];

            if (ch == '(') {
                stack.push({id: ++curNodeId, type: INodeType.NODE_OPENING_BRACE});
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

                if (
                    prevTop && 
                    prevTop.type !== INodeType.NODE_OPENING_BRACE && 
                    prevTop.type !== INodeType.NODE_ALT
                ) {
                    const concatNode = {id: ++curNodeId, type: INodeType.NODE_CONCAT};

                    stack.push(concatNode);
                    tree.nodes.push(concatNode);
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

                tree.nodes.push(node);
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
                tree.nodes.push(node);
            } else {
                const node = {id: ++curNodeId, type: INodeType.NODE_CHAR, content: ch};
                stack.push(node);
                tree.nodes.push(node);

                if ((prevCh == ')' || !'(|'.includes(prevCh)) && !'+*'.includes(nextCh)) {
                    const top1 = stack.pop()!;
                    const top2 = stack.pop()!;
                    const node = {id: ++curNodeId, type: INodeType.NODE_CONCAT};

                    stack.push(node);
                    tree.nodes.push(node);

                    tree.parents[top1.id] = [node.id, true];
                    tree.parents[top2.id] = [node.id, false];
                }
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
