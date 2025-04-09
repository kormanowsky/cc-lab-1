import { FSMBuilder } from "./fsm";
import { DotFilePrinter } from "./printer";
import { FileReader } from "./reader";
import { TreeBuilder } from "./tree";
import { TreeFuncComputer } from "./tree-funcs";

async function main() {
    const reader = new FileReader('./examples/regex.txt');
    const builder = new TreeBuilder();
    const printer = new DotFilePrinter('./result.dot');
    const computer = new TreeFuncComputer();
    const fsmBuilder = new FSMBuilder();

    const regex = await reader.readRegex();
    const tree = await builder.buildTree(regex);
    const funcs = await computer.computeTreeFuncs(tree);
    const fsm = await fsmBuilder.buildFSM(tree, funcs, "ab");

    await printer.printTree(tree);

    console.log(funcs);
    console.log(fsm);

    for(const s of fsm.states) {
        console.log(s.id, [...s.positions]);
    }
}

main();
