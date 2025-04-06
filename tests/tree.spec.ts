import { INode, INodeType, ITree, ITreeBuilder } from "../src/interface";
import { TreeBuilder } from "../src/tree";

type TreeTest = [string, ITree['nodes'], ITree['parents']];

const tests: TreeTest[] = [
    [
        // Regular expression
        'a', 
        // Expected nodes
        [{id: 0, type: INodeType.NODE_CHAR, content: 'a'}], 
        // Expected parents
        {}
    ],
    [
        'ab',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_CONCAT}, 
            {id: 2, type: INodeType.NODE_CHAR, content: 'b'},
        ],
        {
            0: [1, false], 
            2: [1, true]
        }
    ],
    [
        'a+',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_ITER}
        ],
        {
            0: [1, true]
        }
    ],
    [
        'a*',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_ZITER}
        ],
        {
            0: [1, true]
        }
    ],
    [
        'a|b',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_ALT},
            {id: 2, type: INodeType.NODE_CHAR, content: 'b'}
        ],
        {
            0: [1, false],
            2: [1, true]
        }
    ],
    [
        '(a|b)c',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_ALT},
            {id: 2, type: INodeType.NODE_CHAR, content: 'b'},
            {id: 3, type: INodeType.NODE_CONCAT},
            {id: 4, type: INodeType.NODE_CHAR, content: 'c'}
        ],
        {
            0: [1, false],
            2: [1, true],
            1: [3, false],
            4: [3, true]
        }
    ],
    [
        'a+|b',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_ITER},
            {id: 2, type: INodeType.NODE_ALT},
            {id: 3, type: INodeType.NODE_CHAR, content: 'b'},
        ],
        {
            0: [1, true],
            1: [2, false],
            3: [2, true],
        }
    ],
    [
        'a+b+',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_ITER},
            {id: 2, type: INodeType.NODE_CHAR, content: 'b'},
            {id: 3, type: INodeType.NODE_ITER},
            {id: 4, type: INodeType.NODE_CONCAT},
        ],
        {
            0: [1, true],
            1: [4, false],
            2: [3, true],
            3: [4, true],
        }
    ],
    [
        'a|b*',
        [
            {id: 0, type: INodeType.NODE_CHAR, content: 'a'},
            {id: 1, type: INodeType.NODE_ALT},
            {id: 2, type: INodeType.NODE_CHAR, content: 'b'},
            {id: 3, type: INodeType.NODE_ZITER},
        ],
        {
            0: [1, false],
            2: [3, true],
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
