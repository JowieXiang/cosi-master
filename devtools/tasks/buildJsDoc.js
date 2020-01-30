const execute = require("child-process-promise").exec,
    path = require("path"),
    pathToJsDocCmd = path.resolve(__dirname, "../../node_modules/.bin/jsdoc");

/**
 * Removes folder jsdoc if it exists.
 * rd remove directory
 * /s with all subfolders
 * /q without confirmations
 * Then it generates the JsDoc using:
 * Config: -c jsdoc-config.json
 */

execute("if exist jsdoc rd /s /q jsdoc")
    .then(function () {
        console.warn("===========\nNOTICE: In case JSDOC throws an error with only the file name but not the full file path, you may modify its lib code like this:\n\n1: Go to /masterportal/node_modules/jsdoc/lib/jsdoc/tag/validator.js:9\n\n2: Modify this:\nfunction buildMessage(tagName, {filename, lineno, comment}, desc) {let result = `The @${tagName} tag ${desc}. File: ${filename}, line: ${lineno}`;\n\n...into this:\nfunction buildMessage(tagName, {filename, lineno, comment, path}, desc) {let result = `The @${tagName} tag ${desc}. FILEPATH: ${path}/${filename}:${lineno}`;\n===========\n");
        execute(pathToJsDocCmd + " -c ./devtools/jsdoc/jsdoc-config.json");
    });

process.on("unhandledRejection", function (error) {
    throw new Error(error);
});

