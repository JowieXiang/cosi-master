const Util = Backbone.Model.extend({
    defaults: {},
    initialize: function () {
        let channel = Radio.channel("ChartUtil");

        channel.reply({
            "getCountData": this.getCountData,
            "getSumData": this.getSumData,
            "getMinData": this.getMinData,
            "getMaxData": this.getMaxData,
            "getSeriesData": this.getSeriesData,
            "getDataByFunction": this.getDataByFunction,
            "getUniqueSeriesNames": this.getUniqueSeriesNames,
            "getElementNameAtLevel": this.getElementNameAtLevel,
            "concatAllElements": this.concatAllElements,
            "capitalize": this.capitalize
        }, this);
    },
    getCountData: function (data, seriesIdent) {
        return this.getDataByFunction(data, seriesIdent, "COUNT");
    },
    getSumData: function (data, seriesIdent, dataIdent) {
        return this.getDataByFunction(data, seriesIdent, "SUM", dataIdent);
    },
    getMinData: function (data, seriesIdent, dataIdent) {
        return this.getDataByFunction(data, seriesIdent, "MINIMUM", dataIdent);
    },
    getMaxData: function (data, seriesIdent, dataIdent) {
        return this.getDataByFunction(data, seriesIdent, "MAXIMUM", dataIdent);
    },
    getSeriesData: function (data, seriesIdent, dataIdent, seriesPointIdent, seriesPointElements, highlight) {
        let dataArray = [];
        let seriesNames = this.getUniqueSeriesNames(data, [seriesIdent]);
        for (let _i = 0, seriesNames_1 = seriesNames; _i < seriesNames_1.length; _i++) {
            let uniqueName = seriesNames_1[_i];
            let series = {name: uniqueName};
            let seriesData = [];
            for (let _a = 0, seriesPointElements_1 = seriesPointElements; _a < seriesPointElements_1.length; _a++) {
                let seriesPoint = seriesPointElements_1[_a];
                let found = true;
                for (let _b = 0, data_1 = data; _b < data_1.length; _b++) {
                    let obj = data_1[_b];
                    if (obj[seriesPointIdent] === seriesPoint &&
                        this.getElementNameAtLevel([seriesIdent], obj) === uniqueName) {
                        seriesData.push(Number(obj[dataIdent]));
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    seriesData.push(null);
                }
            }
            if (series.name == highlight) {
                series["color"] = '#434348';
            }
            if (seriesPointElements.length == 1) {
                series["y"] = seriesData[0];
            }
            else {
                series["data"] = seriesData;
            }
            dataArray.push(series);
        }
        if (seriesPointElements.length == 1) {
            let newDataArray = {};
            newDataArray["data"] = dataArray;
            newDataArray["name"] = [seriesIdent];
            return newDataArray;
        }
        else {
            return dataArray;
        }
    },
    getDataByFunction: function (data, seriesIdent, calcFunction, dataIdentity) {
        let dataArray = {};
        dataArray['name'] = seriesIdent;
        let seriesCollection = [];
        let seriesNames = this.getUniqueSeriesNames(data, seriesIdent);
        let ident = dataIdentity ? dataIdentity : '';
        for (let _i = 0, seriesNames_2 = seriesNames; _i < seriesNames_2.length; _i++) {
            let uniqueName = seriesNames_2[_i];
            let series = {name: uniqueName};
            let dataFunction = 0;
            for (let _a = 0, data_2 = data; _a < data_2.length; _a++) {
                let obj = data_2[_a];
                if (this.getElementNameAtLevel(seriesIdent, obj) === uniqueName) {
                    let dataElement = Number(obj[ident]);
                    if (calcFunction === "COUNT" ||
                        calcFunction === "SUM") {
                        if (!dataFunction) {
                            dataFunction = 0;
                        }
                    }
                    if (calcFunction === "COUNT") {
                        dataFunction++;
                    }
                    else if (calcFunction === "SUM") {
                        dataFunction = dataFunction + dataElement;
                    }
                    else if (calcFunction === "MAXIMUM") {
                        if (!dataFunction) {
                            dataFunction = dataElement;
                        }
                        else {
                            dataFunction = dataElement > dataFunction ? dataElement : dataFunction;
                        }
                    }
                    else if (calcFunction === "MINIMUM") {
                        if (!dataFunction) {
                            dataFunction = dataElement;
                        }
                        else {
                            dataFunction = dataElement < dataFunction ? dataElement : dataFunction;
                        }
                    }
                }
            }
            series['y'] = dataFunction;
            seriesCollection.push(series);
        }
        dataArray['data'] = seriesCollection;
        return dataArray;
    },
    getUniqueSeriesNames: function (data, seriesIdent) {
        let seriesNames = [];
        for (let _i = 0, data_3 = data; _i < data_3.length; _i++) {
            let obj = data_3[_i];
            let currentSeriesName = this.getElementNameAtLevel(seriesIdent, obj);
            if (seriesNames.indexOf(currentSeriesName) === -1) {
                seriesNames.push(currentSeriesName);
            }
        }
        return seriesNames;
    },
    getElementNameAtLevel: function (seriesIdent, obj) {
        let latestElement;
        for (let _i = 0, seriesIdent_1 = seriesIdent; _i < seriesIdent_1.length; _i++) {
            let sIdent = seriesIdent_1[_i];
            latestElement = latestElement ? latestElement : obj;
            if (latestElement[sIdent] instanceof Array) {
                latestElement = latestElement[sIdent][0];
            }
            else {
                latestElement = latestElement[sIdent];
            }
        }
        let currentSeriesName = latestElement;
        return currentSeriesName;
    },
    concatAllElements: function (textArr) {
        let concatenated = '';
        for (let _i = 0, textArr_1 = textArr; _i < textArr_1.length; _i++) {
            let text = textArr_1[_i];
            concatenated = concatenated.concat(' ' + text);
        }
        return concatenated;
    },
    capitalize: function (value) {
        let string = '';
        if (value instanceof Array) {
            string = value[0].name;
        }
        else if (typeof value === 'object') {
            string = value.name[0];
        }
        else {
            string = value.name;
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

});
export default Util;


