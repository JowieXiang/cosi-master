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
        this.prepareForExport();

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

            this.setData(csv, "text/csv");
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
        this.set("data", new Blob([data], {type: type}));
    }
});

export default ExportButtonModel;