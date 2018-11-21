const InfoScreenModel = Backbone.Model.extend({
    defaults: {
        isToolStarted: false,

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

    /*
    *   Loads topic specific data from a JSON file and sets general parameters for the charts
    */

    loadChartDataForTopic: function (topic) {
        if (!this.getIsToolStarted()) {
            // Radio.trigger("Util", "showLoader");
            this.setIsToolStarted(true);
        }

        //The panels need to be loaded first, for highcharts to use the dom elements
        Radio.trigger("InfoScreen", "loadChartPanels");

        topic = topic ? topic : "grobo";

        $.ajax({
            url: "../../portal/cosiInfoscreen/assets/data/" + topic + "-data.json",
            async: true,
            type: "GET",
            cache: false,
            dataType: "json",
            context: this,
            success: function (data) {
                if (topic === "kitas") {
                    this.set("columnCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['Stadtgebiet']));
                    this.set("columnData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'unter_6_perc', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("columnTitle", 'Anteil Bevölkerung < 6 Jahren in % (2016)');
                    this.set("columnSubTitle", '');
                    this.set("columnPlotLine", 5.92);

                    this.set("columnData2", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'spaces_p_child', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("column2Title", 'Kitaplätze pro Kind (2016)');
                    this.set("column2SubTitle", 'Berechnungsgrundlage sind Ø 3m² Fläche pro Kind');
                    this.set("column2PlotLine", 0.89);
                } else if (topic === "nahversorgung") {
                    this.set("columnCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['Stadtgebiet']));
                    this.set("columnData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'apotheken_p_10000', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("columnTitle", 'Apotheken pro 10 Tsd. Einwohner');
                    this.set("columnSubTitle", '');
                    this.set("columnPlotLine", 2.15);

                    this.set("columnData2", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'supermaerkte_p_10000', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("column2Title", 'Supermärkte pro 10 Tsd. Einwohner');
                    this.set("column2SubTitle", '');
                    this.set("column2PlotLine", 3.23);
                } else if (topic === "gruenflaechen") {
                    this.set("columnCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['Stadtgebiet']));
                    this.set("columnData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'pspace_p_p', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("columnTitle", 'Öffentliche Grünfläche je EW in m²');
                    this.set("columnSubTitle", '');
                    this.set("columnPlotLine", 31.61);

                    this.set("columnData2", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'parks_playgrounds_p_p', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("column2Title", 'Park-, Spielplatzfläche je EW in m²');
                    this.set("column2SubTitle", '');
                    this.set("column2PlotLine", 15.67);
                } else {
                    this.set("columnCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['Stadtgebiet']));
                    this.set("columnData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'Anteil_der_unter_18_J_hrigen_in', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("columnTitle", 'Anteil der Bevölkerung < 18 Jahren in % (2016)');
                    this.set("columnSubTitle", 'Die rote Linie zeigt den Hamburger Durchschnitt');
                    this.set("columnPlotLine", 16.2);

                    this.set("columnData2", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'Anteil_der_Bev_lkerung_mit_Migrations_hintergrund_in', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("column2Title", 'Anteil der Bevölkerung mit Migrationshintergrund in % (2016)');
                    this.set("column2SubTitle", 'Die rote Linie zeigt den Hamburger Durchschnitt');
                    this.set("column2PlotLine", 34.1);
                }

                if (this.getLineData() === null) {
                    this.set("lineCategories", Radio.request("ChartUtil", "getUniqueSeriesNames", data, ['jahr']));
                    this.set("lineData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'Geburten', 'jahr', this.getLineCategories(), 'Groß Borstel'));
                    this.set("lineTitle", 'Geburten pro Jahr zwischen 2012-2016');
                    this.set("lineSubTitle", '');
                }
                if (this.getPieData() === null) {
                    this.set("pieData", Radio.request("ChartUtil", "getSeriesData", data, 'Stadtgebiet',
                        'Bev_lkerung', 'jahr', ['2016'], 'Groß Borstel'));
                    this.set("pieTitle", 'Geburten pro Jahr zwischen 2012-2016');
                    this.set("pieSubTitle", '');
                }

                Radio.trigger("Util", "hideLoader");
                Radio.trigger("InfoScreen", "dataCalculated", topic);
            }
        });
    },
    setIsToolStarted: function (isVisible) {
        return this.set("isToolStarted", isVisible);
    },
    getIsToolStarted: function () {
        return this.get("isToolStarted");
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
    },
    getLineCategories: function () {
        return this.get("lineCategories");
    },
    getLineTitle: function () {
        return this.get("lineTitle");
    },
    getPieTitle: function () {
        return this.get("pieTitle");
    }

});
export default InfoScreenModel;

