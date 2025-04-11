import { FSMBuilder } from "./fsm";
import { DotFilePrinter } from "./printer";
import { FileReader } from "./file-reader";
import { TreeBuilder } from "./tree";
import { TreeFuncComputer } from "./tree-funcs";
import { ConsoleReader } from "./console-reader";

interface IState {
    input: () => Promise<string>; 
    regex?: string;
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
