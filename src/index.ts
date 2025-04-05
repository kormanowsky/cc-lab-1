import { DotFilePrinter } from "./printer";
import { FileReader } from "./reader";
import { TreeBuilder } from "./tree";

async function main() {
    const reader = new FileReader('./tests/regex.txt');
    const builder = new TreeBuilder();
    const printer = new DotFilePrinter('./tests/result.dot');

    const regex = await reader.readRegex();
    const tree = await builder.buildTree(regex);

    console.log(tree);
    console.log(JSON.stringify(tree, null, 4));

    await printer.printTree(tree);
}

main();
