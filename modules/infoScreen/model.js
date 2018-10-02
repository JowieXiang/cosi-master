define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        InfoScreenModel;

    InfoScreenModel = Backbone.Model.extend({
        defaults: {
            isToolStarted: true,
            selectedFeature: false,

            lineData: null,
            lineCategories: null,
            lineTitle: '',
            lineSubTitle: '',

            pieData: null,
            pieTitle: '',
            pieSubTitle: '',

            columnData: null,
            columnCategories: null,
            columnTitle: '',
            columnSubTitle: '',
            columnPlotLine: 0,

            columnData2: null,
            column2Title: '',
            column2SubTitle: '',
            column2PlotLine: 0
        },
        initialize: function () {
        },
        loadChartDataForTopic: function (topic) {
            // TODO: What is this?
            // Radio.trigger("Util", "showLoader");
            if (!this.getIsToolStarted()) {
                this.setIsToolStarted(true);
            }
            topic = topic ? topic : "grobo";

            $.ajax({
                url: "../../portal/cosiInfoscreen/assets/data/" + topic + "-data.json",
                async: true,
                type: "GET",
                cache: false,
                dataType: "json",
                context: this,
                success: function (data) {
                    if (data.success === false) {
                        Radio.trigger("Alert", "alert", {text: "NOT???", kategorie: "alert-warning"});
                    }
                    else {

                        if (topic === "kitas") {
                            this.set("columnCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['Stadtgebiet']));
                            this.set("columnData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                                'unter_6_perc', 'jahr', ['2016'], 'Groß Borstel'));
                            this.set("columnTitle", 'Anteil Bevölkerung < 6 Jahren in % (2016)');
                            this.set("columnSubTitle", '');

                            this.set("columnData2", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                                'spaces_p_child', 'jahr', ['2016'], 'Groß Borstel'));
                            this.set("column2Title", 'Kitaplätze pro Kind (2016)');
                            this.set("column2SubTitle", 'Berechnungsgrundlage sind Ø 3m² Fläche pro Kind');
                        } else if (topic === "nahversorgung") {
                            this.set("columnCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['Stadtgebiet']));
                            this.set("columnData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                                'apotheken_p_10000', 'jahr', ['2016'], 'Groß Borstel'));
                            this.set("columnTitle", 'Apotheken pro 10 Tsd. Einwohner');
                            this.set("columnSubTitle", '');

                            this.set("columnData2", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                                'supermaerkte_p_10000', 'jahr', ['2016'], 'Groß Borstel'));
                            this.set("column2Title", 'Supermärkte pro 10 Tsd. Einwohner');
                            this.set("column2SubTitle", '');
                        } else if (topic === "gruenflaechen") {

                            this.set("columnCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['Stadtgebiet']));
                            this.set("columnData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                                'pspace_p_p', 'jahr', ['2016'], 'Groß Borstel'));
                            this.set("columnTitle", 'Öffentliche Grünfläche je EW in m²');
                            this.set("columnSubTitle", '');
                            this.set("columnPlotLine", 16.2);

                            this.set("columnData2", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                                'parks_playgrounds_p_p', 'jahr', ['2016'], 'Groß Borstel'));
                            this.set("column2Title", 'Park-, Spielplatzfläche je EW in m²');
                            this.set("column2SubTitle", '');
                            this.set("column2PlotLine", 34.1);
                        } else {
                            // This is the fallback or initial grobo data
                        }
                    }
                }
            });
        },
        setIsToolStarted: function (isVisible) {
            return this.set("isToolStarted", isVisible);
        },
        getIsToolStarted: function () {
            return this.get("isToolStarted");
        },
        setSelectedFeature: function (selectedFeature) {
            return this.set("selectedFeature", selectedFeature);
        },
        getSelectedFeature: function () {
            return this.get("selectedFeature");
        },
        setColumnData: function (columnData) {
            return this.set("columnData", columnData);
        },
        getColumnData: function () {
            return this.get("columnData");
        },
        setColumnData2: function (columnData2) {
            return this.set("columnData2", columnData2);
        },
        getColumnData2: function () {
            return this.get("columnData2");
        },
        getColumnCategories: function () {
            return this.get("columnCategories");
        },
        setPieData: function (pieData) {
            return this.set("pieData", pieData);
        },
        getPieData: function () {
            return this.get("pieData");
        },
        setLineData: function (lineData) {
            return this.set("lineData", lineData);
        },
        getLineData: function () {
            return this.get("lineData");
        },
        getColumnTitle: function () {
            return this.get("columnTitle");
        },
        getColumnSubTitle: function () {
            return this.get("columnSubTitle");
        },
        getColumn2Title: function () {
            return this.get("column2Title");
        },
        getColumn2SubTitle: function () {
            return this.get("column2SubTitle");
        },
        getColumnPlotLine: function () {
            return this.get("columnPlotLine");
        },
        getColumn2PlotLine: function () {
            return this.get("column2PlotLine");
        }
    });

    return InfoScreenModel;
});
