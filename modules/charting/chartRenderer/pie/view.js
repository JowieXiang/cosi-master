import PieModel from "./model";
import PieTemplate from "text-loader!../template.html";
import Highcharts from "highcharts";
import BarModel from "../bar-line/model";

window.Highcharts = Highcharts;

const PieView = Backbone.View.extend({

    id: "pie-chart",
    model: new PieModel(),
    template: _.template(PieTemplate),
    events: {},

    initialize: function () {
    },

    render: function (series, domElement) {
    },

    resetPieModel: function () {
        this.model = new PieModel();
    },

    renderPie: function () {
        let domElement = $(this.model.getHtmlElement());
        let data = this.model.getSeries();

        // TODO: das renderTo wohl noch umstellen auf die ID des htmlElementes
        this.model.setIsExport(false);

        if (domElement) {
            let newChart = Highcharts.chart(domElement[0]["id"], {
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
                    useHTML: true,
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
                series: [data]
            });
        } else {
            console.warn('The Dom-Element has not been set. Cannot create chart.')
        }
    },


    // This we do via PieView, because the model cannot be imported (?) by the inforScreen module - only the views can - so no direct model access
    setPieParameters: function (htmlElement, series, chartTitle, chartSubTitle, chartTitleAlign, isShowLabels, isPercentageLabel, isNoDecimalPlace,
                                dataLabelDistance, isExport, innerSize) {
        if (htmlElement !== null)
            this.model.setHtmlElement(htmlElement);
        if (series !== null)
            this.model.setSeries(series);
        if (chartTitle !== null)
            this.model.setChartTitle(chartTitle);
        if (chartSubTitle !== null)
            this.model.setChartSubTitle(chartSubTitle);
        if (chartTitleAlign !== null)
            this.model.setChartTitleAlign(chartTitleAlign);
        if (isShowLabels !== null)
            this.model.setIsShowLabels(isShowLabels);
        if (isPercentageLabel !== null)
            this.model.setIsPercentageLabel(isPercentageLabel);
        if (isNoDecimalPlace !== null)
            this.model.setIsNoDecimalPlace(isNoDecimalPlace);
        if (dataLabelDistance !== null)
            this.model.setDataLabelDistance(dataLabelDistance);
        if (isExport !== null)
            this.model.setIsExport(isExport);
        if (innerSize !== null)
            this.model.setInnerSize(innerSize);
    }
});
export default PieView;
