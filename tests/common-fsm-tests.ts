export interface IFSMTest {
    regex: string;
    input: string;
    accepted: boolean;
    alphabet?: string;
};

export const tests: IFSMTest[] = [
    {regex: '(a*b*)*', input: 'ababababa', accepted: true},
    {regex: '(a|b)*(aa|bb)(a|b)*', input: 'a', accepted: false},
    {regex: '(a|b)*(aa|bb)(a|b)*', input: 'aabb', accepted: true},
    {regex: 'a+b', input: 'b', accepted: false},
    {regex: 'a+b|b+a', input: 'ba', accepted: true},
    {regex: 'э', input: '', accepted: true, alphabet: "ab"},
    {regex: '(э|a)(b|э)', input: 'ab', accepted: true},
    {regex: 'ab+ba+', input: '', accepted: false},
    {regex: '(a+b)a', input: 'aaaaaaaaaabaa', accepted: false}
]
