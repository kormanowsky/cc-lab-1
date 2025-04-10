import fsP from "fs/promises";

import { INodeType, ITree, IPrinter, IFSM } from "../interface";

export class DotFilePrinter implements IPrinter {
    constructor(filePath: string) {
        this.filePromise = fsP.open(filePath, "w");
    }

    async printTree(tree: ITree): Promise<void> {
        const file = await this.filePromise;

        await file.write("digraph G {\n");

        for(const node of Object.values(tree.nodes)) {
            const nodeLabels = {
                [INodeType.NODE_ALT]: "|",
                [INodeType.NODE_CONCAT]: "@",
                [INodeType.NODE_ITER]: "+",
                [INodeType.NODE_ZITER]: "*",
                [INodeType.NODE_CHAR]: undefined
            };

            const nodeLabel = nodeLabels[node.type] ?? node.content ?? `node_${node.id}`;

            await file.write(`node_${node.id} [shape=circle style=filled label="${nodeLabel}"];\n`);
        }

        for(const entry of Object.entries(tree.parents)) {
            const [childId, parent] = entry;

            if (parent) {
                const [parentId, isRight] = parent;

                await file.write(`node_${parentId} -> node_${childId} [color=${isRight?'red': 'blue'}];\n`);
            }
        }

        await file.write("}\n");

        await file.close();
    }

    async printFSM(fsm: IFSM): Promise<void> {
        const file = await this.filePromise;

        await file.write("digraph G {\n");

        await file.write('state_fake [label="",shape=none,height=.0,width=.0];\n');

        for(const state of fsm.states) {
            const shape = fsm.finalStates.includes(state.id) ? "doublecircle" : "circle";

            await file.write(`state_${state.id} [shape=${shape} style=filled label="${[...state.positions]}"];\n`);
        }

        for(const [sourceStateId, transitions] of Object.entries(fsm.transitionFunction)) {
            for(const [sym, targetStateId] of Object.entries(transitions)) {
                await file.write(`state_${sourceStateId} -> state_${targetStateId} [label="${sym}"];\n`)
            }
        }

        await file.write(`state_fake -> state_${fsm.initialState};\n`);

        await file.write("}\n");

        await file.close();
    }

    private filePromise: Promise<fsP.FileHandle>;
}
