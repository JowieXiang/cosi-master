const fs = require("fs-extra"),
    execute = require("child-process-promise").exec,

    path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),

    replaceStrings = require(path.resolve(rootPath, "devtools/tasks/replace")),
    prependVersionNumber = require(path.resolve(rootPath, "devtools/tasks/prependVersionNumber")),

    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))(),
    distPath = path.resolve(rootPath, "dist/"),
    mastercodeVersionPath = path.resolve(distPath, "mastercode/", stableVersionNumber),
    buildTempPath = path.resolve(distPath, "build/");

/**
 * copy files to the given destination
 * @param {String} sourcePortalPath source of the built portal
 * @param {String} distPortalPath destination folder for the built portal
 * @returns {void}
 */
function copyPortalFiles (sourcePortalPath, distPortalPath) {
    fs.copy(sourcePortalPath, distPortalPath).then(() => {
        console.warn("NOTE: Copied \"" + sourcePortalPath + "\" to \"" + distPortalPath + "\".");
        fs.copy("./img", mastercodeVersionPath + "/img").then(() => {
            console.warn("NOTE: Copied \"./img\" to \"" + mastercodeVersionPath + "\".");
            fs.copy(buildTempPath, mastercodeVersionPath).then(() => {
                console.warn("NOTE: Copied \"" + buildTempPath + "\" to \"" + mastercodeVersionPath + "\".");
                fs.remove(buildTempPath).then(() => {
                    replaceStrings(distPortalPath);
                    console.warn("NOTE: Copied \"" + buildTempPath + "\" to \"" + distPortalPath + "\".");
                }).catch(error => console.error(error));
            }).catch(error => console.error(error));
        }).catch(error => console.error(error));
    }).catch(error => console.error(error));
}

/**
 * remove files if if they already exist.
 * @param {String} sourcePortalPath source of the built portal
 * @param {String} distPortalPath destination folder for the built portal
 * @returns {void}
 */
function removeOldBuiltFiles (sourcePortalPath, distPortalPath) {
    fs.remove(mastercodeVersionPath).then(() => {
        console.warn("NOTE: Deleted directory \"" + mastercodeVersionPath + "\".");
        fs.remove(distPortalPath).then(() => {
            console.warn("NOTE: Deleted directory \"" + distPortalPath + "\".");
            copyPortalFiles(sourcePortalPath, distPortalPath);
        }).catch(function (err) {
            throw new Error("ERROR", err);
        });
    }).catch(function (err) {
        throw new Error("ERROR", err);
    });
}

/**
 * start the process to build a portal with webpack
 * @param {Object} answers contains the attributes for the portal to be build
 * @returns {void}
 */
module.exports = function buildWebpack (answers) {
    const
        sourcePortalPath = path.resolve(rootPath, answers.portalPath),
        portalName = sourcePortalPath.split(path.sep).pop(),
        distPortalPath = path.resolve(distPath, portalName),
        cliExecCommand = "webpack --config devtools/webpack.prod.js";

    if (!fs.existsSync(sourcePortalPath)) {
        console.error("---\n---");
        throw new Error("ERROR: PATH DOES NOT EXIST \"" + sourcePortalPath + "\"\nABORTED...");
    }

    console.warn("NOTICE: executing command \"" + cliExecCommand + "\"");
    execute(cliExecCommand).then(function (result) {
        console.warn(result.stdout);
        prependVersionNumber(path.resolve(buildTempPath, "js/masterportal.js"));
        removeOldBuiltFiles(sourcePortalPath, distPortalPath);
    }).catch(function (err) {
        throw new Error("ERROR", err);
    });
};


