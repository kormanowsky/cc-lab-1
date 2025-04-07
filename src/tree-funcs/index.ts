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

        return {
            nullable,
            firstpos: {},
            lastpos: {},
            followpos: {}
        }
    }
}
