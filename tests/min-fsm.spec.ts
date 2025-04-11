import { FSMBuilder } from "../src/fsm";
import { IFiniteStateMachineBuilder, IFiniteStateMachineSimulator, IFSM, ITree, ITreeBuilder, ITreeFuncComputer } from "../src/interface";
import { FSMSimulator } from "../src/simulator";
import { TreeBuilder } from "../src/tree";
import { TreeFuncComputer } from "../src/tree-funcs";
import { IFSMTest, tests } from "./common-fsm-tests";

describe('Finite-state machine minimization', () => {
    let treeBuilder: ITreeBuilder;
    let fsmBuilder: IFiniteStateMachineBuilder;
    let treeFuncComputer: ITreeFuncComputer;
    let fsmSimulator: IFiniteStateMachineSimulator;

    beforeEach(() => {
        treeBuilder = new TreeBuilder();
        fsmBuilder = new FSMBuilder();
        treeFuncComputer = new TreeFuncComputer();
        fsmSimulator = new FSMSimulator();
    });

    for(const {regex, input, alphabet, accepted} of tests) {
        it(`is performed on finite-state machine tree for regular expression ${regex}`, async () => {
            const tree = await treeBuilder.buildTree(`(${regex})#`);
            const treeFuncs = await treeFuncComputer.computeTreeFuncs(tree);
            const fsm = await fsmBuilder.buildFSM(tree, treeFuncs, alphabet ?? regex.split("").filter(ch => !"()+*#|э".includes(ch)).join(""));
            const minFsm = await fsmBuilder.buildMinifiedFSM(fsm);

            expect(
                minFsm.states.find(state => state.id === minFsm.initialState)?.positions.has(fsm.initialState)
            ).toBe(true);
    
            for(const finalStateId of fsm.finalStates) {
                expect(
                    minFsm.finalStates.some(st => 
                        minFsm.states.find(state => state.id === st)?.positions.has(finalStateId)
                    )
                ).toBe(true);
            }

            expect(minFsm.states.length).toBeGreaterThan(0);
            expect(minFsm.states.length).toBeLessThanOrEqual(fsm.states.length);
        });

        it(`produces result that ${accepted ? 'does': 'does not'} accept string "${input}" for regular expression "${regex}"`, async () => {
            const tree = await treeBuilder.buildTree(`(${regex})#`);
            const treeFuncs = await treeFuncComputer.computeTreeFuncs(tree);
            const fsm = await fsmBuilder.buildFSM(tree, treeFuncs, regex.split("").filter(ch => !"()+*#|э".includes(ch)).join(""));
            const minFsm = await fsmBuilder.buildMinifiedFSM(fsm);
            const result = await fsmSimulator.simulateFSM(minFsm, input);

            expect(result.error).toBeUndefined();
            expect(result.accepted).toBe(accepted);
            expect(result.steps.length).toBeGreaterThan(0);
            expect(result.steps.at(-1)?.isFinal).toBe(accepted);

        });
    }
});
