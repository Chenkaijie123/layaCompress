import fs from "fs"
import { mainFile } from "./Config";
import Scaner from "./control/Scaner";
import JSFileMdl from "./model/JSFileMdl";
/**压缩流程控制 */
export default class CompressProcess {
    constructor() {
        this.start();
    }

    private async start() {
        this.initSource();
        await this.parseFiles();
        this.compressClass();
        this.compressWords();
        this.writeFile();
    }

    /**
     * 工具初始化处理
     */
    private initSource(): void {

    }

    /**
     * 解析源代码文件
     */
    private parseFiles() {
        return new Promise((resolve, reject) => {
            fs.readFile(mainFile, { encoding: "utf-8" }, (err, data) => {
                if (err) {
                    console.error(err);
                    reject()
                    return;
                }
                (new Scaner).parse(data);
                resolve(null);
            })
        })
    }

    /**
     * 类按规则压缩
     */
    private compressClass(): void {

    }

    /**
     * 压缩字段
     */
    private compressWords(): void {
        for (let info of JSFileMdl.ins.fileInfos) {
            info.wordsList.forEach(v => {
                JSFileMdl.ins.addWords(v);
            })
        }
        JSFileMdl.ins.compressWords()
        fs.writeFile("./out.json",JSON.stringify(JSFileMdl.ins.stringMap),()=>{})
    }

    /**
     * 输出
     */
    private writeFile(): void {

    }
}