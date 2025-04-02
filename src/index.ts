import { FileReader } from "./reader";
import { TreeBuilder } from "./tree";

async function main() {
    const reader = new FileReader('./tests/regex.txt');
    const builder = new TreeBuilder();

    const regex = await reader.readRegex();
    const tree = await builder.buildTree(regex);

    console.log(tree);

}

main();
