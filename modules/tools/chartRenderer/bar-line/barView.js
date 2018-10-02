define(function (require, Highcharts) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        barTemplate = require("text!modules/tools/chartRenderer/template.html"),
        barModel = require("modules/tools/chartRenderer/bar-line/barModel"),
        $ = require("jquery"),
        Radio = require("backbone.radio"),
        highcharts = Highcharts,
        barView;

    barView = Backbone.View.extend({

        id: "bar-chart",
        model: new barModel(),
        template: _.template(barTemplate),
        events: {},

        initialize: function () {
            // this.id = this.id + '-' + Math.random().toString(36).substring(2, 15);

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

        render: function () {
        },
        //
        // setBarModel: function (barModel) {
        //     this.model = barModel;
        // },

        renderBar: function () {
            var domElement = $(this.model.getHtmlElement());
            var data = this.model.getSeries();

            //if (!series) {
                // TODO: hie den alter aus dem ajax request!
            //}
            // data['colorByPoint'] = this.model.getIsColorByPoint();

            if (domElement) {
                domElement.highcharts({
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: this.model.getChartType(),
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
                        yAxis: {
                            visible: this.model.getIsShowYAxis(),
                            title: {
                                text: this.model.getYTitle()
                            },
                            gridLineWidth: this.model.getIsNoGridLines() ? 0 : 1,
                            lineWidth: this.model.getIsNoGridLines ? 0 : 1,
                            plotLines: [{
                                color: '#FF0000',
                                width: this.model.getPlotLineValue() ? 2 : 0,
                                value: this.model.getPlotLineValue() ? this.model.getPlotLineValue() : null
                            }]
                        },
                        xAxis: {
                            categories: this.model.getXCategories(),
                            title: {
                                text: this.model.getXTitle()
                            },
                            labels: {
                                autoRotationLimit: 0
                            },
                            tickWidth: this.model.getIsNoGridLines() ? 0 : 1,
                            lineWidth: this.model.getIsNoGridLines() ? 0 : 1
                        },
                        legend: {
                            enabled: this.model.getLegendEnabled(),
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle'
                        },
                        credits: {
                            enabled: false
                        },
                        plotOptions: {
                            series: {
                                cursor: 'pointer'
                            }
                        },
                        series: [data]
                    }
                );
            } else {
                console.warn('The Dom-Element has not been set. Cannot create chart.')
            }
        },

        setBarParameters: function (htmlElement, series, xCategories, chartTitle, chartSubTitle, chartTitleAlign, chartType,
                                    yTitle, xTitle, plotLineValue, isShowYAxis, pointStart, legendEnabled, isColorByPoint,
                                    isExport, isNoGridLines) {
            if (htmlElement)
                this.model.setHtmlElement(htmlElement);
            if (series)
                this.model.setSeries(series);
            if (xCategories)
                this.model.setXCategories(xCategories);
            if (chartTitle)
                this.model.setChartTitle(chartTitle);
            if (chartSubTitle)
                this.model.setChartSubTitle(chartSubTitle);
            if (chartType)
                this.model.setChartType(chartType);
            if (yTitle)
                this.model.setYTitle(yTitle);
            if (xTitle)
                this.model.setXTitle(xTitle);
            if (isShowYAxis)
                this.model.setIsShowYAxis(isShowYAxis);
            if (pointStart)
                this.model.setPointStart(pointStart);
            if (legendEnabled)
                this.model.setLegendEnabled(legendEnabled);
            if (isColorByPoint)
                this.model.setIsColorByPoint(isColorByPoint);
            if (isExport)
                this.model.setIsExport(isExport);
            if (plotLineValue)
                this.model.setPlotLineValue(plotLineValue);
            if (isNoGridLines)
                this.model.setIsNoGridLines(isNoGridLines);
        }
    });
    return barView;
});
