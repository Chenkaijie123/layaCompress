import JSFileMdl from "../model/JSFileMdl";
import JSFileInfo from "../model/JSFileInfo";
import { getArrayItem } from "../Utils";
import { stringMapName } from "../Config";




export default class Scaner {
    private str: string;
    private maxLen: number;
    private index: number;
    private stack: rule_type[] = [];
    private targetJSFileInfo: JSFileInfo;

    static spliceChars: string = "()[]{}~|&^><+-*/=,.;:!%? \'\"\n\t";
    ruleConfig: { [key: string]: [string, rule_type][] } = {
        [rule_type.note1]: [["\n", rule_type.complete]],
        [rule_type.note2]: [["*/", rule_type.complete], ["\*/", rule_type.ignore], ["\*\/", rule_type.ignore]],
        [rule_type.str1]: [["\"", rule_type.complete], ["\\\"", rule_type.ignore]],
        [rule_type.str2]: [["'", rule_type.complete], ["\\\'", rule_type.ignore]],
        [rule_type.reg]: [["/", rule_type.complete], ["\\/", rule_type.ignore]],
        [rule_type.dakuohao]: [["}", rule_type.complete], ["(", rule_type.xiaokuohao], ["{", rule_type.dakuohao], ["//", rule_type.note1], ["\/*", rule_type.note2], ["\"", rule_type.str1], ["'", rule_type.str2], ["[", rule_type.zhongkuohao]],
        [rule_type.zhongkuohao]: [["]", rule_type.complete], ["(", rule_type.xiaokuohao], ["[", rule_type.zhongkuohao], ["//", rule_type.note1], ["\/*", rule_type.note2], ["\"", rule_type.str1], ["'", rule_type.str2], ["{", rule_type.dakuohao]],
        [rule_type.xiaokuohao]: [[")", rule_type.complete], ["(", rule_type.xiaokuohao], ["[", rule_type.zhongkuohao], ["//", rule_type.note1], ["\/*", rule_type.note2], ["\"", rule_type.str1], ["'", rule_type.str2], ["{", rule_type.dakuohao]]
    }

    parse(str: string): void {
        this.targetJSFileInfo = new JSFileInfo;
        JSFileMdl.ins.fileInfos.push(this.targetJSFileInfo);
        this.str = str;
        this.maxLen = str.length;
        this.index = 0;
        while (this.index < this.maxLen) {
            this.parseSection(this.index, 200);
        }
    }

    parseSection(start: number, len: number): void {
        let searchStr: string = this.str.substr(start, len);
        let status: rule_type = getArrayItem(this.stack) || rule_type.dakuohao;
        let rules = this.ruleConfig[status];
        let targetRule: rule_type;
        let targetChar: string;
        let targetIndex: number;
        let tempIndex: number;
        for (let rule of rules) {
            tempIndex = searchStr.indexOf(rule[0]);
            if (tempIndex == -1) continue;
            if (!targetRule || targetIndex > tempIndex) {
                targetIndex = tempIndex;
                targetRule = rule[1];
                targetChar = rule[0];
            }
        }
        if (!targetRule && start + len < this.maxLen) {
            this.parseSection(start, len * 2);
        } else {
            this.doParseSection(start, start + targetIndex + targetChar.length, status, targetRule);
        }
    }

    private tempStr: string = "";
    doParseSection(start: number, end: number, ruleNow: rule_type, nextRule: rule_type): void {
        this.index = end;
        let targetStr: string = this.str.substring(start, end);
        if (ruleNow != rule_type.note1 && ruleNow != rule_type.note2) {
            if (ruleNow == rule_type.str1 || ruleNow == rule_type.str2) {
                this.tempStr += targetStr;
            } else {
                if (this.tempStr) {
                    this.parseStrWords(this.tempStr);
                    this.tempStr = "";
                } else {
                    this.parseWords(targetStr);
                }
            }

        }

        switch (nextRule) {
            case rule_type.complete:

                this.stack.pop();
                break;
            case rule_type.ignore:

                //TODO
                break;
            default:
                this.stack.push(nextRule)
                break;
        }

    }

    //分词
    parseWords(str: string): void {
        let start = 0;
        let end = 0;
        let maxLen = str.length;
        while (end < maxLen) {
            while (Scaner.spliceChars.indexOf(str[end]) == -1) {
                end++;
            };
            if (start == end) {
                this.targetJSFileInfo.wordsList.push(str[end++])
            } else {
                this.targetJSFileInfo.wordsList.push(str.substring(start, end));
            }
            start = end;
        }
        let last = getArrayItem(this.targetJSFileInfo.wordsList);
        if(last == "'" || last == "\"") this.targetJSFileInfo.wordsList.pop();//去掉字符串符号
    }

    /**
     * 把所有字符串保存到一个对象，在压缩属性方法阶段在把整个字符串映射对象进行压缩
     * @param str 
     */
    parseStrWords(str: string): void {
        let state = getArrayItem(this.stack,-2)
        str = str.substr(0, str.length - 1);
        if (state == rule_type.zhongkuohao){
            JSFileMdl.ins.attrKeyMap[str] = 1;
        }
        this.targetJSFileInfo.wordsList.push(`${stringMapName}(${JSFileMdl.ins.addString(str)})`);
        
    }



}

enum rule_type {
    note1 = 1,
    note2,
    str1,
    str2,
    reg,
    dakuohao,
    zhongkuohao,
    xiaokuohao,

    ignore,
    complete,

}