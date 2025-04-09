import { INodeType, ITree, ITreeFuncComputer, ITreeFuncs } from "../interface";

export class TreeFuncComputer implements ITreeFuncComputer {
    async computeTreeFuncs(tree: ITree): Promise<ITreeFuncs> {
        const nullable: ITreeFuncs['nullable'] = {};
        const firstpos: ITreeFuncs['firstpos'] = {};
        const lastpos: ITreeFuncs['lastpos'] = {};
        const followpos: ITreeFuncs['followpos'] = {};

        const orderedNodeIds: number[] = [];
        const children: Record<number, Record<'l'|'r', number|undefined>> = {};

        for(const id of Object.keys(tree.nodes)) {
            if (children[id] == null) {
                children[id] = {l: undefined, r: undefined};
            }

            if (tree.parents[id] == null) {
                orderedNodeIds.push(<number><unknown>id);
            } else {
                const [parentId, isRight] = tree.parents[id];
                const parentIndex = orderedNodeIds.indexOf(parentId.toString());
                if (parentIndex === -1) {
                    orderedNodeIds.push(<number><unknown>id);
                } else {
                    orderedNodeIds.splice(parentIndex, 0, <number><unknown>id);
                }

                if (children[parentId] == null) {
                    children[parentId] = {l: undefined, r: undefined};
                }

                children[parentId][isRight ? 'r' : 'l'] = <number><unknown>id;
            }
        }

        for(const id of orderedNodeIds) {
            const {l, r} = children[id];
            const node = tree.nodes[id];

            if (node.type === INodeType.NODE_CHAR) {
                const isEps = node.content === 'eps';
                nullable[id] = isEps;
                firstpos[id] = new Set<number>();
                lastpos[id] = new Set<number>();
                if (!isEps) {
                    firstpos[id].add(id);
                    lastpos[id].add(id);
                }

            } else if (node.type === INodeType.NODE_ZITER) {
                nullable[id] = true;
                firstpos[id] = new Set<number>([...firstpos[r!]]);
                lastpos[id] = new Set<number>([...lastpos[r!]]);

                for (const pos of lastpos[id]) {
                    if (followpos[pos] == null) {
                        followpos[pos] = new Set<number>();
                    }

                    for(const rPos of firstpos[id]) {
                        followpos[pos].add(rPos);
                    }
                }

            } else if (node.type === INodeType.NODE_ITER) {
                nullable[id] = nullable[r!];
                firstpos[id] = new Set<number>([...firstpos[r!]]);
                lastpos[id] = new Set<number>([...lastpos[r!]]);

                for (const pos of lastpos[id]) {
                    if (followpos[pos] == null) {
                        followpos[pos] = new Set<number>();
                    }

                    for(const rPos of firstpos[id]) {
                        followpos[pos].add(rPos);
                    }
                }

            } else if (node.type === INodeType.NODE_ALT) {
                nullable[id] = nullable[l!] || nullable[r!];
                firstpos[id] = new Set<number>([...firstpos[l!], ...firstpos[r!]]);
                lastpos[id] = new Set<number>([...lastpos[l!], ...lastpos[r!]]);

            } else if (node.type === INodeType.NODE_CONCAT) {
                nullable[id] = nullable[l!] && nullable[r!];

                if (nullable[l!]) {
                    firstpos[id] = new Set<number>([...firstpos[l!], ...firstpos[r!]]);
                } else {
                    firstpos[id] = new Set<number>([...firstpos[l!]]);
                }

                if (nullable[r!]) {
                    lastpos[id] = new Set<number>([...lastpos[l!], ...lastpos[r!]]);
                } else {
                    lastpos[id] = new Set<number>([...lastpos[r!]]);
                }

                for (const pos of lastpos[l!]) {
                    if (followpos[pos] == null) {
                        followpos[pos] = new Set<number>();
                    }

                    for(const rPos of firstpos[r!]) {
                        followpos[pos].add(rPos);
                    }
                }
            }
        }

        return {
            nullable,
            firstpos,
            lastpos,
            followpos,
            root: orderedNodeIds.at(-1)!
        }
    }
}
