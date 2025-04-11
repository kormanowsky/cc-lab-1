import { FSMBuilder } from "../src/fsm";
import { IFiniteStateMachineBuilder, IFiniteStateMachineSimulator, IFSM, ITree, ITreeBuilder, ITreeFuncComputer } from "../src/interface";
import { FSMSimulator } from "../src/simulator";
import { TreeBuilder } from "../src/tree";
import { TreeFuncComputer } from "../src/tree-funcs";
import { tests } from "./common-fsm-tests";

describe('Finite-state machine', () => {
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
        it(`is built from tree for regular expression "${regex}"`, async () => {
            const tree = await treeBuilder.buildTree(`(${regex})#`);
            const treeFuncs = await treeFuncComputer.computeTreeFuncs(tree);
            const fsm = await fsmBuilder.buildFSM(tree, treeFuncs, regex.split("").filter(ch => !"()+*#|э".includes(ch)).join(""));

            expect(fsm.initialState).toBeGreaterThanOrEqual(0);
            expect(fsm.finalStates.length).toBeGreaterThan(0);
            expect(fsm.states.length).toBeGreaterThan(0);
        });

        it(`${accepted ? 'does': 'does not'} accept string "${input}" for regular expression "${regex}"`, async () => {
            const tree = await treeBuilder.buildTree(`(${regex})#`);
            const treeFuncs = await treeFuncComputer.computeTreeFuncs(tree);
            const fsm = await fsmBuilder.buildFSM(tree, treeFuncs, alphabet ?? regex.split("").filter(ch => !"()+*#|э".includes(ch)).join(""));
            const result = await fsmSimulator.simulateFSM(fsm, input);

            expect(result.error).toBeUndefined();
            expect(result.accepted).toBe(accepted);
            expect(result.steps.length).toBeGreaterThan(0);
            expect(result.steps.at(-1)?.isFinal).toBe(accepted);

        });
    }
});
