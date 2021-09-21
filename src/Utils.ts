import fs from "fs";
import path from "path";
/**
 * 删除文件夹
 * @param url 全路径
 */
export function deleteFolder(url) {
    let files = [];
    /**
     * 判断给定的路径是否存在
     */
    if (fs.existsSync(url)) {
        /**
         * 返回文件和子目录的数组
         */
        files = fs.readdirSync(url);
        files.forEach(function (file) {

            var curPath = path.join(url, file);
            /**
             * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
             */
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);

            } else {
                fs.unlinkSync(curPath);
            }
        });
        /**
         * 清除文件夹
         */
        fs.rmdirSync(url);
    } else {
        console.log("给定的路径不存在，请给出正确的路径");
    }
}

/**
 * 读取整个文件夹
 * @param url 
 * @param cb 
 */
export function readFiles(url: string, cb: (data: string) => any): void {
    if (fs.existsSync(url)) {
        let files = fs.readdirSync(url);
        files.forEach(file => {
            let curPath = path.join(url, file);
            if (fs.statSync(curPath).isDirectory()) {
                readFiles(curPath, cb);
            } else {
                fs.readFile(curPath, { encoding: "utf-8" }, (err, data) => {
                    if (err) {
                        throw `读取文件${curPath}失败!`
                    }
                    cb(data)
                })
            }
        })

    }
}

/**
 * 获取数组最后一个元素
 * @param arr 
 * @returns 
 */
export function getArrayItem<T>(arr: T[],idx:number = -1): T {
    return arr ? arr[arr.length +  idx] : null;
}