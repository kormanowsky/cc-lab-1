import { INodeType, ITree, ITreeFuncComputer, ITreeFuncs } from "../interface";

export class TreeFuncComputer implements ITreeFuncComputer {
    async computeTreeFuncs(tree: ITree): Promise<ITreeFuncs> {
        // TODO: real functions

        const nullable: ITreeFuncs['nullable'] = {};

        for(const [id, node] of Object.entries(tree.nodes)) {
            nullable[id] = nullable[id] ?? false;

            if (
                node.type === INodeType.NODE_CHAR && node.content === 'eps' || 
                node.type === INodeType.NODE_ZITER
            ) {
                nullable[id] = true;
            }

            const parentNode = tree.nodes[tree.parents[id]?.[0]];

            if (parentNode) {
                const parentNodeNullable = nullable[parentNode.id];

                if (parentNode.type === INodeType.NODE_ALT) {
                    nullable[parentNode.id] = (parentNodeNullable ?? false) || nullable[id];
                } else if (parentNode.type === INodeType.NODE_ITER) {
                    nullable[parentNode.id] = nullable[id];
                } else if (parentNode.type === INodeType.NODE_CONCAT) {
                    nullable[parentNode.id] = (parentNodeNullable ?? true) && nullable[id];
                }
            }
        }

        const firstpos: ITreeFuncs['firstpos'] = {};

        for(const [id, node] of Object.entries(tree.nodes)) {
            firstpos[id] = new Set<number>();

            if (node.type === INodeType.NODE_CHAR) {
                firstpos[id].add(id);
            }

            const parentNode = tree.nodes[tree.parents[id]?.[0]];

            if (parentNode) {
                const parentNodeFirstpos = firstpos[parentNode.id] ?? new Set<number>();

                if (
                    parentNode.type === INodeType.NODE_ALT ||
                    parentNode.type === INodeType.NODE_ITER || 
                    parentNode.type === INodeType.NODE_ZITER
                ) {
                    firstpos[parentNode.id] = new Set<number>([...parentNodeFirstpos, ...firstpos[id]]);
                } else if (tree.parents[id]![1]) {
                    // TODO: fix
                    firstpos[parentNode.id] = new Set<number>([...firstpos[id]]);
                }
            }
        }

        return {
            nullable,
            firstpos,
            lastpos: {},
            followpos: {}
        }
    }
}
