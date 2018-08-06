define(function (require) {
    var Backbone = require("backbone"),
        Model;

    Model = Backbone.Model.extend({
        defaults: {
            htmlElement: {},
            chartTitle: '',
            chartSubTitle: '',
            chartTitleAlign: 'center',

            isShowLabels: true,
            isPercentageLabel: true,
            isNoDecimalPlace: false,
            dataLabelDistance: 30,
            isExport: true,
            innerSize: 0,
            series: []
        },
        initialize: function () {

        },

        getHtmlElement: function () {
            return this.htmlElement;
        },

        setHtmlElement: function (value) {
            this.htmlElement = value;
        },

        getChartTitle: function () {
            return this._chartTitle;
        },

        setChartTitle: function (value) {
            this._chartTitle = value;
        },

        getChartSubTitle: function () {
            return this._chartSubTitle;
        },

        setChartSubTitle: function (value) {
            this._chartSubTitle = value;
        },

        getChartTitleAlign: function () {
            return this.chartTitleAlign;
        },

        setChartTitleAlign: function (value) {
            this.chartTitleAlign = value;
        },

        getIsShowLabels: function () {
            return this.isShowLabels;
        },

        setIsShowLabels: function (value) {
            this.isShowLabels = value;
        },

        getIsPercentageLabel: function () {
            return this._isPercentageLabel;
        },

        setIsPercentageLabel: function (value) {
            this._isPercentageLabel = value;
        },

        getIsNoDecimalPlace: function () {
            return this._isNoDecimalPlace;
        },

        setIsNoDecimalPlace: function (value) {
            this._isNoDecimalPlace = value;
        },

        getDataLabelDistance: function () {
            return this._dataLabelDistance;
        },

        setDataLabelDistance: function (value) {
            this._dataLabelDistance = value;
        },

        getIsExport: function () {
            return this.isExport;
        },

        setIsExport: function (value) {
            this.isExport = value;
        },

        getInnerSize: function () {
            return this.innerSize;
        },

        setInnerSize: function (value) {
            this.innerSize = value;
        },

        getSeries: function () {
            return this._series;
        },

        setSeries: function (value) {
            this._series = value;
        }

    });

    return Model;
});
