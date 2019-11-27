import SnippetModel from "../model";

const ExportButtonModel = SnippetModel.extend({
    defaults: {
        tag: "Export",
        rawData: null,
        filename: "",
        fileExtension: "",
        data: null
    },

    /**
     * @description creates a downloadable Blob from Objects / ObjectArrays and appends them to a "download"-button
     */

    initialize: function () {
        this.superInitialize();

        if (typeof this.get("rawData") === "string") {
            this.set("data", "printHtml");
            this.trigger("render");
        }
        else {
            this.prepareForExport();
        }

        this.listenTo(this, {
            "change:isActive": this.prepareForExport,
            "change:rawData": this.prepareForExport
        });
    },
    convertRawData: function () {
        const data = this.get("rawData");

        if (data.length > 0 || _.allKeys(data).length > 0) {
            switch (this.get("fileExtension")) {
                case "csv":
                    this.convertJsonToCsv(data);
                    break;
                default:
                    this.setData(data, {type: "text/plain"});
                    break;
            }
        }
    },
    convertJsonToCsv: function (data = this.get("rawData")) {
        let dataAsObjArr = data;

        if (typeof data.length === "undefined") {
            dataAsObjArr = this.refineObject(dataAsObjArr);
        }

        try {
            const csv = Radio.request("Util", "convertArrayOfObjectsToCsv", dataAsObjArr);

            this.setData(csv, "text/csv;charset=utf-8,%EF%BB%BF");
        }
        catch (err) {
            console.error(err);
        }

    },
    refineObject: function (data) {
        const objArr = [];

        for (const key in data) {
            data[key].id = key;
            objArr.push(data[key]);
        }

        return objArr;
    },
    generateFilename: function () {
        const date = new Date().toLocaleDateString("en-US", {year: "numeric", month: "numeric", day: "numeric"}),
            filename = `${this.get("filename")}-${date}.${this.get("fileExtension")}`;

        return filename;
    },
    prepareForExport: function () {
        this.convertRawData();

        this.trigger("render");
    },
    setData: function (data, type) {
        this.set("data", new Blob(["\ufeff", data], {type: type}));
    }
    // htmlToBlob: async function (elementTag) {
    //     return new Promise((res, rej) => {
    //         var element = document.querySelector(elementTag).cloneNode(true),
    //             svgs = element.querySelectorAll("svg"),
    //             preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>",
    //             postHtml = "</body></html>";

    //         this.replaceSvgs(svgs)
    //             .then((canvasArray) => {
    //                 for (let i = 0; i < canvasArray.length; i++) {
    //                     svgs[i].parentNode.append(canvasArray[i]);
    //                     svgs[i].parentNode.removeChild(svgs[i]);
    //                 }

    //                 const html = preHtml + element.innerHTML + postHtml,
    //                     blob = new Blob(["\ufeff", html], {
    //                         type: "application/vnd.ms-word"
    //                     });

    //                 res(blob);
    //             });
    //     });
    // },
    // replaceSvgs (svgs) {
    //     return new Promise(async res => {
    //         const canvasArray = [];

    //         for (let i = 0; i < svgs.length; i++) {
    //             this.svgToCanvas(svgs[i]).then(canvas => {
    //                 canvasArray[i] = canvas;
    //                 if (i === svgs.length - 1) {
    //                     res(canvasArray);
    //                 }
    //             });
    //         }
    //     });
    // },
    // svgToCanvas (svg) {
    //     return new Promise((res, rej) => {
    //         try {
    //             const domUrl = window.URL || window.webkitURL || window,
    //                 blob = new Blob([
    //                     new XMLSerializer().serializeToString(svg)
    //                 ], {type: "image/svg+xml;charset=utf-8"}),
    //                 url = domUrl.createObjectURL(blob),
    //                 canvas = document.createElement("canvas"),
    //                 img = new Image(),
    //                 ctx = canvas.getContext("2d");

    //             canvas.width = svg.outerWidth;
    //             canvas.height = svg.innerWidth;
    //             canvas.imageSmoothingEnabled = false;

    //             ctx.font = "sans-serif";
    //             ctx.fillStyle = "white";
    //             ctx.fillRect(0, 0, canvas.width, canvas.height);

    //             img.onload = () => {
    //                 ctx.drawImage(img, 20, 20);
    //                 domUrl.revokeObjectURL(url);

    //                 console.log(canvas);
    //                 res(canvas);
    //             };
    //             img.src = url;
    //         }
    //         catch (e) {
    //             rej(console.error(e));
    //         }
    //     });
    // }
});

export default ExportButtonModel;
