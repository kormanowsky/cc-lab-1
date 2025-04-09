import { IFiniteStateMachineBuilder, IFSM, INodeType, ITree, ITreeFuncs } from "../interface";

export class FSMBuilder implements IFiniteStateMachineBuilder {
    async buildFSM(tree: ITree, funcs: ITreeFuncs, alphabet: string = "abcdefghijklmnopqrstuvwxyz"): Promise<IFSM> {
        const states: IFSM['states'] = [];
        const transitionFunction: IFSM['transitionFunction'] = {};

        let stateId = -1;

        states.push({id: ++stateId, positions: new Set<number>([...funcs.firstpos[funcs.root]])});

        const unmarkedStates = [states[0]];

        while(unmarkedStates.length > 0) {
            const s = unmarkedStates.pop()!;

            for(const a of alphabet) {
                const u = new Set<number>();

                for(const p of s.positions) {
                    const node = tree.nodes[p];

                    if (node.type === INodeType.NODE_CHAR && node.content === a) {
                        for(const pos of funcs.followpos[p]) {
                            u.add(pos);
                        }
                    }
                }

                let id = -1;

                for(const st of states) {
                    if (this.setsEqual(st.positions, u)) {
                        id = st.id;
                    }
                }

                if (id == -1) {
                    const newSt = {id: ++stateId, positions: u};

                    states.push(newSt);
                    unmarkedStates.push(newSt);

                    id = stateId;
                }

                transitionFunction[s.id] = {...transitionFunction[s.id], [a]: id};
            }
        }

        return {
            states,
            transitionFunction
        };
    }

    protected setsEqual<T = number>(a: Set<T>, b: Set<T>): boolean {
        for(const aEl of a) {
            if (!b.has(aEl)) {
                return false;
            }
        }

        for(const bEl of b) {
            if (!a.has(bEl)) {
                return false;
            }
        }

        return true;
    }
}
