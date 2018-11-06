// define(function (require) {
//     let Backbone = require("backbone"),
//         highcharts = require("highcharts"),
//         Model;

const Model = Backbone.Model.extend({
        defaults: {
            htmlElement: {},
            chartTitle: '',
            chartSubTitle: '',
            chartTitleAlign: 'center',

            chartType: 'line',
            yTitle: '',
            xTitle: '',
            isShowYAxis: true,

            pointStart: null,

            legendEnabled: true,
            isColorByPoint: false,
            isExport: true,

            plotLineValue: 0,
            isNoGridLines: false,

            xCategories: [],
            series: []
        },
        initialize: function () {

        },
        getSeries: function () {
            return this.get("series");
        },
        setSeries: function (series) {
            this.set("series", series);
        },

        getHtmlElement: function () {
            return this.get("htmlElement");
        },

        setHtmlElement: function (htmlElement) {
            this.set("htmlElement", htmlElement);
        },

        getChartTitle: function () {
            return this.get("chartTitle");
        },

        setChartTitle: function (chartTitle) {
            this.set("chartTitle", chartTitle);
        },

        getChartSubTitle: function () {
            return this.get("chartSubTitle");
        },

        setChartSubTitle: function (chartSubTitle) {
            this.set("chartSubTitle", chartSubTitle);
        },

        getChartTitleAlign: function () {
            return this.get("chartTitleAlign");
        },

        setChartTitleAlign: function (chartTitleAlign) {
            this.set("chartTitleAlign", chartTitleAlign);
        },

        getChartType: function () {
            return this.get("chartType");
        },

        setChartType: function (chartType) {
            this.set("chartType", chartType);
        },

        getYTitle: function () {
            return this.get("yTitle");
        },

        setYTitle: function (yTitle) {
            this.set("yTitle", yTitle);
        },

        getXTitle: function () {
            return this.get("xTitle");
        },

        setXTitle: function (xTitle) {
            this.set("xTitle", xTitle);
        },

        getIsShowYAxis: function () {
            return this.get("isShowYAxis");
        },

        setIsShowYAxis: function (isShowYAxis) {
            this.set("isShowYAxis", isShowYAxis);
        },

        getPointStart: function () {
            return this.get("pointStart");
        },

        setPointStart: function (pointStart) {
            this.set("pointStart", pointStart);
        },

        getLegendEnabled: function () {
            return this.get("legendEnabled");
        },

        setLegendEnabled: function (legendEnabled) {
            this.set("legendEnabled", legendEnabled);
        },

        getIsColorByPoint: function () {
            return this.get("isColorByPoint");
        },

        setIsColorByPoint: function (isColorByPoint) {
            this.set("isColorByPoint", isColorByPoint);
        },

        getIsExport: function () {
            return this.get("isExport");
        },

        setIsExport: function (isExport) {
            this.set("isExport", isExport);
        },

        getPlotLineValue: function () {
            return this.get("plotLineValue");
        },

        setPlotLineValue: function (plotLineValue) {
            this.set("plotLineValue", plotLineValue);
        },

        getIsNoGridLines: function () {
            return this.get("isNoGridLines");
        },

        setIsNoGridLines: function (isNoGridLines) {
            this.set("isNoGridLines", isNoGridLines);
        },

        getXCategories: function () {
            return this.get("xCategories");
        },

        setXCategories: function (xCategories) {
            this.set("xCategories", xCategories);
        }
    });
export default Model;
