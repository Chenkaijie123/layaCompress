import { getArrayItem } from "../Utils";
import Scaner from "../control/Scaner";
import JSFileInfo from "./JSFileInfo";

export default class JSFileMdl {
    fileInfos: JSFileInfo[] = []
    /**
     * 不压缩词
     */
    notCompressWordsMap: { [key: string]: number } = Object.create(null);
    /**
     * 所有压缩js文件出现词语和出现次数
     */
    wordSymbolMap: { [key: string]: number } = Object.create(null);
    /**
     * 未压缩词 => 压缩词
     */
    u2cMap: { [key: string]: string } = Object.create(null);
    /**
     * 压缩词 => 未压缩词
     */
    c2uMap: { [key: string]: string } = Object.create(null);
    /**
     * 字符串
     */
    stringMap: { [key: string]: number } = Object.create(null);

    /**
     * 可能是动态属性
     */
    attrKeyMap: { [key: string]: number } = Object.create(null);

    private id: number = 0;
    private stringID: number = 0;
    private symbolWords: string = "abcdefghijklnmopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ_";
    private filesEndName: string[] = ["png", "jpg", "json", "js", "jpeg"]
    private maxLen: number;
    private static _ins: JSFileMdl;
    public static get ins(): JSFileMdl {
        return JSFileMdl._ins || (JSFileMdl._ins = new JSFileMdl);
    }

    constructor() {
        this.maxLen = this.symbolWords.length;
    }

    addWords(word: string): void {
        if (!word || /^[0-9.+-]+$/.test(word)) return;
        if (Scaner.spliceChars.indexOf(word) >= 0) return;
        this.wordSymbolMap[word] = this.wordSymbolMap[word] ? this.wordSymbolMap[word] + 1 : 1;
    }

    /**获取压缩名 */
    getCompressWords(words: string): string {
        return this.u2cMap[words] || words;
    }

    /**获取未压缩名 */
    getUnCompressWords(words: string): string {
        return this.c2uMap[words] || words;
    }

    /**获取一个新的词 */
    getSymbol(): string {
        let res: string;
        while (1) {
            res = this.createSymbol();
            if (!this.u2cMap[res]
                && !this.c2uMap[res]) {
                break;
            }
        }
        return res;
    }

    /**压缩词汇 */
    compressWords(): void {
        let words: string[] = Object.keys(this.wordSymbolMap);
        words.sort((a: string, b: string) => {
            return b.length * this.wordSymbolMap[b] * (this.notCompressWordsMap[b] ? 0 : 1) - a.length * this.wordSymbolMap[a] * (this.notCompressWordsMap[a] ? 0 : 1);
        })
        words.forEach(v => {
            if (this.notCompressWordsMap[v]) return;
            let compressWords: string = this.notCompressWordsMap[v] ? v : this.getSymbol();
            this.u2cMap[v] = compressWords;
            this.c2uMap[compressWords] = v;
        })
        //压缩字符串
        let strMap: { [key: string]: number } = Object.create(null);
        for (let str in this.stringMap) {
            if (/[#/\\]/g.test(str)) {
                strMap[str] = this.stringMap[str]
            } else if (str.indexOf(".") != -1) {
                let strArr = str.split(".");
                //可能是文件名，不压缩
                if (this.filesEndName.indexOf(getArrayItem(strArr)) != -1) {
                    strMap[str] = this.stringMap[str]
                } else {
                    //可能是包名，需要一个一个压缩
                    strMap[strArr.map(v => {
                        return this.u2cMap[v] || v
                    }).join(".")] = this.stringMap[str]

                }
            } else{
                strMap[this.getCompressWords(str)] = this.stringMap[str];
            }
        }
        this.stringMap = strMap;
    }

    /**添加字符串 */
    addString(str: string): number {
        if (!this.stringMap[str]) {
            this.stringMap[str] = this.stringID++;
        }
        return this.stringMap[str];
    }

    /**创建一个唯一字符 */
    private createSymbol(): string {
        let res: string[] = [];
        let id = this.id++;
        let shan = id / this.maxLen >> 0
        let yu = id % this.maxLen
        while (shan) {
            yu = shan % this.maxLen
            shan = shan / this.maxLen >> 0
            res.unshift(this.symbolWords[yu]);
        }
        return res.join("");
    }

}

