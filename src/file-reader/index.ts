import fsP from "fs/promises";
import readlineP from "readline/promises";
import { IReader } from "../interface";

export class FileReader implements IReader {
    constructor(filePath: string) {
        this.filePromise = fsP.open(filePath);
    }

    async readString(): Promise<string> {
        const file = await this.filePromise;
        const iface = readlineP.createInterface({
            input: file.createReadStream()
        });

        return new Promise<string>((resolve) => {
            iface.once("line", line => {
                iface.close();
                resolve(line);
            });
        });
    }

    async readRegex(): Promise<string> {
        const file = await this.filePromise;
        return (await file.readFile({encoding: 'utf-8'})).trim();
    }

    async [Symbol.asyncDispose]() {
        const file = await this.filePromise;
        await file.close();
    }

    private filePromise: Promise<fsP.FileHandle>;
}
