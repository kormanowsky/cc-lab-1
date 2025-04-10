import fsP from "fs/promises";
import { IRegexReader } from "../interface";

export class FileReader implements IRegexReader {
    constructor(filePath: string) {
        this.filePromise = fsP.open(filePath);
    }

    async readRegex(): Promise<string> {
        const file = await this.filePromise;
        
        return (await file.readFile({encoding: 'utf-8'})).trim();

    }

    private filePromise: Promise<fsP.FileHandle>;
}
