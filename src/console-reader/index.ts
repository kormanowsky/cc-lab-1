import readlineP from "readline/promises";
import { IReader } from "../interface";

export class ConsoleReader implements IReader {
    constructor() {
        this.iface = readlineP.createInterface({
            input: process.stdin
        });
    }

    async readString(): Promise<string> {
        return new Promise<string>((resolve) => {
            this.iface.once("line", resolve);
        });
        
    }

    async readRegex(): Promise<string> {
        return new Promise<string>((resolve) => {
            this.iface.once("line", resolve);
        });
    }

    async [Symbol.asyncDispose]() {
        this.iface.close();
    }

    private iface: readlineP.Interface;
}