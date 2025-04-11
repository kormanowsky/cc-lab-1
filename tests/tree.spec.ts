import { INodeType, ITree, ITreeBuilder } from "../src/interface";
import { TreeBuilder } from "../src/tree";

type TreeTest = [string, ITree['nodes'], ITree['parents']];

const tests: TreeTest[] = [
    [
        // Regular expression
        'a', 
        // Expected nodes
        {0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'}}, 
        // Expected parents
        {}
    ],
    [
        'ab',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_CONCAT}, 
            2: {id: 2, type: INodeType.NODE_CHAR, content: 'b'},
        },
        {
            0: [1, false], 
            2: [1, true]
        }
    ],
    [
        'a+',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_ITER}
        },
        {
            0: [1, false]
        }
    ],
    [
        'a*',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_ZITER}
        },
        {
            0: [1, false]
        }
    ],
    [
        'a|b',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_ALT},
            2: {id: 2, type: INodeType.NODE_CHAR, content: 'b'}
        },
        {
            0: [1, false],
            2: [1, true]
        }
    ],
    [
        '(a|b)c',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_ALT},
            2: {id: 2, type: INodeType.NODE_CHAR, content: 'b'},
            3: {id: 3, type: INodeType.NODE_CONCAT},
            4: {id: 4, type: INodeType.NODE_CHAR, content: 'c'}
        },
        {
            0: [1, false],
            2: [1, true],
            1: [3, false],
            4: [3, true]
        }
    ],
    [
        'a+|b',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_ITER},
            2: {id: 2, type: INodeType.NODE_ALT},
            3: {id: 3, type: INodeType.NODE_CHAR, content: 'b'},
        },
        {
            0: [1, false],
            1: [2, false],
            3: [2, true],
        }
    ],
    [
        'a+b+',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_ITER},
            2: {id: 2, type: INodeType.NODE_CONCAT},
            3: {id: 3, type: INodeType.NODE_CHAR, content: 'b'},
            4: {id: 4, type: INodeType.NODE_ITER},
        },
        {
            0: [1, false],
            1: [2, false],
            4: [2, true],
            3: [4, false],
        }
    ],
    [
        'a|b*',
        {
            0: {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            1: {id: 1, type: INodeType.NODE_ALT},
            2: {id: 2, type: INodeType.NODE_CHAR, content: 'b'},
            3: {id: 3, type: INodeType.NODE_ZITER},
        },
        {
            0: [1, false],
            2: [3, false],
            3: [1, true],
        }
    ]
];

describe('Syntax tree', () => {
    let treeBuilder: ITreeBuilder;

    beforeEach(() => {
        treeBuilder = new TreeBuilder();
    });

    for(const [regex, nodes, parents] of tests) {
        it(`is correct for regular expression "${regex}"`, async () => {
            const tree = await treeBuilder.buildTree(regex);

            expect(tree).not.toBeNull();
            expect(tree.nodes).toEqual(nodes);
            expect(tree.parents).toEqual(parents);
        });
    }
});
