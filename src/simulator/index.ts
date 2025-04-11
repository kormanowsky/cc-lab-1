import { IFiniteStateMachineSimulator, IFSM, IFSMSimResult } from "../interface";

export class FSMSimulator implements IFiniteStateMachineSimulator {
    async simulateFSM(fsm: IFSM, input: string): Promise<IFSMSimResult> {
        const steps: IFSMSimResult['steps'] = [];
        let curStateId = fsm.initialState;

        steps.push({
            id: steps.length + 1, 
            curStateId,
            char: '<NULL>',
            isFinal: fsm.finalStates.includes(curStateId),
            isInitial: fsm.initialState === curStateId
        });

        for(const char of input) {
            try {
                curStateId = fsm.transitionFunction[curStateId][char];
            } catch (err) {
                return {
                    accepted: false,
                    error: err,
                    steps
                };
            }

            steps.push({
                id: steps.length + 1, 
                curStateId,
                char,
                isFinal: fsm.finalStates.includes(curStateId),
                isInitial: fsm.initialState === curStateId
            });
        }

        return {
            accepted: fsm.finalStates.includes(curStateId), 
            steps
        };
    }
}
