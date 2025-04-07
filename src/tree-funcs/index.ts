import { ITree, ITreeFuncComputer, ITreeFuncs } from "../interface";

export class TreeFuncComputer implements ITreeFuncComputer {
    async computeTreeFuncs(tree: ITree): Promise<ITreeFuncs> {
        // TODO: real functions
        return {
            nullable(n) {
                return false;
            },
            fisrtpos(n) {
                return new Set<number>();
            },
            lastpos(n) {
                return new Set<number>();
            },
            followpos(p) {
                return new Set<number>();
            }
        }
    }
}
