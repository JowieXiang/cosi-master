import BarModel from "./model";
import BarTemplate from "text-loader!../template.html";
import Highcharts from "highcharts";

const BarView = Backbone.View.extend({

    id: "bar-chart",
    model: new BarModel(),
    template: _.template(BarTemplate),
    events: {},

    initialize: function () {
    },

    render: function () {
    },

    resetBarModel: function () {
        this.model = new BarModel();
    },

    renderBar: function () {
        let domElement = $(this.model.getHtmlElement());
        let data = this.model.getSeries();

        data['colorByPoint'] = this.model.getIsColorByPoint();
        this.model.setIsExport(false);

        if (domElement) {
            let newChart = Highcharts.chart(domElement[0]["id"], {
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
                    useHTML: true,
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
                series: (data instanceof Array ? data : [data])
            });
        } else {
            console.warn('The Dom-Element has not been set. Cannot create chart.')
        }
    },

    setBarParameters: function (htmlElement, series, xCategories, chartTitle, chartSubTitle, chartTitleAlign, chartType,
                                yTitle, xTitle, plotLineValue, isShowYAxis, pointStart, legendEnabled, isColorByPoint,
                                isExport, isNoGridLines) {
        if (htmlElement !== null)
            this.model.setHtmlElement(htmlElement);
        if (series !== null)
            this.model.setSeries(series);
        if (xCategories !== null)
            this.model.setXCategories(xCategories);
        if (chartTitle !== null)
            this.model.setChartTitle(chartTitle);
        if (chartSubTitle !== null)
            this.model.setChartSubTitle(chartSubTitle);
        if (chartType !== null)
            this.model.setChartType(chartType);
        if (yTitle !== null)
            this.model.setYTitle(yTitle);
        if (xTitle !== null)
            this.model.setXTitle(xTitle);
        if (isShowYAxis !== null)
            this.model.setIsShowYAxis(isShowYAxis);
        if (pointStart !== null)
            this.model.setPointStart(pointStart);
        if (legendEnabled !== null)
            this.model.setLegendEnabled(legendEnabled);
        if (isColorByPoint !== null)
            this.model.setIsColorByPoint(isColorByPoint);
        if (isExport !== null)
            this.model.setIsExport(isExport);
        if (plotLineValue !== null)
            this.model.setPlotLineValue(plotLineValue);
        if (isNoGridLines !== null)
            this.model.setIsNoGridLines(isNoGridLines);
    }
});
export default BarView;
