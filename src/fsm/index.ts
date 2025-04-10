import { IFiniteStateMachineBuilder, IFSM, IFSMState, INodeType, ITree, ITreeFuncs } from "../interface";

export class FSMBuilder implements IFiniteStateMachineBuilder {
    async buildFSM(tree: ITree, funcs: ITreeFuncs, alphabet: string = "abcdefghijklmnopqrstuvwxyz"): Promise<IFSM> {
        const states: IFSM['states'] = [];
        const transitionFunction: IFSM['transitionFunction'] = {};

        let stateId = -1;

        states.push({id: ++stateId, positions: new Set<number>([...funcs.firstpos[funcs.root]])});

        const initialState = stateId;
        const finalStates: number[] = [];
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

                    for(const pos of newSt.positions) {
                        const node = tree.nodes[pos];
                        console.log(pos, node);
                        if (node.type === INodeType.NODE_CHAR && node.content === "#") {
                            finalStates.push(newSt.id);
                        }
                    }

                    id = stateId;
                }

                transitionFunction[s.id] = {...transitionFunction[s.id], [a]: id};
            }
        }

        return {
            states,
            transitionFunction,
            initialState,
            finalStates,
            alphabet
        };
    }

    async buildMinifiedFsm(fsm: IFSM): Promise<IFSM> {
        const {states, finalStates, transitionFunction: d, alphabet: S} = fsm;
        const Q = new Set<number>(states.map((s) => s.id));
        const F = new Set<number>(finalStates);
        const P = [Q, this.setDifference(Q, F)];
        const Class: Record<number, number> = {};
        for(const q of Q) {
            Class[q] = 0;
        }
        for(const q of this.setDifference(Q, F)) {
            Class[q] = 1;
        }
        const Inv: Record<number, Record<string, number[]>> = {};

        for(const [sourceState, transitions] of Object.entries(d)) {
            for(const [sym, targetState] of Object.entries(transitions)) {
                if (Inv[targetState] == null) {
                    Inv[targetState] = {};
                }
                if (Inv[targetState][sym] == null) {
                    Inv[targetState][sym] = [];
                }
                Inv[targetState][sym].push(<number><unknown>sourceState);
            }
        }

        console.log(Inv);


        const Queue: Array<[Set<number>, string]> = [];

        for(const c of S) {
            Queue.push([F, c]);
            Queue.push([this.setDifference(Q, F), c]);
        }

        while(Queue.length > 0) {
            const [C, a] = Queue[0];
            Queue.splice(0, 1);
            const Involved = {};

            for (const q of C) {
                for (const r of Inv[q][a] ?? []) {
                    const i = Class[r];
                    if (Involved[i] == null) {
                        Involved[i] = [];
                    }
                    Involved[i].push(r);
                }
            }

            for (const i of Object.keys(Involved)) {
                if (Involved[i].length < P[i].length) {
                    const j = P.push(new Set<number>()) - 1;
                    for(const r of Involved[i]) {
                        P[i].delete(r);
                        P[j].add(r);
                    }

                    if (P[j].size > P[i].size) {
                        const tmp = P[i];
                        P[i] = P[j];
                        P[j] = tmp;
                    }

                    for(const r of P[j]) {
                        Class[r] = j;
                    }

                    for(const c of S) {
                        Queue.push([P[j], c]);
                    }
                }
            }
        }

        console.log(P);
        
        // TODO:
        return {
            ...fsm
        }
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

    protected setDifference<T = number>(a: Set<T>, b: Set<T>, eq: (x: T, y: T) => boolean = (x, y) => x === y): Set<T> {
        const result: Set<T> = new Set<T>();

        for(const aEl of a) {
            let isInB: boolean = false;

            for(const bEl of b) {
                if (eq(aEl, bEl)) {
                    isInB = true;
                    break;
                }
            }

            if (!isInB) {
                result.add(aEl);
            }
        }

        return result;
    }
}
