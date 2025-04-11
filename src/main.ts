import { FSMBuilder } from "./fsm";
import { DotFilePrinter } from "./printer";
import { FileReader } from "./file-reader";
import { TreeBuilder } from "./tree";
import { TreeFuncComputer } from "./tree-funcs";
import { ConsoleReader } from "./console-reader";
import { IFSM } from "./interface";
import { FSMSimulator } from "./simulator";

interface IState {
    input: () => Promise<string>; 
    regex?: string;
    fsm?: IFSM;
    minFsm?: IFSM;
};

interface ICommand {
    help: string;
    invoke(state: IState): Promise<IState>;
}

const commands: ICommand[] = [
    {
        help: 'exit',
        invoke: async (state) => {
            process.exit(0);

            return state;
        }
    },
    {
        help: 'read regular expression',
        invoke: async (state) => {
            console.log('Enter file path or "-" to read regex from stdin');

            const filePath = await state.input();
            const regexReader = filePath === "-" ? new ConsoleReader() : new FileReader(filePath);

            if (filePath === "-") {
                console.log('Enter regex, operations supported: (), |, +, *');
            }

            const regex = await regexReader.readRegex();
            state.regex = regex;

            console.log(`Read regex: "${regex}"`);
    
            return state;
        }
    }, 
    {
        help: 'build and save syntax tree in .dot format', 
        invoke: async (state) => {
            if (state.regex == null) {
                console.error('No regular expression entered, skipping...');
                return state;
            }

            console.log('Enter file path to save the syntax tree');
            const filePath = await state.input();

            const builder = new TreeBuilder();
            const printer = new DotFilePrinter(filePath);

            const tree = await builder.buildTree(`(${state.regex})#`);

            await printer.printTree(tree);

            console.log(`Saved tree to file: ${filePath}`);

            return state;
        }
    }, 
    {
        help: 'build and save determined finite-state machine in .dot format',
        invoke: async (state) => {
            if (state.regex == null) {
                console.error('No regular expression entered, skipping...');
                return state;
            }

            console.log('Enter file path to save the finite-state machine or press ENTER to skip saving');
            const filePath = await state.input();

            console.log('Enter the alphabet or press ENTER to guess it from the regular expression');
            let alphabet = (await state.input()).trim();

            if (alphabet.length === 0) {
                alphabet = state.regex.split("").filter(ch => !"()+*#|э".includes(ch)).join("");
            }

            const builder = new TreeBuilder();
            const computer = new TreeFuncComputer();
            const fsmBuilder = new FSMBuilder();

            const tree = await builder.buildTree(`(${state.regex})#`);
            const funcs = await computer.computeTreeFuncs(tree);
            const fsm = await fsmBuilder.buildFSM(tree, funcs, alphabet);

            console.log('Built finite-state machine');

            if (filePath.length > 0) {
                const printer = new DotFilePrinter(filePath);
                await printer.printFSM(fsm);

                console.log(`Saved finite-state machine to file: ${filePath}`);
            }

            state.fsm = fsm;
            return state;
        }
    },
    {
        help: 'minimize and save pre-built determined finite-state machine in .dot format',
        invoke: async (state) => {
            if (state.fsm == null) {
                console.error('No built finite-state machine, skipping...');
                return state;
            }

            console.log('Enter file path to save the finite-state machine or press ENTER to skip saving');
            const filePath = await state.input();

            const fsmBuilder = new FSMBuilder();
            const minFsm = await fsmBuilder.buildMinifiedFSM(state.fsm);

            console.log('Minimized finite-state machine');

            if (filePath.length > 0) {
                const printer = new DotFilePrinter(filePath);
                await printer.printFSM(minFsm);

                console.log(`Saved minimized finite-state machine to file: ${filePath}`);
            }

            state.minFsm = minFsm;
            return state;
        }
    },
    {
        help: 'simulate minimized finite-state machine',
        invoke: async (state) => {
            if (state.minFsm == null) {
                console.error('Minimize finite-state machine before simulating, skipping...');
                return state;
            }

            const simulator = new FSMSimulator();

            do {
                console.log('Enter input string or press ENTER to exit');
                const input = await state.input();

                if (input.length === 0) {
                    return state;
                }

                const result = await simulator.simulateFSM(state.minFsm, input);

                console.log('Simulation Result');
                console.log('Input Accepted: ', result.accepted);
                console.log('Steps:');

                for(const step of result.steps) {
                    console.log(`>>> Step #${step.id}`);
                    console.log(`Current State: ${step.curStateId}`);
                    console.log(`Character just read: ${step.char}`);
                    console.log(`State is initial: ${step.isInitial}; state is final: ${step.isFinal}`);
                }

                console.log('Simulation finished');

            } while (true);
        }
    }
]

async function main() {
    const cmdReader = new ConsoleReader();

    let state = {
        input: cmdReader.readString.bind(cmdReader)
    };

    let cmd = -1;

    do {
        console.log('Menu:');
    
        for(let i = 0; i < commands.length; ++i) {
            console.log(`${i}: ${commands[i].help}`);
        }

        console.log('Enter command:');
        cmd = parseInt(await cmdReader.readString(), 10);

        if (cmd >= 0 && cmd < commands.length) {
            state = await commands[cmd].invoke(state);
        } else {
            console.error('Invalid command!');
        }
    } while (true);

    process.exit(0);

    const reader = new FileReader('./examples/regex.txt');
    const builder = new TreeBuilder();
    const printer = new DotFilePrinter('./tree.dot');
    const printer2 = new DotFilePrinter('./fsm.dot');
    const printer3 = new DotFilePrinter('./min-fsm.dot');
    const computer = new TreeFuncComputer();
    const fsmBuilder = new FSMBuilder();

    const regex = await reader.readRegex();
    const tree = await builder.buildTree(`(${regex})#`);

    await printer.printTree(tree);

    const funcs = await computer.computeTreeFuncs(tree);
    const fsm = await fsmBuilder.buildFSM(tree, funcs, "ab");

    await printer2.printFSM(fsm);

    const minFsm = await fsmBuilder.buildMinifiedFSM(fsm);

    await printer3.printFSM(minFsm);
}

main();
