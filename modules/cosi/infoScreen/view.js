import InfoScreenModel from "./model";
import Template from "text-loader!./template.html";
import BarView from "../../charting/chartRenderer/bar-line/view";
import PieView from "../../charting/chartRenderer/pie/view";

// define(function (require) {
//
//     let Template = require("text-loader!modules/cosi/infoScreen/template.html"),
//         InfoScreenModel = require("modules/cosi/infoScreen/model"),
//         BarView = require("modules/charting/chartRenderer/bar-line/barView"),
//         PieView = require("modules/charting/chartRenderer/pie/pieView"),
//         Radio = require("backbone.radio"),
//         $ = require("jquery"),
//         InfoScreenView;

const InfoScreenView = Backbone.View.extend({
    className: "info-screen",
    id: "infoScreen",
    model: new InfoScreenModel(),
    template: _.template(Template),
    barView: new BarView(),
    pieView: new PieView(),
    initialize: function () {
        this.listenTo(Radio.channel("LocalStorage"), {
            "newStorageMessage": function (message) {
                if (message.type === 'topic-select') {
                    this.model.loadChartDataForTopic(message.data);
                }
            }
        }, this);

        let channel = Radio.channel("InfoScreen");
        channel.on({
            "dataCalculated": this.renderCharts,
            "loadChartPanels": this.render
        }, this);

        this.render();
    },

    render: function () {
        let attr = this.model.toJSON();
        $("#info-screen").append(this.$el.html(this.template(attr)));
    },

    renderCharts: function (topic) {

        // Bar-Chart 1
        this.barView = new BarView();
        this.barView.resetBarModel();
        this.barView.setBarParameters(document.getElementById("chart-column-1"),
            this.model.getColumnData(), this.model.getColumnCategories(), this.model.getColumnTitle(),
            this.model.getColumnSubTitle(), null, 'column', null, null, this.model.getColumnPlotLine(), null, null, false);
        this.barView.renderBar();

        // Bar-Chart 2
        this.barView = new BarView();
        this.barView.resetBarModel();
        this.barView.setBarParameters(document.getElementById("chart-column-2"),
            this.model.getColumnData2(), this.model.getColumnCategories(), this.model.getColumn2Title(),
            this.model.getColumn2SubTitle(), null, 'column', null, null, this.model.getColumn2PlotLine(), null, null, false);
        this.barView.renderBar();

        //TODO: wieder anfangen!"
        // if (topic === "grobo") {
        // Line-Chart 1
        this.barView = new BarView();
        this.barView.resetBarModel();
        this.barView.setBarParameters(document.getElementById("chart-line-1"),
            this.model.getLineData(), this.model.getLineCategories(), this.model.getLineTitle(),
            null, null, 'line', null, null, null, null, null, true);
        this.barView.renderBar();

        // Pie-Chart 1

        this.pieView = new PieView();
        this.pieView.setPieParameters(document.getElementById("chart-pie-1"),
            this.model.getPieData(), this.model.getPieTitle(), null, null, true, false, true, 0);
        this.pieView.renderPie();
        // }
    }
});
export default InfoScreenView;
