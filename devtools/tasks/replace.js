var replace = require("replace-in-file"),
    replacements = [{
        "files": "dist/index.html",
        "from": /..\/..\/build\//g,
        "to": "./"
    },
    {
        "files": "dist/css/style.css",
        "from": /css\/woffs/g,
        "to": "./woffs"
    },
    {
        "files": "dist/config.json",
        "from": /\.\.\/\.\.\/node_modules\/lgv-config/g,
        "to": "../lgv-config"
    }
    ];


replacements.forEach(function (replacement) {
    replace.sync({
        files: replacement.files,
        from: replacement.from,
        to: replacement.to
    });
    console.log ("Successfully replaced '" + replacement.from + "' in Files '" + replacement.files + "' to '" + replacement.to + "!");
});
