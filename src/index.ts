import { FSMBuilder } from "./fsm";
import { DotFilePrinter } from "./printer";
import { FileReader } from "./reader";
import { TreeBuilder } from "./tree";
import { TreeFuncComputer } from "./tree-funcs";

async function main() {
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

    const minFsm = await fsmBuilder.buildMinifiedFsm(fsm);

    await printer3.printFSM(minFsm);
}

main();
