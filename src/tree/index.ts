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

        for(const ch of regex) {
            console.log('got', ch);

            if (ch == '(') {
                stack.push({id: ++curNodeId, type: INodeType.NODE_OPENING_BRACE});

                console.log(stack);
            } else if (ch == ')') {
                let top: INode | undefined = undefined;

                while(stack.length > 0 && stack[stack.length - 1].type !== INodeType.NODE_OPENING_BRACE) {
                    top = stack.pop()!;

                    console.log(stack);
                }

                stack.pop();

                if (top) {
                    stack.push(top);
                }

                console.log(stack);

            } else if (ch == '+' || ch == '*') {
                const top = stack.pop();
                stack.push({
                    id: ++curNodeId, 
                    type: ch == '+' ? INodeType.NODE_ITER : INodeType.NODE_ZITER
                });
                console.log(stack);
            } else if (ch == '|') {
                while(stack.length > 0 && stack[stack.length - 1].type !== INodeType.NODE_OPENING_BRACE) {
                    const top1 = stack.pop();

                    console.log(stack);
                }

                stack.push({
                    id: ++curNodeId,
                    type: INodeType.NODE_ALT
                });

                console.log(stack);
            } else {
                stack.push({id: ++curNodeId, type: INodeType.NODE_CHAR, content: ch});
                console.log(stack);

                if (prevCh == ')' || !'(|+*'.includes(prevCh)) {
                    const top1 = stack.pop();
                    const top2 = stack.pop();

                    stack.push({id: ++curNodeId, type: INodeType.NODE_CONCAT});

                    console.log(stack);
                }
            }

            prevCh = ch;
        }

        while(stack.length > 0) {
            const top = stack.pop();
            console.log(stack);
        }

        return tree;
    }
}
