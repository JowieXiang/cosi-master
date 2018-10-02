define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        pieTemplate = require("text!modules/tools/chartRenderer/template.html"),
        pieModel = require("modules/tools/chartRenderer/pie/pieModel"),
        $ = require("jquery"),
        Radio = require("backbone.radio"),
        highcharts = require("highcharts"),
        pieView;

    pieView = Backbone.View.extend({

        id: "pie-chart",
        model: new pieModel(),
        template: _.template(pieTemplate),

        events: {},
        initialize: function () {
            this.id = this.id + '-' + Math.random().toString(36).substring(2, 15);

            // var channel = Radio.channel("chartCaller");
            // channel.on({
            //     "createChart": function (callerData) {
            //         console.log('Called ' + callerData[0] + ' value ' + callerData[1]);
            //         this.render(callerData[0], callerData[1]);
            //     },
            //     "deleteAll": function () {
            //         this.render('deleteAll', false);
            //     }
            // }, this);
        },

        setPieModel: function (pieModel) {
            this.model = pieModel;
        },

        renderPie: function () {
            var domElement = this.model.getHtmlElement();
            var series = this.model.getSeries();
            if (!series) {
                series = this.getRandomPieData();
            }
            if (this.model.getInnerSize() > 0) {
                series['innerSize'] = this.model.getInnerSize();
            }
            if (domElement) {
                this.render(series, domElement);
            } else {
                console.warn('The Dom-Element has not been set. Cannot create chart.')
            }
        },

        render: function (series, domElement) {
            domElement.highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie',
                        renderTo: document.getElementById(this.id)
                    },
                    exporting: {
                        enabled: this.model.getIsExport(),
                        buttons: {
                            contextButton: {
                                enabled: true
                            }
                        }
                    },
                    title: {
                        text: this.model.getChartTitle(),
                        align: this.model.getChartTitleAlign()
                    },
                    subtitle: {
                        text: this.model.getChartSubTitle()
                    },
                    credits: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            center: ['50%', '50%'],
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: this.model.getIsShowLabels(),
                                format: this.model.getIsPercentageLabel() ? '<b>{point.name}</b>: {point.percentage:.1f} %'
                                    : this.model.getIsNoDecimalPlace() ? '<b>{point.name}</b>: {point.y:.0f}' : '<b>{point.name}</b>: {point.y:.2f}',
                                distance: this.model.getDataLabelDistance()
                            }
                        },
                        series: {
                            cursor: 'pointer'
                        }
                    },
                    series: series
                }
            );

        },

        getRandomPieData: function () {
            return [{
                name: 'Brands',
                colorByPoint: true,
                data: [{
                    name: 'Chrome',
                    y: 61.41,
                    sliced: true,
                    selected: true
                }, {
                    name: 'Internet Explorer',
                    y: 11.84
                }, {
                    name: 'Firefox',
                    y: 10.85
                }, {
                    name: 'Edge',
                    y: 4.67
                }, {
                    name: 'Safari',
                    y: 4.18
                }, {
                    name: 'Sogou Explorer',
                    y: 1.64
                }, {
                    name: 'Opera',
                    y: 1.6
                }, {
                    name: 'QQ',
                    y: 1.2
                }, {
                    name: 'Other',
                    y: 2.61
                }]
            }]
        },

        // Not really userful?

        setPieParameters: function (htmlElement, series, chartTitle, chartSubTitle, chartTitleAlign, isShowLabels, isPercentageLabel, isNoDecimalPlace,
                                    dataLabelDistance, isExport, innerSize) {
            this.model.setHtmlElement(htmlElement);
            this.model.setChartTitle(chartTitle);
            this.model.setChartSubTitle(chartSubTitle);
            this.model.setChartTitleAlign(chartTitleAlign);
            this.model.setIsShowLabels(isShowLabels);
            this.model.setIsPercentageLabel(isPercentageLabel);
            this.model.setIsNoDecimalPlace(isNoDecimalPlace);
            this.model.setDataLabelDistance(dataLabelDistance);
            this.model.setIsExport(isExport);
            this.model.setInnerSize(innerSize);
            this.model.setSeries(series);
        }
    });
    return pieView;
});
